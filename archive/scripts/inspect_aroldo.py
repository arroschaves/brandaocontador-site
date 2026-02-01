#!/usr/bin/env python3
import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv('.env.local')
SCOPES = ['https://www.googleapis.com/auth/drive']
ROOT_FOLDER_ID = "1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP"

def get_drive_service():
    creds_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
    creds_info = json.loads(creds_json)
    creds = service_account.Credentials.from_service_account_info(creds_info, scopes=SCOPES)
    return build('drive', 'v3', credentials=creds)

def inspect_client(client_name):
    service = get_drive_service()
    query = f"name contains '{client_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    results = service.files().list(q=query, fields="files(id, name)").execute()
    clients = results.get('files', [])
    
    for client in clients:
        print(f"\n📁 Analisando Estrutura de: {client['name']} ({client['id']})")
        # Listar todas as subpastas recursivamente
        subquery = f"mimeType='application/vnd.google-apps.folder' and trashed=false"
        # Nota: Google Drive API não suporta busca recursiva por ID de pai facilmente sem múltiplos níveis. 
        # Vou listar as de primeiro nível.
        items = service.files().list(q=f"'{client['id']}' in parents and trashed=false", fields="files(id, name, mimeType)").execute()
        for item in items.get('files', []):
            print(f"  - {item['name']} ({'Pasta' if item['mimeType'] == 'application/vnd.google-apps.folder' else 'Arquivo'})")
            if item['mimeType'] == 'application/vnd.google-apps.folder':
                 subitems = service.files().list(q=f"'{item['id']}' in parents and trashed=false", fields="files(id, name, mimeType)").execute()
                 for si in subitems.get('files', []):
                     print(f"    -- {si['name']} ({'Pasta' if si['mimeType'] == 'application/vnd.google-apps.folder' else 'Arquivo'})")

if __name__ == "__main__":
    inspect_client("AROLDO")
