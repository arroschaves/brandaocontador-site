import os
import requests
import json
from dotenv import load_dotenv

# Carrega .env.local
load_dotenv('.env.local')

SUPABASE_URL = "https://escritoriobrandao-supabase.3ow2vi.easypanel.host"
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

def log(msg):
    print(msg)

def normalize_name(name):
    if not name: return ""
    # Remove espaços extras no meio e nas pontas
    name = " ".join(name.split())
    # Converte para UPPER CASE (Padrão do Escritório)
    return name.upper()

def run_normalization():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

    log("📡 Buscando todos os clientes...")
    r = requests.get(f"{SUPABASE_URL}/rest/v1/clientes?select=id,nome,razao_social", headers=headers)
    clientes = r.json()

    log(f"✅ {len(clientes)} clientes encontrados.")

    updates = 0
    for c in clientes:
        original_name = c['nome']
        new_name = normalize_name(original_name)
        
        original_razao = c.get('razao_social', '')
        new_razao = normalize_name(original_razao) if original_razao else ''

        if original_name != new_name or original_razao != new_razao:
            log(f"🔄 Normalizando: '{original_name}' -> '{new_name}'")
            update_data = {"nome": new_name}
            if new_razao: update_data["razao_social"] = new_razao
            
            requests.patch(f"{SUPABASE_URL}/rest/v1/clientes?id=eq.{c['id']}", 
                          json=update_data, headers=headers)
            updates += 1

    log(f"🏁 Finalizado! {updates} clientes normalizados.")

if __name__ == "__main__":
    run_normalization()
