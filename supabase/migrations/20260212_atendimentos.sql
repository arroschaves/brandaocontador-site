-- Migration: 20260212_atendimentos.sql
-- Objetivo: Criar tabela de atendimentos para integração WhatsApp e Radar
-- Autor: Antigravity AI

-- 1. Tabela atendimentos
CREATE TABLE IF NOT EXISTS public.atendimentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Vínculo com cliente (opcional, pode ser lead novo)
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    
    -- Dados Origem (WhatsApp/Evolution)
    pushName TEXT,
    telefone_whatsapp TEXT,
    mensagem TEXT,
    transcricao_audio TEXT,
    
    -- Gestão de Status
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_atendimento', 'concluido', 'arquivado')),
    prioridade TEXT DEFAULT 'MEDIA' CHECK (prioridade IN ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA')),
    
    -- Classificação Maestro
    categoria_solicitacao TEXT, -- 'FISCAL', 'RH', 'CONTABIL', 'DOUVIDA'
    atendimento_automatico BOOLEAN DEFAULT FALSE,
    
    -- Respostas
    resposta_automatica TEXT,
    motivo_humano TEXT
);

-- 2. Habilitar RLS
ALTER TABLE public.atendimentos ENABLE ROW LEVEL SECURITY;

-- 3. Políticas
CREATE POLICY "atendimentos_select" ON public.atendimentos
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "atendimentos_insert" ON public.atendimentos
FOR INSERT WITH CHECK (true);

CREATE POLICY "atendimentos_update" ON public.atendimentos
FOR UPDATE USING (auth.role() = 'authenticated');

-- 4. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.atendimentos;

-- 5. Índices de performance
CREATE INDEX IF NOT EXISTS idx_atendimentos_status ON public.atendimentos(status);
CREATE INDEX IF NOT EXISTS idx_atendimentos_cliente ON public.atendimentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_atendimentos_created_at ON public.atendimentos(created_at DESC);
