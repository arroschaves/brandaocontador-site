-- ========================================
-- SCRIPT 3: ADICIONAR COLUNAS DE METADADOS
-- Execute APÓS deduplicação
-- ========================================

-- 3.1 Adicionar coluna razao_social (se não existir)
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS razao_social TEXT;

-- 3.2 Adicionar colunas de metadados
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS ultima_certidao_vencimento DATE;

ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS ultima_folha_competence TEXT;

ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS ultimo_upload_tipo TEXT;

ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS ultimo_upload_data TIMESTAMPTZ;

-- 3.3 Verificar colunas adicionadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clientes'
ORDER BY ordinal_position;
