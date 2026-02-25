import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv('.env.local')

def get_drive_service():
    creds_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
    info = json.loads(creds_json)
    creds = service_account.Credentials.from_service_account_info(
        info, scopes=['https://www.googleapis.com/auth/drive.readonly']
    )
    return build('drive', 'v3', credentials=creds)

def print_tree(service, folder_id, prefix=""):
    # List files and folders inside this folder
    query = f"'{folder_id}' in parents and trashed = false"
    results = service.files().list(q=query, fields="files(id, name, mimeType)", orderBy="name").execute()
    items = results.get('files', [])
    
    if not items:
        return

    for i, item in enumerate(items):
        is_last = (i == len(items) - 1)
        connector = "└── " if is_last else "├── "
        
        if item['mimeType'] == 'application/vnd.google-apps.folder':
            print(f"{prefix}{connector}📁 {item['name']}")
            extension = "    " if is_last else "│   "
            print_tree(service, item['id'], prefix + extension)
        else:
            print(f"{prefix}{connector}📄 {item['name']}")

def main():
    service = get_drive_service()
    root_id = os.getenv('GOOGLE_DRIVE_ROOT_FOLDER_ID')
    
    print("🔍 Iniciando Discovery do Google Drive...\n")
    
    # Listar clients
    # Buscar todos sem limites (pageSize = 1000)
    results = service.files().list(
        q=f"'{root_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
        fields="files(id, name)",
        pageSize=1000
    ).execute()
    
    clients = results.get('files', [])
    if not clients:
        print("Nenhum cliente encontrado na raiz.")
        return

    # Buscar apenas os alvos passados pelo usuário
    pj_client = next((c for c in clients if 'MAQUITA' in c['name'].upper()), None)
    pf_client = next((c for c in clients if 'AROLDO' in c['name'].upper()), None)
    
    targets = []
    if pj_client: targets.append(("PJ (Empresa)", pj_client))
    if pf_client: targets.append(("PF (Produtor/Pessoa)", pf_client))
    
    # Se não achou pelos parênteses, pega os 2 primeiros
    if not targets:
        targets = [("Cliente", c) for c in clients[:2]]

    for tipo, client in targets:
        print("="*60)
        print(f"🏢 MAPEANDO {tipo}: {client['name']}")
        print("="*60)
        print_tree(service, client['id'])
        print("\n")

if __name__ == "__main__":
    main()
