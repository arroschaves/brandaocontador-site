-- ========================================
-- SCRIPT 5: RESTAURAR NOMES (TEMPLATE)
-- ATENÇÃO: Este é um TEMPLATE
-- Você precisa preencher com os nomes corretos!
-- ========================================

-- 5.1 Primeiro, veja quais nomes precisam ser restaurados
SELECT 
    id, 
    nome as nome_corrompido,
    razao_social,
    drive_folder_id
FROM clientes
WHERE nome ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
ORDER BY nome;

-- 5.2 TEMPLATE de restauração
-- Copie e modifique para cada cliente corrompido

-- Exemplo 1:
-- UPDATE clientes 
-- SET nome = 'MG PETS' 
-- WHERE id = '67807290-bc7f-4387-ad44-3d511b654efe';

-- Exemplo 2:
-- UPDATE clientes 
-- SET nome = 'EDUARDO BASSO' 
-- WHERE id = 'outro-uuid-aqui';

-- Exemplo 3:
-- UPDATE clientes 
-- SET nome = 'RICARDO PONTO COM' 
-- WHERE id = 'mais-um-uuid';

-- 5.3 Após restaurar todos, verificar
SELECT 
    COUNT(*) as total_clientes,
    COUNT(*) FILTER (WHERE nome ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') as ainda_corrompidos
FROM clientes;

-- ainda_corrompidos deve ser 0!
