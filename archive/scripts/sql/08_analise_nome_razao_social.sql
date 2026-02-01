-- ========================================
-- SCRIPT DE ANÁLISE: NOME vs RAZÃO SOCIAL
-- Identifica problemas e inconsistências
-- ========================================

-- 1. Ver TODOS os clientes com nome e razão social
SELECT 
    id,
    nome,
    razao_social,
    CASE 
        WHEN nome IS NULL THEN '🔴 NOME_VAZIO'
        WHEN razao_social IS NULL THEN '🟡 SEM_RAZAO_SOCIAL'
        WHEN nome = razao_social THEN '🟠 NOME_IGUAL_RAZAO'
        WHEN UPPER(nome) = UPPER(razao_social) THEN '🟠 NOME_IGUAL_RAZAO_CASE'
        ELSE '✅ OK'
    END as status,
    drive_folder_id,
    email
FROM clientes
ORDER BY 
    CASE 
        WHEN nome IS NULL THEN 1
        WHEN nome = razao_social THEN 2
        WHEN razao_social IS NULL THEN 3
        ELSE 4
    END,
    nome;

-- 2. Estatísticas de problemas
SELECT 
    SUM(CASE WHEN nome IS NULL THEN 1 ELSE 0 END) as nomes_vazios,
    SUM(CASE WHEN razao_social IS NULL THEN 1 ELSE 0 END) as sem_razao_social,
    SUM(CASE WHEN nome = razao_social THEN 1 ELSE 0 END) as nome_igual_razao_exato,
    SUM(CASE WHEN UPPER(nome) = UPPER(razao_social) THEN 1 ELSE 0 END) as nome_igual_razao_case,
    SUM(CASE WHEN nome IS NOT NULL AND razao_social IS NOT NULL AND nome != razao_social THEN 1 ELSE 0 END) as ok
FROM clientes;

-- 3. Clientes com nome = razão social (suspeitos)
SELECT 
    id,
    nome,
    razao_social,
    drive_folder_id
FROM clientes
WHERE nome = razao_social
   OR UPPER(nome) = UPPER(razao_social)
ORDER BY nome;

-- 4. Clientes OK (nome diferente de razão social)
SELECT 
    id,
    nome as nome_fantasia,
    razao_social,
    drive_folder_id
FROM clientes
WHERE nome IS NOT NULL 
  AND razao_social IS NOT NULL
  AND UPPER(nome) != UPPER(razao_social)
ORDER BY nome
LIMIT 20;

-- 5. Total de clientes
SELECT COUNT(*) as total_clientes FROM clientes;
