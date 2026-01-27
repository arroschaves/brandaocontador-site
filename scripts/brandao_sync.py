import os
import json
import requests
import re
import logging
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# Configuração de Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')

load_dotenv(".env.local")
load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

# URLS n8n
WEBHOOK_FOLDER = "https://webhook.brandaocontador.com.br/webhook/3232dacd-f6a4-40ed-9b57-5a22045de998"

# Workflow simplificado (3 nós: Webhook → Drive → Supabase)
# Após importar o workflow corrigido, copie a nova URL do webhook aqui
WEBHOOK_UPLOAD = "https://webhook.brandaocontador.com.br/webhook/upload-brandao"

# URL antiga (workflow com 7 nós - DESCONTINUADO):
# WEBHOOK_UPLOAD = "https://webhook.brandaocontador.com.br/webhook/01f435a5-aa5c-44b3-a46d-1b22d2b1c825"

def get_supabase_client():
    if not SUPABASE_URL or not SUPABASE_KEY: return None
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_clients(supabase: Client):
    try:
        return supabase.table("clientes").select("id, nome, razao_social, cnpj_cpf, drive_folder_id").execute().data
    except: return []

def fetch_units(supabase: Client):
    try:
        return supabase.table("unidades_fiscais").select("*").execute().data
    except: return []

def normalize_doc(doc):
    if not doc: return ""
    return "".join(re.findall(r'\d+', str(doc)))

def find_client(item, clients):
    filename = item["name"]
    filepath = item["path"]
    text_upper = (filename + filepath).upper()
    digits = "".join(re.findall(r'\d+', text_upper))

    # 1. Busca por Documento
    for c in clients:
        doc = str(c.get("cnpj_cpf", ""))
        if not doc: continue
        doc_digits = "".join(re.findall(r'\d+', doc))
        if not doc_digits: continue
        
        # Match direto
        if doc_digits in digits and len(doc_digits) > 8: return c
        
        # Match sem zeros
        doc_no_zeros = doc_digits.lstrip('0')
        if len(doc_no_zeros) > 7 and doc_no_zeros in digits: return c

    # 2. Busca por Nome
    for c in clients:
        nome = str(c.get("nome", "")).upper()
        razao = str(c.get("razao_social", "")).upper()
        if (nome and (nome in text_upper)) or (razao and (razao in text_upper)): return c
    return None

def identify_target_path_v6(filename, client, units, full_path=""):
    # Prioriza nome fantasia
    folder_name = client.get("nome") or client.get("razao_social") or "DESCONHECIDO"
    base_folder = f"{folder_name.strip()}"
    
    fn = filename.upper()
    fp = full_path.upper()
    
    # 1. Identificar Unidade
    target_unit = "GERAL"
    digits = normalize_doc(filename + full_path)
    
    for u in units:
        if u["cliente_id"] == client["id"]:
            u_doc = normalize_doc(u.get("documento_id", ""))
            if u_doc and u_doc in digits and len(u_doc) > 10:
                target_unit = u["nome_identificador"]
                break
            if u["nome_identificador"].upper() in fp:
                target_unit = u["nome_identificador"]
                break

    # 2. Categoria
    category = "OUTROS"
    if any(x in fp for x in ["CCIR", "ITR", "NIRF", "CAEPF"]) or any(x in fn for x in ["CAEPF", "CCIR", "ITR"]):
        category = "00_DOCUMENTOS_PERMANENTES/RURAL"
    elif any(x in fp for x in ["JUNTA", "CONTRATO", "SOCIAL", "ALTERACAO"]):
        category = "00_DOCUMENTOS_PERMANENTES/JUNTA_COMERCIAL"
    elif any(x in fp for x in ["CERTIFICADO DIGITAL"]):
        category = "00_DOCUMENTOS_PERMANENTES/CERTIFICADOS_DIGITAIS"
    elif any(x in fp for x in ["FOLHA", "RH", "RECIBO"]):
        category = "01_RH_FOLHA"
    elif any(x in fp for x in ["NOTAS", "FATURAMENTO", "XML", "NF", "AUXILIO"]):
        category = "02_FISCAL_TRIBUTOS"
    elif any(x in fp for x in ["CERTIDAO", "CND"]):
        category = "04_CERTIDOES"

    year = "2026" if "2026" in fn or "2026" in fp else "2025"
    
    if "00_DOCUMENTOS" in category or "04_CERTIDOES" in category:
        return f"{base_folder}/{target_unit}/{category}"
    
    return f"{base_folder}/{target_unit}/{category}/{year}"

def run_sync():
    logging.info("🚀 [SINCRONIZADOR ATIVO] - Iniciando envio otimizado (Multipart) para o Google Drive")
    
    supabase = get_supabase_client()
    if not supabase: 
        logging.error("❌ Erro ao conectar com Supabase.")
        return
    
    clients = fetch_clients(supabase)
    units = fetch_units(supabase)
    logging.info(f"📊 {len(clients)} clientes e {len(units)} unidades carregadas.")
    
    report_path = "public/automation_report.json"
    if not os.path.exists(report_path): 
        logging.error("❌ automation_report.json não encontrado.")
        return

    with open(report_path, "r", encoding="utf-8") as f:
        scan_data = json.load(f)

    success_count = 0
    skip_count = 0
    error_count = 0
    
    for item in scan_data:
        filename = item["name"]
        filepath = item["path"]
        
        if not os.path.exists(filepath): continue
        
        target_client = find_client(item, clients)
        
        if target_client:
            target_path = identify_target_path_v6(filename, target_client, units, filepath)
            logging.info(f"📤 Processando: {filename} -> {target_path}")
            
            try:
                # 1. Criar pasta (Webhook simples JSON)
                try:
                    requests.post(WEBHOOK_FOLDER, json={"path": target_path, "client_id": target_client["id"]}, timeout=15)
                except:
                    pass # Continuar mesmo se a criação de folder falhar, o upload pode criar a pasta
                
                # 2. Upload Real (Multipart simples com metadados completos)
                with open(filepath, 'rb') as f:
                    # Scanner V2 coloca metadados diretamente no item
                    # Compatível com estrutura antiga (metadata nested) e nova (flat)
                    
                    resp = requests.post(WEBHOOK_UPLOAD, 
                        files={'file': (filename, f, 'application/octet-stream')},
                        data={
                            "file_name": filename,
                            "doc_type": item.get("doc_type", "OUTROS"),
                            "client_id": target_client["id"],
                            "drive_folder_id": target_client.get("drive_folder_id") or "1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP",
                            "path": target_path,
                            
                            # Metadados do Scanner V2 (flat structure)
                            "year": item.get("year"),
                            "month": item.get("month"),
                            "expiry_date": item.get("expiry_date"),
                            "competence": item.get("competence"),
                            "doc_subtype": item.get("doc_subtype"),
                            "cpf_cnpj": item.get("cpf_cnpj")
                        }, 
                        timeout=120)
                        
                if resp.status_code == 200:
                    logging.info(f"✅ Sucesso: {filename}")
                    success_count += 1
                else:
                    logging.warning(f"⚠️ Falha no n8n para {filename}: {resp.text}")
                    error_count += 1
            except Exception as e:
                logging.error(f"❌ Erro crítico no envio de {filename}: {e}")
                error_count += 1
        else:
            skip_count += 1
            logging.info(f"⏭️ Cliente não identificado para: {filename}")

    logging.info(f"🏁 Fim da Sincronização.")
    logging.info(f"✅ Sucesso: {success_count} | ⏭️ Ignorados: {skip_count} | ❌ Erros: {error_count}")

if __name__ == "__main__":
    run_sync()