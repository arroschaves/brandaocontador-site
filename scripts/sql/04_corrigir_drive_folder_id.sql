-- ========================================
-- SCRIPT 4: CORRIGIR DRIVE_FOLDER_ID
-- Execute APÓS adicionar colunas
-- ========================================

-- 4.1 Preencher drive_folder_id vazios com pasta raiz
UPDATE clientes
SET drive_folder_id = '1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP'
WHERE drive_folder_id IS NULL 
   OR drive_folder_id = '';

-- 4.2 Verificar resultado
SELECT 
    COUNT(*) as total_clientes,
    COUNT(*) FILTER (WHERE drive_folder_id IS NOT NULL AND drive_folder_id != '') as com_drive_id,
    COUNT(*) FILTER (WHERE drive_folder_id IS NULL OR drive_folder_id = '') as sem_drive_id
FROM clientes;

-- Todos devem ter drive_folder_id agora!
