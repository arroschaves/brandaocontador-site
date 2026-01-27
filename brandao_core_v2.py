"""
BRANDÃO CORE V2 - SCANNER INTELIGENTE
======================================

Mudanças principais:
1. Usa NOME DA PASTA como tipo de documento
2. Extrai CPF/CNPJ diretamente dos arquivos (PDF, XML)
3. Matching automático de clientes por CPF/CNPJ
4. Estrutura: Cliente/Ano/Mês/TipoPasta/arquivo.pdf
"""

import os
import json
import re
import time
from datetime import datetime
from pathlib import Path
import PyPDF2
import xml.etree.ElementTree as ET

# --- CONFIGURAÇÃO DE FONTES (PASTAS DOS CLIENTES) ---
PC_SOURCES = [
    r"C:\Users\Alessandro\Documents\JUNTA COMERCIAL",
    r"C:\Users\Alessandro\Documents\SEFAZ MS",
    r"C:\Users\Alessandro\Documents\CERTIFICADO DIGITAL",
    r"C:\Users\Alessandro\Documents\AUTENTICA",
    r"C:\Users\Alessandro\Documents\CAEPF",
    r"C:\Users\Alessandro\Documents\CCIR",
    r"C:\Users\Alessandro\Documents\NOTAS",
    r"C:\Users\Alessandro\Documents\FATURAMENTO",
    r"C:\Users\Alessandro\Documents\CERTIDOES",
    r"C:\AuxilioNFe\NFE"
]

# Data limite: 01/01/2025
FILTER_DATE = datetime(2025, 1, 1).timestamp()

# Mapeamento de nomes de pastas para tipos de documentos
FOLDER_TYPE_MAP = {
    "JUNTA COMERCIAL": "JUNTA_COMERCIAL",
    "JUCEMS": "JUNTA_COMERCIAL",
    "SEFAZ MS": "CERTIDOES_NEGATIVAS",
    "SEFAZ": "CERTIDOES_NEGATIVAS",
    "CERTIFICADO DIGITAL": "CERTIFICADOS_DIGITAIS",
    "CERTIFICADO": "CERTIFICADOS_DIGITAIS",
    "AUTENTICA": "AUTENTICACOES",
    "CAEPF": "CAEPF",
    "CCIR": "CCIR",
    "NOTAS": "NOTAS_FISCAIS",
    "NFE": "NOTAS_FISCAIS",
    "FATURAMENTO": "FATURAMENTO",
    "CERTIDOES": "CERTIDOES_NEGATIVAS",
    "CERTIDÃO": "CERTIDOES_NEGATIVAS",
    "CND": "CERTIDOES_NEGATIVAS",
}

def extract_cpf_cnpj_from_pdf(file_path):
    """
    Extrai CPF ou CNPJ de um arquivo PDF.
    
    Returns:
        str: CPF/CNPJ encontrado (apenas números) ou None
    """
    try:
        with open(file_path, 'rb') as f:
            pdf = PyPDF2.PdfReader(f)
            text = ""
            # Ler primeiras 3 páginas (geralmente CPF/CNPJ está no início)
            for page_num in range(min(3, len(pdf.pages))):
                text += pdf.pages[page_num].extract_text()
        
        # Regex para CNPJ (14 dígitos)
        cnpj_match = re.search(r'\b(\d{2}\.?\d{3}\.?\d{3}/?\d{4}-?\d{2})\b', text)
        if cnpj_match:
            return re.sub(r'\D', '', cnpj_match.group(1))
        
        # Regex para CPF (11 dígitos)
        cpf_match = re.search(r'\b(\d{3}\.?\d{3}\.?\d{3}-?\d{2})\b', text)
        if cpf_match:
            return re.sub(r'\D', '', cpf_match.group(1))
        
        return None
    except Exception as e:
        print(f"⚠️ Erro ao extrair CPF/CNPJ do PDF {file_path}: {e}")
        return None

def extract_cpf_cnpj_from_xml(file_path):
    """
    Extrai CPF ou CNPJ de um arquivo XML (NFe).
    
    Returns:
        str: CPF/CNPJ encontrado (apenas números) ou None
    """
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()
        
        # Namespace da NFe
        ns = {'nfe': 'http://www.portalfiscal.inf.br/nfe'}
        
        # Tentar pegar CNPJ do emitente
        cnpj_emit = root.find('.//nfe:emit/nfe:CNPJ', ns)
        if cnpj_emit is not None and cnpj_emit.text:
            return cnpj_emit.text.strip()
        
        # Tentar pegar CPF do emitente
        cpf_emit = root.find('.//nfe:emit/nfe:CPF', ns)
        if cpf_emit is not None and cpf_emit.text:
            return cpf_emit.text.strip()
        
        # Tentar pegar CNPJ do destinatário
        cnpj_dest = root.find('.//nfe:dest/nfe:CNPJ', ns)
        if cnpj_dest is not None and cnpj_dest.text:
            return cnpj_dest.text.strip()
        
        # Tentar pegar CPF do destinatário
        cpf_dest = root.find('.//nfe:dest/nfe:CPF', ns)
        if cpf_dest is not None and cpf_dest.text:
            return cpf_dest.text.strip()
        
        return None
    except Exception as e:
        print(f"⚠️ Erro ao extrair CPF/CNPJ do XML {file_path}: {e}")
        return None

def detect_doc_type_from_folder(file_path):
    """
    Detecta o tipo de documento baseado no NOME DA PASTA.
    
    Args:
        file_path: Caminho completo do arquivo
    
    Returns:
        str: Tipo do documento (ex: JUNTA_COMERCIAL, CERTIDOES_NEGATIVAS)
    """
    path_parts = Path(file_path).parts
    
    # Percorrer as partes do caminho de trás para frente
    for part in reversed(path_parts):
        part_upper = part.upper()
        
        # Verificar se a parte do caminho está no mapeamento
        for folder_key, doc_type in FOLDER_TYPE_MAP.items():
            if folder_key in part_upper:
                return doc_type
    
    # Se não encontrou, tentar pelo nome do arquivo
    filename = os.path.basename(file_path).upper()
    
    if filename.endswith('.XML'):
        return "NOTAS_FISCAIS"
    elif 'CERTID' in filename or 'CND' in filename:
        return "CERTIDOES_NEGATIVAS"
    elif 'JUNTA' in filename or 'REDESIM' in filename:
        return "JUNTA_COMERCIAL"
    elif 'CERTIFICADO' in filename or '.PFX' in filename or '.PEM' in filename:
        return "CERTIFICADOS_DIGITAIS"
    
    return "OUTROS"

def extract_metadata(filename, file_path, doc_type, mtime):
    """
    Extrai metadados específicos por tipo de documento.
    
    Args:
        filename: Nome do arquivo
        file_path: Caminho completo do arquivo
        doc_type: Tipo do documento
        mtime: Timestamp de modificação do arquivo
    
    Returns:
        dict com: year, month, expiry_date, competence, doc_subtype, cpf_cnpj
    """
    metadata = {
        "year": None,
        "month": None,
        "expiry_date": None,
        "competence": None,
        "doc_subtype": doc_type,
        "cpf_cnpj": None
    }
    
    # Extrair CPF/CNPJ do conteúdo do arquivo
    if filename.lower().endswith('.pdf'):
        metadata["cpf_cnpj"] = extract_cpf_cnpj_from_pdf(file_path)
    elif filename.lower().endswith('.xml'):
        metadata["cpf_cnpj"] = extract_cpf_cnpj_from_xml(file_path)
    
    # Extrair data de vencimento ou competência do nome do arquivo
    name_upper = filename.upper()
    
    # Padrões de data: 2025-12-31, 31/12/2025, 31-12-2025
    date_patterns = [
        r'(\d{4})-(\d{2})-(\d{2})',  # 2025-12-31
        r'(\d{2})[/-](\d{2})[/-](\d{4})',  # 31/12/2025 ou 31-12-2025
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, filename)
        if match:
            if pattern.startswith(r'(\d{4})'):
                # Formato: YYYY-MM-DD
                year, month, day = match.groups()
            else:
                # Formato: DD/MM/YYYY
                day, month, year = match.groups()
            
            metadata["year"] = int(year)
            metadata["month"] = int(month)
            
            # Se for certidão, considerar como data de vencimento
            if "CERTID" in doc_type or "CND" in doc_type:
                metadata["expiry_date"] = f"{year}-{month}-{day}"
            
            break
    
    # Se não encontrou data no nome, usar data de modificação
    if not metadata["year"]:
        mod_date = datetime.fromtimestamp(mtime)
        metadata["year"] = mod_date.year
        metadata["month"] = mod_date.month
    
    return metadata

def scan_files():
    """
    Escaneia todas as pastas configuradas e retorna lista de arquivos válidos.
    
    Returns:
        list: Lista de dicts com informações dos arquivos
    """
    print("\n" + "="*50)
    print("💎 BRANDÃO DIGITAL - SCANNER INTELIGENTE V2")
    print("="*50)
    print("\n🛰️  INICIANDO SCANNER COM DETECÇÃO AUTOMÁTICA...")
    
    all_files = []
    seen_hashes = set()
    doc_type_counts = {}
    
    for source in PC_SOURCES:
        if not os.path.exists(source):
            print(f"⚠️ Pasta não encontrada: {source}")
            continue
        
        print(f"🔍 Escaneando: {source}")
        
        for root, dirs, files in os.walk(source):
            for filename in files:
                file_path = os.path.join(root, filename)
                
                # Filtrar por extensão
                ext = filename.lower().split('.')[-1]
                if ext not in ['pdf', 'xml', 'pfx', 'pem', 'docx', 'xlsx']:
                    continue
                
                # Filtrar por data de modificação
                try:
                    mtime = os.path.getmtime(file_path)
                    if mtime < FILTER_DATE:
                        continue
                except:
                    continue
                
                # Detectar tipo de documento pela PASTA
                doc_type = detect_doc_type_from_folder(file_path)
                
                # Extrair metadados
                metadata = extract_metadata(filename, file_path, doc_type, mtime)
                
                # Criar hash para deduplicação
                file_hash = f"{filename}_{os.path.getsize(file_path)}"
                
                if file_hash in seen_hashes:
                    continue
                
                seen_hashes.add(file_hash)
                
                # Adicionar à lista
                file_info = {
                    "name": filename,
                    "path": file_path,
                    "doc_type": doc_type,
                    "size": os.path.getsize(file_path),
                    "modified": mtime,
                    **metadata
                }
                
                all_files.append(file_info)
                
                # Contar tipos
                doc_type_counts[doc_type] = doc_type_counts.get(doc_type, 0) + 1
    
    print(f"✅ Scanner concluído! {len(all_files)} arquivos válidos mapeados.\n")
    print("📊 Distribuição por tipo de documento:")
    for doc_type, count in sorted(doc_type_counts.items()):
        print(f"   {doc_type}: {count} arquivo(s)")
    
    return all_files

def save_report(files):
    """
    Salva relatório JSON com todos os arquivos escaneados.
    """
    report_path = "public/automation_report.json"
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(files, f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 Relatório salvo em: {report_path}")

if __name__ == "__main__":
    start_time = time.time()
    
    # Escanear arquivos
    files = scan_files()
    
    # Salvar relatório
    save_report(files)
    
    elapsed = time.time() - start_time
    print(f"\n⏱️ Tempo total: {elapsed:.2f}s")
    print(f"📊 Total de arquivos: {len(files)}")
    print(f"📊 Arquivos com CPF/CNPJ identificado: {sum(1 for f in files if f.get('cpf_cnpj'))}")
