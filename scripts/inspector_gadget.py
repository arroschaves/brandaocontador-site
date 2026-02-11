#!/usr/bin/env python3
"""
Inspector Gadget - Auditoria do Google Drive
Autor: Antigravity AI
Data: 2026-02-10

MÉTODO: OAUTH INTERATIVO (Igual ao drive_sync.py)
"""

import os
import sys
import pickle
import json
from datetime import datetime
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Configurações
SCOPES = ['https://www.googleapis.com/auth/drive']
TOKEN_PATH = 'token_drive.pickle'
CREDENTIALS_PATH = 'credentials.json'

class InspectorGadget:
    def __init__(self):
        self.service = None
        self.report = {
            'generated_at': datetime.now().isoformat(),
            'empty_folders': [],
            'legacy_folders': [],
            'total_folders_scanned': 0
        }

    def authenticate(self):
        """Autentica com Google Drive (OAuth)"""
        creds = None
        
        # Tenta carregar token existente
        if os.path.exists(TOKEN_PATH):
            try:
                with open(TOKEN_PATH, 'rb') as token:
                    creds = pickle.load(token)
            except Exception:
                print("⚠️ Token corrompido ou antigo. Ignorando.")

        # Se não tiver creds validas, refresca ou pede login
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                except Exception:
                    print("⚠️ Erro ao atualizar token. Refazendo login...")
                    creds = None

            if not creds:
                if not os.path.exists(CREDENTIALS_PATH):
                    print(f"❌ Erro: Arquivo {CREDENTIALS_PATH} não encontrado")
                    sys.exit(1)
                
                # Fluxo interativo
                flow = InstalledAppFlow.from_client_secrets_file(
                    CREDENTIALS_PATH, SCOPES)
                creds = flow.run_local_server(port=0)
            
            # Salva token novo
            with open(TOKEN_PATH, 'wb') as token:
                pickle.dump(creds, token)
            
        self.service = build('drive', 'v3', credentials=creds)
        print("✅ Inspector Gadget autenticado (Modo Usuário)!")

    def list_folders_recursive(self, parent_id, path_prefix=""):
        """Varre recursivamente"""
        try:
            query = f"'{parent_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
            results = self.service.files().list(
                q=query,
                fields="files(id, name)",
                pageSize=1000
            ).execute()
            
            folders = results.get('files', [])
            
            for folder in folders:
                self.report['total_folders_scanned'] += 1
                current_path = f"{path_prefix}/{folder['name']}"
                
                if self.report['total_folders_scanned'] % 10 == 0:
                    print(f"📂 Escaneados: {self.report['total_folders_scanned']} (Atual: {current_path})")
                
                # Check Conteúdo (rápido)
                child_res = self.service.files().list(
                    q=f"'{folder['id']}' in parents and trashed=false",
                    fields="files(id)",
                    pageSize=1
                ).execute()
                
                has_content = len(child_res.get('files', [])) > 0
                
                if not has_content:
                    self.report['empty_folders'].append({'path': current_path, 'id': folder['id']})
                
                if has_content:
                    self.list_folders_recursive(folder['id'], current_path)
                    
        except Exception as e:
            print(f"⚠️ Erro ao ler pasta {parent_id}: {e}")

    def save_report(self):
        filename = 'drive_audit_report.json'
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.report, f, indent=2, ensure_ascii=False)
        print(f"\n📊 Relatório salvo em: {filename}")
        print(f"   - Total: {self.report['total_folders_scanned']}")
        print(f"   - Vazias: {len(self.report['empty_folders'])}")

def main():
    print("🕵️ Inspector Gadget: Iniciando (Modo OAuth)...")
    inspector = InspectorGadget()
    
    try:
        inspector.authenticate()
    except Exception as e:
        print(f"❌ Falha crítica de autenticação: {e}")
        print("👉 Verifique se 'credentials.json' é um arquivo OAuth 2.0 Client ID (não Service Account)")
        return

    # Acha root
    query = "name='CRM_Documentos' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    results = inspector.service.files().list(q=query, fields="files(id, name)").execute()
    files = results.get('files', [])
    
    if files:
        root_id = files[0]['id']
        print(f"📂 Raiz: {files[0]['name']}")
        inspector.list_folders_recursive(root_id, "/CRM_Documentos")
        inspector.save_report()
    else:
        print("❌ Pasta 'CRM_Documentos' não encontrada.")

if __name__ == '__main__':
    main()
