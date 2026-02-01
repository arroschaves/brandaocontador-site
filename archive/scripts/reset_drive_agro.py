
import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from datetime import datetime
from dotenv import load_dotenv

load_dotenv('.env.local')

SCOPES = ['https://www.googleapis.com/auth/drive']
ROOT_FOLDER_ID = "1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP" # BRANDAO CONTABILIDADE

# Estrutura Padrão Agro-Empresarial
STANDARD_STRUCTURE = [
    "01 - DOCUMENTOS PESSOAIS",
    "02 - JURÍDICO E CONTRATOS (JUCEMS)",
    "03 - CERTIDÕES (CNDs)",
    "04 - ALVARÁS",
    "05 - FAZENDAS / UNIDADES AGRO",
    "06 - EMPRESAS (CNPJ)"
]

MONTHS = [
    "01_Janeiro", "02_Fevereiro", "03_Marco", "04_Abril", 
    "05_Maio", "06_Junho", "07_Julho", "08_Agosto", 
    "09_Setembro", "10_Outubro", "11_Novembro", "12_Dezembro", "13_Salario"
]

class AgroDriveReset:
    def __init__(self, execute=False):
        self.execute = execute
        self.service = self.get_drive_service()

    def get_drive_service(self):
        creds_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
        creds_info = json.loads(creds_json)
        creds = service_account.Credentials.from_service_account_info(creds_info, scopes=SCOPES)
        return build('drive', 'v3', credentials=creds)

    def get_or_create(self, name, parent_id):
        query = f"'{parent_id}' in parents and name='{name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
        res = self.service.files().list(q=query).execute().get('files', [])
        if res: return res[0]['id']
        if not self.execute: return f"DRY_RUN_{name}"
        body = {'name': name, 'parents': [parent_id], 'mimeType': 'application/vnd.google-apps.folder'}
        return self.service.files().create(body=body, fields='id').execute()['id']

    def setup_client(self, client_name, client_id):
        print(f"\n🚜 Padronizando: {client_name}")
        
        # Criar base 1-6
        base_folders = {}
        for folder in STANDARD_STRUCTURE:
            base_folders[folder] = self.get_or_create(folder, client_id)
            
        print(f"  ✅ Estrutura Base Criada.")
        return base_folders

    def organize(self):
        # 1. Obter todos os clientes
        query = f"'{ROOT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
        clients = self.service.files().list(q=query).execute().get('files', [])
        
        for client in clients:
            # Pular pastas de sistema
            if client['name'].startswith('_'): continue
            
            # Criar a estrutura
            base = self.setup_client(client['name'], client['id'])
            
            # Aqui poderíamos mover arquivos antigos...
            # Mas vamos focar em deixar a estrutura pronta para o novo Sentinela.

if __name__ == "__main__":
    resetter = AgroDriveReset(execute=True)
    resetter.organize()
