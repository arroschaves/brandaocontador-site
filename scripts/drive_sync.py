#!/usr/bin/env python3
"""
Google Drive Sync - Sincronização Bidirecional
Autor: Antigravity AI
Data: 2026-02-06

Sincroniza pastas locais com Google Drive de forma inteligente:
- Detecta mudanças em AMBOS os lados (local e Drive)
- Resolve conflitos automaticamente
- Coordena múltiplos notebooks
- Evita duplicação de arquivos
"""

import os
import sys
import json
import pickle
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional

try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload
except ImportError:
    print("❌ Erro: Instale as dependências do Google Drive")
    print("Execute: pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client")
    sys.exit(1)

# Configurações
SCOPES = ['https://www.googleapis.com/auth/drive']
TOKEN_PATH = 'token_drive.pickle'
CREDENTIALS_PATH = 'credentials.json'
SYNC_DB_PATH = '.sync_database.json'
DRIVE_FOLDER_NAME = 'CRM_Documentos'  # Nome da pasta raiz no Drive

class DriveSync:
    def __init__(self, local_folder: str):
        self.local_folder = Path(local_folder)
        self.service = None
        self.drive_folder_id = None
        self.sync_db = self.load_sync_db()
        
    def load_sync_db(self) -> Dict:
        """Carrega banco de dados de sincronização"""
        if os.path.exists(SYNC_DB_PATH):
            with open(SYNC_DB_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {'files': {}, 'folders': {}, 'last_sync': None}
    
    def save_sync_db(self):
        """Salva banco de dados de sincronização"""
        self.sync_db['last_sync'] = datetime.now().isoformat()
        with open(SYNC_DB_PATH, 'w', encoding='utf-8') as f:
            json.dump(self.sync_db, f, indent=2, ensure_ascii=False)
    
    def get_file_hash(self, filepath: Path) -> str:
        """Calcula hash MD5 de um arquivo"""
        hash_md5 = hashlib.md5()
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    
    def authenticate(self):
        """Autentica com Google Drive"""
        creds = None
        
        if os.path.exists(TOKEN_PATH):
            with open(TOKEN_PATH, 'rb') as token:
                creds = pickle.load(token)
        
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists(CREDENTIALS_PATH):
                    print(f"❌ Erro: Arquivo {CREDENTIALS_PATH} não encontrado")
                    print("📝 Baixe as credenciais do Google Cloud Console")
                    sys.exit(1)
                
                flow = InstalledAppFlow.from_client_secrets_file(
                    CREDENTIALS_PATH, SCOPES)
                creds = flow.run_local_server(port=0)
            
            with open(TOKEN_PATH, 'wb') as token:
                pickle.dump(creds, token)
        
        self.service = build('drive', 'v3', credentials=creds)
        print("✅ Autenticado com Google Drive")
    
    def get_or_create_drive_folder(self) -> str:
        """Encontra ou cria pasta raiz no Drive"""
        query = f"name='{DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
        results = self.service.files().list(q=query, fields="files(id, name)").execute()
        files = results.get('files', [])
        
        if files:
            folder_id = files[0]['id']
            print(f"📁 Pasta encontrada: {DRIVE_FOLDER_NAME} ({folder_id})")
            return folder_id
        else:
            file_metadata = {
                'name': DRIVE_FOLDER_NAME,
                'mimeType': 'application/vnd.google-apps.folder'
            }
            folder = self.service.files().create(body=file_metadata, fields='id').execute()
            folder_id = folder['id']
            print(f"📁 Pasta criada: {DRIVE_FOLDER_NAME} ({folder_id})")
            return folder_id
    
    def list_drive_files(self, parent_id: str) -> List[Dict]:
        """Lista arquivos e pastas no Drive"""
        query = f"'{parent_id}' in parents and trashed=false"
        results = self.service.files().list(
            q=query,
            fields="files(id, name, mimeType, modifiedTime, md5Checksum)",
            pageSize=1000
        ).execute()
        return results.get('files', [])
    
    def list_local_files(self) -> List[Path]:
        """Lista arquivos locais"""
        files = []
        for item in self.local_folder.rglob('*'):
            if item.is_file() and not item.name.startswith('.'):
                files.append(item)
        return files
    
    def download_file(self, file_id: str, local_path: Path):
        """Baixa arquivo do Drive"""
        request = self.service.files().get_media(fileId=file_id)
        local_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(local_path, 'wb') as f:
            downloader = MediaIoBaseDownload(f, request)
            done = False
            while not done:
                status, done = downloader.next_chunk()
        
        print(f"⬇️  Baixado: {local_path.name}")
    
    def upload_file(self, local_path: Path, parent_id: str) -> str:
        """Faz upload de arquivo para o Drive"""
        file_metadata = {
            'name': local_path.name,
            'parents': [parent_id]
        }
        media = MediaFileUpload(str(local_path), resumable=True)
        file = self.service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, md5Checksum'
        ).execute()
        
        print(f"⬆️  Enviado: {local_path.name}")
        return file['id']
    
    def delete_drive_file(self, file_id: str, filename: str):
        """Deleta arquivo do Drive"""
        self.service.files().delete(fileId=file_id).execute()
        print(f"🗑️  Deletado no Drive: {filename}")
    
    def sync_bidirectional(self):
        """Sincronização bidirecional completa"""
        print("\n🔄 Iniciando sincronização bidirecional...")
        print(f"📂 Pasta local: {self.local_folder}")
        
        self.authenticate()
        self.drive_folder_id = self.get_or_create_drive_folder()
        
        # PASSO 1: Buscar arquivos do Drive
        print("\n📥 Buscando arquivos do Drive...")
        drive_files = self.list_drive_files(self.drive_folder_id)
        drive_map = {f['name']: f for f in drive_files}
        
        # PASSO 2: Buscar arquivos locais
        print("📁 Buscando arquivos locais...")
        local_files = self.list_local_files()
        local_map = {f.name: f for f in local_files}
        
        # PASSO 3: Detectar mudanças e sincronizar
        print("\n🔍 Detectando mudanças...\n")
        
        # 3A: Arquivos que existem no Drive mas não localmente (BAIXAR)
        for filename, drive_file in drive_map.items():
            if filename not in local_map:
                # Arquivo foi deletado localmente ou é novo no Drive
                if filename in self.sync_db['files']:
                    # Foi deletado localmente - deletar do Drive também
                    print(f"🗑️  Arquivo deletado localmente, removendo do Drive: {filename}")
                    self.delete_drive_file(drive_file['id'], filename)
                    del self.sync_db['files'][filename]
                else:
                    # Novo no Drive - baixar
                    local_path = self.local_folder / filename
                    self.download_file(drive_file['id'], local_path)
                    self.sync_db['files'][filename] = {
                        'drive_id': drive_file['id'],
                        'hash': drive_file.get('md5Checksum', ''),
                        'modified': drive_file['modifiedTime']
                    }
        
        # 3B: Arquivos que existem localmente mas não no Drive (ENVIAR)
        for filename, local_path in local_map.items():
            if filename not in drive_map:
                # Arquivo novo local ou foi deletado do Drive
                if filename in self.sync_db['files']:
                    # Foi deletado do Drive - deletar localmente também
                    print(f"🗑️  Arquivo deletado no Drive, removendo localmente: {filename}")
                    local_path.unlink()
                    del self.sync_db['files'][filename]
                else:
                    # Novo localmente - enviar
                    file_id = self.upload_file(local_path, self.drive_folder_id)
                    file_hash = self.get_file_hash(local_path)
                    self.sync_db['files'][filename] = {
                        'drive_id': file_id,
                        'hash': file_hash,
                        'modified': datetime.now().isoformat()
                    }
        
        # 3C: Arquivos que existem em AMBOS (VERIFICAR CONFLITOS)
        for filename in set(drive_map.keys()) & set(local_map.keys()):
            drive_file = drive_map[filename]
            local_path = local_map[filename]
            local_hash = self.get_file_hash(local_path)
            drive_hash = drive_file.get('md5Checksum', '')
            
            # Verificar se mudou
            if local_hash != drive_hash:
                # CONFLITO: Arquivo mudou em ambos os lados
                drive_time = datetime.fromisoformat(drive_file['modifiedTime'].replace('Z', '+00:00'))
                local_time = datetime.fromtimestamp(local_path.stat().st_mtime)
                
                if local_time > drive_time:
                    # Local mais recente - enviar para Drive
                    print(f"🔄 Atualizando Drive (local mais recente): {filename}")
                    self.service.files().delete(fileId=drive_file['id']).execute()
                    file_id = self.upload_file(local_path, self.drive_folder_id)
                    self.sync_db['files'][filename] = {
                        'drive_id': file_id,
                        'hash': local_hash,
                        'modified': local_time.isoformat()
                    }
                else:
                    # Drive mais recente - baixar
                    print(f"🔄 Atualizando local (Drive mais recente): {filename}")
                    self.download_file(drive_file['id'], local_path)
                    self.sync_db['files'][filename] = {
                        'drive_id': drive_file['id'],
                        'hash': drive_hash,
                        'modified': drive_file['modifiedTime']
                    }
        
        # Salvar estado
        self.save_sync_db()
        print(f"\n✅ Sincronização concluída! ({len(self.sync_db['files'])} arquivos)")
        print(f"📊 Última sync: {self.sync_db['last_sync']}")


def main():
    """Função principal"""
    if len(sys.argv) < 2:
        print("❌ Uso: python drive_sync.py <pasta_local>")
        print("Exemplo: python drive_sync.py C:\\CRM_Docs")
        sys.exit(1)
    
    local_folder = sys.argv[1]
    
    if not os.path.exists(local_folder):
        print(f"❌ Pasta não encontrada: {local_folder}")
        sys.exit(1)
    
    sync = DriveSync(local_folder)
    sync.sync_bidirectional()


if __name__ == '__main__':
    main()
