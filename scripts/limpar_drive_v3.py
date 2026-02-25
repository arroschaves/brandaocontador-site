"""
LIMPEZA DIRETA v3 — Abordagem sem recursão profunda
=====================================================
O problema: algumas pastas de clientes têm 16.000 subpastas,
causando timeout/500 na API do Drive durante recursão.

NOVA ESTRATÉGIA:
  1. Busca APENAS as pastas duplicadas na RAIZ DO CRM (nível 1)
  2. Busca por nome EXATO das pastas PJ padrão dentro de cada cliente (nível 2)
  3. Usa busca direta por query ao invés de listar tudo e filtrar

Pastas PJ padrão conhecidas (que devem existir UMA VEZ por cliente):
  01_Societario_Legal, 02_Fiscal_Tributos,
  03_Contabil_Financeiro, 04_Folha_RH

EXECUTE COM:
  python scripts/limpar_drive_v3.py --simular    (ver o que seria deletado)
  python scripts/limpar_drive_v3.py --executar   (deletar de verdade)
"""

import os, sys, json, time, argparse
from collections import defaultdict

try:
    from dotenv import load_dotenv
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
except ImportError:
    os.system(f"{sys.executable} -m pip install google-api-python-client google-auth python-dotenv")
    from dotenv import load_dotenv
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

ROOT_FOLDER_ID = os.getenv('GOOGLE_DRIVE_ROOT_FOLDER_ID', '1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP')

# Pastas que devem existir UMA ÚNICA VEZ dentro de cada cliente
PASTAS_PADRAO_PJ = [
    '01_Societario_Legal',
    '02_Fiscal_Tributos',
    '03_Contabil_Financeiro',
    '04_Folha_RH',
]

# ─── Drive ──────────────────────────────────────────────────────────────────

def get_service():
    info = json.loads(os.getenv('GOOGLE_CREDENTIALS_JSON'))
    creds = service_account.Credentials.from_service_account_info(
        info, scopes=['https://www.googleapis.com/auth/drive']
    )
    return build('drive', 'v3', credentials=creds)

def listar_filhos(service, parent_id, so_pastas=True, timeout_retries=2):
    """Lista filhos de uma pasta com retry em caso de erro 500."""
    mime_filter = "mimeType='application/vnd.google-apps.folder'" if so_pastas else ""
    q = f"'{parent_id}' in parents and trashed=false"
    if mime_filter:
        q += f" and {mime_filter}"

    resultado = []
    page_token = None

    for tentativa in range(timeout_retries + 1):
        try:
            while True:
                params = {
                    'q': q,
                    'fields': 'nextPageToken, files(id, name, createdTime)',
                    'pageSize': 1000,
                }
                if page_token:
                    params['pageToken'] = page_token
                res = service.files().list(**params).execute()
                resultado.extend(res.get('files', []))
                page_token = res.get('nextPageToken')
                if not page_token:
                    break
                time.sleep(0.1)
            return resultado
        except HttpError as e:
            if e.status_code == 500 and tentativa < timeout_retries:
                print(f"    ⚠️ API error 500, aguardando 3s e tentando novamente...")
                time.sleep(3)
                resultado = []
                page_token = None
                continue
            print(f"    ❌ Erro irreversível: {e}")
            return resultado

    return resultado

def buscar_duplicatas_por_nome(service, parent_id, nome_procurado):
    """Busca DIRETAMENTE pastas com nome específico dentro de um parent."""
    q = f"'{parent_id}' in parents and name='{nome_procurado}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    try:
        res = service.files().list(
            q=q, fields='files(id, name, createdTime)', pageSize=100
        ).execute()
        return res.get('files', [])
    except HttpError:
        return []

def mover_lixeira(service, file_id, simular):
    if simular:
        return True
    try:
        service.files().update(fileId=file_id, body={'trashed': True}).execute()
        time.sleep(0.05)
        return True
    except HttpError as e:
        print(f"    ERRO lixeira: {e}")
        return False

# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--simular',  action='store_true', default=True)
    parser.add_argument('--executar', action='store_true')
    args = parser.parse_args()
    simular = not args.executar

    print("=" * 65)
    print("LIMPEZA DRIVE v3 — Brandão Contabilidade CRM")
    print("=" * 65)
    print(f"Modo: {'🟡 SIMULAÇÃO' if simular else '🔴 REAL'}\n")

    if not simular:
        ok = input("Digite 'CONFIRMO' para executar a limpeza: ").strip()
        if ok != 'CONFIRMO':
            print("Cancelado.")
            return

    service = get_service()

    # ── PASSO 1: Duplicatas NA RAIZ CRM (pastas de clientes) ──────────────
    print("PASSO 1: Verificando pastas de CLIENTES duplicadas na raiz CRM...")
    clientes = listar_filhos(service, ROOT_FOLDER_ID)
    print(f"   Total de clientes encontrados: {len(clientes)}")

    # Agrupar por nome
    por_nome = defaultdict(list)
    for c in clientes:
        por_nome[c['name']].append(c)

    duplicatas_raiz = []
    for nome, lista in por_nome.items():
        if len(lista) > 1:
            # Manter a mais antiga, deletar as demais
            lista_ord = sorted(lista, key=lambda x: x.get('createdTime', ''))
            for dup in lista_ord[1:]:
                duplicatas_raiz.append({'id': dup['id'], 'nome': dup['name'], 'nivel': 'RAIZ'})

    print(f"   Pastas de clientes DUPLICADAS na raiz: {len(duplicatas_raiz)}")

    # ── PASSO 2: Duplicatas das pastas PJ PADRÃO dentro de cada cliente ───
    print(f"\nPASSO 2: Verificando pastas PJ padrão duplicadas dentro dos {len(clientes)} clientes...")
    duplicatas_nivel2 = []

    # Usar apenas os clientes ÚNICOS (sem duplicatas da raiz — usar os mais antigos)
    clientes_unicos = {}
    for nome, lista in por_nome.items():
        lista_ord = sorted(lista, key=lambda x: x.get('createdTime', ''))
        clientes_unicos[nome] = lista_ord[0]  # Mais antigo = original

    total = len(clientes_unicos)
    for i, (nome_cliente, cliente) in enumerate(clientes_unicos.items()):
        print(f"   [{i+1:02d}/{total}] {nome_cliente[:50]}")
        for pasta_padrao in PASTAS_PADRAO_PJ:
            ocorrencias = buscar_duplicatas_por_nome(service, cliente['id'], pasta_padrao)
            if len(ocorrencias) > 1:
                # Manter a mais antiga
                ocorrencias_ord = sorted(ocorrencias, key=lambda x: x.get('createdTime', ''))
                for dup in ocorrencias_ord[1:]:
                    duplicatas_nivel2.append({
                        'id': dup['id'],
                        'nome': f"{pasta_padrao} (dentro de {nome_cliente[:30]})",
                        'nivel': 'NIVEL_2',
                        'created': dup.get('createdTime', '')
                    })
                print(f"      ⚠️ {pasta_padrao}: {len(ocorrencias)} cópias! Serão removidas {len(ocorrencias)-1}")

    print(f"\n   Pastas PJ padrão duplicadas (nível 2): {len(duplicatas_nivel2)}")

    # ── RELATÓRIO ────────────────────────────────────────────────────────────
    total_remover = duplicatas_raiz + duplicatas_nivel2
    print(f"\n{'='*65}")
    print(f"RELATÓRIO:")
    print(f"  Duplicatas na raiz CRM     : {len(duplicatas_raiz)}")
    print(f"  Pastas PJ padrão duplicadas: {len(duplicatas_nivel2)}")
    print(f"  TOTAL A REMOVER            : {len(total_remover)}")
    print(f"{'='*65}")

    if not total_remover:
        print("\n✅ Nenhuma duplicata encontrada neste nível!")
        print("\nNOTA: As 16.000 pastas podem estar em subníveis mais profundos.")
        print("Para limpar manualmente: Abra o Google Drive e delete as pastas")
        print("duplicadas de cada cliente manualmente.")
        return

    if simular:
        print(f"\n[SIMULAÇÃO] Seriam removidas: {len(total_remover)} pastas")
        if duplicatas_raiz:
            print("\nDuplicatas na raiz:")
            for d in duplicatas_raiz:
                print(f"  - {d['nome']}")
        if duplicatas_nivel2:
            print("\nPastas PJ padrão duplicadas (amostra):")
            for d in duplicatas_nivel2[:15]:
                print(f"  - {d['nome']}")
            if len(duplicatas_nivel2) > 15:
                print(f"  ... e mais {len(duplicatas_nivel2)-15}")
        print("\nPara executar:")
        print("  python scripts/limpar_drive_v3.py --executar")
        return

    # ── EXECUTAR ──────────────────────────────────────────────────────────
    print(f"\nRemovendo {len(total_remover)} pastas...")
    ok, err = 0, 0
    for i, item in enumerate(total_remover):
        if mover_lixeira(service, item['id'], simular):
            ok += 1
        else:
            err += 1
        if (i+1) % 20 == 0:
            print(f"  {i+1}/{len(total_remover)} | OK: {ok} | Erro: {err}")

    print(f"\n✅ LIMPEZA CONCLUÍDA!")
    print(f"   Removidas: {ok} | Erros: {err}")
    print("\n   Pastas na LIXEIRA — 30 dias para recuperar se precisar.")

if __name__ == "__main__":
    main()
