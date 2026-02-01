
import os
import json
import requests
import time
from google.oauth2 import service_account
from googleapiclient.discovery import build
from datetime import datetime
from dotenv import load_dotenv

load_dotenv('.env.local')

SCOPES = ['https://www.googleapis.com/auth/drive']
ROOT_FOLDER_ID = "1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP" # BRANDAO CONTABILIDADE

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

# Categorias Base Agro Master 2026
BASE_CATEGORIES = [
    "01 - DOCUMENTOS PESSOAIS",
    "02 - JURÍDICO E CONTRATOS (JUCEMS)",
    "03 - CERTIDÕES (CNDs)",
    "04 - ALVARÁS",
    "05 - FOLHA DE PAGAMENTO (RH)",
    "06 - FAZENDAS _ UNIDADES AGRO",
    "07 - EMPRESAS (CNPJ)"
]

RH_CATEGORIES = [
    "FICHAS_EMPREGADOS", "AVISO_PREVIO", "PEDIDO_REGISTRO", "RECIBO_FOLHA", 
    "RECIBO_RESCISAO", "RECIBO_FERIAS", "FGTS", "INSS"
]

MONTHS = ["01_Janeiro", "02_Fevereiro", "03_Marco", "04_Abril", "05_Maio", "06_Junho", 
          "07_Julho", "08_Agosto", "09_Setembro", "10_Outubro", "11_Novembro", "12_Dezembro", "13_Salario"]

class AgroMasterResetV2:
    def __init__(self, execute=True):
        self.execute = execute
        self.service = self.get_drive_service()

    def get_drive_service(self):
        creds_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
        creds_info = json.loads(creds_json)
        creds = service_account.Credentials.from_service_account_info(creds_info, scopes=SCOPES)
        return build('drive', 'v3', credentials=creds)

    def get_or_create_folder(self, name, parent_id):
        safe_name = name.replace("'", "\\'")
        query = f"'{parent_id}' in parents and name='{safe_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
        try:
            res = self.service.files().list(q=query).execute().get('files', [])
            if res: return res[0]['id']
            
            if not self.execute: 
                print(f"  [DRY RUN] Criaria: {name}")
                return f"DRY_ID_{name}"
                
            body = {'name': name, 'parents': [parent_id], 'mimeType': 'application/vnd.google-apps.folder'}
            new_folder = self.service.files().create(body=body, fields='id').execute()
            print(f"  ✨ Criada: {name}")
            return new_folder['id']
        except Exception as e:
            print(f"  ❌ Erro ao criar/buscar {name}: {e}")
            return None

    def setup_rh(self, rh_root, year="2026"):
        for cat in RH_CATEGORIES:
            cat_id = self.get_or_create_folder(cat, rh_root)
            year_id = self.get_or_create_folder(year, cat_id)
            for m in MONTHS:
                self.get_or_create_folder(m, year_id)

    def setup_fiscal(self, fiscal_root, year="2026"):
        year_id = self.get_or_create_folder(year, fiscal_root)
        for m in MONTHS:
            self.get_or_create_folder(m, year_id)

    def get_supabase_data(self, table, select="*"):
        url = f"{SUPABASE_URL}/rest/v1/{table}?select={select}"
        headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
        r = requests.get(url, headers=headers)
        return r.json()

    def run(self):
        print(f"🚀 REBOOT AGRO MASTER DRIVE (Execução: {self.execute})")
        
        # 1. Obter Clientes Válidos
        all_clients = self.get_supabase_data("clientes", "id,nome")
        valid_clients = [c for c in all_clients if not c['nome'].startswith('2026-')]
        
        # 2. Obter Unidades Fiscais
        all_units = self.get_supabase_data("unidades_fiscais", "cliente_id,nome_identificador,tipo_unidade")
        
        # 3. Mapear pastas na raiz (BRANDAO CONTABILIDADE)
        query = f"'{ROOT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
        drive_folders = self.service.files().list(q=query, fields="files(id, name)").execute().get('files', [])
        drive_map = {f['name'].upper(): f['id'] for f in drive_folders}

        for client in valid_clients:
            client_name = client['nome'].upper()
            if client_name not in drive_map:
                print(f"  ⚠️ Cliente sem pasta raiz: {client['nome']}")
                continue
            
            client_root = drive_map[client_name]
            print(f"\n🚜 Processando: {client['nome']}")
            
            # Criar Categorias Base (01-07)
            cats = {}
            for cat_name in BASE_CATEGORIES:
                cats[cat_name] = self.get_or_create_folder(cat_name, client_root)

            # 05 - FOLHA DE PAGAMENTO
            self.setup_rh(cats["05 - FOLHA DE PAGAMENTO (RH)"])

            # 06 - FAZENDAS e 07 - EMPRESAS
            client_units = [u for u in all_units if u['cliente_id'] == client['id']]
            
            # Se não tiver unidades no Supabase, mas tiver CNPJ no cadastro do cliente, criamos uma padrão
            client_full = next((c for c in all_clients if c['id'] == client['id']), {})
            cnpj_cpf = client_full.get('cnpj_cpf', '')
            is_pj_client = len(cnpj_cpf.replace('.','').replace('-','').replace('/','')) == 14

            if not client_units:
                placeholder_name = client['nome'].upper()
                u_type = 'EMPRESA_CNPJ' if is_pj_client else 'PROPRIEDADE_RURAL'
                client_units.append({'nome_identificador': placeholder_name, 'tipo_unidade': u_type})

            for unit in client_units:
                u_name = unit['nome_identificador'].upper()
                # Heurística: Se o tipo for empresa ou o nome tiver LTDA/CNPJ ou o cliente for PJ
                is_company = unit.get('tipo_unidade') == 'EMPRESA_CNPJ' or 'LTDA' in u_name or 'EPP' in u_name or is_pj_client
                
                target_root = cats["07 - EMPRESAS (CNPJ)"] if is_company else cats["06 - FAZENDAS _ UNIDADES AGRO"]
                print(f"    🌱 Unidade: {u_name} -> {'EMPRESA' if is_company else 'FAZENDA'}")
                
                u_id = self.get_or_create_folder(u_name, target_root)
                
                # A - Docs / B - Fiscal
                legal_label = "A - DOCUMENTOS LEGAIS" if is_company else "A - DOCUMENTOS TERRA (ITR_CCIR)"
                self.get_or_create_folder(legal_label, u_id)
                
                fiscal_id = self.get_or_create_folder("B - FISCAL (NFe_CTe)", u_id)
                self.setup_fiscal(fiscal_id)

        print("\n✅ Processo concluído com sucesso!")

if __name__ == "__main__":
    bot = AgroMasterResetV2(execute=True)
    bot.run()
