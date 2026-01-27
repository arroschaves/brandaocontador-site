#!/usr/bin/env python3
"""
EXTRATOR DE CREDENCIAIS DO N8N
================================

Este script ajuda a extrair as credenciais do Google Drive configuradas no n8n
e formatá-las para uso no consolidate_drive.py

IMPORTANTE: Você precisa ter acesso ao n8n para executar este script.
"""

import json
import sys

def format_credentials_for_env(credentials_dict):
    """
    Formata as credenciais em uma única linha para o .env.local
    """
    # Remove espaços e quebras de linha
    credentials_json = json.dumps(credentials_dict, separators=(',', ':'))
    
    print("\n" + "="*70)
    print("📋 CREDENCIAIS FORMATADAS PARA .env.local")
    print("="*70)
    print("\nCopie a linha abaixo e adicione no seu .env.local:\n")
    print(f"GOOGLE_CREDENTIALS_JSON='{credentials_json}'")
    print("\n" + "="*70)
    print("\n✅ Depois de adicionar no .env.local, execute:")
    print("   python scripts/consolidate_drive.py")
    print("\n")

def extract_from_n8n():
    """
    Instruções para extrair credenciais do n8n
    """
    print("\n" + "="*70)
    print("🔍 COMO EXTRAIR CREDENCIAIS DO N8N")
    print("="*70)
    print("""
1. Acesse seu n8n: https://seu-n8n.com

2. Vá em: Settings (⚙️) > Credentials

3. Encontre a credencial do Google Drive (Google Service Account)

4. Clique em "Edit" ou "View"

5. Copie o JSON completo que está no campo "Service Account Email" ou similar

6. Cole o JSON abaixo quando solicitado

7. O script irá formatar para você usar no .env.local
""")
    print("="*70)
    
    print("\n📝 Cole o JSON das credenciais abaixo (pressione Enter duas vezes para finalizar):\n")
    
    lines = []
    while True:
        try:
            line = input()
            if line == "" and len(lines) > 0:
                break
            lines.append(line)
        except EOFError:
            break
    
    credentials_text = "\n".join(lines)
    
    try:
        credentials_dict = json.loads(credentials_text)
        
        # Validar campos obrigatórios
        required_fields = ['type', 'project_id', 'private_key', 'client_email']
        missing_fields = [field for field in required_fields if field not in credentials_dict]
        
        if missing_fields:
            print(f"\n❌ Erro: Campos obrigatórios faltando: {', '.join(missing_fields)}")
            sys.exit(1)
        
        format_credentials_for_env(credentials_dict)
        
    except json.JSONDecodeError as e:
        print(f"\n❌ Erro ao decodificar JSON: {e}")
        print("   Verifique se você colou o JSON completo e válido.")
        sys.exit(1)

def manual_setup():
    """
    Instruções para criar credenciais manualmente
    """
    print("\n" + "="*70)
    print("🔧 CRIAR CREDENCIAIS MANUALMENTE NO GOOGLE CLOUD")
    print("="*70)
    print("""
1. Acesse: https://console.cloud.google.com/

2. Crie um novo projeto ou selecione um existente

3. Ative a Google Drive API:
   - Menu > APIs & Services > Library
   - Procure por "Google Drive API"
   - Clique em "Enable"

4. Crie uma Service Account:
   - Menu > APIs & Services > Credentials
   - Clique em "Create Credentials" > "Service Account"
   - Preencha os dados e clique em "Create"

5. Baixe o arquivo JSON:
   - Clique na service account criada
   - Vá em "Keys" > "Add Key" > "Create new key"
   - Escolha "JSON" e clique em "Create"
   - O arquivo será baixado automaticamente

6. Compartilhe a pasta do Google Drive:
   - Abra o Google Drive
   - Encontre a pasta "BRANDAO CONTABILIDADE"
   - Clique com botão direito > "Compartilhar"
   - Adicione o email da service account (está no JSON)
   - Dê permissão de "Editor"

7. Configure no .env.local:
   - Abra o arquivo JSON baixado
   - Copie TODO o conteúdo
   - Cole no .env.local no formato:
     GOOGLE_CREDENTIALS_JSON='{"type":"service_account",...}'
     (tudo em uma única linha, entre aspas simples)
""")
    print("="*70)

if __name__ == "__main__":
    print("\n🔑 CONFIGURADOR DE CREDENCIAIS DO GOOGLE DRIVE")
    print("\nEscolha uma opção:")
    print("1. Extrair credenciais do n8n")
    print("2. Instruções para criar credenciais manualmente")
    print("3. Sair")
    
    choice = input("\nOpção (1/2/3): ").strip()
    
    if choice == "1":
        extract_from_n8n()
    elif choice == "2":
        manual_setup()
    elif choice == "3":
        print("\n👋 Até logo!")
        sys.exit(0)
    else:
        print("\n❌ Opção inválida!")
        sys.exit(1)
