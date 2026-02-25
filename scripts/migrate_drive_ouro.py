import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv('.env.local')

PF_FOLDERS = [
    '01_Pessoal_Legal',
    '02_Produtor_Rural',
    '03_Livro_Caixa_LCDPR',
    '04_Folha_RH'
]

PJ_FOLDERS = [
    '01_Societario_Legal',
    '02_Fiscal_Tributos',
    '03_Contabil_Financeiro',
    '04_Folha_RH'
]

def get_service():
    info = json.loads(os.getenv('GOOGLE_CREDENTIALS_JSON'))
    creds = service_account.Credentials.from_service_account_info(
        info, scopes=['https://www.googleapis.com/auth/drive']
    )
    return build('drive', 'v3', credentials=creds)

def ensure_folders(service, parent_id, is_pj=False):
    target = PJ_FOLDERS if is_pj else PF_FOLDERS
    created_map = {}
    
    # List existing
    res = service.files().list(
        q=f"'{parent_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields="files(id, name)",
        supportsAllDrives=True,
        includeItemsFromAllDrives=True
    ).execute()
    
    existing = {f['name']: f['id'] for f in res.get('files', [])}
    
    for f_name in target:
        if f_name in existing:
            created_map[f_name] = existing[f_name]
            print(f"✔️ Pasta já existe na raiz: {f_name}")
        else:
            print(f"➕ Criando pasta Departamento Oficial: {f_name}")
            folder_metadata = {
                'name': f_name,
                'mimeType': 'application/vnd.google-apps.folder',
                'parents': [parent_id]
            }
            folder = service.files().create(
                body=folder_metadata, 
                fields='id',
                supportsAllDrives=True
            ).execute()
            created_map[f_name] = folder.get('id')
            
    return created_map, existing

def run_migration(folder_id, cnpj_cpf):
    service = get_service()
    digits = ''.join(filter(str.isdigit, cnpj_cpf))
    is_pj = len(digits) >= 14
    
    print(f"\n🚀 Iniciando Migração Padrão Ouro para ID: {folder_id} ({'PJ - EMPRESA' if is_pj else 'PF - PRODUTOR RURAL'})")
    new_folders, old_folders = ensure_folders(service, folder_id, is_pj)
    
    print("\n---------------------------------------------------")
    print("✅ DEPARTAMENTOS OURO INJETADOS COM SUCESSO.")
    print("Os arquivos soltos e o legado poderão ser movidos para estas grandes pastas mestras.")
    print("---------------------------------------------------")

if __name__ == "__main__":
    # Test IDs obtained from the discovery (Os 2 Produtores Rurais)
    
    # MAQUITA (CPF: 23092394100 - Produtor Rural)
    run_migration('1n3rqM9DfuBgdgoMvuI51O3c3O4eTO0L6', '23092394100')
    
    # AROLDO FERREIRA CORREA (CPF: 07388152172 - Produtor Rural)
    run_migration('1Iy1YrWQWjaV-y9j6InIQ3QQCis7qcFzT', '07388152172')
