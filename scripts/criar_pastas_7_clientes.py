"""
CRIAR PASTAS — 7 clientes sem pasta no Google Drive
====================================================
Cria estrutura PJ completa no Drive e atualiza drive_folder_id no Supabase.

Clientes:
  - LIONS CLUBE DE SIDROLANDIA MS  (15554033000150)
  - TESHA CONSULTORIA              (01325908000138)
  - ARAUJO SERVICOS & TRANSPORTES  (00107984000104)
  - PLANTAO MS                     (09547585000139)
  - AGRO TESHA LTDA                (51095825000178)
  - CORREA PARTICIPACOES LTDA      (50720854000110)
  - CONF. COMERCIO & SERVICOS      (37189966000129)

EXECUTE COM: python scripts/criar_pastas_7_clientes.py
"""

import os, sys, json, time
try:
    from dotenv import load_dotenv
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    import psycopg2
except ImportError:
    os.system(f"{sys.executable} -m pip install google-api-python-client google-auth python-dotenv psycopg2-binary")
    from dotenv import load_dotenv
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    import psycopg2

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

ROOT_FOLDER_ID = os.getenv('GOOGLE_DRIVE_ROOT_FOLDER_ID', '1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP')

# ─── Estrutura PJ completa (padrão Brandão) ─────────────────────────────────

MESES = [
    '01_Janeiro','02_Fevereiro','03_Marco','04_Abril','05_Maio','06_Junho',
    '07_Julho','08_Agosto','09_Setembro','10_Outubro','11_Novembro','12_Dezembro',
    '13_Salario'
]

PJ_ESTRUTURA = [
    {'n': '01_Societario_Legal', 'f': [
        'Alvaras', 'Certidoes_Negativas', 'Certificado_Digital', 'Contratos_e_Alteracoes'
    ]},
    {'n': '02_Fiscal_Tributos', 'f': [
        'Declaracoes_Fiscais_DCTF_Etc',
        {'n': 'Impostos_e_Guias', 'f': [{'n': '2026', 'f': MESES}]},
        'Notas_Fiscais_XML'
    ]},
    {'n': '03_Contabil_Financeiro', 'f': [
        'Balancetes_DRE',
        {'n': 'Extratos_Bancarios', 'f': [{'n': '2026', 'f': MESES}]},
        'Recibos_Faturamento'
    ]},
    {'n': '04_Folha_RH', 'f': [
        'Ferias_Rescisoes',
        {'n': 'Guias_INSS_FGTS', 'f': [{'n': '2026', 'f': MESES}]},
        {'n': 'Recibos_Folha_Pagamento', 'f': [{'n': '2026', 'f': MESES}]}
    ]},
]

# ─── 7 clientes para criar (nome_fantasia + documento do Supabase) ───────────

CLIENTES = [
    {'nome': 'LIONS CLUBE DE SIDROLANDIA MS', 'documento': '15554033000150'},
    {'nome': 'TESHA CONSULTORIA',             'documento': '01325908000138'},
    {'nome': 'ARAUJO SERVICOS & TRANSPORTES','documento': '00107984000104'},
    {'nome': 'PLANTAO MS',                   'documento': '09547585000139'},
    {'nome': 'AGRO TESHA LTDA',              'documento': '51095825000178'},
    {'nome': 'CORREA PARTICIPACOES LTDA',    'documento': '50720854000110'},
    {'nome': 'CONF. COMERCIO & SERVICOS',    'documento': '37189966000129'},
]

# ─── Helpers Drive ───────────────────────────────────────────────────────────

def get_drive_service():
    info = json.loads(os.getenv('GOOGLE_CREDENTIALS_JSON'))
    creds = service_account.Credentials.from_service_account_info(
        info, scopes=['https://www.googleapis.com/auth/drive']
    )
    return build('drive', 'v3', credentials=creds)

def pasta_existe(service, parent_id, nome):
    """Retorna ID se pasta já existe, None se não existe."""
    res = service.files().list(
        q=f"'{parent_id}' in parents and name='{nome}' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields='files(id,name)', pageSize=1
    ).execute()
    files = res.get('files', [])
    return files[0]['id'] if files else None

def criar_pasta(service, parent_id, nome):
    """Cria pasta — verifica se já existe primeiro (anti-duplicata)."""
    existente = pasta_existe(service, parent_id, nome)
    if existente:
        print(f"    ↩️  Já existe: {nome}")
        return existente
    meta = {'name': nome, 'mimeType': 'application/vnd.google-apps.folder', 'parents': [parent_id]}
    res = service.files().create(body=meta, fields='id').execute()
    time.sleep(0.15)  # rate limit
    return res['id']

def criar_arvore(service, parent_id, estrutura, indent=2):
    """Cria recursivamente a árvore de pastas."""
    espaco = '  ' * indent
    for item in estrutura:
        if isinstance(item, str):
            folder_id = criar_pasta(service, parent_id, item)
            print(f"{espaco}📁 {item}")
        elif isinstance(item, dict):
            folder_id = criar_pasta(service, parent_id, item['n'])
            print(f"{espaco}📁 {item['n']}/")
            if item.get('f'):
                criar_arvore(service, folder_id, item['f'], indent + 1)

# ─── Supabase ────────────────────────────────────────────────────────────────

def atualizar_drive_id_supabase(conn, nome_fantasia, documento, drive_id):
    """Atualiza o drive_folder_id do cliente no Supabase."""
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE core.empresas
            SET drive_folder_id = %s
            WHERE documento = %s OR nome_fantasia ILIKE %s
        """, (drive_id, documento, f'%{nome_fantasia[:20]}%'))
        rows = cur.rowcount
        conn.commit()
        return rows

# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("CRIAR PASTAS — 7 Clientes sem Drive — Brandão CRM")
    print("=" * 60)

    service = get_drive_service()
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    print("✅ Conexão OK\n")

    resultados = []

    for i, cliente in enumerate(CLIENTES, 1):
        nome = cliente['nome']
        doc  = cliente['documento']
        nome_pasta = f"{nome} ({doc})"

        print(f"\n[{i}/7] {nome_pasta}")
        print(f"{'─'*55}")

        # 1. Verificar se já existe na raiz
        existente_id = pasta_existe(service, ROOT_FOLDER_ID, nome_pasta)
        if existente_id:
            print(f"  ↩️  Pasta já existe! ID: {existente_id}")
            client_folder_id = existente_id
        else:
            print(f"  ➕ Criando pasta raiz do cliente...")
            client_folder_id = criar_pasta(service, ROOT_FOLDER_ID, nome_pasta)
            print(f"  ✅ Criada! ID: {client_folder_id}")

        # 2. Criar estrutura PJ completa
        print("  📂 Criando estrutura PJ:")
        criar_arvore(service, client_folder_id, PJ_ESTRUTURA, indent=2)

        # 3. Atualizar Supabase
        rows = atualizar_drive_id_supabase(conn, nome, doc, client_folder_id)
        status_db = f"✅ Supabase atualizado ({rows} registro)" if rows > 0 else "⚠️ Não encontrado no Supabase"
        print(f"  💾 {status_db}")

        resultados.append({'nome': nome, 'drive_id': client_folder_id, 'db': rows > 0})

    conn.close()

    print(f"\n{'='*60}")
    print("RESULTADO FINAL")
    print(f"{'='*60}")
    for r in resultados:
        status = '✅' if r['db'] else '⚠️'
        print(f"  {status} {r['nome'][:45]:<45} | Drive: {r['drive_id'][:20]}")

    sem_db = [r for r in resultados if not r['db']]
    if sem_db:
        print(f"\n⚠️  {len(sem_db)} clientes não encontrados no Supabase:")
        for r in sem_db:
            print(f"    - {r['nome']} → drive_folder_id: {r['drive_id']}")
        print("  Verifique o nome exato no Supabase e atualize manualmente.")

    print("\n✅ PROCESSO CONCLUÍDO!")

if __name__ == "__main__":
    main()
