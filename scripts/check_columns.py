import os
import requests
from dotenv import load_dotenv

load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f"Bearer {SUPABASE_KEY}"
}

def get_columns():
    url = f"{SUPABASE_URL}/rest/v1/obrigacoes_acessorias"
    # PostgREST allows us to get the schema by calling with empty select or head
    r = requests.options(url, headers=headers)
    print(r.headers)
    
    # Or just get one record
    r = requests.get(url + "?limit=1", headers=headers)
    if r.json():
        print("Record columns:", r.json()[0].keys())
    else:
        print("Table is empty")

if __name__ == "__main__":
    get_columns()
