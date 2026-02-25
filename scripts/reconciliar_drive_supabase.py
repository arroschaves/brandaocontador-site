"""
RECONCILIAÇÃO DRIVE ↔ SUPABASE
================================
Corrige todos os drive_folder_id do Supabase que estão com UUIDs errados.

Estratégia:
  1. Buscar TODAS as pastas reais no Google Drive CRM
  2. Buscar TODOS os clientes no Supabase (nome_fantasia + documento)
  3. Fazer match por similaridade de nome
  4. Atualizar drive_folder_id no Supabase com o ID real do Drive

EXECUTE:
  python scripts/reconciliar_drive_supabase.py --simular   (ver os matches)
  python scripts/reconciliar_drive_supabase.py --executar  (gravar no Supabase)
"""

import os, sys, json, time, re, argparse
from difflib import SequenceMatcher

try:
    from dotenv import load_dotenv
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    import psycopg2, psycopg2.extras
except ImportError:
    os.system(f"{sys.executable} -m pip install google-api-python-client google-auth python-dotenv psycopg2-binary")
    from dotenv import load_dotenv
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    import psycopg2, psycopg2.extras

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

ROOT_FOLDER_ID = os.getenv('GOOGLE_DRIVE_ROOT_FOLDER_ID', '1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP')

# ─── Helpers ───────────────────────────────────────────────────────────────

def normalizar(texto: str) -> str:
    """Remove documento (CPF/CNPJ) do nome e normaliza para comparação."""
    if not texto:
        return ''
    # Remove conteúdo entre parênteses: "STAR SHOP (43649257000181)" → "STAR SHOP"
    s = re.sub(r'\s*\([^)]+\)', '', texto)
    # Remove pontuação especial, espaços duplos, maiúsculas
    s = re.sub(r'[_\-\.]', ' ', s)
    s = ' '.join(s.upper().split())
    return s

def extrair_documento(texto: str) -> str:
    """Extrai o CPF/CNPJ do nome da pasta."""
    if not texto:
        return ''
    m = re.search(r'\((\d+)\)', texto)
    return m.group(1) if m else ''

def similaridade(a: str, b: str) -> float:
    return SequenceMatcher(None, a, b).ratio()

def get_drive_service():
    info = json.loads(os.getenv('GOOGLE_CREDENTIALS_JSON'))
    creds = service_account.Credentials.from_service_account_info(
        info, scopes=['https://www.googleapis.com/auth/drive']
    )
    return build('drive', 'v3', credentials=creds)

# ─── Buscar pastas do Drive ─────────────────────────────────────────────────

def listar_pastas_drive(service) -> list:
    """Lista todas as pastas na raiz CRM."""
    pastas = []
    page_token = None
    while True:
        res = service.files().list(
            q=f"'{ROOT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false",
            fields='nextPageToken, files(id, name)',
            pageSize=1000,
            pageToken=page_token
        ).execute() if page_token else service.files().list(
            q=f"'{ROOT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false",
            fields='nextPageToken, files(id, name)',
            pageSize=1000
        ).execute()
        pastas.extend(res.get('files', []))
        page_token = res.get('nextPageToken')
        if not page_token:
            break
    return pastas

# ─── Buscar clientes do Supabase ────────────────────────────────────────────

def listar_clientes_supabase(conn) -> list:
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute("SELECT id, nome_fantasia, razao_social, documento, drive_folder_id FROM core.empresas")
        return [dict(r) for r in cur.fetchall()]

# ─── Match ──────────────────────────────────────────────────────────────────

def fazer_match(clientes_supabase: list, pastas_drive: list) -> list:
    """
    Para cada cliente do Supabase, encontra a melhor pasta no Drive.
    Retorna lista de matches: [{cliente_id, nome_fantasia, drive_id, match_nome, score, metodo}]
    """
    matches = []

    # Indexar pastas do Drive por documento e nome normalizado
    drive_por_doc = {}   # documento → pasta
    drive_por_nome = {}  # nome_norm → pasta

    for pasta in pastas_drive:
        doc = extrair_documento(pasta['name'])
        nome_norm = normalizar(pasta['name'])
        if doc:
            drive_por_doc[doc] = pasta
        drive_por_nome[nome_norm] = pasta

    for cliente in clientes_supabase:
        nome_fantasia = cliente.get('nome_fantasia') or ''
        razao_social  = cliente.get('razao_social')  or ''
        documento     = (cliente.get('documento') or '').replace('.', '').replace('/', '').replace('-', '').strip()
        drive_id_atual = cliente.get('drive_folder_id', '')

        # Verificar se já tem ID real do Drive (não UUID)
        ja_tem_drive_real = bool(drive_id_atual and '-' not in drive_id_atual and len(drive_id_atual) > 20)

        match_pasta = None
        score = 0.0
        metodo = ''

        # 1. Match por documento (mais confiável)
        if documento and documento in drive_por_doc:
            match_pasta = drive_por_doc[documento]
            score = 1.0
            metodo = 'DOCUMENTO_EXATO'

        # 2. Match por nome normalizado exato
        if not match_pasta:
            nome_norm = normalizar(nome_fantasia)
            if nome_norm and nome_norm in drive_por_nome:
                match_pasta = drive_por_nome[nome_norm]
                score = 1.0
                metodo = 'NOME_EXATO'

        # 3. Match fuzzy por nome
        if not match_pasta:
            melhor = None
            melhor_score = 0.0
            for nome_norm, pasta in drive_por_nome.items():
                s = max(
                    similaridade(normalizar(nome_fantasia), nome_norm),
                    similaridade(normalizar(razao_social), nome_norm)
                )
                if s > melhor_score:
                    melhor_score = s
                    melhor = pasta
            if melhor_score >= 0.70:
                match_pasta = melhor
                score = melhor_score
                metodo = f'FUZZY_{melhor_score:.0%}'

        # Determinar se precisa atualizar
        precisa_atualizar = (
            match_pasta and
            match_pasta['id'] != drive_id_atual  # atual é diferente do encontrado
        )

        matches.append({
            'cliente_id':      cliente['id'],
            'nome_fantasia':   nome_fantasia[:40],
            'documento':       documento,
            'drive_id_atual':  drive_id_atual[:30] if drive_id_atual else 'NULL',
            'drive_id_novo':   match_pasta['id'] if match_pasta else None,
            'drive_nome':      match_pasta['name'][:40] if match_pasta else 'SEM MATCH',
            'score':           score,
            'metodo':          metodo or 'SEM_MATCH',
            'precisa_atualizar': precisa_atualizar,
        })

    return matches

# ─── Atualizar Supabase ──────────────────────────────────────────────────────

def atualizar_supabase(conn, matches: list, simular: bool) -> tuple:
    ok, falha, skip = 0, 0, 0
    with conn.cursor() as cur:
        for m in matches:
            if not m['precisa_atualizar']:
                skip += 1
                continue
            if simular:
                ok += 1
                continue
            try:
                cur.execute(
                    "UPDATE core.empresas SET drive_folder_id = %s WHERE id = %s",
                    (m['drive_id_novo'], m['cliente_id'])
                )
                ok += 1
            except Exception as e:
                print(f"  ERRO ao atualizar {m['nome_fantasia']}: {e}")
                falha += 1
        if not simular:
            conn.commit()
    return ok, falha, skip

# ─── Main ───────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--simular',  action='store_true', default=True)
    parser.add_argument('--executar', action='store_true')
    args = parser.parse_args()
    simular = not args.executar

    print("=" * 65)
    print("RECONCILIAÇÃO Drive ↔ Supabase — Brandão Contabilidade")
    print("=" * 65)
    print(f"Modo: {'🟡 SIMULAÇÃO' if simular else '🔴 REAL (gravando no Supabase)'}")

    if not simular:
        ok = input("\nDigite 'CONFIRMO' para atualizar o Supabase: ").strip()
        if ok != 'CONFIRMO':
            print("Cancelado.")
            return

    print("\n1. Conectando ao Google Drive...")
    drive = get_drive_service()
    pastas_drive = listar_pastas_drive(drive)
    print(f"   Pastas no Drive CRM: {len(pastas_drive)}")

    print("\n2. Conectando ao Supabase...")
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    clientes = listar_clientes_supabase(conn)
    print(f"   Clientes no Supabase: {len(clientes)}")

    print("\n3. Fazendo match...")
    matches = fazer_match(clientes, pastas_drive)

    # Relatório
    precisam  = [m for m in matches if m['precisa_atualizar']]
    sem_match = [m for m in matches if m['metodo'] == 'SEM_MATCH']
    ok_score  = [m for m in matches if m['score'] >= 0.9 and m['precisa_atualizar']]

    print(f"\n{'='*65}")
    print(f"RELATÓRIO DE MATCHES")
    print(f"{'='*65}")
    print(f"  Clientes analisados  : {len(matches)}")
    print(f"  Precisam atualizar   : {len(precisam)}")
    print(f"  Match perfeito (≥90%): {len(ok_score)}")
    print(f"  Sem match encontrado : {len(sem_match)}")

    print(f"\n{'─'*65}")
    print("DETALHE DOS MATCHES:")
    print(f"{'─'*65}")
    for m in sorted(matches, key=lambda x: -x['score'])[:30]:
        status = '✅' if m['score'] >= 0.9 else ('⚠️' if m['score'] >= 0.7 else '❌')
        upd = ' [ATUALIZAR]' if m['precisa_atualizar'] else ''
        print(f"  {status} {m['nome_fantasia'][:30]:<30} | {m['metodo']:<18} | Drive: {m['drive_nome'][:25]}{upd}")

    if sem_match:
        print(f"\n{'─'*65}")
        print(f"SEM MATCH ({len(sem_match)} clientes):")
        for m in sem_match:
            print(f"  ❌ {m['nome_fantasia'][:40]} (doc: {m['documento']})")

    if simular:
        print(f"\n[SIMULAÇÃO] Seriam atualizados: {len(precisam)} registros")
        print("\nPara executar:")
        print("  python scripts/reconciliar_drive_supabase.py --executar")
        conn.close()
        return

    print(f"\n4. Atualizando Supabase...")
    ok, falha, skip = atualizar_supabase(conn, matches, simular)
    print(f"   Atualizados: {ok} | Erros: {falha} | Sem mudança: {skip}")
    conn.close()

    print(f"\n✅ RECONCILIAÇÃO CONCLUÍDA!")
    print("   Verifique o Supabase: o campo drive_folder_id agora contém IDs reais do Drive.")

if __name__ == "__main__":
    main()
