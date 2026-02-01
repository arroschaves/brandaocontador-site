-- ========================================
-- SCRIPT DE EXPORTAÇÃO COMPLETA
-- Execute este e me envie o resultado
-- ========================================

-- Exportar TODOS os clientes com informações relevantes
SELECT 
    id,
    nome,
    razao_social,
    drive_folder_id,
    email,
    telefone,
    regime_tributario,
    CASE 
        WHEN nome IS NULL THEN 'NOME_VAZIO'
        WHEN nome ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'NOME_UUID'
        WHEN nome = razao_social THEN 'NOME_IGUAL_RAZAO'
        ELSE 'OK'
    END as status_nome
FROM clientes
ORDER BY 
    CASE 
        WHEN nome IS NULL THEN 1
        WHEN nome ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 2
        ELSE 3
    END,
    nome;

-- Total de clientes
SELECT COUNT(*) as total_clientes FROM clientes;

-- Estatísticas de problemas
SELECT 
    SUM(CASE WHEN nome IS NULL THEN 1 ELSE 0 END) as nomes_vazios,
    SUM(CASE WHEN nome ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 ELSE 0 END) as nomes_uuid,
    SUM(CASE WHEN drive_folder_id IS NULL OR drive_folder_id = '' THEN 1 ELSE 0 END) as sem_drive_id
FROM clientes;
