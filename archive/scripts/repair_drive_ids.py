import os
import json
import requests
import re
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
ROOT_DRIVE_ID = "1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP"
SCOPES = ['https://www.googleapis.com/auth/drive']

def log(msg):
    print(msg)

def get_drive_service():
    creds_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
    creds_info = json.loads(creds_json)
    creds = service_account.Credentials.from_service_account_info(creds_info, scopes=SCOPES)
    return build('drive', 'v3', credentials=creds)

def clean_doc(doc):
    return re.sub(r'\D', '', str(doc))

def repair_drive_ids():
    service = get_drive_service()
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

    log("📡 Buscando todos os clientes do Supabase...")
    r = requests.get(f"{SUPABASE_URL}/rest/v1/clientes?select=id,nome,cnpj_cpf", headers=headers)
    clientes = r.json()
    
    log(f"📡 Listando pastas no Google Drive (Raiz: {ROOT_DRIVE_ID})...")
    query = f"'{ROOT_DRIVE_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
    results = service.files().list(q=query, fields="files(id, name)", pageSize=1000).execute()
    drive_folders = results.get('files', [])
    
    log(f"✅ {len(drive_folders)} pastas encontradas no Drive.")

    updates = 0
    for c in clientes:
        client_doc = clean_doc(c['cnpj_cpf'])
        client_name = c['nome'].upper()
        
        # Tenta encontrar a pasta pelo documento Primeiro
        match = None
        for df in drive_folders:
            df_name = df['name'].upper()
            if client_doc and client_doc in clean_doc(df_name) and len(client_doc) > 5:
                match = df
                break
        
        # Se não achou por doc, tenta por nome (fuzzy match)
        if not match:
            for df in drive_folders:
                df_name = df['name'].upper()
                if client_name in df_name or df_name in client_name:
                    match = df
                    break
        
        if match:
            log(f"🔄 Corrigindo: {client_name} -> ID: {match['id']} (Pasta: {match['name']})")
            requests.patch(f"{SUPABASE_URL}/rest/v1/clientes?id=eq.{c['id']}", 
                          json={"drive_folder_id": match['id']}, headers=headers)
            updates += 1
        else:
            log(f"⚠️ Não encontrada: {client_name}")

    log(f"🏁 Finalizado! {updates} IDs de pastas corrigidos.")

if __name__ == "__main__":
    repair_drive_ids()
