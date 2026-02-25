import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv('.env.local')

def get_service():
    info = json.loads(os.getenv('GOOGLE_CREDENTIALS_JSON'))
    creds = service_account.Credentials.from_service_account_info(
        info, scopes=['https://www.googleapis.com/auth/drive']
    )
    return build('drive', 'v3', credentials=creds)

def main():
    service = get_service()
    res = service.files().list(
        q="name contains 'AROLDO' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields="files(id, name, parents)",
        supportsAllDrives=True,
        includeItemsFromAllDrives=True
    ).execute()
    
    print("Encontrados (Aroldo):")
    for f in res.get('files', []):
        print(f" - {f['name']} (ID: {f['id']}, Parents: {f.get('parents')})")

    res_maq = service.files().list(
        q="name contains '01_Pessoal_Legal' and trashed=false",
        fields="files(id, name, parents)",
        supportsAllDrives=True,
        includeItemsFromAllDrives=True
    ).execute()
    
    print("\nPastas '01_Pessoal_Legal' criadas:")
    for f in res_maq.get('files', []):
        print(f" - {f['name']} (ID: {f['id']}, Parents: {f.get('parents')})")

if __name__ == "__main__":
    main()
