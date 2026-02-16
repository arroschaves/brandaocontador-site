
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv('.env.local')

def main():
    print("🧠 Atualizando o Cérebro do Banco (Trigger PF/PJ)...")
    
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("❌ DATABASE_URL não encontrada.")
        return

    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()

        # Lê o arquivo SQL
        with open('supabase/migrations/20260215_brain_trigger.sql', 'r') as file:
            sql_commands = file.read()

        cur.execute(sql_commands)
        conn.commit()
        
        print("✅ Cérebro atualizado! Tabela 'empresas' agora identifica Documento, PF/PJ, Email automaticamente.")
        
    except Exception as e:
        print(f"❌ Erro ao atualizar cérebro: {e}")
        conn.rollback()
    
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()

if __name__ == "__main__":
    main()
