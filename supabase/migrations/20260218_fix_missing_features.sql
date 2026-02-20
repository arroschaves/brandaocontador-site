-- ============================================================
-- 🛠️ CORREÇÃO DE INFRAESTRUTURA FALTANTE (SCHEMA COMPLIANCE & WIKI)
-- Data: 2026-02-18
-- ============================================================

-- 1. Criar Schema Compliance (estava faltando o CREATE)
CREATE SCHEMA IF NOT EXISTS compliance;

-- 2. Tabela de Documentos Processados (Maestro Vision Engine)
CREATE TABLE IF NOT EXISTS compliance.documentos_processados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES core.empresas(id) ON DELETE CASCADE,
    documento_id UUID, 
    tipo TEXT, -- Ex: DAS, FGTS, INSS, eSocial
    competencia DATE,
    vencimento DATE,
    valor DECIMAL(14,2),
    status_processamento TEXT DEFAULT 'pendente' CHECK (status_processamento IN ('pendente', 'sucesso', 'erro', 'humano_obrigatorio')),
    metadata_ia JSONB DEFAULT '{}'::jsonb,
    analisado_em TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Dossiê Técnico (Wiki do Cliente)
CREATE TABLE IF NOT EXISTS core.cliente_wiki (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES core.empresas(id) ON DELETE CASCADE,
    conteudo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_cliente_wiki UNIQUE (cliente_id)
);

-- 4. Garantir Estrutura de Auditoria
CREATE SCHEMA IF NOT EXISTS audit;
CREATE TABLE IF NOT EXISTS audit.logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID,
    tabela TEXT,
    acao TEXT,
    registro_id UUID,
    dados_antigos JSONB,
    dados_novos JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Índices de Performance
CREATE INDEX IF NOT EXISTS idx_compliance_empresa ON compliance.documentos_processados(empresa_id);
CREATE INDEX IF NOT EXISTS idx_compliance_vencimento ON compliance.documentos_processados(vencimento);
CREATE INDEX IF NOT EXISTS idx_audit_registro ON audit.logs(registro_id);

-- 6. Permissões
GRANT USAGE ON SCHEMA compliance TO authenticated;
GRANT USAGE ON SCHEMA audit TO authenticated;
GRANT ALL ON compliance.documentos_processados TO authenticated;
GRANT ALL ON core.cliente_wiki TO authenticated;
GRANT ALL ON audit.logs TO authenticated;

-- RLS (Simples para ADMIN)
ALTER TABLE compliance.documentos_processados ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.cliente_wiki ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin All Access Compliance" ON compliance.documentos_processados FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access Wiki" ON core.cliente_wiki FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access Audit" ON audit.logs FOR ALL USING (auth.role() = 'authenticated');

SELECT 'INFRAESTRUTURA DE COMPLIANCE E WIKI PRONTA' as status;
