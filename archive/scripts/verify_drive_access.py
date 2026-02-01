#!/usr/bin/env python3
"""
VERIFICADOR DE ACESSO AO GOOGLE DRIVE
======================================

Verifica se a Service Account tem acesso à pasta do Google Drive.
"""

import os
import sys
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv('.env.local')

# Credenciais do Google Drive
SCOPES = ['https://www.googleapis.com/auth/drive']
ROOT_FOLDER_ID = "1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP"

def get_drive_service():
    """Conecta ao Google Drive."""
    credentials_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
    
    if not credentials_json:
        print("❌ GOOGLE_CREDENTIALS_JSON não encontrado no .env.local")
        sys.exit(1)
    
    credentials_info = json.loads(credentials_json)
    creds = service_account.Credentials.from_service_account_info(
        credentials_info, scopes=SCOPES)
    
    return build('drive', 'v3', credentials=creds)

def main():
    print("\n" + "="*70)
    print("🔍 VERIFICADOR DE ACESSO AO GOOGLE DRIVE")
    print("="*70)
    
    service = get_drive_service()
    
    print(f"\n📂 Verificando acesso à pasta: {ROOT_FOLDER_ID}")
    
    try:
        # Tentar obter informações da pasta raiz
        folder = service.files().get(
            fileId=ROOT_FOLDER_ID,
            fields="id, name, mimeType, owners, permissions"
        ).execute()
        
        print(f"\n✅ Acesso concedido!")
        print(f"   Nome: {folder.get('name')}")
        print(f"   ID: {folder.get('id')}")
        print(f"   Tipo: {folder.get('mimeType')}")
        
        # Listar pastas dentro
        print(f"\n📊 Listando pastas dentro de '{folder.get('name')}'...")
        
        query = f"'{ROOT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
        results = service.files().list(
            q=query,
            fields="files(id, name)",
            pageSize=100
        ).execute()
        
        folders = results.get('files', [])
        
        if folders:
            print(f"\n✅ Encontradas {len(folders)} pastas:")
            for i, folder in enumerate(folders[:10], 1):
                print(f"   {i}. {folder['name']}")
            
            if len(folders) > 10:
                print(f"   ... e mais {len(folders) - 10} pastas")
        else:
            print("\n⚠️ Nenhuma pasta encontrada dentro da pasta raiz!")
            print("\nPossíveis causas:")
            print("  1. A pasta está vazia")
            print("  2. As pastas de clientes estão em outro local")
            print("  3. A service account não tem permissão para ver as subpastas")
        
        # Verificar permissões
        print("\n🔐 Verificando permissões...")
        try:
            permissions = service.permissions().list(
                fileId=ROOT_FOLDER_ID,
                fields="permissions(emailAddress, role, type)"
            ).execute()
            
            service_email = json.loads(os.getenv('GOOGLE_CREDENTIALS_JSON'))['client_email']
            
            has_permission = False
            for perm in permissions.get('permissions', []):
                if perm.get('emailAddress') == service_email:
                    has_permission = True
                    print(f"   ✅ Service Account tem permissão: {perm.get('role')}")
                    break
            
            if not has_permission:
                print(f"   ⚠️ Service Account ({service_email}) NÃO encontrada nas permissões!")
                print("   Você compartilhou a pasta com este email?")
        except HttpError as e:
            print(f"   ⚠️ Não foi possível verificar permissões: {e}")
        
    except HttpError as e:
        if e.resp.status == 404:
            print("\n❌ Pasta não encontrada!")
            print(f"   ID: {ROOT_FOLDER_ID}")
            print("\nPossíveis causas:")
            print("  1. O ID da pasta está incorreto")
            print("  2. A pasta foi deletada")
            print("  3. A service account não tem acesso")
        elif e.resp.status == 403:
            print("\n❌ Acesso negado!")
            print("\nA service account NÃO tem permissão para acessar esta pasta.")
            print("\nSolução:")
            service_email = json.loads(os.getenv('GOOGLE_CREDENTIALS_JSON'))['client_email']
            print(f"  1. Abra: https://drive.google.com/drive/folders/{ROOT_FOLDER_ID}")
            print(f"  2. Clique em 'Compartilhar'")
            print(f"  3. Adicione: {service_email}")
            print(f"  4. Permissão: Editor")
            print(f"  5. Clique em 'Compartilhar'")
        else:
            print(f"\n❌ Erro ao acessar pasta: {e}")
    
    print("\n" + "="*70 + "\n")

if __name__ == "__main__":
    main()
