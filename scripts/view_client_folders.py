import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv('.env.local')

def get_service():
    info = json.loads(os.getenv('GOOGLE_CREDENTIALS_JSON'))
    creds = service_account.Credentials.from_service_account_info(
        info, scopes=['https://www.googleapis.com/auth/drive.readonly']
    )
    return build('drive', 'v3', credentials=creds)

def list_children(service, folder_id, name):
    print(f"\n--- Estrutura Nível 1 de {name} ---")
    res = service.files().list(
        q=f"'{folder_id}' in parents and trashed=false",
        fields="files(id, name, mimeType)",
        orderBy="name"
    ).execute()
    for f in res.get('files', []):
        icon = '📁' if f['mimeType'] == 'application/vnd.google-apps.folder' else '📄'
        print(f"{icon} {f['name']}")

try:
    service = get_service()
    list_children(service, '1n3rqM9DfuBgdgoMvuI51O3c3O4eTO0L6', 'MAQUITA')
    list_children(service, '1Iy1YrWQWjaV-y9j6InIQ3QQCis7qcFzT', 'AROLDO FERREIRA CORREA')
except Exception as e:
    print(f"Erro: {e}")
