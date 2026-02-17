-- ============================================================
-- 🛠️ CORREÇÃO DE TABELAS FALTANTES E AJUSTE DE SCHEMAS
-- Brandão Contador - 2026-02-16
-- ============================================================

-- 1. Agendamentos de Pendências (Schema WORKFLOW)
-- Re-criando com a FK correta para core.empresas
CREATE TABLE IF NOT EXISTS workflow.agendamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES core.empresas(id) ON DELETE CASCADE,
    tipo_pendencia TEXT NOT NULL,
    subtipo TEXT,
    descricao TEXT NOT NULL,
    data_vencimento DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','concluido','atrasado','cancelado')),
    alertas_config JSONB DEFAULT '{"dias_antes": [7, 3, 1], "canais": ["sistema"]}'::jsonb,
    metadata JSONB,
    concluido_em TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Vault de Certificados (Schema CORE)
-- Re-criando com as colunas de criptografia necessárias para o Vault
CREATE TABLE IF NOT EXISTS core.certificados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES core.empresas(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL DEFAULT 'A1',
    nome_arquivo TEXT NOT NULL,
    data_vencimento DATE,
    
    -- Dados de Criptografia do Certificado (lib/vault.ts)
    arquivo_dados TEXT NOT NULL, 
    arquivo_iv TEXT NOT NULL,    
    arquivo_tag TEXT NOT NULL,   
    
    -- Dados de Criptografia da Senha
    senha_dados TEXT NOT NULL,   
    senha_iv TEXT NOT NULL,      
    senha_tag TEXT NOT NULL,     
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices de Performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_empresa ON workflow.agendamentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_vencimento ON workflow.agendamentos(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_certificados_empresa ON core.certificados(empresa_id);

-- 4. Habilitar RLS
ALTER TABLE workflow.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.certificados ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Acesso (Simplificadas para Administrativo por enquanto)
CREATE POLICY "Acesso total adm agendamentos" ON workflow.agendamentos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso total adm certificados" ON core.certificados FOR ALL USING (auth.role() = 'authenticated');

-- 6. Garantir USAGE nos schemas para a role authenticated
GRANT USAGE ON SCHEMA workflow TO authenticated;
GRANT USAGE ON SCHEMA core TO authenticated;
GRANT USAGE ON SCHEMA compliance TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA workflow TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA core TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA compliance TO authenticated;

-- 7. View de Radar (Garantir que usa as novas tabelas)
-- Esta view unifica tudo para o Dashboard e Radar
CREATE OR REPLACE VIEW public.vw_radar_vencimentos AS
SELECT 
    'MAESTRO' as origem,
    dp.id,
    dp.empresa_id,
    e.razao_social as cliente_nome,
    dp.tipo as documento,
    dp.vencimento as data_vencimento,
    dp.valor,
    dp.status_processamento as status
FROM compliance.documentos_processados dp
JOIN core.empresas e ON e.id = dp.empresa_id
WHERE dp.status_processamento != 'erro'

UNION ALL

SELECT 
    'CERTIFICADO' as origem,
    c.id,
    c.empresa_id,
    e.razao_social as cliente_nome,
    'Certificado: ' || c.tipo as documento,
    c.data_vencimento,
    0 as valor,
    CASE WHEN c.data_vencimento < CURRENT_DATE THEN 'atrasado' ELSE 'pendente' END as status
FROM core.certificados c
JOIN core.empresas e ON e.id = c.empresa_id

UNION ALL

SELECT 
    'AGENDA' as origem,
    a.id,
    a.empresa_id,
    e.razao_social as cliente_nome,
    a.descricao as documento,
    a.data_vencimento,
    0 as valor,
    a.status
FROM workflow.agendamentos a
JOIN core.empresas e ON e.id = a.empresa_id
WHERE a.status = 'pendente';
