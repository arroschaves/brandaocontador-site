
import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv('.env.local')

creds_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
creds = service_account.Credentials.from_service_account_info(json.loads(creds_json), scopes=['https://www.googleapis.com/auth/drive'])
service = build('drive', 'v3', credentials=creds)

# ID da Denise Fazenda (descoberto via fuzzy nos logs anteriores ou buscando agora)
def list_subfolders(parent_id, label):
    print(f"\n--- Subpastas de {label} ({parent_id}) ---")
    query = f"'{parent_id}' in parents and trashed=false"
    res = service.files().list(q=query, fields='files(id, name, mimeType)').execute()
    for f in res.get('files', []):
        print(f"[{'DIR' if f['mimeType'] == 'application/vnd.google-apps.folder' else 'FILE'}] {f['name']} ({f['id']})")

# 1. Buscar Denise Fazenda
query_denise = "name contains 'DENISE GRANATA FAZENDA' and trashed=false"
res_denise = service.files().list(q=query_denise).execute().get('files', [])
if res_denise:
    denise_id = res_denise[0]['id']
    list_subfolders(denise_id, "DENISE GRANATA FAZENDA")
    
    # 2. Se houver pasta 06 ou 07, listar dentro dela
    query_cat = f"'{denise_id}' in parents and name contains '06' and trashed=false"
    res_cat = service.files().list(q=query_cat).execute().get('files', [])
    if res_cat:
        cat_id = res_cat[0]['id']
        list_subfolders(cat_id, res_cat[0]['name'])
else:
    print("Denise não encontrada.")
