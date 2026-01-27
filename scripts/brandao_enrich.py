import os
import re
import json
import xml.etree.ElementTree as ET
import logging
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# Configuração de Logging para Arquivo
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("brandao_operation.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)

# Carregamento de ambiente
load_dotenv(".env.local")
load_dotenv()

# CONFIGURAÇÕES SUPABASE
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

def get_supabase_client():
    if not SUPABASE_URL or not SUPABASE_KEY: return None
    return create_client(SUPABASE_URL, SUPABASE_KEY)

class BrandaoEnricher:
    def __init__(self):
        self.supabase = get_supabase_client()
        self.clients_cache = []
        self.load_clients()

    def load_clients(self):
        if self.supabase:
            try:
                self.clients_cache = self.supabase.table("clientes").select("id, nome, cnpj_cpf").execute().data
                logging.info(f"✅ {len(self.clients_cache)} clientes carregados para cache.")
            except Exception as e:
                logging.error(f"⚠️ Erro ao carregar cache de clientes: {e}")

    def normalize_doc(self, doc):
        if not doc: return ""
        digits = "".join(re.findall(r'\d+', str(doc)))
        if len(digits) <= 11: return digits.zfill(11) # CPF
        return digits.zfill(14) # CNPJ / CAEPF

    def find_by_document(self, document):
        """
        Busca cliente por CPF/CNPJ exato.
        
        Args:
            document: CPF ou CNPJ (apenas números)
        
        Returns:
            str: ID do cliente ou None
        """
        if not document:
            return None
        
        normalized = self.normalize_doc(document)
        
        for c in self.clients_cache:
            db_doc = self.normalize_doc(c.get("cnpj_cpf", ""))
            if db_doc == normalized:
                return c["id"]
        
        return None
    
    def find_by_text(self, text):
        """
        Busca cliente por texto (nome do arquivo ou caminho).
        Método legado para fallback.
        """
        if not text:
            return None
        
        text_upper = str(text).upper()
        text_digits = "".join(re.findall(r'\d+', text_upper))
        
        # 1. Busca por Documento (Com tolerância a zero à esquerda)
        for c in self.clients_cache:
            db_doc = self.normalize_doc(c.get("cnpj_cpf", ""))
            if not db_doc:
                continue
            
            # Se o documento do banco (ex: 0123...) está no texto
            if db_doc in text_digits:
                return c["id"]
            
            # Se o documento do texto sem zero (ex: 123...) bate com o banco sem zero
            if db_doc.lstrip('0') in text_digits and len(db_doc.lstrip('0')) > 7:
                return c["id"]

        # 2. Busca por Nome (Fuzzy Match básico)
        for c in self.clients_cache:
            nome_cliente = str(c.get("nome", "")).upper()
            if nome_cliente and nome_cliente in text_upper:
                return c["id"]
                
        return None
    
    def find_client_id(self, file_info):
        """
        Busca cliente por CPF/CNPJ extraído ou nome do arquivo.
        
        Args:
            file_info: dict ou str
                Se dict: {"name": "arquivo.pdf", "cpf_cnpj": "17448680000103", "path": "..."}
                Se str: nome do arquivo (compatibilidade legada)
        
        Returns:
            str: ID do cliente ou None
        """
        # Compatibilidade com código legado (quando recebe string)
        if isinstance(file_info, str):
            return self.find_by_text(file_info)
        
        # Novo comportamento: priorizar CPF/CNPJ extraído
        if isinstance(file_info, dict):
            # 1. Prioridade: CPF/CNPJ extraído do conteúdo
            if file_info.get("cpf_cnpj"):
                client_id = self.find_by_document(file_info["cpf_cnpj"])
                if client_id:
                    logging.info(f"✅ Cliente encontrado por CPF/CNPJ extraído: {file_info['cpf_cnpj']}")
                    return client_id
            
            # 2. Fallback: buscar no nome do arquivo + caminho
            text = file_info.get("name", "") + file_info.get("path", "")
            return self.find_by_text(text)
        
        return None

    def parse_xml_nfe(self, file_path):
        try:
            tree = ET.parse(file_path)
            root = tree.getroot()
            ns = {'nfe': 'http://www.portalfiscal.inf.br/nfe'}
            
            emit = root.find('.//nfe:emit', ns)
            dest = root.find('.//nfe:dest', ns)
            
            for actor in [emit, dest]:
                if actor is None: continue
                cnpj = actor.find('nfe:CNPJ', ns)
                cpf = actor.find('nfe:CPF', ns)
                doc = (cnpj.text if cnpj is not None else cpf.text) if (cnpj is not None or cpf is not None) else None
                
                client_id = self.find_client_id(doc)
                if client_id:
                    data = {
                        'razao_social': actor.find('nfe:xNome', ns).text if actor.find('nfe:xNome', ns) is not None else None,
                        'inscricao_estadual': actor.find('nfe:IE', ns).text if actor.find('nfe:IE', ns) is not None else None,
                    }
                    ender = actor.find('nfe:enderEmit', ns) or actor.find('nfe:enderDest', ns)
                    if ender is not None:
                        data.update({
                            'logradouro': ender.find('nfe:xLgr', ns).text if ender.find('nfe:xLgr', ns) is not None else None,
                            'numero': ender.find('nfe:nro', ns).text if ender.find('nfe:nro', ns) is not None else None,
                            'bairro': ender.find('nfe:xBairro', ns).text if ender.find('nfe:xBairro', ns) is not None else None,
                            'cidade': ender.find('nfe:xMun', ns).text if ender.find('nfe:xMun', ns) is not None else None,
                            'estado': ender.find('nfe:UF', ns).text if ender.find('nfe:UF', ns) is not None else None,
                            'cep': ender.find('nfe:CEP', ns).text if ender.find('nfe:CEP', ns) is not None else None,
                        })
                    return client_id, data
        except: pass
        return None, None

    def extract_date(self, text):
        # Padroes comuns: DD/MM/YYYY, DD.MM.YYYY, DD-MM-YYYY, YYYY-MM-DD
        patterns = [
            r'(\d{2})[/-](\d{2})[/-](\d{4})',
            r'(\d{2})\.(\d{2})\.(\d{4})',
            r'(\d{4})[/-](\d{2})[/-](\d{2})'
        ]
        text = str(text)
        for p in patterns:
            match = re.search(p, text)
            if match:
                g = match.groups()
                if len(g[0]) == 4: # YYYY-MM-DD
                    return f"{g[0]}-{g[1]}-{g[2]}"
                else: # DD-MM-YYYY
                    return f"{g[2]}-{g[1]}-{g[0]}"
        return None

    def enrich_all(self, report_path="public/automation_report.json"):
        if not os.path.exists(report_path):
            logging.error("❌ Relatório automation_report.json não encontrado.")
            return

        with open(report_path, "r", encoding="utf-8") as f:
            scan_data = json.load(f)

        logging.info(f"🔍 [OPERÁRIO PRO MAX] - Analisando {len(scan_data)} arquivos...")
        
        updated_count = 0
        for item in scan_data:
            filepath = item.get("path") or item.get("fullPath")
            filename = item["name"].upper()
            
            if not filepath or not os.path.exists(filepath): continue
            
            # --- 1. SETOR FISCAL (AUXILIO NFE) ---
            if filename.endswith(".XML") or "AUXILIO NFE" in filepath.upper():
                client_id, info = self.parse_xml_nfe(filepath)
                if client_id:
                    logging.info(f"✨ [XML] Atualizando {info.get('razao_social', 'Cliente')}")
                    try:
                        self.supabase.table("clientes").update(info).eq("id", client_id).execute()
                        updated_count += 1
                    except Exception as e:
                        logging.debug(f"Erro update cliente: {e}")

            # --- 2. SETOR RURAL E VALIDIDADES ---
            # Passar item completo para find_client_id (com cpf_cnpj se disponível)
            client_id = self.find_client_id(item)
            if client_id:
                # 2.1 Identificar Unidade e Dados Rurais
                if any(x in filename for x in ["CAEPF", "CCIR", "ITR", "INCRA", "NIRF", "FAZENDA"]):
                    rural_info = {}
                    caepf = re.search(r'(\d{14})', filename)
                    if caepf: rural_info['documento_id'] = caepf.group(1)
                    
                    farm_name = "GERAL"
                    farm_match = re.search(r'FAZENDA\s+([A-Z0-9\s]+)', filepath.upper())
                    if farm_match: farm_name = farm_match.group(0).strip()
                    
                    if rural_info or farm_name != "GERAL":
                        logging.info(f"🚜 [RURAL] Vinculando Unidade: {farm_name}")
                        try:
                            self.supabase.table("unidades_fiscais").upsert({
                                "cliente_id": client_id,
                                "nome_identificador": farm_name,
                                "documento_id": rural_info.get('documento_id'),
                                "tipo_unidade": "PROPRIEDADE_RURAL",
                                "updated_at": "now()"
                            }, on_conflict="cliente_id, nome_identificador").execute()
                            updated_count += 1
                        except Exception as e:
                            logging.debug(f"Pulo de unidade ou erro: {e}")

                # 2.2 Extrair Datas de Validade (Novo: Atendendo pedido do usuário)
                val_date = self.extract_date(filename + filepath)
                if val_date:
                    doc_type = "OUTROS"
                    if "CERTIFICADO" in filename: doc_type = "CERTIFICADO_DIGITAL"
                    elif "CND" in filename: doc_type = "CND"
                    elif "ITR" in filename: doc_type = "ITR"
                    elif "CCIR" in filename: doc_type = "CCIR"
                    
                    logging.info(f"📅 [VALIDADE] Detectada data {val_date} para {filename}")
                    try:
                        self.supabase.table("controle_validades").upsert({
                            "cliente_id": client_id,
                            "tipo_documento": doc_type,
                            "data_vencimento": val_date,
                            "observacoes": f"Detectado via automação em {filename}",
                            "updated_at": "now()"
                        }, on_conflict="cliente_id, tipo_documento, data_vencimento").execute()
                        updated_count += 1
                    except Exception as e:
                        logging.debug(f"Erro ao salvar validade: {e}")

        logging.info(f"✅ Fim da missão. {updated_count} operações realizadas.")

if __name__ == "__main__":
    enricher = BrandaoEnricher()
    enricher.enrich_all()
