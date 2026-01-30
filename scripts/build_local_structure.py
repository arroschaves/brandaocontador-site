import json
import os

# CONFIGURAÇÃO
ROOT_DIR = "C:\\Brandao_Contabilidade"
STRUCTURE_FILE = "scripts/crm_structure.json"

MONTHS = [
    "01_Janeiro", "02_Fevereiro", "03_Marca", "04_Abril", 
    "05_Maio", "06_Junho", "07_Julho", "08_Agosto", 
    "09_Setembro", "10_Outubro", "11_Novembro", "12_Dezembro", "13_Salario"
]

RH_CATEGORIES = [
    "AVISO_PREVIO", "FGTS", "FICHAS_EMPREGADOS", "INSS", 
    "PEDIDO_REGISTRO", "RECIBO_FERIAS", "RECIBO_FOLHA", "RECIBO_RESCISAO"
]

YEARS = ["2024", "2025", "2026"]

def clean_name(name):
    """Remove caracteres proibidos no Windows para nomes de pastas."""
    for char in r'<>:"/\|?*':
        name = name.replace(char, '_')
    return name.strip()

def process_unit_folders(base_path, years, months, rh_cats):
    """Cria FISCAL, RH e a nova pasta de IMPOSTOS E GUIAS."""
    # 1. FISCAL (Ano -> Mes)
    fiscal_path = os.path.join(base_path, "01 - FISCAL")
    for y in years:
        for m in months:
            os.makedirs(os.path.join(fiscal_path, y, m), exist_ok=True)
            
    # 2. RH (Categoria -> Ano -> Mes)
    rh_path = os.path.join(base_path, "02 - RH")
    for cat in rh_cats:
        for y in years:
            for m in months:
                # Otimização: 13_salario apenas em Folha e Férias
                if m == "13_Salario" and cat not in ["RECIBO_FOLHA", "RECIBO_FERIAS"]:
                    continue
                os.makedirs(os.path.join(rh_path, cat, y, m), exist_ok=True)
                
    # 3. IMPOSTOS E GUIAS (Ano -> Mes) - NOVA MELHORIA
    guias_path = os.path.join(base_path, "03 - IMPOSTOS E GUIAS")
    for y in years:
        for m in months:
            if m == "13_Salario": continue
            os.makedirs(os.path.join(guias_path, y, m), exist_ok=True)

def create_folders():
    if not os.path.exists(STRUCTURE_FILE):
        print(f"❌ Erro: {STRUCTURE_FILE} não encontrado.")
        return

    with open(STRUCTURE_FILE, "r", encoding="utf-8") as f:
        clientes = json.load(f)

    print(f"📁 Iniciando criação da estrutura em {ROOT_DIR}...")
    
    for c in clientes:
        # Limpa o nome para evitar erro de sistema de arquivos do Windows
        safe_name = clean_name(c['nome'])
        client_folder = os.path.join(ROOT_DIR, f"{safe_name} ({c['doc']})")
        
        # 1. Pastas Estáticas (01-09)
        static_folders = [
            "01 - CND (Certidões Negativas)",
            "02 - PENDÊNCIAS FISCAIS (Federal, Estadual, Municipal)",
            "03 - DOCUMENTOS PESSOAIS",
            "04 - CERTIFICADO DIGITAL",
            "05 - DOCUMENTOS TERRA",
            "06 - IRPF",
            "07 - JUNTA COMERCIAL",
            "08 - FATURAMENTO",
            "09 - CAEPF"
        ]
        
        for sf in static_folders:
            os.makedirs(os.path.join(client_folder, sf), exist_ok=True)
            
        # 2. Unidades (Fazendas / PJ)
        unidades = c.get('unidades', [])
        
        # Pasta de agrupamento operacional (10)
        op_root = os.path.join(client_folder, "10 - RH - ESCRITA - CONTABILIDADE")
        os.makedirs(op_root, exist_ok=True)
        
        if not unidades:
            # Caso PJ Simples ou Cliente sem fazendas no CRM, bota FISCAL/RH direto na 09
            process_unit_folders(op_root, YEARS, MONTHS, RH_CATEGORIES)
        else:
            for idx, u in enumerate(unidades, start=1):
                u_name = clean_name(u['nome_identificador'].upper())
                ie = u.get('inscricao_estadual', '')
                label = f"{idx:02d} - {u_name}"
                if ie: label += f" - IE {ie}"
                
                unit_path = os.path.join(op_root, label)
                process_unit_folders(unit_path, YEARS, MONTHS, RH_CATEGORIES)

    print(f"✅ Estrutura concluída para {len(clientes)} clientes.")

if __name__ == "__main__":
    if not os.path.exists("C:\\"):
        print("❌ Erro: Disco C: não acessível.")
    else:
        create_folders()
