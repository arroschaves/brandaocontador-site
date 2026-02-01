-- Migração para Automação Contábil Avançada (Versão Expandida)

-- 1. Atualizar tabela de atendimentos
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS categoria_solicitacao TEXT;
ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS prioridade INTEGER DEFAULT 3;

-- 2. Atualizar tabela de clientes (Vencimentos Especializados)
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS vencimento_alvara_funcionamento DATE;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS vencimento_alvara_sanitario DATE;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS vencimento_alvara_bombeiros DATE;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS vencimento_alvara_ambiental DATE;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS vencimento_certificado_a1 DATE;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS vencimento_certificado_a3 DATE;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS drive_folder_id TEXT;

-- 3. Comentários
COMMENT ON COLUMN clientes.vencimento_alvara_funcionamento IS 'Vencimento do Alvará de Funcionamento';
COMMENT ON COLUMN clientes.vencimento_certificado_a1 IS 'Vencimento do Certificado Digital A1';
