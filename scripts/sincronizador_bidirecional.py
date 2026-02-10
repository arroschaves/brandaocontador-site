import os
import io
import pickle
import datetime
import time
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

# --- CONFIGURAÇÃO ---
LOCAL_ROOT = r'C:\Brandao_Contabilidade'
DRIVE_ROOT_ID = '1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP'  # Pasta "Brandão Contabilidade CRM"
SCOPES = ['https://www.googleapis.com/auth/drive']
ignored_files = ['desktop.ini', 'Thumbs.db', '.DS_Store']

def get_service():
    creds = None
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    return build('drive', 'v3', credentials=creds)

def list_drive_folder(service, folder_id):
    results = {}
    page_token = None
    while True:
        try:
            response = service.files().list(
                q=f"'{folder_id}' in parents and trashed=false",
                fields="nextPageToken, files(id, name, mimeType, modifiedTime, size)",
                pageToken=page_token
            ).execute()
            
            for file in response.get('files', []):
                results[file['name']] = file
            page_token = response.get('nextPageToken', None)
            if page_token is None:
                break
        except Exception as e:
            print(f"Erro ao listar pasta {folder_id}: {e}")
            break
    return results

def sync_recursive(service, local_path, drive_folder_id):
    if not os.path.exists(local_path):
        os.makedirs(local_path)
    
    print(f"📂 Sincronizando: {local_path} <-> Drive: {drive_folder_id}")
    
    # 1. Pega estado Atual
    drive_items = list_drive_folder(service, drive_folder_id)
    local_items = os.listdir(local_path)
    
    # 2. Upload (Local -> Drive) e Criação de Pastas Locais no Drive
    for item in local_items:
        if item in ignored_files: continue
        
        full_path = os.path.join(local_path, item)
        
        if os.path.isdir(full_path):
            # É pasta local: Garante que existe no Drive
            if item not in drive_items:
                print(f"⬆️ Criando pasta no Drive: {item}")
                file_metadata = {
                    'name': item,
                    'parents': [drive_folder_id],
                    'mimeType': 'application/vnd.google-apps.folder'
                }
                folder = service.files().create(body=file_metadata, fields='id').execute()
                drive_items[item] = folder # Atualiza lista local
            
            # Recurse
            sync_recursive(service, full_path, drive_items[item]['id'])
            
        else:
            # É arquivo local: Garante que existe no Drive
            if item not in drive_items:
                print(f"⬆️ Uploading: {item}")
                file_metadata = {'name': item, 'parents': [drive_folder_id]}
                media = MediaFileUpload(full_path, resumable=True)
                service.files().create(body=file_metadata, media_body=media, fields='id').execute()

    # 3. Download (Drive -> Local) e Criação de Pastas Remotas no Local
    for name, meta in drive_items.items():
        local_path_item = os.path.join(local_path, name)
        
        if meta['mimeType'] == 'application/vnd.google-apps.folder':
            if not os.path.exists(local_path_item):
                print(f"⬇️ Criando pasta Local: {name}")
                os.makedirs(local_path_item)
            # Recurse (já feito no loop acima se existisse local, mas se é novo remoto, precisa entrar)
            # Para evitar duplo processamento, idealmente teríamos um set de processed_folders
            sync_recursive(service, local_path_item, meta['id'])
            
        else:
            # É arquivo remoto
            if not os.path.exists(local_path_item):
                print(f"⬇️ Downloading: {name}")
                request = service.files().get_media(fileId=meta['id'])
                fh = io.FileIO(local_path_item, 'wb')
                downloader = MediaIoBaseDownload(fh, request)
                done = False
                while done is False:
                    status, done = downloader.next_chunk()

if __name__ == '__main__':
    print("--- INICIANDO SINCRONIZAÇÃO BIDIRECIONAL MAESTRO ---")
    print(f"Raiz Local: {LOCAL_ROOT}")
    print(f"Raiz Drive ID: {DRIVE_ROOT_ID}")
    
    try:
        service = get_service()
        sync_recursive(service, LOCAL_ROOT, DRIVE_ROOT_ID)
        print("✅ Sincronização Concluída com Sucesso!")
    except Exception as e:
        print(f"❌ Erro Fatal: {e}")
        input("Pressione Enter para sair...")
