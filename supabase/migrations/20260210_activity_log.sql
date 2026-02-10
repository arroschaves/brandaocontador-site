-- Migration: 20260210_activity_log.sql
-- Objetivo: Tabela unificada de atividades do CRM para alimentar Dashboard e Maestro AI
-- Autor: Antigravity AI
-- Data: 2026-02-10

-- 1. Tabela activity_log (fonte única de verdade para o Feed de Atividades)
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Quem
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    cliente_nome TEXT,  -- Denormalizado para performance (evita JOIN)
    
    -- O quê
    tipo TEXT NOT NULL,  -- 'upload', 'sync', 'alert', 'folder_created', 'payment_detected', 'obligation_completed'
    categoria TEXT,      -- 'FISCAL', 'RH', 'FGTS', 'INSS', 'ALVARAS', etc.
    descricao TEXT NOT NULL,
    
    -- Arquivo (se aplicável)
    arquivo_nome TEXT,
    arquivo_url TEXT,
    pasta_path TEXT,     -- Ex: "10 - RH/02 - RH/FGTS/2026/01_Janeiro"
    
    -- Status
    status TEXT DEFAULT 'info',  -- 'info', 'success', 'warning', 'error'
    
    -- Metadata extra (JSONB para flexibilidade)
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_cliente ON public.activity_log(cliente_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_tipo ON public.activity_log(tipo);

-- 3. RLS (Row Level Security)
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para usuários autenticados
CREATE POLICY "activity_log_select" ON public.activity_log
FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir inserção via service role (webhook/API)
CREATE POLICY "activity_log_insert" ON public.activity_log
FOR INSERT WITH CHECK (true);

-- 4. Habilitar Realtime para que o CRM receba updates em tempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;

-- 5. View materializada para stats do Dashboard (opcional, útil para performance)
CREATE OR REPLACE VIEW public.activity_stats AS
SELECT 
    DATE_TRUNC('day', created_at) AS dia,
    COUNT(*) AS total_eventos,
    COUNT(*) FILTER (WHERE tipo = 'upload') AS uploads,
    COUNT(*) FILTER (WHERE tipo = 'obligation_completed') AS obrigacoes_completadas,
    COUNT(*) FILTER (WHERE tipo = 'alert') AS alertas,
    COUNT(*) FILTER (WHERE tipo = 'payment_detected') AS pagamentos_detectados,
    COUNT(DISTINCT cliente_id) AS clientes_ativos
FROM public.activity_log
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY dia DESC;
