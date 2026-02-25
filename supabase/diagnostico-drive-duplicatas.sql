-- ============================================================
-- DIAGNÓSTICO DE PASTAS DUPLICADAS NO GOOGLE DRIVE
-- Brandão Contabilidade CRM
-- Data: 2026-02-25
-- 
-- INSTRUÇÕES:
-- 1. Execute no Supabase SQL Editor
-- 2. Identifica clientes com problemas de drive_folder_id
-- 3. Salve o resultado para verificar manualmente no Drive
-- ============================================================

-- 1. CLIENTES SEM PASTA NO DRIVE (drive_folder_id NULL)
-- Estes são os que o AutoAutomacao deve criar pastas
SELECT 
  id,
  nome_fantasia,
  cnpj_cpf,
  email,
  drive_folder_id,
  created_at
FROM core.empresas
WHERE drive_folder_id IS NULL
ORDER BY nome_fantasia;

-- ============================================================

-- 2. CLIENTES COM PASTA CONFIGURADA (verificar no Drive se existem duplicatas)
SELECT 
  id,
  nome_fantasia,
  cnpj_cpf,
  drive_folder_id,
  'https://drive.google.com/drive/folders/' || drive_folder_id as link_drive
FROM core.empresas
WHERE drive_folder_id IS NOT NULL
ORDER BY nome_fantasia;

-- ============================================================

-- 3. VERIFICAR SE HÁ DRIVE_FOLDER_IDs DUPLICADOS (mesmo ID em 2 clientes)
SELECT 
  drive_folder_id,
  COUNT(*) as quantidade,
  ARRAY_AGG(nome_fantasia) as clientes
FROM core.empresas
WHERE drive_folder_id IS NOT NULL
GROUP BY drive_folder_id
HAVING COUNT(*) > 1;

-- ============================================================

-- 4. CLIENTES CRIADOS RECENTEMENTE (últimas 48h) - possíveis vítimas do bug
SELECT 
  id,
  nome_fantasia,
  cnpj_cpf,
  drive_folder_id,
  created_at
FROM core.empresas
WHERE created_at > NOW() - INTERVAL '48 hours'
ORDER BY created_at DESC;

-- ============================================================

-- 5. RESUMO GERAL DO STATUS
SELECT 
  COUNT(*) FILTER (WHERE drive_folder_id IS NULL) as sem_pasta_drive,
  COUNT(*) FILTER (WHERE drive_folder_id IS NOT NULL) as com_pasta_drive,
  COUNT(*) as total_clientes
FROM core.empresas;
