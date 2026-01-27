#!/usr/bin/env python3
"""
LISTADOR DE PASTAS DO GOOGLE DRIVE
===================================

Lista todas as pastas que a Service Account tem acesso.
"""

import os
import sys
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv('.env.local')

SCOPES = ['https://www.googleapis.com/auth/drive']

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
    print("📂 LISTADOR DE PASTAS DO GOOGLE DRIVE")
    print("="*70)
    
    service = get_drive_service()
    service_email = json.loads(os.getenv('GOOGLE_CREDENTIALS_JSON'))['client_email']
    
    print(f"\n🔑 Service Account: {service_email}")
    print("\n🔍 Buscando pastas compartilhadas com esta conta...\n")
    
    try:
        # Buscar todas as pastas compartilhadas
        query = "mimeType='application/vnd.google-apps.folder' and trashed=false"
        results = service.files().list(
            q=query,
            fields="files(id, name, parents, owners)",
            pageSize=100,
            orderBy="name"
        ).execute()
        
        folders = results.get('files', [])
        
        if not folders:
            print("⚠️ Nenhuma pasta encontrada!")
            print("\nIsso significa que a service account NÃO tem acesso a nenhuma pasta.")
            print("\nSolução:")
            print("  1. Abra o Google Drive: https://drive.google.com/")
            print("  2. Encontre a pasta 'BRANDAO CONTABILIDADE'")
            print("  3. Clique com botão direito > Compartilhar")
            print(f"  4. Adicione: {service_email}")
            print("  5. Permissão: Editor")
            print("  6. Clique em Compartilhar")
        else:
            print(f"✅ Encontradas {len(folders)} pasta(s):\n")
            print("="*70)
            
            for i, folder in enumerate(folders, 1):
                print(f"\n{i}. 📁 {folder['name']}")
                print(f"   ID: {folder['id']}")
                print(f"   URL: https://drive.google.com/drive/folders/{folder['id']}")
                
                if 'parents' in folder:
                    print(f"   Pasta pai: {folder['parents'][0]}")
            
            print("\n" + "="*70)
            print("\n💡 Dica: Procure pela pasta 'BRANDAO CONTABILIDADE' na lista acima")
            print("   Se não estiver na lista, você precisa compartilhá-la com:")
            print(f"   {service_email}")
    
    except Exception as e:
        print(f"❌ Erro ao listar pastas: {e}")
    
    print("\n" + "="*70 + "\n")

if __name__ == "__main__":
    main()
