from google_auth_oauthlib.flow import InstalledAppFlow
import json

# Recriando o arquivo credentials.json com o conteúdo correto fornecido
client_config = {
    "installed": {
        "client_id": "1066192034288-ru9s5i9ofkm4a44omv6u38c24a9n5847.apps.googleusercontent.com",
        "project_id": "brandao-site",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_secret": "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",
        "redirect_uris": ["http://localhost"]
    }
}

with open('credentials.json', 'w') as f:
    json.dump(client_config, f)

SCOPES = ['https://www.googleapis.com/auth/drive']
flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
auth_url, _ = flow.authorization_url(prompt='consent')

print("\n\n🔗 CLIQUE AQUI PARA AUTORIZAR:")
print(auth_url)
print("\n")
