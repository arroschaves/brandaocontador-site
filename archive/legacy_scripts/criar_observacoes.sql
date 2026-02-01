-- Adicionar a coluna que falta para o Robô funcionar
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Opcional: Forçar refresh do cache do esquema
NOTIFY pgrst, 'reload schema';
