
import os
import xml.etree.ElementTree as ET
import requests
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv('.env.local')

SUPABASE_URL = "https://escritoriobrandao-supabase.3ow2vi.easypanel.host"
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY') or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE"

XML_PATH = r"C:\AuxilioNFe\NFE\XML\2026\janeiro"

def extract_metadata(file_path):
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()
        ns = {'nfe': 'http://www.portalfiscal.inf.br/nfe'}
        
        # Preferência por Destinatário (Cliente comprando)
        dest = root.find('.//nfe:dest', ns)
        if dest is not None:
            cnpj = dest.find('nfe:CNPJ', ns)
            cpf = dest.find('nfe:CPF', ns)
            nome = dest.find('nfe:xNome', ns)
            doc = (cnpj.text if cnpj is not None else (cpf.text if cpf is not None else None))
            if doc and nome is not None:
                return doc, nome.text

        # Fallback Emitente (Cliente vendendo)
        emit = root.find('.//nfe:emit', ns)
        if emit is not None:
            cnpj = emit.find('nfe:CNPJ', ns)
            cpf = emit.find('nfe:CPF', ns)
            nome = emit.find('nfe:xNome', ns)
            doc = (cnpj.text if cnpj is not None else (cpf.text if cpf is not None else None))
            if doc and nome is not None:
                return doc, nome.text
    except Exception as e:
        pass
    return None, None

def update_supabase_client(doc, real_name):
    # Buscar cliente com esse documento cujo nome seja data ou lixo
    doc_clean = doc.replace('.','').replace('-','').replace('/','')
    query_url = f"{SUPABASE_URL}/rest/v1/clientes?cnpj_cpf=eq.{doc_clean}&select=id,nome"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    r = requests.get(query_url, headers=headers)
    clients = r.json()
    
    if not clients:
        return False
    
    client = clients[0]
    # Se o nome for lixo/data, atualiza
    if client['nome'].startswith('2026-') or "UNTITLED" in client['nome'].upper():
        print(f"  🔧 Recuperando: {doc_clean} -> {real_name}")
        patch_url = f"{SUPABASE_URL}/rest/v1/clientes?id=eq.{client['id']}"
        requests.patch(patch_url, headers=headers, json={"nome": real_name.upper()})
        return True
    return False

def run_recovery():
    print(f"🚀 Iniciando Recuperação de Nomes (CRM Healing) em {XML_PATH}")
    files = [f for f in os.listdir(XML_PATH) if f.endswith('.xml')]
    recovered_count = 0
    
    for filename in files:
        full_path = os.path.join(XML_PATH, filename)
        doc, nome = extract_metadata(full_path)
        if doc and nome:
            if update_supabase_client(doc, nome):
                recovered_count += 1
                
    print(f"\n✅ Recuperação concluída! {recovered_count} clientes restaurados.")

if __name__ == "__main__":
    run_recovery()
