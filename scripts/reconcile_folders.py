"""
Script: reconcile_folders.py
Objetivo: Reconciliar TODOS os clientes no Supabase com pastas no Google Drive.
- Clientes sem drive_folder_id → Busca no Drive ou CRIA nova pasta com estrutura completa
- Estrutura completa: 11 categorias + subpastas ANO/MÊS (somente 2026)
- Diferencia PJ (CNPJ ≥14 dígitos) de PF (CPF = 11 dígitos)

Uso: python scripts/reconcile_folders.py
"""
import os
import re
import json
import sys
import time

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from supabase import create_client, Client
except ImportError as e:
    print(f"❌ Biblioteca não encontrada: {e}")
    print("Execute: pip install google-auth google-api-python-client supabase")
    sys.exit(1)

# --- CONFIGURAÇÃO ---
SCOPES = ['https://www.googleapis.com/auth/drive']

# Meses padrão Brandão Contabilidade
MESES = [
    {'name': '01_Janeiro'}, {'name': '02_Fevereiro'}, {'name': '03_Marco'},
    {'name': '04_Abril'}, {'name': '05_Maio'}, {'name': '06_Junho'},
    {'name': '07_Julho'}, {'name': '08_Agosto'}, {'name': '09_Setembro'},
    {'name': '10_Outubro'}, {'name': '11_Novembro'}, {'name': '12_Dezembro'},
    {'name': '13_Salario'},
]

# Ano atual com meses
ANO_2026 = {'name': '2026', 'children': list(MESES)}

# Subpastas de RH (02 - RH)
RH_SUBFOLDERS = [
    {'name': 'AVISO_PREVIO'},
    {'name': 'FGTS', 'children': [{'name': '2026', 'children': list(MESES)}]},
    {'name': 'FICHAS_EMPREGADOS'},
    {'name': 'INSS', 'children': [{'name': '2026', 'children': list(MESES)}]},
    {'name': 'PEDIDO_REGISTRO'},
    {'name': 'RECIBO_FERIAS', 'children': [{'name': '2026', 'children': list(MESES)}]},
    {'name': 'RECIBO_FOLHA', 'children': [{'name': '2026', 'children': list(MESES)}]},
    {'name': 'RECIBO_RESCISAO', 'children': [{'name': '2026', 'children': list(MESES)}]},
]

# Estrutura BASE para TODOS os clientes
BASE_FOLDERS = [
    {'name': '01 - CND (Certidões Negativas)'},
    {'name': '02 - PENDÊNCIAS FISCAIS (Federal, Estadual, Municipal)'},
    {'name': '03 - DOCUMENTOS PESSOAIS'},
    {'name': '04 - CERTIFICADO DIGITAL'},
    {'name': '05 - DOCUMENTOS TERRA'},
    {'name': '06 - IRPF'},
    {'name': '07 - JUNTA COMERCIAL'},
    {'name': '08 - FATURAMENTO'},
    {'name': '09 - CAEPF'},
    {
        'name': '10 - RH - ESCRITA - CONTABILIDADE',
        'children': [
            {'name': '01 - FISCAL', 'children': [{'name': '2026', 'children': list(MESES)}]},
            {'name': '02 - RH', 'children': list(RH_SUBFOLDERS)},
            {'name': '03 - IMPOSTOS E GUIAS', 'children': [{'name': '2026', 'children': list(MESES)}]},
        ]
    },
    {
        'name': 'GERAL',
        'children': [
            {'name': 'AVISO_PREVIO'},
            {'name': 'FGTS'},
            {'name': 'FICHAS_EMPREGADOS'},
            {'name': 'INSS'},
            {'name': 'PEDIDO_REGISTRO'},
            {'name': 'RECIBO_FERIAS'},
            {'name': 'RECIBO_FOLHA'},
            {'name': 'RECIBO_RESCISAO'},
        ]
    }
]

# Pastas extras só para PJ (CNPJ)
PJ_EXTRA_FOLDERS = [
    {
        'name': '11 - ALVARAS',
        'children': [
            {'name': 'BOMBEIRO'},
            {'name': 'SANITARIO'},
            {'name': 'MEIO AMBIENTE'},
            {'name': 'FUNCIONAMENTO'},
        ]
    }
]


def load_env():
    """Lê variáveis do .env.local"""
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.local')
    if not os.path.exists(env_path):
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
                    val = val.strip().strip("'").strip('"')
                    env_vars[key.strip()] = val
    return env_vars


def is_cnpj(cnpj_cpf: str) -> bool:
    """Verifica se é CNPJ (≥14 dígitos)"""
    digits = re.sub(r'\D', '', cnpj_cpf or '')
    return len(digits) >= 14


def get_drive_service(env_vars):
    """Autentica no Google Drive com Service Account"""
    creds_json_str = env_vars.get('GOOGLE_CREDENTIALS_JSON')
    if not creds_json_str:
        print("❌ GOOGLE_CREDENTIALS_JSON não encontrado no .env.local")
        return None

    info = json.loads(creds_json_str)
    creds = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
    return build('drive', 'v3', credentials=creds)


def create_drive_folder(service, name, parent_id):
    """Cria uma pasta no Google Drive e retorna o ID"""
    metadata = {
        'name': name,
        'mimeType': 'application/vnd.google-apps.folder',
        'parents': [parent_id]
    }
    folder = service.files().create(body=metadata, fields='id').execute()
    return folder.get('id')


def create_folder_tree(service, folders, parent_id):
    """Cria recursivamente a árvore de pastas"""
    created = 0
    for folder_def in folders:
        folder_id = create_drive_folder(service, folder_def['name'], parent_id)
        created += 1

        children = folder_def.get('children', [])
        if children:
            created += create_folder_tree(service, children, folder_id)

        time.sleep(0.05)  # Rate limit protection

    return created


def count_folders(folders):
    """Conta total de pastas na árvore"""
    count = 0
    for f in folders:
        count += 1
        if 'children' in f:
            count += count_folders(f['children'])
    return count


def search_existing_folder(service, root_folder_id, client_name):
    """Procura pasta existente para o cliente no Drive"""
    q = f"'{root_folder_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
    results = service.files().list(q=q, fields='files(id, name)', pageSize=500).execute()
    folders = results.get('files', [])

    client_lower = client_name.lower().strip()

    # Match exato
    for f in folders:
        if f['name'].lower().strip() == client_lower:
            return f['id'], f['name']

    # Match parcial
    for f in folders:
        fname = f['name'].lower()
        if client_lower in fname or fname in client_lower:
            return f['id'], f['name']

    # Match por palavras-chave
    client_words = set(client_lower.split())
    for f in folders:
        fname_words = set(f['name'].lower().replace('(', '').replace(')', '').split())
        common = client_words & fname_words
        if len(common) >= 2 and len(common) / len(client_words) >= 0.5:
            return f['id'], f['name']

    return None, None


def reconcile():
    """Executa a reconciliação completa"""
    env_vars = load_env()

    supabase_url = env_vars.get('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = env_vars.get('SUPABASE_SERVICE_ROLE_KEY') or env_vars.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    root_folder_id = env_vars.get('GOOGLE_DRIVE_ROOT_FOLDER_ID')

    if not supabase_url or not supabase_key:
        print("❌ Supabase URL/Key não encontrados.")
        return
    if not root_folder_id:
        print("❌ GOOGLE_DRIVE_ROOT_FOLDER_ID não encontrado.")
        return

    print(f"🔗 Supabase: {supabase_url[:40]}...")
    print(f"📁 Root Drive Folder ID: {root_folder_id}")

    # Conta total de pastas na estrutura
    total_base = count_folders(BASE_FOLDERS)
    total_pj = count_folders(PJ_EXTRA_FOLDERS)
    print(f"📋 Estrutura base: {total_base} pastas | PJ extra: +{total_pj} pastas")

    supabase: Client = create_client(supabase_url, supabase_key)

    service = get_drive_service(env_vars)
    if not service:
        return

    # 1. Busca todos os clientes
    print("\n📥 Buscando clientes no Supabase...")
    res = supabase.from_('clientes').select('id, nome, cnpj_cpf, drive_folder_id').execute()
    clientes = res.data or []
    print(f"👥 Total de Clientes: {len(clientes)}")

    sem_pasta = [c for c in clientes if not c.get('drive_folder_id')]
    com_pasta = [c for c in clientes if c.get('drive_folder_id')]

    print(f"  ✅ Com pasta mapeada: {len(com_pasta)}")
    print(f"  ⚠️  Sem pasta mapeada: {len(sem_pasta)}")

    if not sem_pasta:
        print("\n🎉 Todos os clientes já têm pasta mapeada!")
        return

    # 2. Processar clientes sem pasta
    print(f"\n🔧 Processando {len(sem_pasta)} clientes sem pasta...\n")

    matched = 0
    created = 0
    failed = 0

    for cli in sem_pasta:
        nome = cli['nome']
        cnpj_cpf = cli.get('cnpj_cpf', '')
        cli_id = cli['id']

        print(f"--- {nome} ({cnpj_cpf or 'sem doc'}) ---")

        # 2a. Tentar encontrar pasta existente
        folder_id, folder_name = search_existing_folder(service, root_folder_id, nome)

        if folder_id:
            print(f"  🔍 Encontrada: '{folder_name}' → {folder_id[:16]}...")
            supabase.from_('clientes').update({'drive_folder_id': folder_id}).eq('id', cli_id).execute()
            matched += 1
            continue

        # 2b. Criar pasta completa
        sanitized_doc = re.sub(r'\D', '', cnpj_cpf) if cnpj_cpf else ''
        folder_display_name = f"{nome.upper()} ({sanitized_doc})" if sanitized_doc else nome.upper()

        print(f"  📁 Criando: '{folder_display_name}'...")

        try:
            client_folder_id = create_drive_folder(service, folder_display_name, root_folder_id)

            all_folders = list(BASE_FOLDERS)
            if is_cnpj(cnpj_cpf):
                all_folders.extend(PJ_EXTRA_FOLDERS)
                print(f"  📋 PJ (CNPJ) → com ALVARAS")
            else:
                print(f"  📋 PF (CPF) → sem ALVARAS")

            total = create_folder_tree(service, all_folders, client_folder_id)
            print(f"  ✅ {total} subpastas criadas!")

            supabase.from_('clientes').update({'drive_folder_id': client_folder_id}).eq('id', cli_id).execute()
            created += 1

        except Exception as e:
            print(f"  ❌ Erro: {e}")
            failed += 1

    # 3. Resumo
    print("\n" + "=" * 50)
    print("📊 RESUMO DA RECONCILIAÇÃO")
    print("=" * 50)
    print(f"  👥 Sem pasta:           {len(sem_pasta)}")
    print(f"  🔍 Encontrados:         {matched}")
    print(f"  📁 Criados:             {created}")
    print(f"  ❌ Falhas:               {failed}")
    print("=" * 50)

    if failed == 0:
        print("✅ Reconciliação concluída com sucesso!")
    else:
        print(f"⚠️  {failed} falha(s). Verifique os logs.")


if __name__ == "__main__":
    reconcile()
