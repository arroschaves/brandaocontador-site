import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

def log(msg):
    print(msg)

def setup_client_obligations():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

    # Competência Janeiro 2026
    competence = "2026-01-01"
    
    log("📡 Buscando clientes para configuração de obrigações...")
    r = requests.get(f"{SUPABASE_URL}/rest/v1/clientes?select=id,nome,regime_tributario,cnpj_cpf", headers=headers)
    clientes = r.json()

    total_added = 0

    for c in clientes:
        regime = (c.get('regime_tributario') or "").upper()
        nome = c.get('nome', '').upper()
        
        obligations = []
        
        # Lógica Específica Itaoca (Lucro Presumido Sem Movimento)
        if "ITAOCA" in nome:
            obligations = [
                {"tipo": "DCTF", "status": "pendente"},
                {"tipo": "DCTFWEB", "status": "pendente"}, # Sem movimento
                {"tipo": "e-Social", "status": "pendente"}, # Sem movimento
                {"tipo": "EFD-Reinf", "status": "pendente"},
                {"tipo": "XML_NF", "status": "pendente"}
            ]
        elif "SIMPLES" in regime:
            obligations = [
                {"tipo": "DAS", "status": "pendente"},
                {"tipo": "DCTFWEB", "status": "pendente"},
                {"tipo": "e-Social", "status": "pendente"},
                {"tipo": "FGTS", "status": "pendente"},
                {"tipo": "XML_NF", "status": "pendente"}
            ]
        elif "PRESUMIDO" in regime or "REAL" in regime:
            obligations = [
                {"tipo": "DCTF", "status": "pendente"},
                {"tipo": "DCTFWEB", "status": "pendente"},
                {"tipo": "e-Social", "status": "pendente"},
                {"tipo": "EFD-Reinf", "status": "pendente"},
                {"tipo": "XML_NF", "status": "pendente"}
            ]
        else:
            # Fallback para qualquer cliente (Padrão Brandão)
            obligations = [
                {"tipo": "XML_NF", "status": "pendente"},
                {"tipo": "CND_CERT", "status": "pendente"}
            ]

        for ob in obligations:
            # Verifica se já existe para não duplicar
            check_url = f"{SUPABASE_URL}/rest/v1/obrigacoes_acessorias?cliente_id=eq.{c['id']}&tipo=eq.{ob['tipo']}&competencia=eq.{competence}"
            res_check = requests.get(check_url, headers=headers)
            if not res_check.json():
                payload = {
                    "cliente_id": c['id'],
                    "tipo": ob['tipo'],
                    "competencia": competence,
                    "status": ob['status'],
                    "origem": "SETUUP_AUTO"
                }
                requests.post(f"{SUPABASE_URL}/rest/v1/obrigacoes_acessorias", json=payload, headers=headers)
                total_added += 1

    log(f"🏁 Finalizado! {total_added} obrigações criadas para a competência {competence}.")

if __name__ == "__main__":
    setup_client_obligations()
