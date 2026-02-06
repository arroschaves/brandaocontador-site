-- ============================================================================
-- VERIFICAÇÃO: Estrutura da tabela cliente_certificados
-- Execute este script PRIMEIRO para ver as colunas disponíveis
-- ============================================================================

-- Ver todas as colunas de cliente_certificados
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'cliente_certificados'
ORDER BY ordinal_position;

-- Ver alguns registros de exemplo
SELECT * FROM cliente_certificados LIMIT 5;
