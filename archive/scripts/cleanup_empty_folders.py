"""
Script para Limpar Pastas Vazias no Google Drive
Brandão Contabilidade - Organização Automática

Este script:
1. Lista todas as pastas no Drive
2. Identifica pastas vazias (sem arquivos)
3. Mostra para você confirmar
4. Deleta apenas as pastas vazias
"""

import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# ID da pasta raiz (Brandão Contabilidade CRM)
ROOT_FOLDER_ID = "1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP"

def get_drive_service():
    """Conecta ao Google Drive usando as credenciais"""
    # TODO: Configurar autenticação OAuth2
    # Por enquanto, use as credenciais do n8n ou configure manualmente
    print("⚠️  Configure as credenciais do Google Drive primeiro!")
    print("   Veja: https://developers.google.com/drive/api/quickstart/python")
    return None

def list_folders(service, parent_id):
    """Lista todas as pastas dentro de uma pasta pai"""
    try:
        query = f"'{parent_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
        results = service.files().list(
            q=query,
            fields="files(id, name, parents)",
            pageSize=1000
        ).execute()
        
        return results.get('files', [])
    except HttpError as error:
        print(f"❌ Erro ao listar pastas: {error}")
        return []

def count_files_in_folder(service, folder_id):
    """Conta quantos arquivos (não pastas) existem em uma pasta"""
    try:
        query = f"'{folder_id}' in parents and mimeType!='application/vnd.google-apps.folder' and trashed=false"
        results = service.files().list(
            q=query,
            fields="files(id)",
            pageSize=1
        ).execute()
        
        files = results.get('files', [])
        return len(files)
    except HttpError as error:
        print(f"❌ Erro ao contar arquivos: {error}")
        return 0

def find_empty_folders(service, root_id):
    """Encontra todas as pastas vazias recursivamente"""
    empty_folders = []
    
    def scan_folder(folder_id, path=""):
        folders = list_folders(service, folder_id)
        
        for folder in folders:
            folder_path = f"{path}/{folder['name']}"
            
            # Conta arquivos nesta pasta
            file_count = count_files_in_folder(service, folder['id'])
            
            # Escaneia subpastas
            subfolders = list_folders(service, folder['id'])
            
            # Se não tem arquivos E não tem subpastas, está vazia
            if file_count == 0 and len(subfolders) == 0:
                empty_folders.append({
                    'id': folder['id'],
                    'name': folder['name'],
                    'path': folder_path
                })
            
            # Escaneia recursivamente
            scan_folder(folder['id'], folder_path)
    
    scan_folder(root_id)
    return empty_folders

def delete_folder(service, folder_id):
    """Deleta uma pasta do Google Drive"""
    try:
        service.files().delete(fileId=folder_id).execute()
        return True
    except HttpError as error:
        print(f"❌ Erro ao deletar: {error}")
        return False

def main():
    print("=" * 60)
    print("🧹 LIMPEZA DE PASTAS VAZIAS - GOOGLE DRIVE")
    print("=" * 60)
    print()
    
    # Conecta ao Drive
    service = get_drive_service()
    if not service:
        print("\n⚠️  Configure as credenciais primeiro!")
        print("   Ou use a interface web do Google Drive para limpar manualmente.")
        return
    
    print("🔍 Escaneando pastas...")
    empty_folders = find_empty_folders(service, ROOT_FOLDER_ID)
    
    if not empty_folders:
        print("✅ Nenhuma pasta vazia encontrada!")
        return
    
    print(f"\n📊 Encontradas {len(empty_folders)} pastas vazias:\n")
    
    for i, folder in enumerate(empty_folders, 1):
        print(f"{i}. {folder['path']}")
    
    print("\n" + "=" * 60)
    response = input("\n🗑️  Deletar todas essas pastas? (s/N): ").strip().lower()
    
    if response == 's':
        print("\n🗑️  Deletando pastas...")
        deleted = 0
        
        for folder in empty_folders:
            if delete_folder(service, folder['id']):
                print(f"✅ Deletado: {folder['path']}")
                deleted += 1
            else:
                print(f"❌ Erro ao deletar: {folder['path']}")
        
        print(f"\n✨ Limpeza concluída! {deleted}/{len(empty_folders)} pastas deletadas.")
    else:
        print("\n⏭️  Operação cancelada.")

if __name__ == "__main__":
    main()
