import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
import pandas as pd
from dotenv import load_dotenv

load_dotenv('.env.local')

def get_drive_service():
    creds_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
    info = json.loads(creds_json)
    creds = service_account.Credentials.from_service_account_info(
        info, scopes=['https://www.googleapis.com/auth/drive.readonly']
    )
    return build('drive', 'v3', credentials=creds)

def list_2026_pdfs(service, client_folder_id):
    """Varre a pasta do cliente em busca de arquivos criados em 2026."""
    # Data de corte: 01/01/2026
    data_corte = '2026-01-01T00:00:00'
    
    # Buscar arquivos PDF criados APÓS a data de corte recursivamente? 
    # O Drive não busca recursivamente nativamente sem loop, mas podemos buscar na pasta
    # e subpastas se soubermos os IDs. 
    # Melhor estratégia: Buscar QUERY global filtrada por Parents não funciona bem recursivo.
    # Vamos listar os arquivos PDF diretos e entrar em subpastas de 1 nível.
    
    pdfs_2026 = []
    
    # 1. Arquivos na raiz do cliente criados em 2026
    query_files = f"'{client_folder_id}' in parents and mimeType = 'application/pdf' and createdTime > '{data_corte}' and trashed = false"
    results = service.files().list(q=query_files, fields="files(id, name, createdTime)").execute()
    pdfs_2026.extend([f['name'] for f in results.get('files', [])])
    
    # 2. Subpastas (ex: Impostos, 2026, etc)
    query_folders = f"'{client_folder_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    folders = service.files().list(q=query_folders, fields="files(id, name)").execute()
    
    for folder in folders.get('files', []):
        # Entrar na subpasta e buscar PDFs de 2026
        q_sub = f"'{folder['id']}' in parents and mimeType = 'application/pdf' and createdTime > '{data_corte}' and trashed = false"
        sub_res = service.files().list(q=q_sub, fields="files(id, name, createdTime)").execute()
        pdfs_2026.extend([f['name'] for f in sub_res.get('files', [])])
            
    return pdfs_2026

def main():
    service = get_drive_service()
    root_id = os.getenv('GOOGLE_DRIVE_ROOT_FOLDER_ID')
    
    print(f"📦 Iniciando Mapeamento Maestro 2026...")
    
    # Listar as pastas de clientes na raiz
    results = service.files().list(
        q=f"'{root_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
        fields="files(id, name)"
    ).execute()
    
    clients = results.get('files', [])
    report = []

    for client in clients:
        print(f"🔍 Analisando documentos 2026 do cliente: {client['name']}")
        pdfs = list_2026_pdfs(service, client['id'])
        
        if pdfs: # Só adiciona se tiver algo de 2026
            report.append({
                "cliente": client['name'],
                "drive_id": client['id'],
                "documentos_2026": len(pdfs),
                "lista_arquivos": ", ".join(pdfs[:5]) + ("..." if len(pdfs) > 5 else "")
            })

    if report:
        df = pd.DataFrame(report)
        df.to_excel("docs/relatorio_maestro_2026.xlsx", index=False)
        print(f"\n✅ Relatório concluído! docs/relatorio_maestro_2026.xlsx")
        print(f"🚀 {len(report)} clientes encontrados com dados de 2026.")
    else:
        print("📭 Nenhum documento de 2026 encontrado nas pastas dos clientes.")

if __name__ == "__main__":
    main()
