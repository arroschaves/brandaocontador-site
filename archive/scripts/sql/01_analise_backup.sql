-- ========================================
-- SCRIPT 1: BACKUP E ANÁLISE
-- Execute este PRIMEIRO para entender o problema
-- ========================================

-- 1.1 Criar backup da tabela clientes
CREATE TABLE IF NOT EXISTS clientes_backup AS 
SELECT * FROM clientes;

-- Verificar backup criado
SELECT COUNT(*) as total_backup FROM clientes_backup;

-- 1.2 Identificar clientes duplicados
SELECT 
    nome,
    COUNT(*) as total_duplicatas,
    STRING_AGG(id::text, ', ') as ids_duplicados
FROM clientes
GROUP BY nome
HAVING COUNT(*) > 1
ORDER BY total_duplicatas DESC;

-- 1.3 Identificar nomes corrompidos (UUIDs)
SELECT 
    id, 
    nome, 
    razao_social, 
    drive_folder_id
FROM clientes
WHERE nome ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
ORDER BY nome;

-- 1.4 Verificar drive_folder_id vazios
SELECT 
    id, 
    nome, 
    drive_folder_id
FROM clientes
WHERE drive_folder_id IS NULL 
   OR drive_folder_id = ''
ORDER BY nome;

-- 1.5 Estatísticas gerais
SELECT 
    COUNT(*) as total_clientes,
    COUNT(DISTINCT nome) as nomes_unicos,
    COUNT(*) - COUNT(DISTINCT nome) as duplicatas_estimadas
FROM clientes;
