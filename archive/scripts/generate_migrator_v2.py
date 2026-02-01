import json

with open('e:/PROJETOS/brandaocontador-site/scripts/crm_structure.json', 'r', encoding='utf-8') as f:
    clientes = json.load(f)

# Converte booleanos e nulls JSON para Python
clientes_str = json.dumps(clientes, ensure_ascii=False, indent=8).replace('true', 'True').replace('false', 'False').replace('null', 'None')

script_content = f"""import os
import shutil
import json
import xml.etree.ElementTree as ET
from datetime import datetime
import re
import sys
import tkinter as tk
from tkinter import filedialog, messagebox

# DADOS DOS {len(clientes)} CLIENTES EMBUTIDOS DIRETAMENTE NO CÓDIGO (SEGURANÇA 2026)
# Isso torna o EXE 100% independente de arquivos externos.
def get_client_data():
    return {clientes_str}

# CONFIGURAÇÕES
ROOT_DEST = "C:\\\\Brandao_Contabilidade"
REPORT_FILE = "migracao_interativa_report.json"

# Mapeamento de Palavras-Chave para Pastas Estáticas
STATIC_KEYWORD_MAP = {{
    "RG": "03 - DOCUMENTOS PESSOAIS",
    "CPF": "03 - DOCUMENTOS PESSOAIS",
    "CNH": "03 - DOCUMENTOS PESSOAIS",
    "CNIS": "03 - DOCUMENTOS PESSOAIS",
    "CASAMENTO": "03 - DOCUMENTOS PESSOAIS",
    "COMPROVANTE": "03 - DOCUMENTOS PESSOAIS",
    "TERRA": "05 - DOCUMENTOS TERRA",
    "CCIR": "05 - DOCUMENTOS TERRA",
    "ITR": "05 - DOCUMENTOS TERRA",
    "CERTIDAO": "01 - CND (Certidões Negativas)",
    "CND": "01 - CND (Certidões Negativas)",
    "SEFAZ": "01 - CND (Certidões Negativas)",
    "JUNTA": "07 - JUNTA COMERCIAL",
    "CONTRATO": "07 - JUNTA COMERCIAL",
    "CERTIFICADO": "04 - CERTIFICADO DIGITAL",
    "CAEPF": "09 - CAEPF"
}}

MONTH_MAP = {{
    "01": "01_Janeiro", "02": "02_Fevereiro", "03": "03_Marco",
    "04": "04_Abril", "05": "05_Maio", "06": "06_Junho",
    "07": "07_Julho", "08": "08_Agosto", "09": "09_Setembro",
    "10": "10_Outubro", "11": "11_Novembro", "12": "12_Dezembro"
}}

def clean_doc(doc):
    return re.sub(r'\\D', '', str(doc))

def clean_name(name):
    for char in r'<>:"/\\\\|?*':
        name = name.replace(char, '_')
    return name.strip()

class DeepMigrator:
    def __init__(self):
        self.crm_data = get_client_data()
        self.client_map = {{clean_doc(c['doc']): f"{{clean_name(c['nome'])}} ({{c['doc']}})" for c in self.crm_data if c['doc']}}
        self.report = {{"clientes": {{}}, "total": 0, "sucesso": 0, "ignorados": 0}}
        self.folder_identity_cache = {{}} # Contexto de pasta

    def identify_client(self, file_path, folder_path):
        folder_upper = folder_path.upper()
        file_name = os.path.basename(file_path).upper()
        
        # ❌ REGRA: IGNORAR CÓPIAS
        if "COPIA" in file_name or "COPY" in file_name:
            return None

        # 🟢 Nível 1: Cache da Pasta (Herança de Contexto)
        if folder_path in self.folder_identity_cache:
            return self.folder_identity_cache[folder_path]

        # 🔵 Nível 2: Busca por Documento (CPF/CNPJ) Exato no Nome
        for doc, full_name in self.client_map.items():
            if len(doc) >= 11 and (doc in file_name or doc in folder_upper):
                self.folder_identity_cache[folder_path] = doc
                return doc

        # 🟡 Nível 3: Busca por Similaridade de Nome (Fuzzy/Keywords)
        for c in self.crm_data:
            c_name = c['nome'].upper()
            c_doc = clean_doc(c['doc'])
            
            ignore = ["DE", "DA", "DO", "DOS", "DAS", "LTDA", "ME", "EPP", "SOCIAL", "SERVICOS"]
            name_parts = [p for p in c_name.replace("/", " ").replace("-", " ").split() if len(p) > 3 and p not in ignore]
            
            matches = 0
            for part in name_parts:
                if part in folder_upper or part in file_name:
                    matches += 1
            
            if matches >= 2 or (len(name_parts) == 1 and matches == 1):
                self.folder_identity_cache[folder_path] = c_doc
                return c_doc

        # 🔴 Nível 4: Leitura de XML (NFe/CTe)
        if file_path.lower().endswith(".xml"):
            try:
                content = open(file_path, 'r', encoding='utf-8', errors='ignore').read()
                for doc in self.client_map.keys():
                    if doc in content:
                        self.folder_identity_cache[folder_path] = doc
                        return doc
            except: pass
        
        return None

    def get_dest_path(self, doc, file_path, src_base):
        client_folder = self.client_map[doc]
        file_name = os.path.basename(file_path).upper()
        
        for kw, folder in STATIC_KEYWORD_MAP.items():
            if kw in file_name:
                return os.path.join(ROOT_DEST, client_folder, folder)
        
        if "FOLHA" in file_name or "ACESSO RAPÍDO" in file_path.upper() or "RECIBO" in file_name:
            mtime = os.path.getmtime(file_path)
            dt = datetime.fromtimestamp(mtime)
            year, month = str(dt.year), MONTH_MAP.get(f"{{dt.month:02d}}", "01_Janeiro")
            
            client_crm = next(c for c in self.crm_data if clean_doc(c['doc']) == doc)
            unidades = client_crm.get('unidades', [])
            unit_label = ""
            if unidades:
                u = unidades[0]
                unit_label = f"01 - {{clean_name(u['nome_identificador'].upper())}}"
                if u.get('inscricao_estadual'): unit_label += f" - IE {{u['inscricao_estadual']}}"
            
            tipo = "RECIBO_FOLHA"
            if "FERIAS" in file_name: tipo = "RECIBO_FERIAS"
            elif "RESCISAO" in file_name: tipo = "RECIBO_RESCISAO"
            
            if unidades:
                return os.path.join(ROOT_DEST, client_folder, "10 - RH - ESCRITA - CONTABILIDADE", unit_label, "02 - RH", tipo, year, month)
            return os.path.join(ROOT_DEST, client_folder, "10 - RH - ESCRITA - CONTABILIDADE", "02 - RH", tipo, year, month)

        if file_path.lower().endswith(('.pdf', '.jpg', '.png')):
            return os.path.join(ROOT_DEST, client_folder, "03 - DOCUMENTOS PESSOAIS")
            
        return os.path.join(ROOT_DEST, client_folder, "10 - RH - ESCRITA - CONTABILIDADE")

    def run_migration(self, sources):
        print(f"🕵️ Iniciando Migração Interativa v2...")
        for src in sources:
            if not os.path.exists(src): continue
            print(f"🔍 Analisando: {{src}}")
            for root, dirs, files in os.walk(src):
                for f in files:
                    try:
                        self.report["total"] += 1
                        f_path = os.path.join(root, f)
                        
                        doc = self.identify_client(f_path, root)
                        if not doc:
                            self.report["ignorados"] += 1
                            continue
                        
                        dest_dir = self.get_dest_path(doc, f_path, src)
                        os.makedirs(dest_dir, exist_ok=True)
                        
                        dest_file = os.path.join(dest_dir, f)
                        
                        if os.path.exists(dest_file):
                            if os.path.getmtime(f_path) <= os.path.getmtime(dest_file):
                                continue
                                
                        shutil.copy2(f_path, dest_file)
                        self.report["sucesso"] += 1
                        
                        if self.report["total"] % 100 == 0:
                            print(f"📑 Processados {{self.report['total']}}... Migrados: {{self.report['sucesso']}}")
                    except Exception as e:
                        print(f"❌ Erro em {{f}}: {{e}}")

        messagebox.showinfo("Sucesso", f"Migração Concluída!\\n{{self.report['sucesso']}} arquivos organizados em {{ROOT_DEST}}")

def select_and_run():
    root = tk.Tk()
    root.withdraw()
    
    print("📂 Por favor, selecione as pastas de origem dos documentos...")
    paths = []
    while True:
        p = filedialog.askdirectory(title="Selecione uma pasta com documentos (ou cancele para iniciar)")
        if not p: break
        paths.append(p)
        print(f"✅ Adicionada: {{p}}")
    
    if not paths:
        print("❌ Nenhuma pasta selecionada. Encerrando.")
        return

    mig = DeepMigrator()
    mig.run_migration(paths)

if __name__ == "__main__":
    select_and_run()
"""

with open('e:/PROJETOS/brandaocontador-site/scripts/DEEP_Migrator_V2.py', 'w', encoding='utf-8') as f:
    f.write(script_content)
