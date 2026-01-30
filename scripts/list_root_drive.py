import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv('.env.local')

SCOPES = ['https://www.googleapis.com/auth/drive']
ROOT_DRIVE_ID = "1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP"

def list_root_folders():
    creds_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
    creds_info = json.loads(creds_json)
    creds = service_account.Credentials.from_service_account_info(creds_info, scopes=SCOPES)
    service = build('drive', 'v3', credentials=creds)

    print(f"--- Listando pastas na Raiz: {ROOT_DRIVE_ID} ---")
    query = f"'{ROOT_DRIVE_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
    results = service.files().list(q=query, fields="files(id, name)").execute()
    folders = results.get('files', [])

    if not folders:
        print("Nenhuma pasta encontrada.")
    else:
        for f in folders:
            print(f"Nome: {f['name']} | ID: {f['id']}")

if __name__ == "__main__":
    list_root_folders()
