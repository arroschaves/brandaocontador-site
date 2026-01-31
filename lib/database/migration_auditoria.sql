-- Tabela de Auditoria do CRM
CREATE TABLE IF NOT EXISTS auditoria_crm (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES clientes(id),
    acao TEXT NOT NULL, -- 'UPLOAD', 'ENVIO_WA', 'ALTERACAO_CADASTRO'
    detalhes TEXT,
    usuario_email TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar Realtime para auditoria
ALTER PUBLICATION supabase_realtime ADD TABLE auditoria_crm;
