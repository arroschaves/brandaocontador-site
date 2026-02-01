import os
import requests
import json
import time
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
SCOPES = ['https://www.googleapis.com/auth/drive']

def log(msg):
    print(msg)

def test_aroldo_audit():
    creds_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
    creds_info = json.loads(creds_json)
    creds = service_account.Credentials.from_service_account_info(creds_info, scopes=SCOPES)
    service = build('drive', 'v3', credentials=creds)

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }

    # Busca Aroldo
    r = requests.get(f"{SUPABASE_URL}/rest/v1/clientes?nome=ilike.*AROLDO*&select=id,nome,drive_folder_id", headers=headers)
    clients = r.json()
    
    for c in clients:
        log(f"🔎 Testando: {c['nome']} | ID: {c['drive_folder_id']}")
        # Vamos apenas listar as pastas profundas para ver se o auditor chegaria lá
        
        def list_deep(fid, depth=0):
            if depth > 5: return
            try:
                res = service.files().list(q=f"'{fid}' in parents and trashed=false", fields="files(id, name, mimeType)").execute()
                for f in res.get('files', []):
                    log("  " * depth + f"|- {f['name']} ({f['mimeType']})")
                    if f['mimeType'] == 'application/vnd.google-apps.folder':
                        list_deep(f['id'], depth + 1)
            except: pass

        list_deep(c['drive_folder_id'])

if __name__ == "__main__":
    test_aroldo_audit()
