import os
import json
from datetime import datetime

# CONFIGURAÇÕES PADRÃO BRANDÃO
BASE_DRIVE_FOLDER = "Escritorio Brandao Contabilidade"
EXTENSIONS_TO_SYNC = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".xml", ".txt", ".jpg", ".png"]

def get_file_triage():
    """Lê o relatório gerado pelo scan e prepara para o upload"""
    report_path = "public/automation_report.json"
    if not os.path.exists(report_path):
        print("❌ Relatório não encontrado. Execute a análise no CRM primeiro.")
        return []
    
    with open(report_path, "r", encoding="utf-8") as f:
        return json.load(f)

def identify_target_folder(filename, current_folder):
    """
    Identifica o caminho de destino no Google Drive baseado no nome do arquivo.
    Regra: [CLIENTE OU GERAL] / [ANO] / [TIPO DE DOCUMENTO]
    """
    # 1. Tenta achar CNPJ/CPF (Regex simples para 11 ou 14 dígitos)
    # Por enquanto usando placeholder para lógica de busca no DB de clientes
    client_name = "ADMINISTRATIVO_GERAL"
    
    # 2. Identificar Tipo de Documento
    doc_type = "OUTROS"
    l_filename = filename.lower()
    if "ccir" in l_filename: doc_type = "CERTIDOES/CCIR"
    elif "itr" in l_filename: doc_type = "IMPOSTO_RENDA/ITR"
    elif "cnh" in l_filename or "rg" in l_filename or "cpf" in l_filename: doc_type = "DOCS_PESSOAIS"
    elif "alvara" in l_filename: doc_type = "ALVARAS_LICENCAS"
    elif "nota" in l_filename or "xml" in l_filename: doc_type = "NOTAS_FISCAIS"

    return client_name, doc_type

def run_sync():
    triage_list = get_file_triage()
    keep_list = [f for f in triage_list if f["action"] == "KEEP"]
    
    print(f"🚀 Iniciando Sincronização de {len(keep_list)} arquivos para o Google Drive...")
    
    for item in keep_list:
        filename = item["name"]
        year = item["date"].split("/")[-1].split(" ")[0]
        client, d_type = identify_target_folder(filename, item["folder"])
        
        # Simulação de Upload (Conectar com n8n ou API Google Drive)
        print(f"⬆️  MANDANDO: {filename} ➔ {BASE_DRIVE_FOLDER}/{client}/{year}/{d_type}")

if __name__ == "__main__":
    run_sync()
