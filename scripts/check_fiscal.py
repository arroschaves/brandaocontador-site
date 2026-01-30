
import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv('.env.local')

creds_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
creds = service_account.Credentials.from_service_account_info(json.loads(creds_json), scopes=['https://www.googleapis.com/auth/drive'])
service = build('drive', 'v3', credentials=creds)

def list_subfolders(parent_id, label):
    print(f"\n--- Subpastas de {label} ({parent_id}) ---")
    query = f"'{parent_id}' in parents and trashed=false"
    res = service.files().list(q=query, fields='files(id, name, mimeType)').execute()
    for f in res.get('files', []):
        print(f"[{'DIR' if f['mimeType'] == 'application/vnd.google-apps.folder' else 'FILE'}] {f['name']} ({f['id']})")

# Listar dentro de "FAZENDA_MODELO_EXEMPLO"
list_subfolders("1_iR1D3HoYC9X9Op7nJO47P4D2InUn_M8", "FAZENDA_MODELO_EXEMPLO")
