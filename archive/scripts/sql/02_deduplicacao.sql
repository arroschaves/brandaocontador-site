-- ========================================
-- SCRIPT 2 (CORRIGIDO): DEDUPLICAÇÃO SEGURA
-- Execute APÓS reverter ao backup
-- ========================================

-- 2.1 PRIMEIRO: Identificar duplicatas para revisar
SELECT 
    nome,
    COUNT(*) as total,
    STRING_AGG(id::text, ', ') as ids,
    MIN(id) as id_manter
FROM clientes
GROUP BY nome
HAVING COUNT(*) > 1
ORDER BY total DESC;

-- 2.2 DEPOIS: Deletar duplicatas (mantém o PRIMEIRO ID - mais antigo)
-- ATENÇÃO: Só execute se você revisou os resultados acima!

WITH duplicatas AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (PARTITION BY nome ORDER BY id) as rn
    FROM clientes
)
DELETE FROM clientes
WHERE id IN (
    SELECT id FROM duplicatas WHERE rn > 1
);

-- 2.3 Verificar resultado
SELECT 
    COUNT(*) as total_clientes,
    COUNT(DISTINCT nome) as nomes_unicos
FROM clientes;

-- Se total_clientes == nomes_unicos, não há mais duplicatas!

-- 2.4 Comparar com backup
SELECT 
    (SELECT COUNT(*) FROM clientes_backup) as antes,
    (SELECT COUNT(*) FROM clientes) as depois,
    (SELECT COUNT(*) FROM clientes_backup) - (SELECT COUNT(*) FROM clientes) as removidos;
