"""
LIMPEZA DE EMERGÊNCIA v2 — Google Drive CRM (Busca Recursiva)
==============================================================
Detecta e remove:
  1. Pastas com nomes literais inválidos: {{ $json.nome }}, etc.
  2. Pastas DUPLICADAS dentro de cada cliente (mesmo nome + mesmo pai)

A imagem mostra duplicatas em: 10 - RH > 02 - RH > AVISO_PREVIO x2, FGTS x2...
O MaestroSync.exe criou a árvore de subpastas múltiplas vezes.

EXECUTE COM:
  python scripts/limpar_pastas_invalidas_drive.py --simular   (ver o que seria deletado)
  python scripts/limpar_pastas_invalidas_drive.py --executar  (deletar de verdade)
"""

import os
import sys
import json
import time
import argparse
from collections import defaultdict

# ─────────────────────────────────────────────────────────────
#  Instalar dependências se necessário
# ─────────────────────────────────────────────────────────────
try:
    from dotenv import load_dotenv
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
except ImportError:
    print("Instalando dependências...")
    os.system(f"{sys.executable} -m pip install google-api-python-client google-auth python-dotenv")
    from dotenv import load_dotenv
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

# ─────────────────────────────────────────────────────────────
#  Configurações
# ─────────────────────────────────────────────────────────────
ROOT_FOLDER_ID = os.getenv('GOOGLE_DRIVE_ROOT_FOLDER_ID', '1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP')

# Nomes que indicam expressão N8N não resolvida
PATTERNS_INVALIDOS = ['{{ ', '}}', '$json.', '{{$json']

def nome_e_invalido(nome: str) -> bool:
    nome_lower = nome.lower()
    return any(p.lower() in nome_lower for p in PATTERNS_INVALIDOS)

# ─────────────────────────────────────────────────────────────
#  Google Drive
# ─────────────────────────────────────────────────────────────
def get_service():
    creds_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
    if not creds_json:
        raise ValueError("GOOGLE_CREDENTIALS_JSON não encontrado no .env.local")
    info = json.loads(creds_json)
    creds = service_account.Credentials.from_service_account_info(
        info, scopes=['https://www.googleapis.com/auth/drive']
    )
    return build('drive', 'v3', credentials=creds)

def listar_subpastas(service, parent_id: str) -> list:
    """Lista todas as subpastas de um folder (com paginação)."""
    resultado = []
    page_token = None
    while True:
        params = {
            'q': f"'{parent_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false",
            'fields': 'nextPageToken, files(id, name, createdTime)',
            'pageSize': 1000,
        }
        if page_token:
            params['pageToken'] = page_token
        try:
            res = service.files().list(**params).execute()
            resultado.extend(res.get('files', []))
            page_token = res.get('nextPageToken')
            if not page_token:
                break
            time.sleep(0.05)
        except HttpError as e:
            print(f"  ERRO API: {e}")
            break
    return resultado

def mover_para_lixeira(service, file_id: str, nome: str, simular: bool) -> bool:
    if simular:
        return True
    try:
        service.files().update(fileId=file_id, body={'trashed': True}).execute()
        return True
    except HttpError as e:
        print(f"  ERRO ao deletar '{nome}': {e}")
        return False

# ─────────────────────────────────────────────────────────────
#  Varredura e Detecção
# ─────────────────────────────────────────────────────────────
def varrer_pasta_cliente(service, cliente_id: str, cliente_nome: str) -> list:
    """
    Varre recursivamente a pasta de um cliente buscando:
    1. Pastas com nome inválido (N8N não resolvido)
    2. Pastas duplicadas (mesmo nome dentro do mesmo pai)
    Retorna lista de pastas a deletar: [{id, name, motivo, parent_name}]
    """
    para_deletar = []

    def _varrer(parent_id, path):
        subpastas = listar_subpastas(service, parent_id)
        if not subpastas:
            return

        # Detectar duplicatas: agrupar por nome
        por_nome = defaultdict(list)
        for p in subpastas:
            por_nome[p['name']].append(p)

        for nome, lista in por_nome.items():
            # Pastas inválidas
            if nome_e_invalido(nome):
                for p in lista:
                    para_deletar.append({
                        'id': p['id'],
                        'name': p['name'],
                        'motivo': 'NOME_INVALIDO (expressão N8N)',
                        'path': f"{path}/{nome}"
                    })
                continue  # Não varrer dentro de pastas inválidas

            # Pastas duplicadas: manter a mais ANTIGA, deletar as demais
            if len(lista) > 1:
                # Ordenar por data de criação (mais antiga primeiro)
                lista_ord = sorted(lista, key=lambda x: x.get('createdTime', ''))
                manter = lista_ord[0]  # Mais antiga = original
                for p in lista_ord[1:]:  # Duplicatas
                    para_deletar.append({
                        'id': p['id'],
                        'name': p['name'],
                        'motivo': f'DUPLICATA (manter: {manter["id"]})',
                        'path': f"{path}/{nome}"
                    })
                # Continuar varredura APENAS na pasta original (mais antiga)
                _varrer(manter['id'], f"{path}/{nome}")
            else:
                # Única — varrer recursivamente
                _varrer(lista[0]['id'], f"{path}/{nome}")

    _varrer(cliente_id, cliente_nome)
    return para_deletar

# ─────────────────────────────────────────────────────────────
#  Main
# ─────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description='Limpeza de pastas duplicadas no Drive CRM')
    parser.add_argument('--simular', action='store_true', default=True,
                        help='Modo simulação (padrão): não deleta nada')
    parser.add_argument('--executar', action='store_true',
                        help='Executa a limpeza real')
    args = parser.parse_args()

    simular = not args.executar

    print("=" * 65)
    print("LIMPEZA RECURSIVA — Google Drive CRM Brandão Contabilidade")
    print("=" * 65)

    if simular:
        print("\n🟡 MODO SIMULAÇÃO — Nenhuma pasta será deletada")
    else:
        print("\n🔴 MODO REAL — Pastas serão movidas para LIXEIRA do Drive")
        confirmacao = input("   Digite 'CONFIRMO LIMPEZA' para continuar: ").strip()
        if confirmacao != 'CONFIRMO LIMPEZA':
            print("Operação cancelada.")
            return

    try:
        service = get_service()
        print("\nConexão com Google Drive: ✅ OK")
    except Exception as e:
        print(f"\nERRO na conexão: {e}")
        return

    # Listar clientes (pastas na raiz CRM)
    print(f"\nBuscando clientes na raiz CRM...")
    clientes = listar_subpastas(service, ROOT_FOLDER_ID)
    print(f"Clientes encontrados: {len(clientes)}")

    # Varrer cada cliente
    total_invalidas = []
    for i, cliente in enumerate(clientes):
        print(f"\n  [{i+1:02d}/{len(clientes)}] {cliente['name'][:50]}...")
        problemas = varrer_pasta_cliente(service, cliente['id'], cliente['name'])
        if problemas:
            print(f"         ⚠️  {len(problemas)} pasta(s) problemática(s)")
            total_invalidas.extend(problemas)

    # Relatório
    print(f"\n{'='*65}")
    print(f"RELATÓRIO FINAL:")
    print(f"  Clientes verificados : {len(clientes)}")
    print(f"  Pastas problemáticas : {len(total_invalidas)}")
    print(f"{'='*65}")

    if total_invalidas:
        print("\nAmostra dos problemas encontrados:")
        for p in total_invalidas[:20]:
            print(f"  [{p['motivo'][:20]}] {p['path'][:60]}")
        if len(total_invalidas) > 20:
            print(f"  ... e mais {len(total_invalidas) - 20} pasta(s)")

    if not total_invalidas:
        print("\n✅ Drive está limpo! Nenhuma duplicata ou pasta inválida.")
        return

    if simular:
        print(f"\n[SIMULAÇÃO] Seriam removidas: {len(total_invalidas)} pastas")
        print("\nPara executar a limpeza real:")
        print("  python scripts/limpar_pastas_invalidas_drive.py --executar")
        return

    # Executar limpeza
    print(f"\nRemovendo {len(total_invalidas)} pastas...")
    sucesso = 0
    for i, p in enumerate(total_invalidas):
        if mover_para_lixeira(service, p['id'], p['name'], simular):
            sucesso += 1
        if (i + 1) % 50 == 0:
            print(f"  Progresso: {i+1}/{len(total_invalidas)}")
        time.sleep(0.05)

    print(f"\n✅ LIMPEZA CONCLUÍDA!")
    print(f"   Removidas: {sucesso}/{len(total_invalidas)}")
    print("\n   ℹ️ Pastas estão na LIXEIRA — você tem 30 dias para recuperar.")
    print("   Para esvaziar: Google Drive → Lixeira → Esvaziar lixeira")

if __name__ == "__main__":
    main()
