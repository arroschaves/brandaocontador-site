import requests
import json
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente explicitamente do .env.local
load_dotenv(".env.local")

SUPABASE_URL = "https://escritoriobrandao-supabase.3ow2vi.easypanel.host"
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

def fetch_data():
    if not SUPABASE_KEY:
        print("❌ ERRO: NEXT_PUBLIC_SUPABASE_ANON_KEY não encontrada no .env.local")
        return

    print("🚀 Iniciando extração de dados do CRM...")
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }

    # 1. Busca Clientes
    print("📡 Buscando clientes ativos...")
    try:
        r_clientes = requests.get(f"{SUPABASE_URL}/rest/v1/clientes?select=id,nome,cnpj_cpf&order=nome", headers=headers)
        clientes = r_clientes.json()
    except Exception as e:
        print(f"❌ Erro ao buscar clientes: {e}")
        return
    
    # 2. Busca Unidades Fiscais (Fazendas)
    print("📡 Buscando unidades fiscais (fazendas)...")
    try:
        r_unidades = requests.get(f"{SUPABASE_URL}/rest/v1/unidades_fiscais?select=cliente_id,nome_identificador,inscricao_estadual,tipo_unidade", headers=headers)
        unidades = r_unidades.json()
    except Exception as e:
        print(f"❌ Erro ao buscar unidades: {e}")
        return

    # Mapeia unidades por cliente
    unidades_map = {}
    for u in unidades:
        cid = u['cliente_id']
        if cid not in unidades_map:
            unidades_map[cid] = []
        unidades_map[cid].append(u)

    # Consolida dados
    final_data = []
    for c in clientes:
        client_id = c['id']
        nome_original = c.get('nome') or "SEM NOME"
        
        # Manteremos todos por enquanto para você ver se falta algo
        doc_raw = c.get('cnpj_cpf', '') or ''
        doc_clean = doc_raw.replace('.','').replace('-','').replace('/','')
        
        c_data = {
            "id": client_id,
            "nome": nome_original.strip().upper(),
            "doc": doc_clean,
            "is_pj": len(doc_clean) == 14,
            "unidades": unidades_map.get(client_id, [])
        }
        final_data.append(c_data)

    # Salva para uso do próximo script
    os.makedirs("scripts", exist_ok=True)
    with open("scripts/crm_structure.json", "w", encoding="utf-8") as f:
        json.dump(final_data, f, indent=4, ensure_ascii=False)

    print(f"✅ Sucesso! {len(final_data)} clientes carregados em 'scripts/crm_structure.json'.")

if __name__ == "__main__":
    fetch_data()
