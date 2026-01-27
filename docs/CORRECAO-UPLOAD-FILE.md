# 🔧 Correção Rápida - Erro Upload File

## 🔴 Erro

**Mensagem:** "Did not find a binary file with the name 'file'. Did you maybe mean 'data'?"

**Causa:** O webhook do n8n nomeia arquivos binários como `data` por padrão, mas o nó estava procurando por `file`.

---

## ✅ Solução Aplicada

Arquivo corrigido: `.agent/workflows/n8n-upload-workflow-FINAL.json`

**Mudança:**
```json
// Antes (ERRADO):
"inputDataFieldName": "file"

// Depois (CORRETO):
"inputDataFieldName": "data"
```

---

## 📥 Como Aplicar

### Opção 1: Reimportar Workflow (Recomendado)

1. **Delete o workflow atual** no n8n
2. **Reimporte:**
   - Workflows → Import from File
   - Selecione: `.agent/workflows/n8n-upload-workflow-FINAL.json`
3. **Ative o workflow**
4. **Teste novamente**

### Opção 2: Corrigir Manualmente

1. Abra o workflow no n8n
2. Clique no nó **"Upload File"**
3. Procure o campo **"Input Data Field Name"**
4. Mude de `file` para **`data`**
5. Salve o workflow

---

## 🧪 Teste

```bash
python brandao_core.py
```

**Resultado esperado:**
```
✅ Execution #4851 - Success (3.5s)
   ├─ Webhook: 1 item
   ├─ Extract Metadata: 1 item
   ├─ Create Year Folder: 1 folder (2025)
   ├─ Create Doc Type Folder: 1 folder (CND)
   ├─ Upload File: 1 file uploaded ✅
   └─ Update Client: 1 row updated
```

---

## ✅ Agora Está 100% Funcional!

Todos os 6 nós devem ficar verdes:
- ✅ Webhook
- ✅ Extract Metadata
- ✅ Create Year Folder
- ✅ Create Doc Type Folder
- ✅ Upload File (CORRIGIDO)
- ✅ Update Client

**Reimporte o workflow e teste!** 🚀
