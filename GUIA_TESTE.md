# Guia de Teste do Sistema Completo

## 🎯 Objetivo

Testar o sistema completo de upload e organização automática:
1. Scanner extrai metadados
2. Upload envia para n8n
3. n8n cria estrutura Cliente/Ano/Mês/TipoDoc
4. Metadados salvos no Supabase

---

## 📋 Passo 1: Teste com 1 Arquivo

### 1.1 Escolher arquivo de teste

Escolha **1 arquivo** de um cliente conhecido. Exemplo:
- Cliente: **MG PETS**
- Arquivo: `CND_Federal_venc_2026-07-15.pdf` (certidão)
- Ou: `Folha_Janeiro_2026.pdf` (folha de pagamento)

### 1.2 Executar scanner

```powershell
python brandao_core.py
```

**Resultado esperado:**
- Scanner encontra o arquivo
- Extrai metadados (ano, mês, vencimento/competência)
- Salva em `automation_report.json`

### 1.3 Verificar metadados extraídos

```powershell
Get-Content public\automation_report.json | Select-String "MG PETS" -Context 5
```

**Verificar:**
- ✅ `year`: 2026
- ✅ `month`: 7 (para certidão) ou 1 (para folha)
- ✅ `expiry_date`: "2026-07-15" (para certidão)
- ✅ `competence`: "2026-01" (para folha)
- ✅ `doc_subtype`: "CERTIDOES_NEGATIVAS" ou "FOLHA_PAGAMENTO"

---

## 📋 Passo 2: Verificar Upload no Google Drive

### 2.1 Acessar Google Drive

1. Ir para: https://drive.google.com
2. Navegar para pasta do cliente (ex: MG PETS)

### 2.2 Validar estrutura

**Estrutura esperada:**

```
📁 MG PETS
   └─ 📁 2026
       └─ 📁 07_Julho (ou 01_Janeiro)
           └─ 📁 CERTIDOES_NEGATIVAS (ou FOLHA_PAGAMENTO)
               └─ 📄 CND_Federal_venc_2026-07-15.pdf
```

**Verificar:**
- ✅ Pasta do ano criada (2026)
- ✅ Pasta do mês criada (07_Julho ou 01_Janeiro)
- ✅ Pasta do tipo criada (CERTIDOES_NEGATIVAS ou FOLHA_PAGAMENTO)
- ✅ Arquivo está na pasta correta

---

## 📋 Passo 3: Verificar Metadados no Supabase

### 3.1 Acessar Supabase

1. Ir para: https://db.brandaocontador.com.br
2. Ir em: Table Editor → clientes

### 3.2 Buscar cliente MG PETS

```sql
SELECT 
    nome,
    ultima_certidao_vencimento,
    ultima_folha_competence,
    ultimo_upload_tipo,
    ultimo_upload_data
FROM clientes
WHERE nome = 'MG PETS';
```

**Verificar:**
- ✅ `ultima_certidao_vencimento`: "2026-07-15" (se foi certidão)
- ✅ `ultima_folha_competence`: "2026-01" (se foi folha)
- ✅ `ultimo_upload_data`: timestamp recente

---

## 📋 Passo 4: Teste com Múltiplos Arquivos

Se o teste com 1 arquivo funcionou, execute com todos:

```powershell
python brandao_core.py
```

**Aguardar:**
- Scanner processa todos os arquivos
- Upload envia para n8n
- n8n organiza automaticamente

**Tempo estimado:** 5-10 minutos (dependendo da quantidade)

---

## ✅ Checklist de Validação

### Scanner
- [ ] Scanner roda sem erros
- [ ] Metadados extraídos corretamente
- [ ] `automation_report.json` gerado

### Google Drive
- [ ] Estrutura Cliente/Ano/Mês/TipoDoc criada
- [ ] Arquivos nas pastas corretas
- [ ] Sem duplicatas

### Supabase
- [ ] Metadados salvos (vencimento, competência)
- [ ] `last_sync` atualizado
- [ ] Sem erros de atualização

### CRM
- [ ] Link do Google Drive funciona
- [ ] Abre pasta correta do cliente

---

## 🐛 Troubleshooting

### Erro: "Webhook não responde"

**Solução:**
1. Verificar que workflow n8n está **ativo**
2. Verificar URL do webhook em `brandao_sync.py`

### Erro: "Pasta não criada"

**Solução:**
1. Verificar credenciais do Google Drive no n8n
2. Verificar permissões da pasta raiz

### Erro: "Metadados não salvos"

**Solução:**
1. Verificar credenciais do Supabase no n8n
2. Verificar que colunas existem no banco

---

## 📊 Resultado Esperado

Após executar tudo:

1. **Google Drive organizado:**
   - Estrutura: Cliente/Ano/Mês/TipoDoc
   - Todos os arquivos nas pastas corretas

2. **Supabase atualizado:**
   - Metadados salvos para cada cliente
   - Última sincronização registrada

3. **CRM funcionando:**
   - Link do Google Drive abre pasta correta

---

**Tempo total:** 15-30 minutos

**Próximo passo:** Consolidar arquivos antigos (Fase 4)
