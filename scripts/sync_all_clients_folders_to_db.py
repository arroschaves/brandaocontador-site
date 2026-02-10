"""
Script: sync_all_clients_folders_to_db.py
Objetivo: Mapear TODAS as pastas do Google Drive para os clientes no Supabase.
Lê credenciais diretamente do .env.local (GOOGLE_CREDENTIALS_JSON).
"""
import os
import json
import sys

# Adiciona supabase-py e google libs
try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from supabase import create_client, Client
except ImportError as e:
    print(f"❌ Biblioteca não encontrada: {e}")
    print("Execute: pip install google-auth google-api-python-client supabase")
    sys.exit(1)

# --- CONFIGURAÇÃO ---
SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly']

def load_env():
    """Lê variáveis do .env.local"""
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.local')
    if not os.path.exists(env_path):
        # Tenta no diretório atual
        env_path = '.env.local'
    
    env_vars = {}
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if '=' in line:
                    key, val = line.split('=', 1)
                    # Remove aspas simples ou duplas
                    val = val.strip().strip("'").strip('"')
                    env_vars[key.strip()] = val
    return env_vars

def get_drive_service(env_vars):
    """Autentica no Google Drive usando a credencial do .env.local"""
    creds_json_str = env_vars.get('GOOGLE_CREDENTIALS_JSON')
    
    if not creds_json_str:
        print("❌ GOOGLE_CREDENTIALS_JSON não encontrado no .env.local")
        return None
    
    try:
        info = json.loads(creds_json_str)
        print(f"✅ Credencial lida: project={info.get('project_id')}, email={info.get('client_email')}")
        
        creds = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
        return build('drive', 'v3', credentials=creds)
    except Exception as e:
        print(f"❌ Erro de autenticação Google: {e}")
        return None

def list_all_drive_folders(service):
    """Lista TODAS as pastas no Google Drive (não-lixeira)."""
    print("🔍 Escaneando Google Drive em busca de pastas...")
    
    all_folders = []
    page_token = None
    
    while True:
        results = service.files().list(
            q="mimeType='application/vnd.google-apps.folder' and trashed=false",
            pageSize=200,
            fields="nextPageToken, files(id, name, parents)",
            pageToken=page_token
        ).execute()
        
        items = results.get('files', [])
        all_folders.extend(items)
        
        page_token = results.get('nextPageToken')
        if not page_token:
            break
    
    print(f"📦 Total de pastas encontradas no Drive: {len(all_folders)}")
    return all_folders

def normalize_name(name):
    """Normaliza nome para comparação (remove acentos comuns, lowercase, trim)."""
    name = name.lower().strip()
    # Remove prefixos numéricos comuns tipo "01 - ", "1- "
    parts = name.split(' - ', 1)
    if len(parts) > 1 and parts[0].strip().isdigit():
        name = parts[1].strip()
    return name

def sync_clients():
    """Executa a sincronização de pastas de clientes."""
    env_vars = load_env()
    
    # Supabase
    supabase_url = env_vars.get('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = env_vars.get('SUPABASE_SERVICE_ROLE_KEY') or env_vars.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Variáveis de Supabase não encontradas no .env.local")
        return
    
    print(f"🔗 Supabase: {supabase_url[:40]}...")
    
    supabase: Client = create_client(supabase_url, supabase_key)
    
    # Google Drive
    drive_service = get_drive_service(env_vars)
    if not drive_service:
        return
    
    # 1. Busca Clientes do DB
    print("\n📥 Buscando clientes no Supabase...")
    res = supabase.from_('clientes').select('id, nome, drive_folder_id').execute()
    clientes = res.data
    
    if not clientes:
        print("❌ Nenhum cliente encontrado no Banco de Dados.")
        return
    
    print(f"👥 Total de Clientes no DB: {len(clientes)}")
    
    # 2. Busca Pastas do Drive
    folders = list_all_drive_folders(drive_service)
    
    # Cria mapa de nomes normalizados para folders
    folder_map = {}
    for f in folders:
        norm = normalize_name(f['name'])
        folder_map[norm] = {'id': f['id'], 'name': f['name']}
    
    # 3. Match e Update
    updated_count = 0
    already_synced = 0
    missing_count = 0
    
    print("\n🚀 Iniciando cruzamento de dados...\n")
    
    for cli in clientes:
        cli_name = cli['nome']
        cli_id = cli['id']
        current_drive_id = cli.get('drive_folder_id')
        
        cli_norm = normalize_name(cli_name)
        folder_id = None
        matched_folder_name = None
        
        # Match Exato (normalizado)
        if cli_norm in folder_map:
            folder_id = folder_map[cli_norm]['id']
            matched_folder_name = folder_map[cli_norm]['name']
        
        # Match Parcial (nome do cliente contido no nome da pasta)
        if not folder_id:
            for fname_norm, fdata in folder_map.items():
                if cli_norm in fname_norm or fname_norm in cli_norm:
                    folder_id = fdata['id']
                    matched_folder_name = fdata['name']
                    break
        
        if folder_id:
            if folder_id != current_drive_id:
                print(f"  ✅ MATCH: '{cli_name}' → Pasta: '{matched_folder_name}' (ID: {folder_id[:12]}...)")
                supabase.from_('clientes').update({'drive_folder_id': folder_id}).eq('id', cli_id).execute()
                updated_count += 1
            else:
                already_synced += 1
        else:
            print(f"  ⚠️ SEM MATCH: '{cli_name}'")
            missing_count += 1
    
    # 4. Também sincronizar Unidades Fiscais (Fazendas)
    print("\n🌾 Buscando Unidades Fiscais (Fazendas)...")
    res_uf = supabase.from_('unidades_fiscais').select('id, nome_identificador, drive_folder_id').execute()
    fazendas = res_uf.data if res_uf.data else []
    
    uf_updated = 0
    for faz in fazendas:
        faz_name = faz.get('nome_identificador', '')
        faz_id = faz['id']
        current_drive_id = faz.get('drive_folder_id')
        
        faz_norm = normalize_name(faz_name)
        folder_id = None
        matched_name = None
        
        if faz_norm in folder_map:
            folder_id = folder_map[faz_norm]['id']
            matched_name = folder_map[faz_norm]['name']
        
        if not folder_id:
            for fname_norm, fdata in folder_map.items():
                if faz_norm and faz_norm in fname_norm:
                    folder_id = fdata['id']
                    matched_name = fdata['name']
                    break
        
        if folder_id and folder_id != current_drive_id:
            print(f"  ✅ FAZENDA: '{faz_name}' → '{matched_name}'")
            supabase.from_('unidades_fiscais').update({'drive_folder_id': folder_id}).eq('id', faz_id).execute()
            uf_updated += 1
    
    # 5. Resumo
    print("\n" + "=" * 50)
    print("📊 RESUMO DA OPERAÇÃO")
    print("=" * 50)
    print(f"  👥 Clientes Processados:     {len(clientes)}")
    print(f"  ✅ Atualizados Agora:         {updated_count}")
    print(f"  ℹ️  Já Sincronizados:          {already_synced}")
    print(f"  ⚠️  Sem Pasta Encontrada:      {missing_count}")
    print(f"  🌾 Fazendas Atualizadas:      {uf_updated}")
    print("=" * 50)
    print("✅ Operação concluída!")

if __name__ == "__main__":
    sync_clients()
