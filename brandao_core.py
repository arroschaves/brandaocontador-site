import os
import json
import time
from datetime import datetime
# Supondo que a estrutura de pastas scripts/ existe, se não, ajuste o import
# from scripts.brandao_enrich import BrandaoEnricher
# from scripts.brandao_sync import run_sync
# Para teste, vou assumir que os imports funcionam na sua estrutura

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

# Definir a data limite: 01/01/2025
FILTER_DATE = datetime(2025, 1, 1).timestamp()

def detect_doc_type(filename, path):
    """
    Classifica o tipo de documento baseado no nome e caminho.
    Isso é CRÍTICO para deduplicação correta (CND != ITR != CCIR)
    """
    name = filename.upper()
    full = (filename + path).upper()
    
    # Certidões (precisam de subcategorias)
    if "CND" in name or "CERTIDAO" in name or "CERTIDÃO" in name:
        if "ESTAD" in full or "SEFAZ" in full:
            return "CND_ESTADUAL"
        elif "MUNIC" in full or "PREFEIT" in full:
            return "CND_MUNICIPAL"
        elif "FGTS" in name:
            return "CND_FGTS"
        elif "FEDERAL" in full or "RECEITA" in full:
            return "CND_FEDERAL"
        else:
            return "CND"
    
    # Documentos Rurais
    if "CCIR" in name:
        return "CCIR"
    if "ITR" in name:
        return "ITR"
    if "CAEPF" in name:
        return "CAEPF"
    if "INCRA" in name or "NIRF" in name:
        return "INCRA"
    
    # Certificados Digitais
    if "CERTIFICADO" in name or "CERT_DIGITAL" in name:
        return "CERTIFICADO_DIGITAL"
    
    # Documentos Fiscais
    if filename.lower().endswith(".xml"):
        return "NFE_XML"
    if "NOTA" in name or "NFE" in name or "NF-E" in name:
        return "NOTA_FISCAL"
    
    # Junta Comercial
    if "JUNTA" in full or "COMERCIAL" in full:
        return "JUNTA_COMERCIAL"
    
    # Outros
    return "OUTROS"

def extract_metadata(filename, file_path, doc_type, mtime):
    """
    Extrai metadados específicos por tipo de documento.
    
    Args:
        filename: Nome do arquivo
        file_path: Caminho completo do arquivo
        doc_type: Tipo do documento (CND, ITR, etc)
        mtime: Timestamp de modificação do arquivo
    
    Returns:
        dict com: year, month, expiry_date, competence, doc_subtype
    """
    import re
    from datetime import datetime
    
    metadata = {
        "year": None,
        "month": None,
        "expiry_date": None,
        "competence": None,
        "doc_subtype": None
    }
    
    name_upper = filename.upper()
    
    # 1. EXTRAIR ANO
    # Procurar padrão de 4 dígitos (2025, 2026, etc)
    year_match = re.search(r'(202[0-9])', filename)
    if year_match:
        metadata["year"] = int(year_match.group(1))
    else:
        # Fallback: usar ano da data de modificação
        metadata["year"] = datetime.fromtimestamp(mtime).year
    
    # 2. EXTRAIR MÊS
    # Procurar nomes de meses em português
    month_names = {
        "JANEIRO": 1, "JAN": 1,
        "FEVEREIRO": 2, "FEV": 2,
        "MARÇO": 3, "MARCO": 3, "MAR": 3,
        "ABRIL": 4, "ABR": 4,
        "MAIO": 5, "MAI": 5,
        "JUNHO": 6, "JUN": 6,
        "JULHO": 7, "JUL": 7,
        "AGOSTO": 8, "AGO": 8,
        "SETEMBRO": 9, "SET": 9,
        "OUTUBRO": 10, "OUT": 10,
        "NOVEMBRO": 11, "NOV": 11,
        "DEZEMBRO": 12, "DEZ": 12
    }
    
    for month_name, month_num in month_names.items():
        if month_name in name_upper:
            metadata["month"] = month_num
            break
    
    # Fallback: procurar padrão MM/YYYY ou YYYY-MM
    if not metadata["month"]:
        month_match = re.search(r'(0[1-9]|1[0-2])[/-](202[0-9])', filename)
        if month_match:
            metadata["month"] = int(month_match.group(1))
    
    # 3. EXTRAIR DATA DE VENCIMENTO (para certidões)
    if "CND" in doc_type or "CERTIDAO" in doc_type or "CERTIDÃO" in doc_type:
        # Procurar padrões: venc_2026-07-15, validade_15/07/2026, etc
        venc_patterns = [
            r'venc[a-z_-]*(\d{4})[-/](\d{2})[-/](\d{2})',  # venc_2026-07-15
            r'validade[a-z_-]*(\d{2})[-/](\d{2})[-/](\d{4})',  # validade_15/07/2026
            r'(\d{2})[-/](\d{2})[-/](\d{4})',  # 15/07/2026
        ]
        
        for pattern in venc_patterns:
            match = re.search(pattern, filename.lower())
            if match:
                groups = match.groups()
                if len(groups) == 3:
                    # Determinar formato (YYYY-MM-DD ou DD/MM/YYYY)
                    if len(groups[0]) == 4:  # YYYY-MM-DD
                        year, month, day = groups
                    else:  # DD/MM/YYYY
                        day, month, year = groups
                    
                    metadata["expiry_date"] = f"{year}-{month.zfill(2)}-{day.zfill(2)}"
                    break
        
        metadata["doc_subtype"] = "CERTIDOES_NEGATIVAS"
    
    # 4. EXTRAIR COMPETÊNCIA (para folha de pagamento)
    elif "FOLHA" in name_upper or "PAGAMENTO" in name_upper:
        # Competência = YYYY-MM
        if metadata["year"] and metadata["month"]:
            metadata["competence"] = f"{metadata['year']}-{str(metadata['month']).zfill(2)}"
        
        metadata["doc_subtype"] = "FOLHA_PAGAMENTO"
    
    # 5. DEFINIR DOC_SUBTYPE POR TIPO
    elif doc_type == "NFE_XML":
        metadata["doc_subtype"] = "XML_NFE"
    
    elif doc_type == "JUNTA_COMERCIAL":
        metadata["doc_subtype"] = "JUNTA_COMERCIAL"
    
    elif "ITR" in doc_type:
        metadata["doc_subtype"] = "PENDENCIAS_FISCAIS"
    
    elif "SIMPLES" in name_upper or "DAS" in name_upper:
        metadata["doc_subtype"] = "SIMPLES_NACIONAL"
    
    elif "LUCRO" in name_upper and "REAL" in name_upper:
        metadata["doc_subtype"] = "LUCRO_REAL"
    
    else:
        # Fallback: usar o próprio doc_type
        metadata["doc_subtype"] = doc_type
    
    return metadata

def scan_local_files():
    """
    PASSO 1: O SCANNER INTELIGENTE
    - Filtra arquivos modificados a partir de 01/01/2025.
    - Deduplica por TIPO + NOME (não só nome)
    - Ignora arquivos de sistema e pastas vazias.
    """
    print("🛰️  INICIANDO SCANNER LOCAL COM FILTRO DE DATA...")
    
    # Dicionário para controlar duplicatas: key=tipo:nome_arquivo, value=dados_do_arquivo
    unique_files = {}
    
    for source in PC_SOURCES:
        if not os.path.exists(source):
            print(f"➖ Pasta não encontrada (pulando): {source}")
            continue
            
        print(f"🔍 Escaneando: {source}")
        
        for root, dirs, files in os.walk(source):
            for file in files:
                # Ignorar lixo do Windows
                if file.upper() in ["THUMBS.DB", "DESKTOP.INI"] or file.startswith("~$"):
                    continue
                
                full_path = os.path.join(root, file)
                
                try:
                    # Obter data de modificação
                    mtime = os.path.getmtime(full_path)
                    
                    # REGRA CRÍTICA: Só processa se for >= 01/01/2025
                    if mtime < FILTER_DATE:
                        continue # Arquivo antigo, descarta
                    
                    # NOVA LÓGICA: Detectar tipo do documento
                    doc_type = detect_doc_type(file, full_path)
                    
                    # EXTRAIR METADADOS
                    metadata = extract_metadata(file, full_path, doc_type, mtime)
                    
                    # Chave de deduplicação: tipo:nome (não só nome!)
                    key = f"{doc_type}:{file.lower()}"
                    
                    # Lógica de Duplicata: Se já existe esse tipo+nome, verifica qual é o mais novo
                    if key in unique_files:
                        existing_mtime = unique_files[key]["mtime"]
                        if mtime > existing_mtime:
                            # Este arquivo é mais recente, substitui o antigo
                            unique_files[key] = {
                                "name": file,
                                "path": full_path,
                                "folder": source,
                                "doc_type": doc_type,
                                "metadata": metadata,
                                "action": "KEEP",
                                "mtime": mtime
                            }
                    else:
                        # Primeira vez que vemos este tipo+nome
                        unique_files[key] = {
                            "name": file,
                            "path": full_path,
                            "folder": source,
                            "doc_type": doc_type,
                            "metadata": metadata,
                            "action": "KEEP",
                            "mtime": mtime
                        }
                        
                except Exception as e:
                    print(f"Erro ao ler arquivo {file}: {e}")

    # Converter o dicionário de valores únicos para a lista final
    report = list(unique_files.values())
                
    with open("public/automation_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=4, ensure_ascii=False)
    
    print(f"✅ Scanner concluído! {len(report)} arquivos válidos mapeados (Filtrados por data e tipo+duplicatas).")
    
    # Estatísticas por tipo
    type_counts = {}
    for item in report:
        doc_type = item.get("doc_type", "OUTROS")
        type_counts[doc_type] = type_counts.get(doc_type, 0) + 1
    
    print("\n📊 Distribuição por tipo de documento:")
    for doc_type, count in sorted(type_counts.items()):
        print(f"   {doc_type}: {count} arquivo(s)")

def start_operation():
    print("\n" + "="*50)
    print("💎 BRANDÃO DIGITAL - OPERAÇÃO AGRO PRO MAX 2026")
    print("="*50 + "\n")
    
    start_time = time.time()
    
    # PASSO 1: ESCANEAR (Com filtro de data e deduplicação)
    scan_local_files()
    
    # PASSO 2: ENRIQUECER (Lê XMLs, Cadastra Fazendas, Atualiza CRM)
    # Nota: Só rode isso se tiver importado as classes corretamente
    try:
        from scripts.brandao_enrich import BrandaoEnricher
        print("\n🧠 PASSO 2: ENRIQUECENDO DADOS NO CRM...")
        enricher = BrandaoEnricher()
        enricher.enrich_all()
    except ImportError:
        print("⚠️ Módulo brandao_enrich não encontrado, pulando enriquecimento.")

    # PASSO 3: ORGANIZAR (Sobe para o Google Drive nas pastas certas)
    try:
        from scripts.brandao_sync import run_sync
        print("\n🚀 PASSO 3: ORGANIZANDO NO GOOGLE DRIVE...")
        run_sync()
    except ImportError:
        print("⚠️ Módulo brandao_sync não encontrado, pulando sincronização.")
    
    end_time = time.time()
    duration = round(end_time - start_time, 2)
    
    print("\n" + "="*50)
    print(f"✨ MISSÃO CONCLUÍDA EM {duration}s!")
    print("="*50 + "\n")

if __name__ == "__main__":
    start_operation()