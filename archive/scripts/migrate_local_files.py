import os
import shutil
import json
import xml.etree.ElementTree as ET
from datetime import datetime
import hashlib

# CONFIGURAÇÕES
ROOT_DEST = "C:\\Brandao_Contabilidade"
STRUCTURE_FILE = "scripts/crm_structure.json"
REPORT_FILE = "scripts/migracao_report.json"

SOURCE_PATHS = {
    r"C:\Users\Alessandro\Documents\JUNTA COMERCIAL": "07 - JUNTA COMERCIAL",
    r"C:\Users\Alessandro\Documents\SEFAZ MS": "01 - CND (Certidões Negativas)",
    r"C:\Users\Alessandro\Documents\CERTIFICADO DIGITAL": "04 - CERTIFICADO DIGITAL",
    r"C:\Users\Alessandro\Documents\AUTENTICA": "03 - DOCUMENTOS PESSOAIS",
    r"C:\Users\Alessandro\Documents\CAEPF": "09 - CAEPF",
    r"C:\Users\Alessandro\Documents\CCIR": "05 - DOCUMENTOS TERRA",
    r"C:\Users\Alessandro\Documents\NOTAS": "10 - RH - ESCRITA - CONTABILIDADE/01 - FISCAL",
    r"C:\Users\Alessandro\Documents\FATURAMENTO": "08 - FATURAMENTO",
    r"C:\Users\Alessandro\Documents\CERTIDOES": "01 - CND (Certidões Negativas)",
    r"C:\AuxilioNFe\NFE": "10 - RH - ESCRITA - CONTABILIDADE/01 - FISCAL",
    r"F:\ACESSO RAPÍDO\FOLHA PAGAMENTO": "10 - RH - ESCRITA - CONTABILIDADE/02 - RH/RECIBO_FOLHA"
}

MONTH_MAP = {
    "01": "01_Janeiro", "02": "02_Fevereiro", "03": "03_Marco",
    "04": "04_Abril", "05": "05_Maio", "06": "06_Junho",
    "07": "07_Julho", "08": "08_Agosto", "09": "09_Setembro",
    "10": "10_Outubro", "11": "11_Novembro", "12": "12_Dezembro"
}

def clean_doc(doc):
    if not doc: return ""
    return doc.replace(".","").replace("-","").replace("/","").strip()

def clean_name(name):
    """Remove caracteres proibidos no Windows para nomes de pastas."""
    for char in r'<>:"/\|?*':
        name = name.replace(char, '_')
    return name.strip()

def get_file_hash(path):
    """Gera um hash simples para detectar duplicados por conteúdo se necessário."""
    return f"{os.path.getsize(path)}_{os.path.basename(path)}"

class LocalMigrator:
    def __init__(self):
        with open(STRUCTURE_FILE, "r", encoding="utf-8") as f:
            self.crm_data = json.load(f)
        self.report = {"clientes": {}, "total_arquivos": 0, "copiados": 0, "duplicados_pulei": 0, "nao_encontrado_crm": 0}
        # Mapa doc -> pasta_destino
        self.client_map = {clean_doc(c['doc']): f"{clean_name(c['nome'])} ({c['doc']})" for c in self.crm_data if c['doc']}

    def identify_client(self, file_path, folder_name):
        """Tenta identificar o cliente pelo nome da pasta pai ou pelo conteúdo do XML."""
        folder_upper = folder_name.upper()
        file_upper = os.path.basename(file_path).upper()
        
        # 1. Tenta pelo DOC (CNPJ/CPF) - Prioridade Máxima
        for doc, folder in self.client_map.items():
            if doc and (doc in folder_upper or doc in file_upper):
                return doc
        
        # 2. Tenta pelo NOME do cliente (Busca por palavras-chave)
        for c in self.crm_data:
            c_name = c['nome'].upper()
            c_doc = clean_doc(c['doc'])
            
            # Se o nome completo está na pasta (ex: "ALVES ADVOGADOS")
            if c_name in folder_upper or c_name in file_upper:
                return c_doc
            
            # Tenta a primeira palavra do nome (ex: "AABB", "DENISE")
            first_word = c_name.split()[0]
            if len(first_word) > 3: # Evita nomes muito curtos como 'ANA'
                if f"\\{first_word}" in folder_upper or f" {first_word} " in folder_upper or folder_upper.endswith(first_word):
                    return c_doc

        # 3. Se for XML, abre e lê
        if file_path.lower().endswith(".xml"):
            try:
                tree = ET.parse(file_path)
                root = tree.getroot()
                ns = {'nfe': 'http://www.portalfiscal.inf.br/nfe'}
                for tag in ['.//nfe:dest', './/nfe:emit']:
                    node = root.find(tag, ns)
                    if node is not None:
                        cnpj = node.find('nfe:CNPJ', ns)
                        cpf = node.find('nfe:CPF', ns)
                        doc = clean_doc(cnpj.text if cnpj is not None else (cpf.text if cpf is not None else None))
                        if doc in self.client_map: return doc
            except: pass
        return None

    def get_dest_path(self, client_doc, rel_dest, file_path):
        """Calcula o caminho final incluindo Unidade, Ano e Mês se for operacional."""
        client_folder = self.client_map.get(client_doc)
        if not client_folder: return None
        
        # Encontra os dados completos do cliente no CRM
        try:
            client_crm = next(c for c in self.crm_data if clean_doc(c['doc']) == client_doc)
        except StopIteration:
            return None
            
        unidades = client_crm.get('unidades', [])
        
        base_dest = os.path.join(ROOT_DEST, client_folder, "10 - RH - ESCRITA - CONTABILIDADE")
        
        # Se for operacional, precisamos de Unidade -> Tipo (Fiscal/RH) -> Ano -> Mês
        if "10 - RH" in rel_dest:
            # 1. Determina a Unidade
            ie_alvo = None
            if file_path.lower().endswith(".xml"):
                try:
                    tree = ET.parse(file_path)
                    root = tree.getroot()
                    ns = {'nfe': 'http://www.portalfiscal.inf.br/nfe'}
                    for tag in ['.//nfe:dest', './/nfe:emit']:
                        node = root.find(tag, ns)
                        if node is not None:
                            ie_node = node.find('nfe:IE', ns)
                            if ie_node is not None: ie_alvo = ie_node.text
                except: pass

            unit_label = ""
            if unidades:
                # Busca a unidade pela IE ou pega a primeira
                match = next((u for u in unidades if u.get('inscricao_estadual') == ie_alvo), unidades[0])
                u_name = clean_name(match['nome_identificador'].upper())
                ie = match.get('inscricao_estadual', '')
                unit_label = f"01 - {u_name}"
                if ie: unit_label += f" - IE {ie}"
            
            # 2. Determina Ano e Mês (via mtime ou XML)
            mtime = os.path.getmtime(file_path)
            dt = datetime.fromtimestamp(mtime)
            year, month = str(dt.year), MONTH_MAP.get(f"{dt.month:02d}", "01_Janeiro")
            
            if file_path.lower().endswith(".xml"):
                try:
                    tree = ET.parse(file_path)
                    root = tree.getroot()
                    ide = root.find('.//nfe:ide', {'nfe': 'http://www.portalfiscal.inf.br/nfe'})
                    if ide is not None:
                        dh = ide.find('nfe:dhEmi', {'nfe': 'http://www.portalfiscal.inf.br/nfe'})
                        if dh is not None:
                            dstr = dh.text[:10]
                            year, month = dstr[:4], MONTH_MAP.get(dstr[5:7], month)
                except: pass

            # Monta o caminho: 10/Unidade/SubPastaDaOrigem/Ano/Mes
            # rel_dest já contém "01 - FISCAL" ou "02 - RH/..."
            sub_tipo = rel_dest.split('/')[-1] if '/' in rel_dest else rel_dest.split('-')[-1].strip()
            # Ajuste para pegar "01 - FISCAL" ou "02 - RH"
            tipo_root = "01 - FISCAL" if "FISCAL" in rel_dest else "02 - RH"
            if "RH/RECIBO_FOLHA" in rel_dest:
                return os.path.join(base_dest, unit_label, tipo_root, "RECIBO_FOLHA", year, month)
            return os.path.join(base_dest, unit_label, tipo_root, year, month)
        
        # Para pastas estáticas (01-09)
        return os.path.join(ROOT_DEST, client_folder, rel_dest)

    def migrate(self):
        print(f"🚀 Iniciando Migração Local para {ROOT_DEST}...")
        
        for src, rel_dest in SOURCE_PATHS.items():
            if not os.path.exists(src):
                print(f"⚠️ Pasta de origem não encontrada: {src}")
                continue
            
            print(f"📂 Varrendo: {src}")
            for root, dirs, files in os.walk(src):
                for file in files:
                    try:
                        self.report["total_arquivos"] += 1
                        file_path = os.path.join(root, file)
                        
                        doc = self.identify_client(file_path, root)
                        if not doc:
                            self.report["nao_encontrado_crm"] += 1
                            continue
                        
                        dest_dir = self.get_dest_path(doc, rel_dest, file_path)
                        if not dest_dir: continue
                        
                        if not os.path.exists(dest_dir):
                            os.makedirs(dest_dir, exist_ok=True)
                        
                        dest_file = os.path.join(dest_dir, file)
                        
                        if self.report["total_arquivos"] % 100 == 0:
                            print(f"📊 Processados: {self.report['total_arquivos']} | Copiados: {self.report['copiados']} | Pulei: {self.report['duplicados_pulei']}")

                        # Checagem de duplicação
                        if os.path.exists(dest_file):
                            # Mantém o mais recente
                            if os.path.getmtime(file_path) > os.path.getmtime(dest_file):
                                shutil.copy2(file_path, dest_file)
                                self.add_to_report(doc, file, src, dest_dir, "ATUALIZADO (Mais recente)")
                            else:
                                self.report["duplicados_pulei"] += 1
                                continue
                        else:
                            shutil.copy2(file_path, dest_file)
                            self.report["copiados"] += 1
                            self.add_to_report(doc, file, src, dest_dir, "COPIADO")
                    except Exception as e:
                        print(f"❌ Erro ao processar {file}: {e}")
                        continue

        with open(REPORT_FILE, "w", encoding="utf-8") as f:
            json.dump(self.report, f, indent=4, ensure_ascii=False)
        print(f"✅ Migração concluída! Verifique o relatório em {REPORT_FILE}")

    def add_to_report(self, doc, file, src, dest, status):
        client_name = self.client_map[doc]
        if client_name not in self.report["clientes"]:
            self.report["clientes"][client_name] = []
        self.report["clientes"][client_name].append({
            "arquivo": file,
            "origem": src,
            "destino": dest,
            "status": status,
            "data": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })

if __name__ == "__main__":
    migrator = LocalMigrator()
    migrator.migrate()
