-- ========================================
-- SCRIPT DE EMERGÊNCIA: REVERTER TUDO
-- Execute este para voltar ao estado original
-- ========================================

-- PASSO 1: Deletar a tabela atual (corrompida)
DROP TABLE IF EXISTS clientes;

-- PASSO 2: Restaurar do backup
CREATE TABLE clientes AS 
SELECT * FROM clientes_backup;

-- PASSO 3: Verificar resultado
SELECT COUNT(*) as total_clientes FROM clientes;

-- Deve mostrar 69 clientes (o número original)

-- PASSO 4: Ver os clientes restaurados
SELECT id, nome, razao_social, drive_folder_id
FROM clientes
ORDER BY nome
LIMIT 20;
