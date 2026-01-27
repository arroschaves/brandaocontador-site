-- ========================================
-- SCRIPT DE LIMPEZA EMERGENCIAL
-- Deleta clientes com nome vazio (NULL)
-- ========================================

-- PASSO 1: Ver quantos clientes serão deletados
SELECT 
    COUNT(*) as total_para_deletar,
    'Clientes com nome vazio' as descricao
FROM clientes
WHERE nome IS NULL;

-- PASSO 2: Ver quais clientes VÁLIDOS serão mantidos
SELECT 
    id,
    nome,
    razao_social,
    drive_folder_id,
    email
FROM clientes
WHERE nome IS NOT NULL
ORDER BY nome;

-- PASSO 3: DELETAR clientes com nome vazio
-- ⚠️ ATENÇÃO: Só execute se você revisou os passos 1 e 2!
DELETE FROM clientes
WHERE nome IS NULL;

-- PASSO 4: Verificar resultado
SELECT 
    COUNT(*) as total_clientes_restantes,
    'Após limpeza' as descricao
FROM clientes;

-- PASSO 5: Ver clientes finais
SELECT 
    id,
    nome,
    razao_social,
    drive_folder_id
FROM clientes
ORDER BY nome
LIMIT 20;
