import os
import requests
import json
import time
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

# Carrega .env.local
load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
ROOT_DRIVE_ID = "1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP"
LOCAL_ROOT = r"C:\Brandao_Contabilidade"
SCOPES = ['https://www.googleapis.com/auth/drive']

# Mapeamento do Padrão Brandão 2026
MAPPING = {
    "DAS": "DAS",
    "FOLHA": "FOLHA",
    "RECIBO": "FOLHA",
    "FGTS": "FGTS",
    "INSS": "INSS",
    "DCTF": "DCTF",
    "DARF": "DARF",
    "CCIR": "ITR_CCIR",
    "ITR": "ITR_CCIR",
    "CND": "CND_CERT",
    "NOTAS": "XML_NF",
    "NFE": "XML_NF",
    "FATURAMENTO": "XML_NF"
}

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

class BrandaoCloudAuditor:
    def __init__(self):
        self.headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }
        self.drive_service = self.init_drive()
        self.stats = {"updated": 0, "verified": 0}

    def init_drive(self):
        try:
            creds_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
            creds_info = json.loads(creds_json)
            creds = service_account.Credentials.from_service_account_info(creds_info, scopes=SCOPES)
            return build('drive', 'v3', credentials=creds)
        except Exception as e:
            log(f"Erro ao iniciar Drive API: {e}")
            return None

    def load_clients(self):
        try:
            r = requests.get(f"{SUPABASE_URL}/rest/v1/clientes?select=id,nome,cnpj_cpf,drive_folder_id", headers=self.headers)
            return r.json()
        except: return []

    def update_obligation(self, client_id, tipo, competence, status='concluido'):
        url = f"{SUPABASE_URL}/rest/v1/obrigacoes_acessorias?cliente_id=eq.{client_id}&tipo=eq.{tipo}&competencia=eq.{competence}"
        r = requests.get(url, headers=self.headers)
        data = r.json()

        if data:
            if data[0]['status'] != 'concluido':
                obj_id = data[0]['id']
                requests.patch(f"{SUPABASE_URL}/rest/v1/obrigacoes_acessorias?id=eq.{obj_id}", 
                               json={"status": status}, headers=self.headers)
                self.stats["updated"] += 1
        else:
            requests.post(f"{SUPABASE_URL}/rest/v1/obrigacoes_acessorias", 
                         json={"cliente_id": client_id, "tipo": tipo, "competencia": competence, "status": status}, 
                         headers=self.headers)
            self.stats["updated"] += 1

    def audit_folder_recursive(self, folder_id, client_id, current_path=""):
        try:
            query = f"'{folder_id}' in parents and trashed=false"
            results = self.drive_service.files().list(q=query, fields="files(id, name, mimeType)").execute()
            items = results.get('files', [])

            has_files = any(i['mimeType'] != 'application/vnd.google-apps.folder' for i in items)
            
            # Se tem arquivos nesta pasta, vamos tentar identificar a obrigação
            if has_files:
                # Detectar competência
                year, month = None, None
                parts = current_path.split("/")
                for p in parts:
                    if p.isdigit() and len(p) == 4: year = p
                    if "_" in p and p[:2].isdigit(): month = p[:2]
                
                if year and month:
                    competence = f"{year}-{month}-01"
                    # Detectar tipo pelo nome da pasta (última parte do path ou nome da pasta atual)
                    folder_name = current_path.split("/")[-1].upper()
                    # Também checa partes superiores do path (ex: RECIBO_FOLHA)
                    full_upper = current_path.upper()
                    
                    tipo = None
                    for key, val in MAPPING.items():
                        if key in full_upper:
                            tipo = val
                            # Prioridade para o mais específico (ex: FOLHA vs DAS)
                    
                    if tipo:
                        self.update_obligation(client_id, tipo, competence)

            # Continua recursão
            for item in items:
                if item['mimeType'] == 'application/vnd.google-apps.folder':
                    new_path = f"{current_path}/{item['name']}" if current_path else item['name']
                    self.audit_folder_recursive(item['id'], client_id, new_path)

        except Exception as e:
            log(f"Erro ao auditar pasta {folder_id}: {e}")

    def run_cloud_audit(self):
        log("☁️ Iniciando Auditoria Direta no Google Drive...")
        clients = self.load_clients()
        
        for c in clients:
            if not c.get('drive_folder_id'): continue
            
            log(f"🔎 Auditando Drive: {c['nome']}")
            self.stats["verified"] += 1
            self.audit_folder_recursive(c['drive_folder_id'], c['id'])

        log(f"🏁 Auditoria Cloud Concluída! {self.stats['verified']} clientes verificados, {self.stats['updated']} obrigações atualizadas.")

if __name__ == "__main__":
    auditor = BrandaoCloudAuditor()
    auditor.run_cloud_audit()
