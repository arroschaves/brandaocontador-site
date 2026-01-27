# Correção do Workflow n8n - Upload Brandão

## 🔴 Problemas Identificados no Workflow Original

### 1. Nó "Normalize Input" (ERRO CRÍTICO)
```javascript
// ❌ ERRADO
"file_name": "={{ $binary.data.fileName }}"
```
**Problema:** `$binary.data.fileName` não existe. O nome do arquivo vem do `body`.

### 2. Nó "Get Client (Supabase)" (DESNECESSÁRIO)
- Não tem filtros configurados
- Python já envia `client_id` e `drive_folder_id`
- Buscar no Supabase é redundante

### 3. Nó "Extract Year" (LÓGICA QUEBRADA)
```javascript
// ❌ ERRADO
const pathString = $json.path;
```
**Problema:** `$json.path` não existe neste ponto do fluxo.

### 4. Nó "Create/Get Year Folder" (COMPLEXIDADE DESNECESSÁRIA)
- Python já envia `drive_folder_id` correto
- Não precisa criar subpastas dinamicamente

---

## ✅ Solução: Workflow Simplificado (3 Nós)

```
┌─────────────┐      ┌──────────────────┐      ┌────────────────┐
│  Webhook    │─────▶│ Upload to Drive  │─────▶│ Update Client  │
└─────────────┘      └──────────────────┘      └────────────────┘
```

### Fluxo Correto:

1. **Webhook** recebe:
   - `file` (binário)
   - `body.file_name` (string)
   - `body.doc_type` (string)
   - `body.client_id` (UUID)
   - `body.drive_folder_id` (string)
   - `body.path` (string)

2. **Upload to Drive** usa:
   - **File Name**: `{{ $json.body.file_name }}`
   - **Parent Folder**: `{{ $json.body.drive_folder_id }}`
   - **Binary Data**: `file` (padrão)

3. **Update Client** marca:
   - **Table**: `clientes`
   - **ID**: `{{ $json.body.client_id }}`
   - **Field**: `last_sync = now()`

---

## 📥 Como Importar o Workflow Corrigido

### Opção 1: Importar JSON (Recomendado)

1. Abra o n8n
2. Clique em **"Workflows"** → **"Import from File"**
3. Selecione: `.agent/workflows/n8n-upload-workflow-fixed.json`
4. Clique em **"Import"**
5. **Ative o workflow**

### Opção 2: Criar Manualmente

#### Nó 1: Webhook
- **HTTP Method**: POST
- **Path**: `upload-brandao`
- **Binary Property Name**: (deixe vazio, padrão é `file`)

#### Nó 2: Google Drive - Upload File
- **Operation**: Upload
- **File Name**: `{{ $json.body.file_name }}`
- **Parent Drive**: My Drive
- **Parent Folder (By ID)**: `{{ $json.body.drive_folder_id }}`
- **Binary Property**: `file`

#### Nó 3: Supabase - Update
- **Operation**: Update
- **Table**: `clientes`
- **Filter Type**: Manual
- **Matching Columns**: `id`
- **Values**:
  - `id`: `{{ $json.body.client_id }}`
  - `last_sync`: `{{ $now.toISO() }}`

---

## 🧪 Como Testar

### 1. Ative o Workflow no n8n

### 2. Rode o Python:
```bash
python brandao_core.py
```

### 3. Verifique os Logs:
- ✅ Terminal Python: "✅ Sucesso: [nome_arquivo]"
- ✅ n8n: Execução verde
- ✅ Google Drive: Arquivo aparece na pasta
- ✅ Supabase: Campo `last_sync` atualizado

---

## 🔧 Troubleshooting

### Erro: "The item has no binary field 'file'"

**Causa:** O Python não está enviando o arquivo corretamente.

**Solução:**
```python
# Verifique em brandao_sync.py linha ~179
files={'file': (filename, f, 'application/octet-stream')}
```

### Erro: "Invalid folder ID"

**Causa:** `drive_folder_id` está vazio ou inválido.

**Solução:**
```python
# Verifique em brandao_sync.py linha ~188
"drive_folder_id": target_client.get("drive_folder_id") or "1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP"
```

### Erro: "Cannot read property 'file_name'"

**Causa:** Webhook não está recebendo `body.file_name`.

**Solução:** Certifique-se que o Python envia:
```python
data={
    "file_name": filename,
    "client_id": target_client["id"],
    "drive_folder_id": target_client.get("drive_folder_id") or "..."
}
```

---

## 📊 Comparação: Antes vs Depois

| Aspecto | Workflow Original | Workflow Corrigido |
|---------|-------------------|-------------------|
| **Nós** | 7 nós | 3 nós |
| **Código JS** | 1 nó de código | 0 nós de código |
| **Consultas Supabase** | 2 (Get + Update) | 1 (Update) |
| **Complexidade** | Alta | Baixa |
| **Pontos de Falha** | 6 | 2 |
| **Manutenibilidade** | Difícil | Fácil |

---

## ✅ Checklist de Validação

Antes de marcar como resolvido, confirme:

- [ ] Workflow importado no n8n
- [ ] Webhook ativo e com URL correta
- [ ] Credenciais do Google Drive configuradas
- [ ] Credenciais do Supabase configuradas
- [ ] Python rodando sem erros
- [ ] Arquivo aparece no Google Drive
- [ ] Campo `last_sync` atualizado no Supabase
- [ ] Logs mostram "✅ Sucesso"

---

## 🎯 Próximos Passos

Após confirmar que o upload funciona:

1. **Adicionar validação de duplicatas** (opcional)
2. **Criar notificações** (email/Slack quando upload completa)
3. **Dashboard de monitoramento** (quantos arquivos/dia)
4. **Backup automático** (cópia para outro Drive)
