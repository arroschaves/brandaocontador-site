# 🔧 Correção do Erro "Carregar para o Drive"

## 🔴 Problema Identificado

O nó do Google Drive não está conseguindo ler o arquivo binário enviado pelo Python.

**Erro:** "Problema no nó 'Carregar para o Drive'"

**Causa:** Falta configurar o campo `inputDataFieldName` no nó do Google Drive.

---

## ✅ Solução Rápida (2 Opções)

### Opção 1: Importar Workflow Corrigido v2 (Recomendado)

1. **Delete o workflow atual** no n8n
2. **Importe o novo:**
   - Workflows → Import from File
   - Selecione: `.agent/workflows/n8n-upload-workflow-fixed-v2.json`
3. **Ative o workflow**
4. **Teste novamente:** `python brandao_core.py`

---

### Opção 2: Corrigir Manualmente (Se preferir)

#### No nó "Upload to Drive":

1. Clique no nó **"Upload to Drive"**
2. Role até encontrar **"Input Data Field Name"**
3. Digite: **`data`**
4. Salve o workflow
5. Teste novamente

**Configuração completa do nó:**
```
Resource: File
Operation: Upload
File Name: {{ $json.body.file_name }}
Input Data Field Name: data  ← ADICIONE ISTO
Parent Drive: My Drive
Parent Folder (By ID): {{ $json.body.drive_folder_id }}
```

---

## 🧪 Como Testar

### 1. Teste Manual com Curl (Antes do Python)

```bash
curl -X POST "https://webhook.brandaocontador.com.br/webhook/upload-brandao" \
  -F "file=@C:\Users\Alessandro\Documents\test.pdf" \
  -F "file_name=test.pdf" \
  -F "doc_type=CND" \
  -F "client_id=67807290-bc7f-4387-ad44-3d511b654efe" \
  -F "drive_folder_id=1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP"
```

**Resultado esperado:**
- ✅ Workflow fica verde no n8n
- ✅ Arquivo aparece no Google Drive
- ✅ Campo `last_sync` atualizado

### 2. Teste com Python

```bash
python brandao_core.py
```

**Resultado esperado:**
```
✅ Sucesso: impressaoDae-scam.pdf
✅ Sucesso: CND.pdf
...
```

---

## 🔍 Verificação de Dados

### No n8n (Aba "Executions"):

**Webhook (Input):**
```json
{
  "headers": {...},
  "body": {
    "file_name": "impressaoDae-scam.pdf",
    "doc_type": "JUNTA_COMERCIAL",
    "client_id": "67807290-bc7f-4387-ad44-3d511b654efe",
    "drive_folder_id": "67807290-bc7f-4387-ad44-3d511b654efe",
    "path": "MG PETS/2025/DOCUMENTOS_PERMANENTES/JUNTA_COMERCIAL"
  },
  "files": {
    "file": {
      "data": "...",  ← ARQUIVO BINÁRIO
      "fileName": "impressaoDae-scam.pdf",
      "mimeType": "application/pdf"
    }
  }
}
```

**Upload to Drive (Output):**
```json
{
  "id": "1ABC123...",
  "name": "impressaoDae-scam.pdf",
  "mimeType": "application/pdf",
  "webViewLink": "https://drive.google.com/file/d/..."
}
```

---

## 🚨 Se Ainda Der Erro

### Erro: "The item has no binary field 'data'"

**Solução:** O n8n não está reconhecendo o arquivo.

**Verifique:**
1. No nó Webhook, vá em **Settings** (aba)
2. Em **"Binary Property"**, deixe vazio (padrão)
3. Salve e teste novamente

### Erro: "Cannot read property 'file_name'"

**Solução:** O Python não está enviando os campos corretamente.

**Verifique em `brandao_sync.py` linha ~152:**
```python
resp = requests.post(WEBHOOK_UPLOAD, 
    files={'file': (filename, f, 'application/octet-stream')},
    data={
        "file_name": filename,  # ← Deve estar aqui
        "doc_type": item.get("doc_type", "OUTROS"),
        "client_id": target_client["id"],
        "drive_folder_id": target_client.get("drive_folder_id") or "...",
        "path": target_path
    }, 
    timeout=120)
```

### Erro: "Invalid folder ID"

**Solução:** O `drive_folder_id` está vazio ou inválido.

**Teste no Supabase:**
```sql
SELECT nome, drive_folder_id 
FROM clientes 
WHERE id = '67807290-bc7f-4387-ad44-3d511b654efe';
```

Se estiver vazio, o Python usa o fallback: `1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP`

---

## 📊 Diferenças Entre v1 e v2

| Aspecto | Workflow v1 | Workflow v2 (Corrigido) |
|---------|-------------|-------------------------|
| **Webhook Response Mode** | lastNode | onReceived |
| **Webhook Raw Body** | (padrão) | false (explícito) |
| **Drive Input Field** | (vazio) | `data` |
| **Supabase Reference** | `$json.body.client_id` | `$node['Webhook'].json.body.client_id` |

---

## ✅ Checklist de Validação

Antes de rodar em produção:

- [ ] Workflow v2 importado
- [ ] Nó "Upload to Drive" tem `inputDataFieldName: data`
- [ ] Webhook ativo
- [ ] Teste com curl passou
- [ ] Teste com Python passou
- [ ] Arquivo apareceu no Drive
- [ ] Campo `last_sync` atualizado
- [ ] Logs do n8n verdes

---

## 🎯 Próximo Passo

**Importe o workflow v2 e teste novamente!**

Se ainda der erro, me envie:
1. Screenshot da execução do n8n (aba Executions)
2. Logs do Python (últimas 20 linhas)
3. Configuração do nó "Upload to Drive"
