-- ============================================================================
-- DIAGNÓSTICO E CORREÇÃO: Erro de Data Inválida (2026-02-31)
-- Descrição: Remove triggers e valores padrão que podem estar causando o erro
-- ============================================================================

-- 1. IDENTIFICAR TRIGGERS NA TABELA CLIENTES
-- Execute esta consulta para ver quais triggers existem
-- SELECT trigger_name, event_manipulation, action_statement 
-- FROM information_schema.triggers 
-- WHERE event_object_table = 'clientes';

-- 2. REMOVER TRIGGERS SUSPEITOS
-- Se você encontrar um trigger chamado 'gerar_obrigacoes' ou similar, use:
DROP TRIGGER IF EXISTS trigger_gerar_obrigacoes_padrao ON public.clientes;
DROP TRIGGER IF EXISTS trigger_setup_cliente_automacao ON public.clientes;

-- 3. REMOVER VALORES PADRÃO (DEFAULT) QUE PODEM TER CÁLCULOS FIXOS
ALTER TABLE public.clientes ALTER COLUMN data_abertura DROP DEFAULT;
ALTER TABLE public.clientes ALTER COLUMN data_situacao_cadastral DROP DEFAULT;

-- 4. FUNÇÃO DE CÁLCULO DE VENCIMENTOS (O CORAÇÃO DO PROBLEMA)
-- Geralmente o erro ocorre em funções que usam: (NOW() + INTERVAL '1 month') 
-- mas forçam o dia para 31.
-- Vamos procurar e desabilitar funções que possam estar sendo chamadas.
DROP FUNCTION IF EXISTS public.gerar_obrigacoes_padrao() CASCADE;

-- 5. VERIFICAÇÃO DE CONSTRAINT DE DATA
-- Caso exista alguma regra de validação que force 2026-02-31
-- (Raro, mas possível em bases migradas)

-- 6. RESET DE COLUNAS DE VENCIMENTO QUE PODEM TER DEFAULTS
ALTER TABLE public.clientes ALTER COLUMN vencimento_alvara_funcionamento SET DEFAULT NULL;
ALTER TABLE public.clientes ALTER COLUMN vencimento_alvara_sanitario SET DEFAULT NULL;
ALTER TABLE public.clientes ALTER COLUMN vencimento_alvara_bombeiros SET DEFAULT NULL;
ALTER TABLE public.clientes ALTER COLUMN vencimento_alvara_ambiental SET DEFAULT NULL;
ALTER TABLE public.clientes ALTER COLUMN vencimento_certificado_a1 SET DEFAULT NULL;
ALTER TABLE public.clientes ALTER COLUMN vencimento_certificado_a3 SET DEFAULT NULL;

-- 7. RECOMENDAÇÃO:
-- Se o erro persistir após rodar isso, o problema está em um script externo 
-- (n8n ou Python) que está sendo disparado ANTES do commit, ou via RPC.
