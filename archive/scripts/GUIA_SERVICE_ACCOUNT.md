# 🔑 Guia: Criar Service Account para Google Drive

## Por que Service Account?

- ✅ **Independente do n8n** - Não afeta suas configurações existentes
- ✅ **Sem interação** - Funciona automaticamente sem login
- ✅ **Mais seguro** - Credenciais específicas para scripts
- ✅ **Fácil de gerenciar** - Um arquivo JSON com tudo

---

## 📋 Passo a Passo

### 1. Acessar Google Cloud Console

Abra: https://console.cloud.google.com/

### 2. Selecionar ou Criar Projeto

- Se já tem um projeto (provavelmente o mesmo do n8n), selecione-o
- OU crie um novo projeto clicando em "Select a project" > "New Project"

### 3. Ativar Google Drive API

1. No menu lateral, vá em: **APIs & Services** > **Library**
2. Procure por: **"Google Drive API"**
3. Clique em **"Enable"** (se já estiver ativada, pule este passo)

### 4. Criar Service Account

1. No menu lateral, vá em: **APIs & Services** > **Credentials**
2. Clique em **"Create Credentials"** (botão azul no topo)
3. Selecione: **"Service Account"**
4. Preencha:
   - **Service account name**: `brandao-consolidator` (ou outro nome)
   - **Service account ID**: (será preenchido automaticamente)
   - **Description**: `Script de consolidação do Google Drive`
5. Clique em **"Create and Continue"**
6. Em "Grant this service account access to project":
   - **Role**: Selecione **"Basic" > "Editor"** (ou deixe em branco)
   - Clique em **"Continue"**
7. Em "Grant users access to this service account":
   - Deixe em branco
   - Clique em **"Done"**

### 5. Baixar Arquivo JSON

1. Na lista de Service Accounts, clique na que você acabou de criar
2. Vá na aba **"Keys"**
3. Clique em **"Add Key"** > **"Create new key"**
4. Selecione **"JSON"**
5. Clique em **"Create"**
6. O arquivo JSON será baixado automaticamente (ex: `projeto-123456-abc123.json`)

### 6. Copiar Email da Service Account

No arquivo JSON baixado, procure o campo `client_email`. Será algo como:

```
brandao-consolidator@seu-projeto-123456.iam.gserviceaccount.com
```

**Copie este email!** Você vai precisar dele no próximo passo.

### 7. Compartilhar Pasta do Google Drive

1. Abra o Google Drive: https://drive.google.com/
2. Encontre a pasta **"BRANDAO CONTABILIDADE"** (ID: `1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP`)
3. Clique com botão direito > **"Compartilhar"** (ou "Share")
4. Cole o email da service account (do passo 6)
5. Defina permissão como **"Editor"**
6. **IMPORTANTE**: Desmarque "Notify people" (não precisa enviar email)
7. Clique em **"Share"** ou **"Compartilhar"**

### 8. Configurar no Projeto

Você tem 2 opções:

#### Opção A: Variável de Ambiente (Recomendado)

1. Abra o arquivo JSON baixado no Notepad
2. Copie **TODO** o conteúdo (deve começar com `{` e terminar com `}`)
3. Abra o arquivo `.env.local` do projeto
4. Adicione a linha:

```bash
GOOGLE_CREDENTIALS_JSON='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

**IMPORTANTE**: Cole o JSON completo em uma única linha, entre aspas simples!

#### Opção B: Arquivo JSON

1. Renomeie o arquivo baixado para `credentials.json`
2. Mova para a raiz do projeto: `e:\PROJETOS\brandaocontador-site\credentials.json`

---

## ✅ Testar

Após configurar, execute:

```bash
python scripts/consolidate_drive.py
```

Você deve ver:

```
🔑 Usando Service Account (variável de ambiente)
============================================================
🔍 MODO DRY-RUN - Nenhuma mudança será feita
============================================================

📊 Encontradas XX pastas de clientes
...
```

---

## 🆘 Troubleshooting

### Erro: "403 Forbidden"

**Solução**: Você esqueceu de compartilhar a pasta do Drive com o email da service account (passo 7).

### Erro: "Invalid JSON"

**Solução**: Verifique se copiou o JSON completo e se está entre aspas simples no `.env.local`.

### Erro: "API not enabled"

**Solução**: Ative a Google Drive API no projeto (passo 3).

---

## 📝 Notas Importantes

- ✅ A Service Account **NÃO afeta** suas credenciais do n8n
- ✅ Você pode ter múltiplas credenciais no mesmo projeto
- ✅ O arquivo JSON contém a chave privada - **NÃO compartilhe** com ninguém
- ✅ Adicione `credentials.json` e `token.pickle` no `.gitignore`

---

## 🔗 Links Úteis

- Google Cloud Console: https://console.cloud.google.com/
- Documentação Service Accounts: https://cloud.google.com/iam/docs/service-accounts
- Google Drive API: https://developers.google.com/drive/api/guides/about-sdk
