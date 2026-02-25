---
description: Workflow seguro para aplicar migrations no Supabase com backup e rollback plan.
---

# Workflow: /migrate — Supabase Migration

> Use quando precisar alterar o schema do banco de dados (adicionar coluna, nova tabela, alterar RLS, etc.)

---

## Pré-requisitos

- Acesso ao Supabase Dashboard
- SQL da migration preparado e revisado
- Ambiente de staging disponível (de preferência)

---

## Passos

### 1. Documentar a Migration

Criar arquivo em `supabase/migrations/` com nome no formato:
```
YYYYMMDD_HHMMSS_descricao_da_migration.sql
```

Exemplo: `20260225_143000_add_gemini_ai_logs.sql`

### 2. Revisar Dependências

Verificar no `CODEBASE.md`:
- Quais arquivos dependem das tabelas que serão alteradas?
- Existe algum N8N workflow que usa essa tabela?
- Existe algum API Route que precisa ser atualizado?

### 3. Testar Localmente (se disponível)

```bash
# Rodar migration local
npx supabase db push --local

# Verificar se o schema está correto
npx supabase db diff
```

### 4. Fazer Backup Mental / Anotação

Anotar o SQL de rollback ANTES de aplicar:
```sql
-- ROLLBACK: caso precise desfazer
-- ALTER TABLE core.clientes DROP COLUMN nova_coluna;
```

### 5. Aplicar em Produção

Via Supabase Dashboard:
1. Acessar: https://supabase.com/dashboard
2. Projeto → SQL Editor
3. Colar e executar o SQL
4. Verificar se não houve erros

### 6. Verificar Resultados

```sql
-- Verificar se a migration foi aplicada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'core' AND table_name = 'clientes';

-- Verificar se RLS está ativo (SEMPRE verificar!)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname IN ('core', 'audit', 'workflow');
```

### 7. Atualizar Tipos TypeScript

Se adicionou/removeu colunas, atualizar os tipos:
```bash
# Regenerar tipos do Supabase
npx supabase gen types typescript --project-id SEU_PROJECT_ID > lib/types/database.types.ts
```

### 8. Atualizar CODEBASE.md

Documentar a mudança no `CODEBASE.md` para referência futura.

---

## ⚠️ Troubleshooting Comum

| Erro | Causa | Solução |
|------|-------|---------|
| `permission denied for table` | RLS bloqueando | Verificar políticas RLS |
| `column does not exist` | Migration não aplicada | Re-aplicar ou verificar schema |
| `foreign key violation` | Dados órfãos | Limpar dados antes da constraint |
| Build falha após migration | Tipos desatualizados | Regenerar tipos TypeScript |
