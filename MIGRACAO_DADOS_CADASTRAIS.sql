
-- Garantir que a coluna de documento aceite zeros à esquerda (tipo TEXT)
ALTER TABLE clientes ALTER COLUMN cnpj_cpf TYPE TEXT;

-- Adicionar colunas para enriquecimento de dados cadastrais
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS razao_social TEXT,
ADD COLUMN IF NOT EXISTS logradouro TEXT,
ADD COLUMN IF NOT EXISTS numero TEXT,
ADD COLUMN IF NOT EXISTS complemento TEXT,
ADD COLUMN IF NOT EXISTS bairro TEXT,
ADD COLUMN IF NOT EXISTS cidade TEXT,
ADD COLUMN IF NOT EXISTS estado TEXT,
ADD COLUMN IF NOT EXISTS cep TEXT,
ADD COLUMN IF NOT EXISTS cnaes_secundarios JSONB,
ADD COLUMN IF NOT EXISTS data_abertura DATE,
ADD COLUMN IF NOT EXISTS natureza_juridica TEXT;

-- Comentários para documentação
COMMENT ON COLUMN clientes.razao_social IS 'Razão Social completa da empresa';
COMMENT ON COLUMN clientes.cnaes_secundarios IS 'Lista de CNAEs secundários em formato JSON';
