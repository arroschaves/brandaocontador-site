-- ============================================================================
-- Migration: Sistema de Agendamentos de Pendências
-- Descrição: Cria tabelas para agenda de pendências e parcelamentos com alertas
-- ============================================================================

-- ============================================================================
-- TABELA PRINCIPAL: agendamentos_pendencias
-- ============================================================================
CREATE TABLE IF NOT EXISTS agendamentos_pendencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    
    -- Tipo de pendência
    tipo_pendencia TEXT NOT NULL CHECK (tipo_pendencia IN (
        'dossie', 
        'emissao_mensal', 
        'parcelamento', 
        'certificado_vencendo',
        'outro'
    )),
    subtipo TEXT, -- Ex: 'DAS', 'FGTS', 'INSS' para emissao_mensal
    
    -- Informações da pendência
    descricao TEXT NOT NULL,
    data_vencimento DATE NOT NULL,
    
    -- Status e controle
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN (
        'pendente',
        'concluido',
        'atrasado',
        'cancelado'
    )),
    
    -- Configuração de alertas (JSON)
    -- Exemplo: {"dias_antes": [7, 3, 1], "canais": ["email", "whatsapp", "sistema"]}
    alertas_config JSONB DEFAULT '{"dias_antes": [7, 3, 1], "canais": ["sistema"]}'::jsonb,
    
    -- Metadados extras (flexível para diferentes tipos)
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    concluido_em TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente_id ON agendamentos_pendencias(cliente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_vencimento ON agendamentos_pendencias(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos_pendencias(status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_tipo ON agendamentos_pendencias(tipo_pendencia);
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente_status ON agendamentos_pendencias(cliente_id, status);

-- ============================================================================
-- TABELA DE HISTÓRICO: historico_alertas
-- ============================================================================
CREATE TABLE IF NOT EXISTS historico_alertas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agendamento_id UUID NOT NULL REFERENCES agendamentos_pendencias(id) ON DELETE CASCADE,
    
    -- Canal de envio
    canal TEXT NOT NULL CHECK (canal IN ('email', 'whatsapp', 'sistema')),
    
    -- Status e detalhes do envio
    status_entrega TEXT NOT NULL DEFAULT 'pendente' CHECK (status_entrega IN (
        'sucesso',
        'falha',
        'pendente'
    )),
    detalhes JSONB, -- Informações extras: erro, ID da mensagem, etc.
    
    -- Timestamps
    enviado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_historico_agendamento_id ON historico_alertas(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_historico_canal ON historico_alertas(canal);
CREATE INDEX IF NOT EXISTS idx_historico_status ON historico_alertas(status_entrega);

-- ============================================================================
-- FUNÇÕES E TRIGGERS
-- ============================================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_agendamento_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_agendamento_updated_at ON agendamentos_pendencias;
CREATE TRIGGER trigger_agendamento_updated_at
    BEFORE UPDATE ON agendamentos_pendencias
    FOR EACH ROW
    EXECUTE FUNCTION update_agendamento_timestamp();

-- Função para atualizar status automaticamente (pendente → atrasado)
CREATE OR REPLACE FUNCTION atualizar_status_atrasado()
RETURNS void AS $$
BEGIN
    UPDATE agendamentos_pendencias
    SET status = 'atrasado'
    WHERE status = 'pendente'
      AND data_vencimento < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Função para marcar como concluído e registrar timestamp
CREATE OR REPLACE FUNCTION marcar_agendamento_concluido()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'concluido' AND OLD.status != 'concluido' THEN
        NEW.concluido_em = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar quando foi concluído
DROP TRIGGER IF EXISTS trigger_agendamento_concluido ON agendamentos_pendencias;
CREATE TRIGGER trigger_agendamento_concluido
    BEFORE UPDATE ON agendamentos_pendencias
    FOR EACH ROW
    EXECUTE FUNCTION marcar_agendamento_concluido();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE agendamentos_pendencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_alertas ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Acesso total para autenticados" ON agendamentos_pendencias
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Acesso total para autenticados" ON historico_alertas
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- REALTIME
-- ============================================================================

-- Habilitar Realtime para sincronização em tempo real
ALTER PUBLICATION supabase_realtime ADD TABLE agendamentos_pendencias;
ALTER PUBLICATION supabase_realtime ADD TABLE historico_alertas;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE agendamentos_pendencias IS 'Gerencia agenda de pendências e parcelamentos dos clientes';
COMMENT ON COLUMN agendamentos_pendencias.tipo_pendencia IS 'Tipo: dossie, emissao_mensal, parcelamento, certificado_vencendo, outro';
COMMENT ON COLUMN agendamentos_pendencias.alertas_config IS 'Configuração de alertas em JSON: dias antes e canais';
COMMENT ON COLUMN agendamentos_pendencias.metadata IS 'Metadados flexíveis específicos do tipo de pendência';

COMMENT ON TABLE historico_alertas IS 'Registra todos os alertas enviados para pendências';
COMMENT ON COLUMN historico_alertas.detalhes IS 'Detalhes do envio: erro, ID da mensagem, etc.';
