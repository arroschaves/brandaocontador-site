-- Correção da Constraint de Status
-- Este script remove a constraint antiga e cria uma nova que aceita todos os status necessários

-- 1. Remover a constraint antiga
ALTER TABLE atendimentos DROP CONSTRAINT IF EXISTS chk_atendimentos_status;

-- 2. Criar nova constraint que aceita todos os status válidos
ALTER TABLE atendimentos ADD CONSTRAINT chk_atendimentos_status 
CHECK (status IN (
    'ABERTO',
    'EM_ATENDIMENTO', 
    'CONCLUIDO',
    'pendente',
    'em_atendimento',
    'concluido'
));

-- 3. Mensagem de sucesso
DO $$ 
BEGIN
    RAISE NOTICE 'Constraint de status atualizada com sucesso!';
    RAISE NOTICE 'Status aceitos: ABERTO, EM_ATENDIMENTO, CONCLUIDO, pendente, em_atendimento, concluido';
END $$;
