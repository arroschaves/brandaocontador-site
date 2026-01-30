import os
import json
import time
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

# Configurações
load_dotenv(".env.local")
ROOT_LOCAL = "C:\\Brandao_Contabilidade"
# ID da pasta mestre no Google Drive fornecido pelo usuário
DRIVE_ROOT_ID = "1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP"

def get_drive_service():
    creds_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
    if not creds_json:
        print("❌ ERRO: GOOGLE_CREDENTIALS_JSON não encontrada no .env.local")
        return None
    
    try:
        creds_info = json.loads(creds_json)
        creds = service_account.Credentials.from_service_account_info(
            creds_info, scopes=['https://www.googleapis.com/auth/drive']
        )
        return build('drive', 'v3', credentials=creds)
    except Exception as e:
        print(f"❌ Erro ao converter JSON de credenciais: {e}")
        return None

def create_drive_folder(service, name, parent_id):
    """Cria uma pasta no Google Drive e retorna o ID."""
    file_metadata = {
        'name': name,
        'mimeType': 'application/vnd.google-apps.folder',
        'parents': [parent_id]
    }
    try:
        folder = service.files().create(body=file_metadata, fields='id').execute()
        return folder.get('id')
    except Exception as e:
        print(f"   ❌ Erro ao criar pasta '{name}': {e}")
        return None

def sync_structure():
    service = get_drive_service()
    if not service: return

    print(f"🚀 Iniciando espelhamento para o Google Drive (Raiz: {DRIVE_ROOT_ID})...")
    
    # Listar apenas pastas de 1º nível (Clientes) para começar
    clients = [d for d in os.listdir(ROOT_LOCAL) if os.path.isdir(os.path.join(ROOT_LOCAL, d))]
    
    for client_name in clients:
        print(f"📂 Criando estrutura para: {client_name}")
        client_drive_id = create_drive_folder(service, client_name, DRIVE_ROOT_ID)
        if not client_drive_id: continue
        
        client_local_path = os.path.join(ROOT_LOCAL, client_name)
        
        # Percorrer subpastas (01-10)
        subfolders = os.listdir(client_local_path)
        for sub in subfolders:
            sub_path = os.path.join(client_local_path, sub)
            if os.path.isdir(sub_path):
                print(f"   ➔ {sub}")
                sub_drive_id = create_drive_folder(service, sub, client_drive_id)
                
                # Se for a pasta 10 operacional, precisamos descer mais níveis
                if "10 - RH" in sub:
                    # Unidades/Fazendas
                    units = os.listdir(sub_path)
                    for unit in units:
                        unit_path = os.path.join(sub_path, unit)
                        if os.path.isdir(unit_path):
                             unit_drive_id = create_drive_folder(service, unit, sub_drive_id)
                             # Criar Fiscal, RH, Impostos (opcional: podemos simplificar ou criar tudo)
                             # Para economizar tempo e cota, vamos criar os níveis principais agora
                
                # Pequena pausa para evitar rate limit da API
                time.sleep(0.1)

    print("✅ Espelhamento concluído!")

if __name__ == "__main__":
    sync_structure()
