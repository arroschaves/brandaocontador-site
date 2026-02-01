import json

with open('e:/PROJETOS/brandaocontador-site/scripts/crm_structure.json', 'r', encoding='utf-8') as f:
    clientes = json.load(f)

# Converte booleanos e nulls JSON para Python
clientes_str = json.dumps(clientes, ensure_ascii=False, indent=8).replace('true', 'True').replace('false', 'False').replace('null', 'None')

script_content = f"""import json
import os
import sys
import tkinter as tk
from tkinter import messagebox

# DADOS DOS {len(clientes)} CLIENTES EMBUTIDOS DIRETAMENTE NO CÓDIGO (SEGURANÇA 2026)
# Isso torna o EXE 100% independente de arquivos externos.
def get_client_data():
    return {clientes_str}

ROOT_DIR = "C:\\\\Brandao_Contabilidade"

MONTHS = ["01_Janeiro", "02_Fevereiro", "03_Marco", "04_Abril", "05_Maio", "06_Junho", "07_Julho", "08_Agosto", "09_Setembro", "10_Outubro", "11_Novembro", "12_Dezembro", "13_Salario"]
RH_CATEGORIES = ["AVISO_PREVIO", "FGTS", "FICHAS_EMPREGADOS", "INSS", "PEDIDO_REGISTRO", "RECIBO_FERIAS", "RECIBO_FOLHA", "RECIBO_RESCISAO"]
YEARS = ["2024", "2025", "2026"]

def clean_name(name):
    for char in r'<>:"/\\\\|?*':
        name = name.replace(char, '_')
    return name.strip()

def process_unit_folders(base_path):
    fiscal_path = os.path.join(base_path, "01 - FISCAL")
    for y in YEARS:
        for m in MONTHS:
            if m == "13_Salario": continue
            os.makedirs(os.path.join(fiscal_path, y, m), exist_ok=True)
            
    rh_path = os.path.join(base_path, "02 - RH")
    for cat in RH_CATEGORIES:
        for y in YEARS:
            for m in MONTHS:
                if m == "13_Salario" and cat not in ["RECIBO_FOLHA", "RECIBO_FERIAS"]:
                    continue
                os.makedirs(os.path.join(rh_path, cat, y, m), exist_ok=True)
                
    guias_path = os.path.join(base_path, "03 - IMPOSTOS E GUIAS")
    for y in YEARS:
        for m in MONTHS:
            if m == "13_Salario": continue
            os.makedirs(os.path.join(guias_path, y, m), exist_ok=True)

def run_setup():
    root = tk.Tk()
    root.withdraw()
    
    try:
        clientes = get_client_data()
        
        for c in clientes:
            safe_name = clean_name(c['nome'])
            client_folder = os.path.join(ROOT_DIR, f"{{safe_name}} ({{c['doc']}})")
            
            static_folders = [
                "01 - CND (Certidões Negativas)", "02 - PENDÊNCIAS FISCAIS (Federal, Estadual, Municipal)",
                "03 - DOCUMENTOS PESSOAIS", "04 - CERTIFICADO DIGITAL", "05 - DOCUMENTOS TERRA",
                "06 - IRPF", "07 - JUNTA COMERCIAL", "08 - FATURAMENTO", "09 - CAEPF"
            ]
            
            for sf in static_folders:
                os.makedirs(os.path.join(client_folder, sf), exist_ok=True)
                
            unidades = c.get('unidades', [])
            op_root = os.path.join(client_folder, "10 - RH - ESCRITA - CONTABILIDADE")
            
            if not unidades:
                process_unit_folders(op_root)
            else:
                for idx, u in enumerate(unidades, start=1):
                    u_ident = clean_name(u['nome_identificador'].upper())
                    ie = u.get('inscricao_estadual', '')
                    label = f"{{idx:02d}} - {{u_ident}}"
                    if ie: label += f" - IE {{ie}}"
                    process_unit_folders(os.path.join(op_root, label))

        messagebox.showinfo("Sucesso", f"Estrutura de {{len(clientes)}} clientes criada com sucesso no disco C:!")
    except Exception as e:
        messagebox.showerror("Erro", f"Ocorreu um erro fatal: {{e}}")

if __name__ == "__main__":
    run_setup()
"""

with open('e:/PROJETOS/brandaocontador-site/scripts/PORTABLE_Setup_Brandao.py', 'w', encoding='utf-8') as f:
    f.write(script_content)
