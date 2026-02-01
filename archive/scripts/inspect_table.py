import os
import requests
import sys
from dotenv import load_dotenv

load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f"Bearer {SUPABASE_KEY}"
}

def get_columns(table_name):
    url = f"{SUPABASE_URL}/rest/v1/{table_name}"
    
    # Get one record to see keys
    r = requests.get(url + "?limit=1", headers=headers)
    if r.status_code == 200:
        data = r.json()
        if data:
            print(f"Colunas de {table_name}:", list(data[0].keys()))
        else:
            # If empty, use OPTIONS to get description
            r = requests.options(url, headers=headers)
            print(f"Colunas via OPTIONS (preferential):", r.headers.get('Allow'))
            # PostgREST also provides OpenAPI spec
            print("Tentando esquema via select=...")
            r = requests.get(url + "?select=*", headers=headers)
            if r.status_code == 200 and r.json():
                 print(f"Colunas de {table_name}:", list(r.json()[0].keys()))
            else:
                 print(f"Tabela {table_name} vazia ou erro ao buscar.")
    else:
        print(f"Erro ao acessar {table_name}: {r.status_code} - {r.text}")

if __name__ == "__main__":
    table = sys.argv[1] if len(sys.argv) > 1 else 'atendimentos'
    get_columns(table)
