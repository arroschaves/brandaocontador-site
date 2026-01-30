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

def check_drive_ids():
    url = f"{SUPABASE_URL}/rest/v1/clientes?select=nome,drive_folder_id&order=nome"
    r = requests.get(url, headers=headers)
    data = r.json()
    for c in data:
        print(f"Cliente: {c['nome']} | ID: {c['drive_folder_id']}")

if __name__ == "__main__":
    check_drive_ids()
