-- Adiciona status de configuração para controle do fluxo de setup (Drive/Email/Whatsapp)
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS status_setup TEXT DEFAULT 'PENDING' CHECK (status_setup IN ('PENDING', 'PROCESSING', 'READY', 'ERROR'));

-- Garante que CNPJ/CPF seja único para evitar duplicidade
ALTER TABLE public.clientes
ADD CONSTRAINT clientes_cnpj_cpf_key UNIQUE (cnpj_cpf);

-- Cria índice para busca rápida por status de setup
CREATE INDEX IF NOT EXISTS idx_clientes_status_setup ON public.clientes(status_setup);
