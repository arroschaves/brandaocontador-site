import requests
import json
import time
import os
from dotenv import load_dotenv

load_dotenv(".env.local")

SUPABASE_URL = "https://escritoriobrandao-supabase.3ow2vi.easypanel.host"
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

def fetch_cnpj_name(cnpj):
    """Consulta o nome da empresa pelo CNPJ usando BrasilAPI ou ReceitaWS."""
    try:
        # BrasilAPI primeiro
        url = f"https://brasilapi.com.br/api/cnpj/v1/{cnpj}"
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            data = r.json()
            return data.get('razao_social') or data.get('nome_fantasia')
    except: pass
    return None

def update_supabase(client_id, new_name):
    url = f"{SUPABASE_URL}/rest/v1/clientes?id=eq.{client_id}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    payload = {"nome": new_name}
    try:
        r = requests.patch(url, headers=headers, json=payload)
        return r.status_code in [200, 201, 204]
    except: return False

def main():
    with open("scripts/crm_structure.json", "r", encoding="utf-8") as f:
        clientes = json.load(f)
    
    dirty_clients = [c for c in clientes if c['nome'].startswith('2026-')]
    
    print(f"🧹 Iniciando limpeza de {len(dirty_clients)} clientes...")
    
    for c in dirty_clients:
        doc = c['doc']
        client_id = c['id']
        
        # Só tenta CNPJ (14 dígitos)
        if len(doc) == 14:
            print(f"🔍 Consultando CNPJ {doc}...")
            new_name = fetch_cnpj_name(doc)
            if new_name:
                print(f"   ✅ Encontrado: {new_name}")
                if update_supabase(client_id, new_name.upper()):
                    print(f"   💾 Supabase atualizado!")
                else:
                    print(f"   ❌ Falha ao atualizar Supabase.")
            else:
                print(f"   ❓ Nome não encontrado.")
            
            # Rate limit preventivo para APIs públicas
            time.sleep(1)
        else:
            print(f"⏩ CPF {doc} - Necessário identificação manual ou via XML.")

    print("\n✅ Processamento concluído. Re-execute o fetch de dados para atualizar o JSON local.")

if __name__ == "__main__":
    main()
