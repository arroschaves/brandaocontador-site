import os
import json
import requests
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
SCOPES = ['https://www.googleapis.com/auth/drive']

def log(msg):
    print(msg)

def sync_fazenda_folders():
    creds_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
    creds_info = json.loads(creds_json)
    creds = service_account.Credentials.from_service_account_info(creds_info, scopes=SCOPES)
    service = build('drive', 'v3', credentials=creds)

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }

    log("­ƒôí Buscando Unidades Fiscais (Fazendas) no Supabase...")
    r = requests.get(f"{SUPABASE_URL}/rest/v1/unidades_fiscais?select=id,nome_identificador,cliente_id", headers=headers)
    unidades = r.json()

    # Cache de pastas de clientes
    client_cache = {}

    for u in unidades:
        cid = u['cliente_id']
        if cid not in client_cache:
            rc = requests.get(f"{SUPABASE_URL}/rest/v1/clientes?id=eq.{cid}&select=nome,drive_folder_id", headers=headers)
            cdata = rc.json()
            if cdata:
                client_cache[cid] = cdata[0]
        
        client = client_cache.get(cid)
        if not client or not client.get('drive_folder_id'):
            continue
        
        fazenda_name = u['nome_identificador'].upper()
        parent_id = client['drive_folder_id']

        # Verifica se a pasta da fazenda j├í existe na raiz do cliente
        query = f"'{parent_id}' in parents and name='{fazenda_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
        res = service.files().list(q=query, fields="files(id)").execute()
        
        if not res.get('files'):
            log(f"­ƒôü Criando pasta da Fazenda '{fazenda_name}' para o cliente '{client['nome']}'")
            file_metadata = {
                'name': fazenda_name,
                'parents': [parent_id],
                'mimeType': 'application/vnd.google-apps.folder'
            }
            service.files().create(body=file_metadata, fields='id').execute()
        else:
            log(f"Ô£à Fazenda '{fazenda_name}' j├í possui pasta para '{client['nome']}'")

if __name__ == "__main__":
    sync_fazenda_folders()
