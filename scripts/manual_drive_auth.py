#!/usr/bin/env python3
"""
Autenticação Manual do Google Drive
Gera link e aceita código manualmente
"""

import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

SCOPES = ['https://www.googleapis.com/auth/drive']
TOKEN_PATH = 'token_drive.pickle'
CREDENTIALS_PATH = 'credentials.json'

print("🔐 Autenticação Manual do Google Drive\n")

# Cria o fluxo OAuth
flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)

# Gera URL de autorização
auth_url, _ = flow.authorization_url(
    access_type='offline',
    include_granted_scopes='true',
    prompt='consent'
)

print("=" * 80)
print("PASSO 1: Copie este link e abra no navegador (Chrome/Firefox):")
print("=" * 80)
print(auth_url)
print("=" * 80)
print("\nPASSO 2: Faça login e autorize o acesso")
print("PASSO 3: Você será redirecionado para uma página de erro (NORMAL!)")
print("PASSO 4: Copie TODO o URL da barra de endereços (começa com http://localhost...)")
print("\n")

# Aguarda o usuário colar o URL completo
redirect_response = input("Cole aqui o URL completo e pressione ENTER:\n").strip()

# Extrai o código do URL
flow.fetch_token(authorization_response=redirect_response)

# Salva as credenciais
creds = flow.credentials
with open(TOKEN_PATH, 'wb') as token:
    pickle.dump(creds, token)

print("\n✅ Autenticação concluída com sucesso!")
print(f"✅ Token salvo em: {TOKEN_PATH}")
print("\nAgora você pode rodar o inspector_gadget.py normalmente.")
