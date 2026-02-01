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
from tkinter import filedialog, messagebox, ttk

# DADOS DOS {len(clientes)} CLIENTES EMBUTIDOS
def get_client_data():
    return {clientes_str}

# CONFIGURAÇÕES
ROOT_DEST = "C:\\\\Brandao_Contabilidade"

STATIC_KEYWORD_MAP = {{
    "RG": "03 - DOCUMENTOS PESSOAIS", "CPF": "03 - DOCUMENTOS PESSOAIS", "CNH": "03 - DOCUMENTOS PESSOAIS",
    "CNIS": "03 - DOCUMENTOS PESSOAIS", "CASAMENTO": "03 - DOCUMENTOS PESSOAIS", "COMPROVANTE": "03 - DOCUMENTOS PESSOAIS",
    "TERRA": "05 - DOCUMENTOS TERRA", "CCIR": "05 - DOCUMENTOS TERRA", "ITR": "05 - DOCUMENTOS TERRA",
    "CERTIDAO": "01 - CND (Certidões Negativas)", "CND": "01 - CND (Certidões Negativas)", "SEFAZ": "01 - CND (Certidões Negativas)",
    "JUNTA": "07 - JUNTA COMERCIAL", "CONTRATO": "07 - JUNTA COMERCIAL", "CERTIFICADO": "04 - CERTIFICADO DIGITAL", "CAEPF": "09 - CAEPF"
}}

MONTH_MAP = {{"01": "01_Janeiro", "02": "02_Fevereiro", "03": "03_Marco", "04": "04_Abril", "05": "05_Maio", "06": "06_Junho", "07": "07_Julho", "08": "08_Agosto", "09": "09_Setembro", "10": "10_Outubro", "11": "11_Novembro", "12": "12_Dezembro"}}

def clean_doc(doc): return re.sub(r'\\D', '', str(doc))
def clean_name(name):
    for char in r'<>:"/\\\\|?*': name = name.replace(char, '_')
    return name.strip()

class DeepMigrator:
    def __init__(self, log_func):
        self.crm_data = get_client_data()
        self.client_map = {{clean_doc(c['doc']): f"{{clean_name(c['nome'])}} ({{c['doc']}})" for c in self.crm_data if c['doc']}}
        self.report = {{"total": 0, "sucesso": 0, "ignorados": 0}}
        self.folder_cache = {{}}
        self.log = log_func

    def identify_client(self, file_path, folder_path):
        folder_upper = folder_path.upper()
        file_name = os.path.basename(file_path).upper()
        if "COPIA" in file_name or "COPY" in file_name: return None
        if folder_path in self.folder_cache: return self.folder_cache[folder_path]

        for doc, full_name in self.client_map.items():
            if len(doc) >= 11 and (doc in file_name or doc in folder_upper):
                self.folder_cache[folder_path] = doc
                return doc

        for c in self.crm_data:
            c_name = c['nome'].upper()
            ignore = ["DE", "DA", "DO", "DOS", "DAS", "LTDA", "ME", "EPP", "SOCIAL", "SERVICOS"]
            name_parts = [p for p in c_name.replace("/", " ").replace("-", " ").split() if len(p) > 3 and p not in ignore]
            matches = sum(1 for part in name_parts if part in folder_upper or part in file_name)
            if matches >= 2 or (len(name_parts) == 1 and matches == 1):
                self.folder_cache[folder_path] = clean_doc(c['doc'])
                return self.folder_cache[folder_path]

        if file_path.lower().endswith(".xml"):
            try:
                content = open(file_path, 'r', encoding='utf-8', errors='ignore').read()
                for doc in self.client_map.keys():
                    if doc in content:
                        self.folder_cache[folder_path] = doc
                        return doc
            except: pass
        return None

    def get_dest_path(self, doc, file_path):
        client_folder = self.client_map[doc]
        file_name = os.path.basename(file_path).upper()
        for kw, fld in STATIC_KEYWORD_MAP.items():
            if kw in file_name: return os.path.join(ROOT_DEST, client_folder, fld)
        
        if any(x in file_name or x in file_path.upper() for x in ["FOLHA", "RECIBO", "PAGAMENTO"]):
            mtime = os.path.getmtime(file_path)
            dt = datetime.fromtimestamp(mtime)
            year, month = str(dt.year), MONTH_MAP.get(f"{{dt.month:02d}}", "01_Janeiro")
            c = next(c for c in self.crm_data if clean_doc(c['doc']) == doc)
            u = c.get('unidades', [])
            tipo = "RECIBO_FERIAS" if "FERIAS" in file_name else ("RECIBO_RESCISAO" if "RESCISAO" in file_name else "RECIBO_FOLHA")
            base = os.path.join(ROOT_DEST, client_folder, "10 - RH - ESCRITA - CONTABILIDADE")
            if u:
                unit = f"01 - {{clean_name(u[0]['nome_identificador'].upper())}}"
                if u[0].get('inscricao_estadual'): unit += f" - IE {{u[0]['inscricao_estadual']}}"
                return os.path.join(base, unit, "02 - RH", tipo, year, month)
            return os.path.join(base, "02 - RH", tipo, year, month)

        if file_path.lower().endswith(('.pdf', '.jpg', '.png')):
            return os.path.join(ROOT_DEST, client_folder, "03 - DOCUMENTOS PESSOAIS")
        return os.path.join(ROOT_DEST, client_folder, "10 - RH - ESCRITA - CONTABILIDADE")

    def migrate(self, sources):
        for src in sources:
            self.log(f"🔍 Analisando: {{src}}")
            for root, dirs, files in os.walk(src):
                for f in files:
                    self.report["total"] += 1
                    f_path = os.path.join(root, f)
                    doc = self.identify_client(f_path, root)
                    if not doc: 
                        self.report["ignorados"] += 1
                        continue
                    try:
                        dest = self.get_dest_path(doc, f_path)
                        os.makedirs(dest, exist_ok=True)
                        dest_file = os.path.join(dest, f)
                        if os.path.exists(dest_file) and os.path.getmtime(f_path) <= os.path.getmtime(dest_file): continue
                        shutil.copy2(f_path, dest_file)
                        self.report["sucesso"] += 1
                    except Exception as e: self.log(f"❌ Erro em {{f}}: {{e}}")
                    if self.report["total"] % 50 == 0: self.log(f"📑 Processados {{self.report['total']}}... Migrados: {{self.report['sucesso']}}")

class App:
    def __init__(self, root):
        self.root = root
        self.root.title("Brandão Contabilidade - Super Migrador V26")
        self.root.geometry("600x500")
        self.paths = []
        
        main_frame = ttk.Frame(root, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)

        ttk.Label(main_frame, text="Pastas de Origem dos Documentos:", font=("Arial", 12, "bold")).pack(anchor=tk.W)
        
        self.listbox = tk.Listbox(main_frame, height=10, font=("Arial", 10))
        self.listbox.pack(fill=tk.BOTH, pady=10)

        btn_frame = ttk.Frame(main_frame)
        btn_frame.pack(fill=tk.X)
        
        ttk.Button(btn_frame, text="+ Adicionar Pasta", command=self.add_path).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="- Remover Selecionada", command=self.remove_path).pack(side=tk.LEFT, padx=5)

        ttk.Separator(main_frame, orient=tk.HORIZONTAL).pack(fill=tk.X, pady=20)

        self.btn_run = ttk.Button(main_frame, text="🚀 INICIAR MIGRAÇÃO AGORA", command=self.run_migration)
        self.btn_run.pack(fill=tk.X, ipady=10)

        self.status_var = tk.StringVar(value="Aguardando seleção de pastas...")
        ttk.Label(main_frame, textvariable=self.status_var, foreground="blue").pack(pady=10)

        self.log_text = tk.Text(main_frame, height=5, state=tk.DISABLED, font=("Consolas", 9))
        self.log_text.pack(fill=tk.BOTH, expand=True)

    def log(self, msg):
        self.log_text.config(state=tk.NORMAL)
        self.log_text.insert(tk.END, msg + "\\n")
        self.log_text.see(tk.END)
        self.log_text.config(state=tk.DISABLED)
        self.root.update()

    def add_path(self):
        p = filedialog.askdirectory()
        if p and p not in self.paths:
            self.paths.append(p)
            self.listbox.insert(tk.END, p)

    def remove_path(self):
        sel = self.listbox.curselection()
        if sel:
            idx = sel[0]
            self.paths.pop(idx)
            self.listbox.delete(idx)

    def run_migration(self):
        if not self.paths:
            messagebox.showwarning("Atenção", "Selecione pelo menos uma pasta!")
            return
        
        self.btn_run.config(state=tk.DISABLED)
        self.log("🚀 Iniciando processamento profundo...")
        migrator = DeepMigrator(self.log)
        migrator.migrate(self.paths)
        
        self.status_var.set("✅ Migração Concluída com Sucesso!")
        messagebox.showinfo("Fim", f"Migração Concluída!\\n{{migrator.report['sucesso']}} arquivos organizados.")
        self.btn_run.config(state=tk.NORMAL)

if __name__ == "__main__":
    root = tk.Tk()
    App(root)
    root.mainloop()
"""

with open('e:/PROJETOS/brandaocontador-site/scripts/DEEP_Migrator_V2.py', 'w', encoding='utf-8') as f:
    f.write(script_content)
