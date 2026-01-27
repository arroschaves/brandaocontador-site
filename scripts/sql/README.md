# Guia de Execução - Scripts SQL de Correção

## 📋 Ordem de Execução

Execute os scripts **NESTA ORDEM** no Supabase SQL Editor:

### 1. Análise e Backup (5 min)
**Arquivo:** `01_analise_backup.sql`

**O que faz:**
- Cria backup da tabela `clientes`
- Identifica duplicatas
- Identifica nomes corrompidos (UUIDs)
- Verifica `drive_folder_id` vazios

**Como executar:**
1. Acesse: https://db.brandaocontador.com.br
2. Vá em: SQL Editor
3. Cole o conteúdo de `01_analise_backup.sql`
4. Clique em "Run"
5. **ANOTE OS RESULTADOS** (quantas duplicatas, quais nomes corrompidos)

---

### 2. Deduplicação (2 min)
**Arquivo:** `02_deduplicacao.sql`

**O que faz:**
- Remove clientes duplicados (mantém o mais antigo)

**⚠️ ATENÇÃO:** Este script **DELETA** dados! Só execute se:
- Você revisou os resultados do Script 1
- Você tem certeza que quer remover duplicatas

**Como executar:**
1. Cole o conteúdo de `02_deduplicacao.sql`
2. Clique em "Run"
3. Verifique que `total_clientes == nomes_unicos`

---

### 3. Adicionar Colunas (1 min)
**Arquivo:** `03_adicionar_colunas.sql`

**O que faz:**
- Adiciona coluna `razao_social`
- Adiciona colunas de metadados:
  - `ultima_certidao_vencimento`
  - `ultima_folha_competence`
  - `ultimo_upload_tipo`
  - `ultimo_upload_data`

**Como executar:**
1. Cole o conteúdo de `03_adicionar_colunas.sql`
2. Clique em "Run"
3. Verifique que as colunas foram criadas

---

### 4. Corrigir drive_folder_id (1 min)
**Arquivo:** `04_corrigir_drive_folder_id.sql`

**O que faz:**
- Preenche `drive_folder_id` vazios com pasta raiz padrão

**Como executar:**
1. Cole o conteúdo de `04_corrigir_drive_folder_id.sql`
2. Clique em "Run"
3. Verifique que `sem_drive_id == 0`

---

### 5. Restaurar Nomes (10-30 min)
**Arquivo:** `05_restaurar_nomes_TEMPLATE.sql`

**O que faz:**
- Restaura nomes corrompidos (UUIDs → Nomes fantasia)

**⚠️ ATENÇÃO:** Este é um **TEMPLATE**!

**Como executar:**
1. Execute a primeira query para ver nomes corrompidos
2. Para cada cliente corrompido:
   ```sql
   UPDATE clientes 
   SET nome = 'NOME_FANTASIA_CORRETO' 
   WHERE id = 'uuid-do-cliente';
   ```
3. Execute a query de verificação
4. Confirme que `ainda_corrompidos == 0`

**Dica:** Se você tiver muitos clientes corrompidos, me envie a lista e eu crio o script completo para você!

---

## ✅ Checklist de Verificação

Após executar todos os scripts:

- [ ] Backup criado (`clientes_backup` existe)
- [ ] Duplicatas removidas (total == únicos)
- [ ] Colunas de metadados adicionadas
- [ ] Todos os clientes têm `drive_folder_id`
- [ ] Nenhum nome corrompido (UUIDs)
- [ ] Link do Google Drive funciona no CRM

---

## 🔄 Rollback (Se algo der errado)

Se precisar reverter:

```sql
-- Deletar tabela atual
DROP TABLE clientes;

-- Restaurar do backup
CREATE TABLE clientes AS 
SELECT * FROM clientes_backup;

-- Verificar
SELECT COUNT(*) FROM clientes;
```

---

## 📊 Estatísticas Esperadas

**Antes:**
- Total de clientes: ~300 (com duplicatas)
- Nomes únicos: ~150
- Nomes corrompidos: ~10-20
- Sem drive_folder_id: ~50

**Depois:**
- Total de clientes: ~150 (sem duplicatas)
- Nomes únicos: ~150
- Nomes corrompidos: 0
- Sem drive_folder_id: 0

---

## 🆘 Suporte

Se encontrar algum erro:

1. **NÃO CONTINUE** executando os próximos scripts
2. Me envie:
   - Screenshot do erro
   - Qual script estava executando
   - Resultado do Script 1 (análise)
3. Eu ajudo a corrigir!

---

**Tempo total estimado:** 20-40 minutos (dependendo de quantos nomes precisam ser restaurados)
