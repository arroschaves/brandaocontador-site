-- Adicionar Inscrição Estadual para completar o cadastro via XML
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS inscricao_estadual TEXT;

-- Forçar atualização do cache da API
NOTIFY pgrst, 'reload schema';
