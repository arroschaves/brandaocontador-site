# Guia Visual: Configuração dos Nós n8n

## 🎯 Objetivo

Criar um workflow de 3 nós que recebe arquivos do Python e envia para o Google Drive.

---

## 📋 Configuração Passo a Passo

### Nó 1: Webhook

```
┌─────────────────────────────────────┐
│         WEBHOOK SETTINGS            │
├─────────────────────────────────────┤
│ HTTP Method: POST                   │
│ Path: upload-brandao                │
│                                     │
│ ⚙️ Options:                         │
│   Binary Property Name: (vazio)     │
│                                     │
│ 📝 Webhook URL será:                │
│ https://n8n.../webhook/upload-...   │
└─────────────────────────────────────┘
```

**O que este nó recebe:**
- `file` → Arquivo binário (PDF, XML, etc)
- `body.file_name` → Nome do arquivo
- `body.doc_type` → Tipo do documento (CND, ITR, etc)
- `body.client_id` → UUID do cliente
- `body.drive_folder_id` → ID da pasta no Drive
- `body.path` → Caminho completo

---

### Nó 2: Google Drive - Upload File

```
┌─────────────────────────────────────┐
│      GOOGLE DRIVE - UPLOAD          │
├─────────────────────────────────────┤
│ Resource: File                      │
│ Operation: Upload                   │
│                                     │
│ 📄 File Name:                       │
│ {{ $json.body.file_name }}          │
│                                     │
│ 📁 Parent Drive:                    │
│ My Drive                            │
│                                     │
│ 📂 Parent Folder (By ID):           │
│ {{ $json.body.drive_folder_id }}    │
│                                     │
│ 🔧 Binary Property:                 │
│ file                                │
│                                     │
│ ✅ Credentials:                     │
│ Google Drive account                │
└─────────────────────────────────────┘
```

**Campos importantes:**

| Campo | Valor | Explicação |
|-------|-------|------------|
| **File Name** | `{{ $json.body.file_name }}` | Nome vem do Python |
| **Parent Folder** | `{{ $json.body.drive_folder_id }}` | ID da pasta vem do Python |
| **Binary Property** | `file` | Nome do campo binário (padrão) |

---

### Nó 3: Supabase - Update

```
┌─────────────────────────────────────┐
│        SUPABASE - UPDATE            │
├─────────────────────────────────────┤
│ Operation: Update                   │
│ Table: clientes                     │
│                                     │
│ 🔍 Filter Type: Manual              │
│                                     │
│ Matching Columns:                   │
│   • id                              │
│                                     │
│ 📝 Values to Send:                  │
│   Column: id                        │
│   Value: {{ $json.body.client_id }} │
│                                     │
│   Column: last_sync                 │
│   Value: {{ $now.toISO() }}         │
│                                     │
│ ✅ Credentials:                     │
│ Supabase account                    │
└─────────────────────────────────────┘
```

**O que este nó faz:**
- Busca o cliente pelo `id`
- Atualiza o campo `last_sync` com a data/hora atual
- Marca que o cliente teve arquivos sincronizados

---

## 🔗 Conexões Entre Nós

```
Webhook
   │
   │ Passa:
   │ • $json.body.file_name
   │ • $json.body.drive_folder_id
   │ • $json.body.client_id
   │ • $binary.file (arquivo)
   ▼
Google Drive Upload
   │
   │ Passa:
   │ • $json.body.client_id (ainda disponível)
   │ • $json.id (ID do arquivo no Drive)
   ▼
Supabase Update
```

---

## 🎨 Layout Visual no n8n

```
     ┌─────────┐
     │ Webhook │
     └────┬────┘
          │
          │ 220px
          ▼
  ┌───────────────┐
  │ Upload Drive  │
  └───────┬───────┘
          │
          │ 220px
          ▼
  ┌───────────────┐
  │ Update Client │
  └───────────────┘
```

**Posições sugeridas:**
- Webhook: `[240, 300]`
- Upload Drive: `[460, 300]`
- Update Client: `[680, 300]`

---

## 🧪 Teste de Cada Nó

### Teste do Webhook

**1. Ative o workflow**
**2. Copie a URL do webhook**
**3. Teste com curl:**

```bash
curl -X POST "https://seu-n8n.com/webhook/upload-brandao" \
  -F "file=@test.pdf" \
  -F "file_name=test.pdf" \
  -F "doc_type=CND" \
  -F "client_id=67807290-bc7f-4387-ad44-3d511b654efe" \
  -F "drive_folder_id=1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP"
```

**Resultado esperado:**
```json
{
  "body": {
    "file_name": "test.pdf",
    "doc_type": "CND",
    "client_id": "67807290-bc7f-4387-ad44-3d511b654efe",
    "drive_folder_id": "1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP"
  }
}
```

### Teste do Google Drive

**Clique em "Execute Node"**

**Resultado esperado:**
- ✅ Nó fica verde
- ✅ Arquivo aparece no Google Drive
- ✅ Output mostra: `{ "id": "1ABC...", "name": "test.pdf" }`

**Se der erro:**
- ❌ "The item has no binary field 'file'" → Webhook não recebeu arquivo
- ❌ "Invalid folder ID" → `drive_folder_id` está errado
- ❌ "Insufficient permissions" → Credenciais do Google Drive

### Teste do Supabase

**Clique em "Execute Node"**

**Resultado esperado:**
- ✅ Nó fica verde
- ✅ No Supabase, campo `last_sync` do cliente foi atualizado

**Se der erro:**
- ❌ "Row not found" → `client_id` não existe na tabela
- ❌ "Column does not exist" → Campo `last_sync` não existe
- ❌ "Insufficient permissions" → Credenciais do Supabase

---

## 🔧 Configuração de Credenciais

### Google Drive OAuth2

1. Vá em **Settings** → **Credentials**
2. Clique em **"Add Credential"**
3. Selecione **"Google Drive OAuth2 API"**
4. Preencha:
   - **Client ID**: (do Google Cloud Console)
   - **Client Secret**: (do Google Cloud Console)
5. Clique em **"Connect my account"**
6. Autorize o acesso

### Supabase API

1. Vá em **Settings** → **Credentials**
2. Clique em **"Add Credential"**
3. Selecione **"Supabase API"**
4. Preencha:
   - **Host**: `https://seu-projeto.supabase.co`
   - **Service Role Secret**: (da página Settings do Supabase)

---

## 📊 Monitoramento

### Ver Execuções

1. Vá em **Executions** (menu lateral)
2. Veja lista de execuções recentes
3. Clique em uma execução para ver detalhes

### Logs de Sucesso

```
✅ Execution #1234
   ├─ Webhook: 1 item
   ├─ Upload Drive: 1 item (file uploaded)
   └─ Update Client: 1 item (row updated)
   
Duration: 2.3s
```

### Logs de Erro

```
❌ Execution #1235
   ├─ Webhook: 1 item
   └─ Upload Drive: ERROR
      └─ The item has no binary field 'file'
```

---

## 🚨 Erros Comuns e Soluções

| Erro | Causa | Solução |
|------|-------|---------|
| "Binary field not found" | Python não enviou arquivo | Verifique `files={'file': ...}` |
| "Cannot read property 'file_name'" | Campo não existe no body | Verifique `data={"file_name": ...}` |
| "Invalid folder ID" | ID da pasta errado | Verifique no Google Drive |
| "Insufficient permissions" | Credenciais sem acesso | Reautorize no n8n |
| "Row not found" | Cliente não existe | Verifique UUID no Supabase |

---

## ✅ Checklist Final

Antes de rodar em produção:

- [ ] Webhook ativo e URL copiada
- [ ] URL do webhook configurada no Python (`WEBHOOK_UPLOAD`)
- [ ] Credenciais do Google Drive funcionando
- [ ] Credenciais do Supabase funcionando
- [ ] Teste manual com curl passou
- [ ] Teste com Python passou
- [ ] Arquivo apareceu no Drive
- [ ] Campo `last_sync` foi atualizado
- [ ] Logs do n8n mostram sucesso
