import os, psycopg2, psycopg2.extras
from dotenv import load_dotenv
load_dotenv('.env.local')

conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

print("=== COLUNAS REAIS de core.empresas ===")
cur.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema='core' AND table_name='empresas' 
    ORDER BY ordinal_position
""")
cols = cur.fetchall()
for c in cols:
    print(f"  {c['column_name']} ({c['data_type']})")

print()
print("=== RESUMO drive_folder_id ===")
cur.execute("""
    SELECT 
        COUNT(*) as total,
        COUNT(drive_folder_id) FILTER (WHERE drive_folder_id IS NOT NULL AND drive_folder_id != '') as com_drive,
        COUNT(*) FILTER (WHERE drive_folder_id IS NULL OR drive_folder_id = '') as sem_drive
    FROM core.empresas
""")
r = cur.fetchone()
print(f"  Total: {r['total']} | Com Drive: {r['com_drive']} | Sem Drive: {r['sem_drive']}")

print()
print("=== PRIMEIRAS 3 LINHAS (colunas identificadoras) ===")
cur.execute("SELECT * FROM core.empresas LIMIT 3")
rows = cur.fetchall()
for row in rows:
    d = dict(row)
    print(f"  nome_fantasia={str(d.get('nome_fantasia','?'))[:30]} | drive={str(d.get('drive_folder_id','NULL'))[:20]}")

conn.close()
print("\nDone.")
