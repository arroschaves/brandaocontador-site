# 🔧 Correção do Erro Supabase

## 🔴 Problema

**Erro:** "No rows were added (condition must be defined)"

**Causa:** O nó do Supabase está usando `matchingColumns` mas a sintaxe correta para a versão 1 do nó é usar `filters` com `conditions`.

---

## ✅ Solução (2 Opções)

### Opção 1: Importar Workflow v3 (Recomendado)

1. **Delete o workflow v2** no n8n
2. **Importe o novo:**
   - Workflows → Import from File
   - Selecione: `.agent/workflows/n8n-upload-workflow-fixed-v3.json`
3. **Ative o workflow**
4. **Teste novamente**

---

### Opção 2: Corrigir Manualmente

#### No nó "Update Client" (Supabase):

**Configuração Correta:**

```
Operation: Update
Table: clientes

Filter Type: Manual

Filters:
  └─ Conditions:
      └─ Condition 1:
          Key Name: id
          Condition: eq
          Key Value: {{ $node['Webhook'].json.body.client_id }}

Fields:
  └─ Field Values:
      └─ Field 1:
          Field ID: last_sync
          Field Value: {{ $now.toISO() }}
```

**Passo a passo:**

1. Clique no nó **"Update Client"**
2. Em **"Filter Type"**, selecione: **Manual**
3. Em **"Filters"**, clique em **"Add Condition"**
4. Configure:
   - **Key Name**: `id`
   - **Condition**: `eq` (equals)
   - **Key Value**: `{{ $node['Webhook'].json.body.client_id }}`
5. Em **"Fields"**, clique em **"Add Field"**
6. Configure:
   - **Field ID**: `last_sync`
   - **Field Value**: `{{ $now.toISO() }}`
7. **Salve** o workflow

---

## 🧪 Como Testar

### 1. Teste Manual (Antes do Python)

No n8n, clique em **"Execute Workflow"** e envie um teste:

```bash
curl -X POST "https://webhook.brandaocontador.com.br/webhook/upload-brandao" \
  -F "file=@C:\Users\Alessandro\Documents\test.pdf" \
  -F "file_name=test.pdf" \
  -F "doc_type=CND" \
  -F "client_id=67807290-bc7f-4387-ad44-3d511b654efe" \
  -F "drive_folder_id=67807290-bc7f-4387-ad44-3d511b654efe"
```

**Resultado esperado:**
- ✅ Webhook: verde
- ✅ Upload to Drive: verde
- ✅ Update Client: verde

### 2. Verifique no Supabase

```sql
SELECT nome, last_sync 
FROM clientes 
WHERE id = '67807290-bc7f-4387-ad44-3d511b654efe';
```

**Resultado esperado:**
```
nome: MG PETS
last_sync: 2026-01-26T11:10:00.000Z  ← ATUALIZADO AGORA
```

---

## 🔍 Diferenças Entre v2 e v3

| Aspecto | v2 (Erro) | v3 (Corrigido) |
|---------|-----------|----------------|
| **Filter Type** | (não definido) | Manual |
| **Matching Columns** | `["id"]` | (removido) |
| **Filters** | (não tinha) | `conditions: [id eq ...]` |
| **Data Mode** | `defineBelow` | (removido) |
| **Values to Send** | `values: [...]` | (removido) |
| **Fields UI** | (não tinha) | `fieldValues: [...]` |

---

## 📊 Verificação de Dados

### No n8n (Execução bem-sucedida):

**Update Client (Input):**
```json
{
  "body": {
    "file_name": "test.pdf",
    "client_id": "67807290-bc7f-4387-ad44-3d511b654efe",
    "drive_folder_id": "...",
    "doc_type": "CND"
  }
}
```

**Update Client (Output):**
```json
{
  "id": "67807290-bc7f-4387-ad44-3d511b654efe",
  "nome": "MG PETS",
  "last_sync": "2026-01-26T11:10:00.000Z",
  "drive_folder_id": "..."
}
```

---

## 🚨 Se Ainda Der Erro

### Erro: "Row not found"

**Causa:** O `client_id` não existe na tabela `clientes`.

**Solução:**
```sql
-- Verifique se o cliente existe:
SELECT * FROM clientes WHERE id = '67807290-bc7f-4387-ad44-3d511b654efe';

-- Se não existir, o Python deve ter logado:
-- "⏭️ Cliente não encontrado para: [arquivo]"
```

### Erro: "Column 'last_sync' does not exist"

**Causa:** A coluna não existe na tabela.

**Solução:**
```sql
-- Crie a coluna:
ALTER TABLE clientes ADD COLUMN last_sync TIMESTAMPTZ;
```

### Erro: "Insufficient permissions"

**Causa:** A chave do Supabase não tem permissão de UPDATE.

**Solução:**
1. No Supabase, vá em **Settings** → **API**
2. Copie a **service_role key** (não a anon key)
3. No n8n, atualize as credenciais do Supabase

---

## ✅ Checklist Final

Após a correção:

- [ ] Workflow v3 importado OU nó corrigido manualmente
- [ ] Teste com curl passou
- [ ] Nó "Update Client" ficou verde
- [ ] Campo `last_sync` foi atualizado no Supabase
- [ ] Teste com Python passou
- [ ] Todos os 3 nós ficam verdes

---

## 🎯 Próximo Passo

**Importe o workflow v3 ou corrija manualmente o nó do Supabase.**

Depois rode novamente:
```bash
python brandao_core.py
```

Agora sim, tudo deve ficar verde! 🚀
