"""
DIAGNÓSTICO SUPABASE — Verificar estado pós-criação massiva de pastas
=====================================================================
Verifica:
  1. Quantos clientes existem em core.empresas
  2. Quantos têm drive_folder_id preenchido vs NULL
  3. Se há drive_folder_ids duplicados
  4. Últimas modificações (para ver o que o AutoAutomacao fez)
  5. Contagem de registros em tabelas críticas

EXECUTE COM: python scripts/diagnostico_supabase.py
"""
import os, sys
try:
    from dotenv import load_dotenv
except ImportError:
    os.system(f"{sys.executable} -m pip install python-dotenv")
    from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    os.system(f"{sys.executable} -m pip install psycopg2-binary")
    import psycopg2
    import psycopg2.extras

DATABASE_URL = os.getenv('DATABASE_URL')

def run_query(conn, titulo, sql, params=None):
    print(f"\n{'─'*60}")
    print(f"📊 {titulo}")
    print(f"{'─'*60}")
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params)
            rows = cur.fetchall()
            if not rows:
                print("  (sem resultados)")
                return []
            for row in rows:
                print("  " + " | ".join(f"{k}: {v}" for k, v in dict(row).items()))
            return rows
    except Exception as e:
        print(f"  ERRO: {e}")
        return []

def main():
    print("=" * 60)
    print("DIAGNÓSTICO SUPABASE — Brandão Contabilidade CRM")
    print("=" * 60)

    if not DATABASE_URL:
        print("ERRO: DATABASE_URL não encontrado no .env.local")
        return

    try:
        conn = psycopg2.connect(DATABASE_URL)
        print("\n✅ Conexão com Supabase: OK")
    except Exception as e:
        print(f"\n❌ Erro na conexão: {e}")
        return

    # 1. Resumo geral de core.empresas
    run_query(conn, "RESUMO core.empresas", """
        SELECT
            COUNT(*) AS total_clientes,
            COUNT(drive_folder_id) AS com_drive_folder,
            COUNT(*) FILTER (WHERE drive_folder_id IS NULL) AS sem_drive_folder,
            COUNT(*) FILTER (WHERE drive_folder_id IS NOT NULL AND drive_folder_id != '') AS drive_configurado
        FROM core.empresas
    """)

    # 2. Drive folder IDs duplicados
    run_query(conn, "DRIVE_FOLDER_IDs DUPLICADOS (mesmo ID para 2+ clientes)", """
        SELECT drive_folder_id, COUNT(*) as quantidade,
               STRING_AGG(nome_fantasia, ', ') as clientes
        FROM core.empresas
        WHERE drive_folder_id IS NOT NULL AND drive_folder_id != ''
        GROUP BY drive_folder_id
        HAVING COUNT(*) > 1
        ORDER BY quantidade DESC
        LIMIT 10
    """)

    # 3. Clientes sem Drive folder
    run_query(conn, "CLIENTES SEM PASTA NO DRIVE (drive_folder_id NULL)", """
        SELECT nome_fantasia, cnpj_cpf, created_at
        FROM core.empresas
        WHERE drive_folder_id IS NULL OR drive_folder_id = ''
        ORDER BY nome_fantasia
        LIMIT 20
    """)

    # 4. Últimas 10 modificações
    run_query(conn, "ÚLTIMAS MODIFICAÇÕES (drive_folder_id recente)", """
        SELECT nome_fantasia, cnpj_cpf,
               LEFT(drive_folder_id, 30) as drive_id_preview,
               updated_at
        FROM core.empresas
        WHERE drive_folder_id IS NOT NULL
        ORDER BY updated_at DESC NULLS LAST
        LIMIT 10
    """)

    # 5. Contagem de tabelas críticas
    for schema_table in ['core.empresas', 'audit.logs', 'workflow.tarefas']:
        schema, table = schema_table.split('.')
        try:
            with conn.cursor() as cur:
                cur.execute(f"SELECT COUNT(*) FROM {schema_table}")
                count = cur.fetchone()[0]
                print(f"\n  📋 {schema_table}: {count} registros")
        except Exception as e:
            print(f"\n  ⚠️  {schema_table}: {e}")

    # 6. Verificar se colunas nome e cnpj_cpf existem (para debug do N8N)
    run_query(conn, "COLUNAS REAIS de core.empresas", """
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'core' AND table_name = 'empresas'
        ORDER BY ordinal_position
        LIMIT 30
    """)

    conn.close()
    print(f"\n{'='*60}")
    print("Diagnóstico concluído.")

if __name__ == "__main__":
    main()
