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

def debug_drive_structure(service, root_id):
    print(f"📂 Debugando estrutura para Root ID: {root_id}")
    
    # Listar TUDO na raiz para ver o que existe
    results = service.files().list(
        q=f"'{root_id}' in parents and trashed = false",
        fields="files(id, name, mimeType)"
    ).execute()
    
    files = results.get('files', [])
    if not files:
        print("📭 Pasta raiz vazia ou sem acesso.")
        return

    print(f"📊 Encontrados {len(files)} itens na raiz:")
    for f in files:
        print(f" - [{f['mimeType']}] {f['name']} (ID: {f['id']})")

if __name__ == "__main__":
    service = get_drive_service()
    root_id = os.getenv('GOOGLE_DRIVE_ROOT_FOLDER_ID')
    debug_drive_structure(service, root_id)
