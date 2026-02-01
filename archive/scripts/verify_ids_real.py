import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv('.env.local')

SCOPES = ['https://www.googleapis.com/auth/drive']

def check_drive_objects():
    creds_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
    creds_info = json.loads(creds_json)
    creds = service_account.Credentials.from_service_account_info(creds_info, scopes=SCOPES)
    service = build('drive', 'v3', credentials=creds)

    # Pegar os primeiros IDs do banco
    # Vou testar alguns conhecidos
    test_ids = [
        "1dx40bMMrjdCunLhJBe-c479oGkMhbS7E", # AABB
        "1I036W0EVn9WNYW_RP8L__V5i9rMfwwE_", # ITAOCA
    ]

    for fid in test_ids:
        try:
            res = service.files().get(fileId=fid, fields="id, name, mimeType").execute()
            print(f"ID: {fid} | Nome: {res['name']} | Tipo: {res['mimeType']}")
        except Exception as e:
            print(f"Erro no ID {fid}: {e}")

if __name__ == "__main__":
    check_drive_objects()
