
import os
import json
import psycopg2
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv('.env.local')

# Conexão direta com Postgres (Sem API)
def get_db_connection():
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        raise ValueError("DATABASE_URL não configurada no .env.local")
    return psycopg2.connect(db_url)

def get_drive_service():
    creds_json = os.environ.get('GOOGLE_CREDENTIALS_JSON')
    info = json.loads(creds_json)
    creds = service_account.Credentials.from_service_account_info(
        info, scopes=['https://www.googleapis.com/auth/drive.readonly']
    )
    return build('drive', 'v3', credentials=creds)

def main():
    print("🚀 Iniciando Importação DIRETA (Postgres) de Clientes...")

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # 1. Garantir Escritório
        cur.execute("SELECT id, razao_social FROM core.escritorios LIMIT 1;")
        office = cur.fetchone()
        office_id = None

        if not office:
            print("🏢 Criando escritório padrão 'Brandão Contabilidade'...")
            cur.execute("""
                INSERT INTO core.escritorios (razao_social, plano) 
                VALUES ('Brandão Contabilidade', 'PRO') 
                RETURNING id;
            """)
            office_id = cur.fetchone()[0]
            conn.commit()
        else:
            office_id = office[0]
            print(f"🏢 Escritório encontrado: {office[1]} ({office_id})")

        # 2. Listar Pastas do Drive
        service = get_drive_service()
        root_id = os.environ.get('GOOGLE_DRIVE_ROOT_FOLDER_ID')
        
        results = service.files().list(
            q=f"'{root_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
            fields="files(id, name)"
        ).execute()
        
        folders = results.get('files', [])
        # ORDENAÇÃO ALFABÉTICA (A-Z)
        folders.sort(key=lambda x: x['name'])
        
        print(f"📂 Encontradas {len(folders)} pastas de clientes. Ordenadas Alfabeticamente.")

        # Limpeza para garantir ordem (TRUNCATE MANTÉM O ESCRITÓRIO, APAGA EMPRESAS)
        # Cuidado: Cascade apagaria tudo relacionado a empresas.
        print("🧹 Limpando tabela de empresas para re-importação ordenada...")
        cur.execute("TRUNCATE TABLE core.empresas CASCADE;") 
        conn.commit()

        count = 0
        new_clients = 0

        for folder in folders:
            # Check se existe
            cur.execute("SELECT id FROM core.empresas WHERE drive_folder_id = %s", (folder['id'],))
            exists = cur.fetchone()

            if not exists:
                print(f"🆕 Criando empresa: {folder['name']}")
                cur.execute("""
                    INSERT INTO core.empresas (escritorio_id, razao_social, drive_folder_id, status)
                    VALUES (%s, %s, %s, 'ATIVO');
                """, (office_id, folder['name'], folder['id']))
                new_clients += 1
            else:
                print(f"✅ Já existe: {folder['name']}")
            
            count += 1
        
        conn.commit()
        print(f"\n🎉 SUCESSO! {new_clients} novas empresas importadas (Total processado: {count}).")

    except Exception as e:
        print(f"💥 Erro Fatal: {e}")
        conn.rollback()
    
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    main()
