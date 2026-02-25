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

def search():
    service = get_drive_service()
    
    # Busca Maquita
    print("Buscando MAQUITA...")
    res = service.files().list(
        q="name contains 'MAQUITA' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields="files(id, name, parents)"
    ).execute()
    for f in res.get('files', []):
        print(f" - {f['name']} (ID: {f['id']}, Parents: {f.get('parents', [])})")

    # Busca Aroldo
    print("\nBuscando AROLDO...")
    res2 = service.files().list(
        q="name contains 'AROLDO' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields="files(id, name, parents)"
    ).execute()
    for f in res2.get('files', []):
        print(f" - {f['name']} (ID: {f['id']}, Parents: {f.get('parents', [])})")

search()
