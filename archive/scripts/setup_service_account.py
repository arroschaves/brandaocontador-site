#!/usr/bin/env python3
"""
CONFIGURADOR RÁPIDO DE SERVICE ACCOUNT
=======================================

Este script guia você passo a passo na configuração da Service Account.
"""

import os
import json
import sys

def main():
    print("\n" + "="*70)
    print("🔑 CONFIGURADOR DE SERVICE ACCOUNT - GOOGLE DRIVE")
    print("="*70)
    
    print("\n📋 PASSOS NECESSÁRIOS:\n")
    print("1. Acesse: https://console.cloud.google.com/")
    print("2. Vá em: APIs & Services > Credentials")
    print("3. Clique em: Create Credentials > Service Account")
    print("4. Preencha:")
    print("   - Nome: brandao-consolidator")
    print("   - Clique em Create and Continue")
    print("   - Role: deixe em branco ou escolha Editor")
    print("   - Clique em Done")
    print("\n5. Clique na Service Account criada")
    print("6. Vá em Keys > Add Key > Create new key")
    print("7. Escolha JSON e clique em Create")
    print("8. O arquivo JSON será baixado")
    
    print("\n" + "="*70)
    input("\n⏸️  Pressione ENTER depois de baixar o arquivo JSON...")
    
    print("\n" + "="*70)
    print("📂 LOCALIZE O ARQUIVO JSON BAIXADO")
    print("="*70)
    print("\nO arquivo deve estar em Downloads com nome tipo:")
    print("  projeto-123456-abc123def456.json")
    
    json_path = input("\n📝 Cole o caminho COMPLETO do arquivo JSON aqui: ").strip()
    json_path = json_path.replace('"', '').replace("'", '')
    
    if not os.path.exists(json_path):
        print(f"\n❌ Arquivo não encontrado: {json_path}")
        print("   Verifique o caminho e tente novamente.")
        sys.exit(1)
    
    # Ler e validar o JSON
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            credentials = json.load(f)
        
        # Validar campos obrigatórios
        required_fields = ['type', 'project_id', 'private_key', 'client_email']
        missing = [f for f in required_fields if f not in credentials]
        
        if missing:
            print(f"\n❌ Campos obrigatórios faltando no JSON: {', '.join(missing)}")
            sys.exit(1)
        
        if credentials['type'] != 'service_account':
            print("\n❌ Este não é um arquivo de Service Account válido!")
            sys.exit(1)
        
        print("\n✅ Arquivo JSON válido!")
        
        # Extrair email da service account
        service_email = credentials['client_email']
        print(f"\n📧 Email da Service Account: {service_email}")
        
        print("\n" + "="*70)
        print("🔗 COMPARTILHAR PASTA DO GOOGLE DRIVE")
        print("="*70)
        print("\nAGORA você precisa compartilhar a pasta do Drive:")
        print("\n1. Abra: https://drive.google.com/")
        print("2. Encontre a pasta: BRANDAO CONTABILIDADE")
        print("3. Clique com botão direito > Compartilhar")
        print(f"4. Cole este email: {service_email}")
        print("5. Defina permissão: Editor")
        print("6. DESMARQUE 'Notify people'")
        print("7. Clique em Compartilhar")
        
        input("\n⏸️  Pressione ENTER depois de compartilhar a pasta...")
        
        # Configurar no .env.local
        print("\n" + "="*70)
        print("⚙️  CONFIGURANDO .env.local")
        print("="*70)
        
        # Converter JSON para string de uma linha
        credentials_str = json.dumps(credentials, separators=(',', ':'))
        
        env_path = '.env.local'
        
        # Ler .env.local atual
        env_lines = []
        if os.path.exists(env_path):
            with open(env_path, 'r', encoding='utf-8') as f:
                env_lines = f.readlines()
        
        # Remover credenciais antigas do Google Drive
        env_lines = [line for line in env_lines if not line.startswith('GOOGLE_')]
        
        # Adicionar nova credencial
        if env_lines and not env_lines[-1].endswith('\n'):
            env_lines.append('\n')
        
        env_lines.append('\n# Google Drive Service Account\n')
        env_lines.append(f"GOOGLE_CREDENTIALS_JSON='{credentials_str}'\n")
        
        # Salvar
        with open(env_path, 'w', encoding='utf-8') as f:
            f.writelines(env_lines)
        
        print(f"\n✅ Configuração salva em {env_path}")
        
        print("\n" + "="*70)
        print("🎉 CONFIGURAÇÃO CONCLUÍDA!")
        print("="*70)
        print("\nAgora você pode executar:")
        print("  python scripts/consolidate_drive.py")
        print("\nO script irá:")
        print("  - Conectar automaticamente ao Google Drive")
        print("  - Escanear todas as pastas de clientes")
        print("  - Mostrar relatório de arquivos a organizar")
        print("  - SEM fazer mudanças (modo dry-run)")
        
        print("\n✨ Tudo pronto! Boa organização! ✨\n")
        
    except json.JSONDecodeError as e:
        print(f"\n❌ Erro ao ler JSON: {e}")
        print("   O arquivo não é um JSON válido.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        sys.exit(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Configuração cancelada pelo usuário.")
        sys.exit(0)
