-- Adicionar colunas para inteligência fiscal na tabela de clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS regime_tributario TEXT; -- Ex: 'Simples Nacional', 'Lucro Presumido'
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS cnae_principal TEXT;    -- Ex: '6920-6/01 - Atividades de contabilidade'
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS status_rfb TEXT;        -- Ex: 'ATIVA', 'INAPTA'
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS log_atualizacao TIMESTAMPTZ DEFAULT NOW();

-- Comentário: Essas colunas serão preenchidas automaticamente pelo Robô Importador
