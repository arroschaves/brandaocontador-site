# 📁 Organização Automática por Pastas - Workflow FINAL

## 🎯 Objetivo

Organizar arquivos automaticamente em pastas por **Ano** e **Tipo de Documento**.

### Estrutura Criada Automaticamente:

```
📁 EDUARDO BASSO (pasta do cliente)
   └─ 📁 2025 (ano extraído do path)
       ├─ 📁 CND
       │   ├─ 📄 certidao-federal.pdf
       │   └─ 📄 certidao-estadual.pdf
       ├─ 📁 CND_ESTADUAL
       │   └─ 📄 cnd-sefaz.pdf
       ├─ 📁 ITR
       │   └─ 📄 itr-2025.pdf
       ├─ 📁 JUNTA_COMERCIAL
       │   ├─ 📄 contrato-social.pdf
       │   └─ 📄 alteracao-contratual.pdf
       ├─ 📁 NFE_XML
       │   ├─ 📄 nota-001.xml
       │   └─ 📄 nota-002.xml
       └─ 📁 CERTIFICADO_DIGITAL
           └─ 📄 certificado.pem
```

---

## 🔄 Como Funciona (6 Nós)

```
┌──────────┐   ┌─────────────────┐   ┌─────────────────┐
│ Webhook  │──▶│ Extract         │──▶│ Create Year     │
└──────────┘   │ Metadata        │   │ Folder (2025)   │
               └─────────────────┘   └─────────────────┘
                                              │
                                              ▼
               ┌─────────────────┐   ┌─────────────────┐
               │ Upload File     │◀──│ Create Doc Type │
               │ to Folder       │   │ Folder (CND)    │
               └─────────────────┘   └─────────────────┘
                        │
                        ▼
               ┌─────────────────┐
               │ Update Client   │
               │ (Supabase)      │
               └─────────────────┘
```

### Nó 1: Webhook
Recebe o arquivo e metadados do Python.

### Nó 2: Extract Metadata (JavaScript)
Extrai:
- **Ano** do path (ex: "2025")
- **Tipo de documento** (ex: "CND", "ITR")
- **ID da pasta raiz** do cliente

### Nó 3: Create Year Folder
Cria ou encontra a pasta do ano (ex: "2025").

### Nó 4: Create Doc Type Folder
Cria ou encontra a pasta do tipo de documento (ex: "CND").

### Nó 5: Upload File
Faz upload do arquivo para a pasta do tipo de documento.

### Nó 6: Update Client
Atualiza o campo `last_sync` no Supabase.

---

## 📥 Como Importar

1. **Delete o workflow anterior** (v2 ou v3)
2. **Importe o novo:**
   - Workflows → Import from File
   - Selecione: `.agent/workflows/n8n-upload-workflow-FINAL.json`
3. **Ative o workflow**
4. **Copie a nova URL** do webhook
5. **Atualize no Python** (se necessário)

---

## 🧪 Teste

### 1. Rode o Python:

```bash
python brandao_core.py
```

### 2. Verifique no Google Drive:

```
📁 Brandão Contabilidade CRM
   └─ 📁 EDUARDO BASSO
       └─ 📁 2025
           ├─ 📁 CND (criada automaticamente)
           ├─ 📁 ITR (criada automaticamente)
           └─ 📁 JUNTA_COMERCIAL (criada automaticamente)
```

### 3. Verifique no n8n (Executions):

```
✅ Execution #4850 - Success (3.2s)
   ├─ Webhook: 1 item
   ├─ Extract Metadata: 1 item
   ├─ Create Year Folder: 1 folder (2025)
   ├─ Create Doc Type Folder: 1 folder (CND)
   ├─ Upload File: 1 file uploaded
   └─ Update Client: 1 row updated
```

---

## 🔍 Tipos de Documentos Suportados

O sistema classifica automaticamente em 15 tipos:

| Tipo | Descrição | Exemplo de Arquivo |
|------|-----------|-------------------|
| `CND` | Certidões genéricas | certidao.pdf |
| `CND_ESTADUAL` | Certidões estaduais (SEFAZ) | cnd-sefaz.pdf |
| `CND_FEDERAL` | Certidões federais (Receita) | cnd-federal.pdf |
| `CND_MUNICIPAL` | Certidões municipais | cnd-prefeitura.pdf |
| `CND_FGTS` | Certidões FGTS | cnd-fgts.pdf |
| `ITR` | Imposto Territorial Rural | itr-2025.pdf |
| `CCIR` | Certificado de Cadastro de Imóvel Rural | ccir.pdf |
| `CAEPF` | Cadastro de Atividade Econômica | caepf.pdf |
| `INCRA` | Documentos do INCRA | nirf.pdf |
| `CERTIFICADO_DIGITAL` | Certificados digitais | certificado.pem |
| `NFE_XML` | Notas fiscais XML | nota-001.xml |
| `NOTA_FISCAL` | Notas fiscais PDF | nfe.pdf |
| `JUNTA_COMERCIAL` | Documentos da Junta | contrato-social.pdf |
| `OUTROS` | Outros documentos | documento.pdf |

---

## 🎨 Personalização (Opcional)

### Mudar a Estrutura de Pastas

Se quiser uma estrutura diferente, edite o nó **"Extract Metadata"**:

**Exemplo 1: Sem pasta de ano (direto por tipo)**
```javascript
return {
  json: {
    doc_type: docType,
    root_folder_id: driveFolderId,
    file_name: $json.body.file_name,
    client_id: $json.body.client_id
  }
};
```

Depois **delete o nó "Create Year Folder"** e conecte direto:
```
Webhook → Extract → Create Doc Type → Upload → Update
```

**Exemplo 2: Adicionar mês (Ano/Mês/Tipo)**
```javascript
const date = new Date();
const year = date.getFullYear().toString();
const month = (date.getMonth() + 1).toString().padStart(2, '0');

return {
  json: {
    year: year,
    month: month,
    doc_type: docType,
    // ...
  }
};
```

Adicione um nó **"Create Month Folder"** entre Year e Doc Type.

---

## 🚨 Troubleshooting

### Erro: "Folder already exists"

**Não é um erro!** O Google Drive retorna a pasta existente se ela já foi criada.

### Pastas Duplicadas

**Causa:** O Google Drive permite pastas com o mesmo nome.

**Solução:** O n8n cria uma nova pasta se não encontrar. Para evitar duplicatas, use a operação **"Get or Create"** (se disponível na sua versão do n8n).

### Arquivos Ainda Soltos

**Causa:** O workflow antigo ainda está ativo.

**Solução:**
1. Desative TODOS os workflows antigos
2. Ative APENAS o workflow FINAL
3. Teste novamente

---

## 📊 Comparação: Antes vs Depois

### Antes (v3):
```
📁 EDUARDO BASSO
   ├─ 📄 certidao.pdf
   ├─ 📄 itr.pdf
   ├─ 📄 contrato.pdf
   └─ 📄 nota.xml
```
❌ Tudo solto, difícil de encontrar

### Depois (FINAL):
```
📁 EDUARDO BASSO
   └─ 📁 2025
       ├─ 📁 CND
       │   └─ 📄 certidao.pdf
       ├─ 📁 ITR
       │   └─ 📄 itr.pdf
       ├─ 📁 JUNTA_COMERCIAL
       │   └─ 📄 contrato.pdf
       └─ 📁 NFE_XML
           └─ 📄 nota.xml
```
✅ Organizado, fácil de navegar

---

## ✅ Checklist

Antes de rodar em produção:

- [ ] Workflow FINAL importado
- [ ] Workflows antigos desativados
- [ ] Workflow FINAL ativado
- [ ] URL do webhook atualizada (se mudou)
- [ ] Teste com Python passou
- [ ] Pastas criadas automaticamente
- [ ] Arquivos organizados por tipo
- [ ] Supabase atualizado

---

## 🎯 Resultado Final

Após rodar `python brandao_core.py`, você terá:

```
📁 Brandão Contabilidade CRM
   ├─ 📁 EDUARDO BASSO
   │   └─ 📁 2025
   │       ├─ 📁 CND (3 arquivos)
   │       ├─ 📁 ITR (1 arquivo)
   │       └─ 📁 JUNTA_COMERCIAL (5 arquivos)
   ├─ 📁 MG PETS
   │   └─ 📁 2025
   │       ├─ 📁 CCIR (1 arquivo)
   │       └─ 📁 CERTIFICADO_DIGITAL (2 arquivos)
   └─ 📁 AROLDO CORREA PF
       └─ 📁 2025
           ├─ 📁 CAEPF (1 arquivo)
           └─ 📁 NFE_XML (324 arquivos)
```

**Tudo organizado automaticamente! 🎉**
