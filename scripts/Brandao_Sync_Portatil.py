#!/usr/bin/env python3
"""
BRANDÃO SENTINELA V6 - MATRIX EDITION (REAL UPLOAD)
===================================================
Monitoramento e Upload de documentos para o Google Drive.
Mapeamento inteligente Agro Master 2026.
"""

import os
import requests
import json
import time
import socket
import platform
import xml.etree.ElementTree as ET
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from dotenv import load_dotenv

# Carregar do .env.local se disponível (para desenvolvimento local)
load_dotenv('.env.local')

# --- CONFIGURAÇÕES DO AMBIENTE ---
SUPABASE_URL = "https://escritoriobrandao-supabase.3ow2vi.easypanel.host"
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

# CAMINHOS MESTRES DA MATRIZ (PC Alessandro)
MATRIX_PATHS = [
    r"C:\Users\Alessandro\Documents\JUNTA COMERCIAL",
    r"C:\Users\Alessandro\Documents\SEFAZ MS",
    r"C:\Users\Alessandro\Documents\CERTIFICADO DIGITAL",
    r"C:\Users\Alessandro\Documents\AUTENTICA",
    r"C:\Users\Alessandro\Documents\CAEPF",
    r"C:\Users\Alessandro\Documents\CCIR",
    r"C:\Users\Alessandro\Documents\NOTAS",
    r"C:\Users\Alessandro\Documents\FATURAMENTO",
    r"C:\Users\Alessandro\Documents\CERTIDOES",
    r"C:\AuxilioNFe\NFE",
    r"F:\ACESSO RAPÍDO\FOLHA PAGAMENTO"
]

HOSTNAME = socket.gethostname()
VERSION = "V6-MATRIX-UPLOAD"
SCOPES = ['https://www.googleapis.com/auth/drive']
ROOT_DRIVE_ID = "1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP" # BRANDAO CONTABILIDADE

# MAPEAMENTO DE MESES
MONTH_MAP = {
    "01": "01_Janeiro", "02": "02_Fevereiro", "03": "03_Marco",
    "04": "04_Abril", "05": "05_Maio", "06": "06_Junho",
    "07": "07_Julho", "08": "08_Agosto", "09": "09_Setembro",
    "10": "10_Outubro", "11": "11_Novembro", "12": "12_Dezembro"
}

DRY_RUN = False # UPLOAD REAL ATIVADO

class SentinelaMatrix:
    def __init__(self):
        self.drive_service = self.init_drive()
        self.client_cache = {} 
        self.unit_cache = {} 
        self.folder_cache = {} # (parent_id, name.upper()) -> folder_id
        self.parent_list_cache = {} # parent_id -> [list of files]

    def log(self, message, type="INFO"):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] [{type}] {message}")

    def get_or_create_folder_cached(self, name, parent_id, is_pj=None):
        if not self.drive_service: return None
        cache_key = (parent_id, name.upper(), is_pj)
        if cache_key in self.folder_cache:
            return self.folder_cache[cache_key]
        
        # Tenta busca exata primeiro
        fid = None
        try:
            # Em vez de buscar na API, olhamos nossa cópia local da pasta pai
            if parent_id not in self.parent_list_cache:
                query = f"'{parent_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
                self.parent_list_cache[parent_id] = self.drive_service.files().list(q=query, fields="files(id, name)").execute().get('files', [])
            
            res = [f for f in self.parent_list_cache[parent_id] if f['name'].upper() == name.upper()]
            if res:
                fid = res[0]['id']
            else:
                # Se não achou exato, tenta busca difusa
                fid = self.find_best_folder_fuzzy_local(name, parent_id, is_pj)

            # Se ainda não achou, e NÃO É A RAIZ DO DRIVE, cria
            if not fid and parent_id != ROOT_DRIVE_ID:
                try:
                    self.log(f"  📁 Criando pasta: {name}")
                    file_metadata = {'name': name, 'parents': [parent_id], 'mimeType': 'application/vnd.google-apps.folder'}
                    f = self.drive_service.files().create(body=file_metadata, fields='id').execute()
                    fid = f.get('id')
                    # Atualiza o list_cache para futuros arquivos na mesma categoria
                    self.parent_list_cache[parent_id].append({'id': fid, 'name': name})
                except Exception as e:
                    self.log(f"Erro ao criar pasta {name}: {e}", "ERROR")

        except Exception as e:
            self.log(f"Erro ao processar pasta {name}: {e}", "ERROR")
        
        self.folder_cache[cache_key] = fid # Cacheia inclusive None
        return fid

    def find_best_folder_fuzzy_local(self, name, parent_id, is_pj=None):
        """Busca similaridade usando a lista já baixada do pai."""
        res = self.parent_list_cache.get(parent_id, [])
        target = name.upper()
        candidates = []
        for f in res:
            f_name = f['name'].upper()
            if is_pj is False and (" PJ" in f_name or " EMPRESA" in f_name): continue
            
            if f_name in target or target in f_name or f_name.split()[0] == target.split()[0]:
                candidates.append(f)

        if candidates:
            if is_pj is False: candidates = sorted(candidates, key=lambda x: (" PJ" in x['name'].upper()))
            elif is_pj is True: candidates = sorted(candidates, key=lambda x: (" PJ" in x['name'].upper()), reverse=True)
            return candidates[0]['id']
        return None


    def init_drive(self):
        try:
            creds_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
            if not creds_json:
                self.log("Credenciais Google não encontradas no ENV.", "ERROR")
                return None
            creds_info = json.loads(creds_json)
            creds = service_account.Credentials.from_service_account_info(creds_info, scopes=SCOPES)
            return build('drive', 'v3', credentials=creds)
        except Exception as e:
            self.log(f"Erro ao iniciar Drive API: {e}", "ERROR")
            return None

    def get_client_by_doc(self, doc):
        """Busca cliente no CRM pelo CPF/CNPJ, ignorando lixo."""
        doc_clean = doc.replace('.','').replace('-','').replace('/','')
        if doc_clean in self.client_cache:
            return self.client_cache[doc_clean]
        
        url = f"{SUPABASE_URL}/rest/v1/clientes?cnpj_cpf=eq.{doc_clean}&select=id,nome"
        headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
        try:
            r = requests.get(url, headers=headers, timeout=10)
            data = r.json()
            if data:
                client = data[0]
                # Filtra se o nome for um timestamp (lixo)
                if client['nome'].startswith('2026-'):
                    return None
                
                self.client_cache[doc_clean] = client
                self.log(f"✅ Cliente: {client['nome']} ({doc_clean})")
                return client
        except Exception as e:
            self.log(f"Erro ao buscar cliente {doc_clean}: {e}", "ERROR")
        return None

    def get_folder_id(self, name, parent_id):
        query = f"'{parent_id}' in parents and name='{name}' and trashed=false"
        res = self.drive_service.files().list(q=query).execute().get('files', [])
        return res[0]['id'] if res else None

    def extract_metadata_from_xml(self, file_path):
        """Lê o XML e captura documentos e IEs do Emitente e Destinatário."""
        docs = [] # Lista de (cnpj_cpf, ie)
        try:
            tree = ET.parse(file_path)
            root = tree.getroot()
            ns = {'nfe': 'http://www.portalfiscal.inf.br/nfe'}
            
            # 1. EMITENTE
            emit = root.find('.//nfe:emit', ns)
            if emit is not None:
                cnpj = emit.find('nfe:CNPJ', ns)
                cpf = emit.find('nfe:CPF', ns)
                ie = emit.find('nfe:IE', ns)
                val = (cnpj.text if cnpj is not None else (cpf.text if cpf is not None else None))
                if val: docs.append((val, (ie.text if ie is not None else None)))

            # 2. DESTINATÁRIO
            dest = root.find('.//nfe:dest', ns)
            if dest is not None:
                cnpj = dest.find('nfe:CNPJ', ns)
                cpf = dest.find('nfe:CPF', ns)
                ie = dest.find('nfe:IE', ns)
                val = (cnpj.text if cnpj is not None else (cpf.text if cpf is not None else None))
                if val: docs.append((val, (ie.text if ie is not None else None)))
                    
        except: pass
        return docs

    def get_client_units(self, client_id):
        if client_id in self.unit_cache: return self.unit_cache[client_id]
        url = f"{SUPABASE_URL}/rest/v1/unidades_fiscais?cliente_id=eq.{client_id}&select=nome_identificador,inscricao_estadual,tipo_unidade"
        headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
        try:
            # self.log(f"  [DEBUG] Chamando Supabase para unidades...")
            r = requests.get(url, headers=headers, timeout=10)
            self.unit_cache[client_id] = r.json()
            # self.log(f"  [DEBUG] Unidades carregadas: {len(self.unit_cache[client_id])}")
            return self.unit_cache[client_id]
        except Exception as e:
            self.log(f"Erro ao buscar unidades {client_id}: {e}", "ERROR")
            return []

    def categorize(self, local_root):
        norm = local_root.upper()
        if "JUNTA" in norm: return "02 - JURÍDICO"
        if "CERTIDOES" in norm or "SEFAZ" in norm: return "03 - CERTIDÕES"
        if "FOLHA" in norm: return "05 - FOLHA DE PAGAMENTO"
        if "NFE" in norm or "NOTAS" in norm or "FATURAMENTO" in norm: return "FISCAL"
        if "CCIR" in norm or "CAEPF" in norm: return "TERRA"
        return "00 - OUTROS"

    def upload_file(self, file_path, drive_folder_id):
        file_name = os.path.basename(file_path)
        # Checar se já existe (usando cache local da pasta pai)
        try:
            if drive_folder_id not in self.parent_list_cache:
                # self.log(f"  [DEBUG] Listando pasta destino...")
                query = f"'{drive_folder_id}' in parents and trashed=false"
                self.parent_list_cache[drive_folder_id] = self.drive_service.files().list(q=query, fields="files(id, name)").execute().get('files', [])
            
            exists = [f for f in self.parent_list_cache[drive_folder_id] if f['name'] == file_name]
            if exists:
                return "EXISTS"
        except Exception as e:
            self.log(f"Erro ao verificar existência de {file_name}: {e}", "ERROR")

        if DRY_RUN: return "DRY"

        try:
            self.log(f"  🚀 ENVIANDO: {file_name}")
            file_metadata = {'name': file_name, 'parents': [drive_folder_id]}
            media = MediaFileUpload(file_path, resumable=True)
            res = self.drive_service.files().create(body=file_metadata, media_body=media, fields='id').execute()
            if res.get('id'):
                # self.log(f"✅ Sucesso: {file_name}")
                self.parent_list_cache[drive_folder_id].append({'id': res.get('id'), 'name': file_name})
                return "UPLOADED"
        except Exception as e:
            self.log(f"Falha ao subir {file_name}: {e}", "ERROR")
            return "ERROR"
        return "NONE"

    def process_file(self, file_path, local_root):
        file_name = os.path.basename(file_path)
        found_docs = []
        
        # self.log(f"  [DEBUG] Lendo {file_name}...")
        if file_path.lower().endswith('.xml'):
            found_docs = self.extract_metadata_from_xml(file_path)
        
        if not found_docs: return
            
        # self.log(f"  ✨ XML com Dados: {found_docs}")
        # Tenta identificar qual documento da nota é nosso cliente
        client = None
        matched_doc, matched_ie = None, None
        
        for doc, ie in found_docs:
            client = self.get_client_by_doc(doc)
            if client:
                matched_doc, matched_ie = doc, ie
                break
        
        if not client: return

        is_pj = len(matched_doc) == 14
        # self.log(f"  [DEBUG] Cliente OK: {client['nome']} (PJ: {is_pj})")

        # Localizar Pasta Raiz
        client_root_id = self.get_or_create_folder_cached(client['nome'].upper(), ROOT_DRIVE_ID, is_pj=is_pj)
        if not client_root_id: 
            self.log(f"  ❌ Sem pasta raiz no Drive para: {client['nome']}", "ERROR")
            return
        
        self.log(f"  [DEBUG] Raiz Drive OK: {client_root_id}")

        cat = self.categorize(local_root)
        self.log(f"  [DEBUG] Categoria Local: {cat}")
        target_id = None
        
        try:
            if cat == "FISCAL":
                root_cat = "EMPRESAS" if is_pj else "FAZENDAS"
                self.log(f"  [DEBUG] Buscando sub-pasta: {root_cat}")
                root_cat_id = self.get_or_create_folder_cached(root_cat, client_root_id, is_pj=is_pj)
                if not root_cat_id: 
                    self.log(f"  ❌ Pasta de categoria {root_cat} não encontrada para {client['nome']}", "ERROR")
                    return
                
                self.log(f"  [DEBUG] Categoria Drive OK: {root_cat_id}")

                # Match Unidade
                self.log(f"  [DEBUG] Buscando Unidades no CRM...")
                units = self.get_client_units(client['id'])
                target_unit_name = "GERAL"
                if matched_ie:
                    match = next((u for u in units if u.get('inscricao_estadual') == matched_ie), None)
                    if match: target_unit_name = match['nome_identificador']
                elif is_pj:
                    # Se for empresa, tenta achar a pasta com o nome do cliente ou GERAL
                    target_unit_name = client['nome']

                u_folder_id = self.get_or_create_folder_cached(target_unit_name.upper(), root_cat_id)
                if not u_folder_id:
                    u_folder_id = self.get_or_create_folder_cached("GERAL", root_cat_id)
                
                if not u_folder_id: 
                    u_folder_id = root_cat_id # Fallback total

                self.log(f"  📂 Unidade: {target_unit_name}")

                fiscal_root = self.get_or_create_folder_cached("FISCAL", u_folder_id)
                if not fiscal_root: fiscal_root = u_folder_id # Fallback
                
                # self.log(f"  📂 Pasta FISCAL OK")

                # Extrair Ano e Mês (Re-lendo XML se necessário ou usando data atual)
                file_date = datetime.now().strftime("%Y-%m-%d")
                try: 
                    tree = ET.parse(file_path)
                    dhEmi = tree.getroot().find('.//nfe:dhEmi', {'nfe': 'http://www.portalfiscal.inf.br/nfe'})
                    if dhEmi is not None: file_date = dhEmi.text[:10]
                except: pass

                year = file_date[:4]
                month_num = file_date[5:7]
                month_name = MONTH_MAP.get(month_num, "00_Outros")

                year_id = self.get_or_create_folder_cached(year, fiscal_root)
                target_id = self.get_or_create_folder_cached(month_name, year_id)
                # if target_id: self.log(f"  📂 Destino: {year}/{month_name}")

            elif cat == "05 - FOLHA DE PAGAMENTO":
                rh_root = self.get_or_create_folder_cached("FOLHA DE PAGAMENTO", client_root_id)
                if not rh_root: 
                    self.log("  ❌ Falha ao localizar/criar pasta RH", "ERROR")
                    return "ERROR"
                
                # Tenta extrair ano do caminho se for RH (Padrão: ...\2025\01_Janeiro)
                year = datetime.now().strftime("%Y")
                month_name = MONTH_MAP.get(datetime.now().strftime("%m"))
                for part in local_root.split(os.sep):
                    if part.isdigit() and len(part) == 4: year = part
                    if "_" in part and part[:2].isdigit(): month_name = part

                cat_rh = self.get_or_create_folder_cached("RECIBO", rh_root)
                if not cat_rh: cat_rh = rh_root # Fallback para a raiz do RH

                year_id = self.get_or_create_folder_cached(year, cat_rh)
                target_id = self.get_or_create_folder_cached(month_name, year_id)
            
            else:
                target_id = self.get_or_create_folder_cached(cat, client_root_id)

            if target_id:
                self.upload_file(file_path, target_id)
            else:
                # self.log(f"❌ Caminho de destino incompleto para: {file_name} (Categoria: {cat})", "WARNING")
                pass
        except Exception as e:
            self.log(f"Erro ao processar arquivo {file_name}: {e}", "ERROR")

    def scan(self):
        self.log(f"Iniciando Ronda Sentinela V6 (Matriz)")
        stats = {"total": 0, "uploaded": 0, "exists": 0, "skipped": 0}
        self.parent_list_cache = {} # Limpa cache de listagem a cada ronda
        
        for path in MATRIX_PATHS:
            if not os.path.exists(path): 
                self.log(f"Caminho não encontrado: {path}", "WARNING")
                continue
            
            self.log(f"Varrendo: {path}...")
            for root, dirs, files in os.walk(path):
                for file in files:
                    if file.lower().endswith(('.xml', '.pdf')):
                        stats["total"] += 1
                        res = self.process_file(os.path.join(root, file), root)
                        
                        if res == "UPLOADED": stats["uploaded"] += 1
                        elif res == "EXISTS": stats["exists"] += 1
                        else: stats["skipped"] += 1

                        if stats["total"] % 5 == 0:
                            self.log(f"📊 Progresso: {stats['total']} lidos | {stats['uploaded']} novos | {stats['exists']} já no Drive")
        
        self.log(f"🏁 Ronda finalizada: {stats['total']} total | {stats['uploaded']} subiram | {stats['exists']} ignorados.")

def main():
    sentinela = SentinelaMatrix()
    while True:
        sentinela.scan()
        time.sleep(600) # Ronda a cada 10 min

if __name__ == "__main__":
    main()
