import os
import sys
import json
import pickle
import time
from pathlib import Path
from datetime import datetime
from google.oauth2 import service_account
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv('.env.local')

# Credenciais do Google Drive
SCOPES = ['https://www.googleapis.com/auth/drive']
SERVICE_ACCOUNT_FILE = 'credentials.json'
TOKEN_FILE = 'token.pickle'

# ID da pasta raiz (BRANDAO CONTABILIDADE)
ROOT_FOLDER_ID = "1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP"
# Mapeamento oficial de meses
MONTH_MAP = {
    "01": "01_Janeiro", "JAN": "01_Janeiro", "JANEIRO": "01_Janeiro",
    "02": "02_Fevereiro", "FEV": "02_Fevereiro", "FEVEREIRO": "02_Fevereiro",
    "03": "03_Marco", "MAR": "03_Marco", "MARCO": "03_Marco",
    "04": "04_Abril", "ABR": "04_Abril", "ABRIL": "04_Abril",
    "05": "05_Maio", "MAI": "05_Maio", "MAIO": "05_Maio",
    "06": "06_Junho", "JUN": "06_Junho", "JUNHO": "06_Junho",
    "07": "07_Julho", "JUL": "07_Julho", "JULHO": "07_Julho",
    "08": "08_Agosto", "AGO": "08_Agosto", "AGOSTO": "08_Agosto",
    "09": "09_Setembro", "SET": "09_Setembro", "SETEMBRO": "09_Setembro",
    "10": "10_Outubro", "OUT": "10_Outubro", "OUTUBRO": "10_Outubro",
    "11": "11_Novembro", "NOV": "11_Novembro", "NOVEMBRO": "11_Novembro",
    "12": "12_Dezembro", "DEZ": "12_Dezembro", "DEZEMBRO": "12_Dezembro"
}

CATEGORY_MAP = {
    "NOTAS_FISCAIS": ["NOTA FISCAL", "NOTAS FISCAIS", "NFE", "XML", "NOTAS", "FISCAL"],
    "CERTIFICADOS_DIGITAIS": ["CERTIFICADO DIGITAL", "CERTIFICADOS DIGITAIS", "CERTIFICADO", "CERTIFICADOS", "DIGITAL"],
    "FOLHA_PAGAMENTO": ["FOLHA DE PAGAMENTO", "FOLHA PAGAMENTO", "HOLERITES", "FOLHA", "PAGAMENTO"],
    "DOCUMENTOS_PERMANENTES": ["DOCUMENTOS PERMANENTES", "DOC PERMANENTE", "CONTRATOS", "CONTRATO SOCIAL", "JUCEMS", "PERMANENTES"],
    "CERTIDOES_NEGATIVAS": ["CERTIDAO", "CERTIDOES", "CERTIDOES NEGATIVAS", "CND"],
    "SIMPLES_NACIONAL": ["SIMPLES NACIONAL", "DAS", "SIMPLES"],
    "OUTROS": ["DIVERSOS", "OUTROS", "EXTRA", "DOCS", "UNTITLED"]
}

class DriveConsolidator:
    def __init__(self, dry_run=True):
        self.dry_run = dry_run
        self.service = self.get_drive_service()
        self.stats = {"files_to_move": 0, "folders_to_delete": 0, "merged_folders": 0}
        self.name_to_category = {}
        for cat, synonyms in CATEGORY_MAP.items():
            for syn in synonyms:
                self.name_to_category[syn.upper()] = cat

    def get_drive_service(self):
        """Conecta ao Google Drive."""
        credentials_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
        if credentials_json:
            credentials_info = json.loads(credentials_json)
            creds = service_account.Credentials.from_service_account_info(credentials_info, scopes=SCOPES)
            return build('drive', 'v3', credentials=creds)
        raise FileNotFoundError("Credenciais não configuradas.")

    def normalize_name(self, name):
        """Padrão de limpeza de nomes (remove acentos, espaços duplos, etc)."""
        import unicodedata
        n = "".join(c for c in unicodedata.normalize('NFD', name) if unicodedata.category(c) != 'Mn')
        return n.upper().strip()

    def get_month_folder_name(self, name):
        """Normaliza nome de pasta para o padrão 01_Janeiro."""
        clean = self.normalize_name(name)
        # Tenta encontrar correspondência no mapa de meses
        for key, val in MONTH_MAP.items():
            if key in clean:
                return val
        return None

    def get_category(self, folder_name):
        """Normaliza nome para categoria oficial."""
        clean = self.normalize_name(folder_name)
        if clean in self.name_to_category:
            return self.name_to_category[clean]
        for key, cat in self.name_to_category.items():
            if key in clean: return cat
        return None

    def list_all_content(self, parent_id):
        """Lista tudo dentro de uma pasta (arquivos e pastas)."""
        try:
            query = f"'{parent_id}' in parents and trashed=false"
            results = self.service.files().list(q=query, fields="files(id, name, mimeType)").execute()
            return results.get('files', [])
        except: return []

    def move_item(self, item_id, new_parent_id):
        if self.dry_run: return True
        try:
            file = self.service.files().get(fileId=item_id, fields='parents').execute()
            previous_parents = ",".join(file.get('parents', []))
            self.service.files().update(fileId=item_id, addParents=new_parent_id, removeParents=previous_parents).execute()
            return True
        except: return False

    def rename_folder(self, folder_id, new_name):
        """Renomeia uma pasta no Drive."""
        if self.dry_run: return True
        try:
            self.service.files().update(fileId=folder_id, body={'name': new_name}).execute()
            return True
        except: return False

    def delete_folder(self, folder_id):
        """Tenta mover para a lixeira. Se falhar por permissão, renomeia para marcar como lixo."""
        if self.dry_run: return True
        try:
            self.service.files().update(fileId=folder_id, body={'trashed': True}).execute()
            return True
        except Exception as e:
            if "insufficientFilePermissions" in str(e):
                # Fallback: Renomeia para facilitar a limpeza manual do usuário
                print(f"    ⚠️ Sem permissão para apagar. Renomeando para '_VAZIA_REMOVER'...")
                self.rename_folder(folder_id, f"_VAZIA_REMOVER_{int(time.time())}")
            else:
                print(f"    ❌ Erro ao deletar: {e}")
            return False

    def merge_same_name_folders(self, parent_id):
        """Varre o diretório e une pastas com nomes idênticos."""
        all_items = self.list_all_content(parent_id)
        folders = [f for f in all_items if f['mimeType'] == 'application/vnd.google-apps.folder' and not f['name'].startswith('_VAZIA')]
        
        groups = {}
        for f in folders:
            name = f['name'].strip().upper()
            if name not in groups: groups[name] = []
            groups[name].append(f)
            
        for name, group in groups.items():
            if len(group) > 1:
                print(f"  🚨 Unificando {len(group)} pastas chamadas '{name}'...")
                primary = group[0]
                others = group[1:]
                for other in others:
                    # Move tudo para a primária
                    content = self.list_all_content(other['id'])
                    for item in content:
                        self.move_item(item['id'], primary['id'])
                    self.delete_folder(other['id'])

    def process_recursive(self, current_folder_id, client_id, current_year=None, current_month=None):
        """
        Varre tudo e move para a estrutura correta:
        Cliente (client_id) -> Ano -> Mês -> Categoria
        """
        items = self.list_all_content(current_folder_id)
        
        for item in items:
            if item['mimeType'] == 'application/vnd.google-apps.folder':
                name = item['name']
                # Tenta detectar se é um ANO, MÊS ou CATEGORIA
                detected_year = name if (name.isdigit() and len(name) == 4) else current_year
                detected_month = self.get_month_folder_name(name) or current_month
                detected_cat = self.get_category(name)
                
                # Se detectamos novos níveis, entramos neles
                self.process_recursive(item['id'], client_id, detected_year, detected_month)
                
                # Se a pasta estiver vazia agora (ou for duplicata vazia), deletar
                # Nota: A verificação de vazia será feita no final para segurança
            else:
                # É um ARQUIVO! Vamos ver onde ele deveria estar
                # Precisamos de pelo menos ANO e MÊS para mover. 
                # Se não temos mês, mas temos ano, vai para DOCUMENTOS_PERMANENTES
                
                target_year = current_year or datetime.now().year
                target_month = current_month or "00_DOCUMENTOS_PERMANENTES"
                target_cat = self.get_category(current_folder_id) or "OUTROS" # Simplificado
                
                # Para arquivos soltos, tentamos descobrir a categoria pelo nome do arquivo
                file_cat = self.get_category(item['name']) or target_cat
                
                # Criar/Obter estrutura oficial
                y_id = self.get_or_create_folder(str(target_year), client_id)
                m_id = self.get_or_create_folder(target_month, y_id)
                c_id = self.get_or_create_folder(file_cat, m_id)
                
                # Se o arquivo não estiver na pasta oficial de categoria, movemos!
                if item['id'] not in [y_id, m_id, c_id] and current_folder_id != c_id:
                    print(f"  📦 Movendo '{item['name']}' -> {target_year}/{target_month}/{file_cat}")
                    if self.move_item(item['id'], c_id):
                        self.stats["files_to_move"] += 1

    def clean_empty_folders(self, parent_id):
        """Remove pastas que ficaram vazias após a movimentação."""
        all_items = self.list_all_content(parent_id)
        folders = [f for f in all_items if f['mimeType'] == 'application/vnd.google-apps.folder']
        
        for f in folders:
            self.clean_empty_folders(f['id'])
            # Checar se pasta ficou vazia
            content = self.list_all_content(f['id'])
            if not content:
                print(f"  🗑️ Removendo pasta vazia: {f['name']}")
                self.delete_folder(f['id'])
                self.stats["folders_to_delete"] += 1

    def get_or_create_folder(self, name, parent_id):
        """Busca pasta pelo nome ou cria se não existir."""
        query = f"'{parent_id}' in parents and name='{name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
        results = self.service.files().list(q=query, fields="files(id, name)").execute()
        folders = results.get('files', [])
        if folders: return folders[0]['id']
        if self.dry_run: return f"DRY_RUN_ID_{name}"
        body = {'name': name, 'parents': [parent_id], 'mimeType': 'application/vnd.google-apps.folder'}
        new_folder = self.service.files().create(body=body, fields='id').execute()
        return new_folder['id']

    def scan_client_folder(self, client_folder):
        print(f"\n🚀 Limpeza Ultra-Agressiva: {client_folder['name']}")
        # 1. Primeiro resolve pastas com nomes IDÊNTICOS no nível raiz do cliente (ex: vários "2025")
        self.merge_same_name_folders(client_folder['id'])
        # 2. Agora processa recursivamente tudo para as pastas oficiais
        self.process_recursive(client_folder['id'], client_folder['id'])
        # 3. Limpa pastas vazias sobrantes
        self.clean_empty_folders(client_folder['id'])

    def consolidate(self):
        print("\n" + "="*60)
        print(f"☢️  LIMPEZA NUCLEAR DO DRIVE {'(SIMULAÇÃO)' if self.dry_run else '(EXECUÇÃO REAL!)'}")
        print("="*60)
        
        # Listar pastas de clientes (apenas pastas na raiz)
        all_items = self.list_all_content(ROOT_FOLDER_ID)
        client_folders = [f for f in all_items if f['mimeType'] == 'application/vnd.google-apps.folder']
        
        print(f"\n📊 Processando {len(client_folders)} pastas de clientes...")
        for client in client_folders:
            self.scan_client_folder(client)
        
        print("\n" + "="*60)
        print("📊 RELATÓRIO FINAL")
        print("="*60)
        print(f"  Arquivos movidos/organizados: {self.stats['files_to_move']}")
        print(f"  Pastas vazias removidas: {self.stats['folders_to_delete']}")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Consolida Google Drive")
    parser.add_argument("--execute", action="store_true", help="Executar consolidação (sem dry-run)")
    args = parser.parse_args()
    
    consolidator = DriveConsolidator(dry_run=not args.execute)
    consolidator.consolidate()
