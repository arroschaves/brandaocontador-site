
import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv('.env.local')

creds_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
creds = service_account.Credentials.from_service_account_info(json.loads(creds_json), scopes=['https://www.googleapis.com/auth/drive'])
service = build('drive', 'v3', credentials=creds)

query = "'1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
res = service.files().list(q=query, fields='files(id, name)').execute()
folders = [f['name'] for f in res.get('files', [])]

for name in sorted(folders):
    print(name)
