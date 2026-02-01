import os
import requests
import json
import time
from datetime import datetime
from dotenv import load_dotenv

# Carrega .env.local
load_dotenv('.env.local')

SUPABASE_URL = "https://escritoriobrandao-supabase.3ow2vi.easypanel.host"
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

ROOT_DIR = r"C:\Brandao_Contabilidade"

# Mapeamento do Padrão Brandão 2026 (Pasta -> Tipo no CRM)
MAPPING = {
    "DAS": "DAS",
    "FOLHA": "FOLHA",
    "RECIBO": "FOLHA",
    "FGTS": "FGTS",
    "INSS": "INSS",
    "DCTF": "DCTF",
    "DARF": "DARF",
    "CCIR": "ITR_CCIR",
    "ITR": "ITR_CCIR",
    "CND": "CND_CERT",
    "NOTAS": "XML_NF",
    "NFE": "XML_NF",
    "FATURAMENTO": "XML_NF"
}

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

class BrandaoAuditor:
    def __init__(self):
        self.headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }
        self.clients = self.load_clients()
        self.stats = {"updated": 0, "verified": 0}

    def load_clients(self):
        log("🛰️ Carregando clientes do Supabase...")
        try:
            r = requests.get(f"{SUPABASE_URL}/rest/v1/clientes?select=id,nome,cnpj_cpf", headers=self.headers)
            return r.json()
        except Exception as e:
            log(f"❌ Erro ao carregar clientes: {e}")
            return []

    def update_obligation(self, client_id, tipo, competence, status='concluido'):
        # Tenta encontrar a obrigação existente
        url = f"{SUPABASE_URL}/rest/v1/obrigacoes_acessorias?cliente_id=eq.{client_id}&tipo=eq.{tipo}&competencia=eq.{competence}"
        r = requests.get(url, headers=self.headers)
        data = r.json()

        if data:
            # Atualiza se não estiver concluído
            if data[0]['status'] != 'concluido':
                obj_id = data[0]['id']
                requests.patch(f"{SUPABASE_URL}/rest/v1/obrigacoes_acessorias?id=eq.{obj_id}", 
                               json={"status": status, "updated_at": "now()"}, headers=self.headers)
                self.stats["updated"] += 1
        else:
            # Cria nova
            requests.post(f"{SUPABASE_URL}/rest/v1/obrigacoes_acessorias", 
                         json={
                             "cliente_id": client_id,
                             "tipo": tipo,
                             "competencia": competence,
                             "status": status
                         }, headers=self.headers)
            self.stats["updated"] += 1

    def run_audit(self):
        log(f"🔎 Iniciando Auditoria em {ROOT_DIR}")
        
        if not os.path.exists(ROOT_DIR):
            log(f"❌ Pasta raiz não encontrada: {ROOT_DIR}")
            return

        for client in self.clients:
            client_folder_name = f"{client['nome']} ({client['cnpj_cpf']})"
            client_path = os.path.join(ROOT_DIR, client_folder_name)
            
            if not os.path.exists(client_path):
                continue
            
            log(f"📂 Auditando: {client['nome']}")
            self.stats["verified"] += 1

            for root, dirs, files in os.walk(client_path):
                if not files: continue
                
                # Detectar competência (Ano/Mês) pelo caminho
                year, month = None, None
                parts = root.split(os.sep)
                
                for p in parts:
                    if p.isdigit() and len(p) == 4: year = p
                    if "_" in p and p[:2].isdigit(): month = p[:2]

                if not year or not month:
                    # Se não achou no caminho, usa o ano/mês atual como fallback para arquivos soltos
                    now = datetime.now()
                    year = year or str(now.year)
                    month = month or f"{now.month:02d}"

                competence = f"{year}-{month}-01"

                # Detectar tipo pelo nome da pasta (root)
                folder_name = os.path.basename(root).upper()
                tipo = None
                for key, val in MAPPING.items():
                    if key in folder_name:
                        tipo = val
                        break
                
                if tipo:
                    self.update_obligation(client['id'], tipo, competence)

        log(f"✅ Auditoria Concluída! {self.stats['verified']} clientes verificados, {self.stats['updated']} obrigações atualizadas.")

if __name__ == "__main__":
    auditor = BrandaoAuditor()
    auditor.run_audit()
