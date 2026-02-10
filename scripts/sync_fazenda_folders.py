import os
import json
import requests
import time
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY') # Idealmente Service Role para escrita sem RLS
SCOPES = ['https://www.googleapis.com/auth/drive']

# Estrutura de pastas padrão para Fazendas (Baseado na imagem enviada)
FAZENDA_SUBFOLDERS = [
    'AVISO_PREVIO',
    'FGTS',
    'FICHAS_EMPREGADOS',
    'INSS',
    'PEDIDO_REGISTRO',
    'RECIBO_FERIAS',
    'RECIBO_FOLHA',
    'RECIBO_RESCISAO'
]

def log(msg):
    print(f"[MAESTRO] {msg}")

def get_supabase_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

def sync_fazenda_folders():
    creds_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
    if not creds_json:
        log("ERRO: GOOGLE_CREDENTIALS_JSON não encontrado no .env.local")
        return

    creds_info = json.loads(creds_json)
    creds = service_account.Credentials.from_service_account_info(creds_info, scopes=SCOPES)
    service = build('drive', 'v3', credentials=creds)

    log("🔍 Buscando Unidades Fiscais (Fazendas) no Supabase...")
    
    # Busca todas as unidades fiscais
    r = requests.get(f"{SUPABASE_URL}/rest/v1/unidades_fiscais?select=id,nome_identificador,cliente_id,drive_folder_id", headers=get_supabase_headers())
    
    if r.status_code != 200:
        log(f"Erro ao buscar unidades: {r.text}")
        return

    unidades = r.json()
    log(f"📋 Encontradas {len(unidades)} unidades fiscais.")

    # Cache de clientes para evitar requests repetidos
    client_cache = {}

    for u in unidades:
        cid = u['cliente_id']
        fazenda_name = u['nome_identificador'].upper()
        
        # Ignora unidade 'GERAL' se não for desejado pasta específica (ou cria também)
        # if fazenda_name == 'GERAL': continue 

        if cid not in client_cache:
            rc = requests.get(f"{SUPABASE_URL}/rest/v1/clientes?id=eq.{cid}&select=nome,drive_folder_id", headers=get_supabase_headers())
            if rc.status_code == 200 and rc.json():
                client_cache[cid] = rc.json()[0]
            else:
                client_cache[cid] = None
        
        client = client_cache.get(cid)
        
        if not client or not client.get('drive_folder_id'):
            log(f"⚠️ Cliente {cid} não encontrado ou sem pasta raiz no Drive.")
            continue

        parent_id = client['drive_folder_id']
        fazenda_folder_id = u.get('drive_folder_id')

        try:
            # 1. Verifica/Cria a pasta da Fazenda
            if not fazenda_folder_id:
                # Tenta encontrar pelo nome antes de criar
                query = f"'{parent_id}' in parents and name='{fazenda_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
                res = service.files().list(q=query, fields="files(id)").execute()
                files = res.get('files', [])
                
                if files:
                    fazenda_folder_id = files[0]['id']
                    log(f"✅ Pasta '{fazenda_name}' já existia (ID recuperado).")
                else:
                    log(f"📁 Criando pasta '{fazenda_name}' para cliente '{client['nome']}'...")
                    file_metadata = {
                        'name': fazenda_name,
                        'parents': [parent_id],
                        'mimeType': 'application/vnd.google-apps.folder'
                    }
                    folder = service.files().create(body=file_metadata, fields='id').execute()
                    fazenda_folder_id = folder.get('id')
                    log(f"✨ Pasta criada com sucesso: {fazenda_folder_id}")

                # Atualiza Supabase com o ID da pasta (Se a coluna existir e tiver permissão)
                patch_url = f"{SUPABASE_URL}/rest/v1/unidades_fiscais?id=eq.{u['id']}"
                rp = requests.patch(patch_url, json={'drive_folder_id': fazenda_folder_id}, headers=get_supabase_headers())
                if rp.status_code == 204:
                    log(f"💾 ID da pasta salvo no Supabase para '{fazenda_name}'.")
                else:
                    log(f"❌ Erro ao salvar ID no Supabase: {rp.text}") # Provavelmente falta de permissão ou coluna

            # 2. Cria Subpastas Obrigatórias (RH, etc)
            if fazenda_folder_id:
                create_subfolders(service, fazenda_folder_id, FAZENDA_SUBFOLDERS)
                
        except Exception as e:
            log(f"❌ Erro crítico ao processar unidade '{fazenda_name}' (Cliente: {client.get('nome')}): {str(e)}")
            continue

def create_subfolders(service, parent_id, folders_list):
    # Lista pastas existentes para não duplicar
    query = f"'{parent_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
    res = service.files().list(q=query, fields="files(name)").execute()
    existing_names = {f['name'] for f in res.get('files', [])}

    for folder_name in folders_list:
        if folder_name not in existing_names:
            file_metadata = {
                'name': folder_name,
                'parents': [parent_id],
                'mimeType': 'application/vnd.google-apps.folder'
            }
            try:
                service.files().create(body=file_metadata, fields='id').execute()
                print(f"   ↳ Criada subpasta: {folder_name}")
            except Exception as e:
                print(f"   ❌ Erro ao criar subpasta {folder_name}: {str(e)}")

if __name__ == "__main__":
    print("--- INICIANDO SINCRONIZAÇÃO MAESTRO (FAZENDAS) ---")
    sync_fazenda_folders()
    print("--- CONCLUÍDO ---")
