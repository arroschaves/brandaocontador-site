-- SCHEMA MASTER - MAESTRO CRM 2026
-- Baseado no BLUEPRINT MASTER e PRD REAL

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SCHEMAS
CREATE SCHEMA IF NOT EXISTS core;    -- Base do sistema
CREATE SCHEMA IF NOT EXISTS fiscal;  -- Módulo Fiscal/Contábil
CREATE SCHEMA IF NOT EXISTS dp;      -- Departamento Pessoal
CREATE SCHEMA IF NOT EXISTS audit;   -- Auditoria e Logs

-- ==========================================
-- SCHEMA: core
-- ==========================================

-- Tabela de Escritórios (Multi-tenant)
CREATE TABLE core.escritorios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    razao_social TEXT NOT NULL,
    cnpj TEXT UNIQUE,
    email_contato TEXT,
    config_drive JSONB DEFAULT '{}',
    plano TEXT DEFAULT 'FREE', -- FREE, PRO, ENTERPRISE
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Empresas (Clientes do Escritório)
CREATE TABLE core.empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escritorio_id UUID REFERENCES core.escritorios(id) ON DELETE CASCADE,
    razao_social TEXT NOT NULL,
    nome_fantasia TEXT,
    cnpj TEXT UNIQUE,
    regime_tributario TEXT, -- Simples Nacional, Lucro Presumido, Real, MEI
    cnae_principal TEXT,
    inicio_atividade DATE,
    drive_folder_id TEXT,
    status TEXT DEFAULT 'ATIVO', -- ATIVO, SUSPENSO, CANCELADO
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de Usuários do Escritório
CREATE TABLE core.usuarios_escritorio (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    escritorio_id UUID REFERENCES core.escritorios(id),
    nome TEXT NOT NULL,
    perfil TEXT DEFAULT 'ANALISTA', -- SUPER_ADMIN, ADMIN, GERENTE, ANALISTA, ASSISTENTE
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Usuários do Cliente (Portal do Cliente)
CREATE TABLE core.usuarios_clientes (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    empresa_id UUID REFERENCES core.empresas(id),
    nome TEXT NOT NULL,
    cpf TEXT,
    pode_assinar BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- SCHEMA: fiscal
-- ==========================================

-- Modelos de Obrigações
CREATE TABLE fiscal.obrigacoes_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL, -- DAS, FGTS, etc.
    departamento TEXT NOT NULL, -- FISCAL, DP, CONTABIL
    regime_tributario TEXT[], -- Array de regimes que possuem essa obrigação
    dia_vencimento INTEGER,
    antecipa_fds BOOLEAN DEFAULT TRUE,
    antecipa_feriado BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE
);

-- Calendário Tributário da Empresa
CREATE TABLE fiscal.calendario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES core.empresas(id),
    template_id UUID REFERENCES fiscal.obrigacoes_templates(id),
    mes_referencia INTEGER NOT NULL,
    ano_referencia INTEGER NOT NULL,
    data_vencimento DATE NOT NULL,
    status TEXT DEFAULT 'PENDENTE', -- PENDENTE, CONCLUIDO, ATRASADO, CANCELADO
    data_conclusao TIMESTAMP WITH TIME ZONE,
    drive_file_id TEXT, -- Link para o PDF no Drive
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- SCHEMA: audit
-- ==========================================

CREATE TABLE audit.logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID, -- Pode ser core.usuarios_escritorio ou core.usuarios_clientes
    tabela TEXT NOT NULL,
    acao TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    dados_antigos JSONB,
    dados_novos JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- POLÍTICAS DE RLS (SEGURANÇA MULTI-TENANT)
-- ==========================================

ALTER TABLE core.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.usuarios_escritorio ENABLE ROW LEVEL SECURITY;

-- Exemplo: Analista só vê empresas do seu escritório
CREATE POLICY policy_analista_ver_empresas ON core.empresas
    FOR SELECT
    USING (escritorio_id IN (
        SELECT escritorio_id FROM core.usuarios_escritorio WHERE id = auth.uid()
    ));

-- POPULAR DADOS INICIAIS (TEMPLATES)
INSERT INTO fiscal.obrigacoes_templates (nome, departamento, regime_tributario, dia_vencimento)
VALUES 
('DAS-SIMPLES', 'FISCAL', '{"Simples Nacional", "MEI"}', 20),
('FGTS-DIGITAL', 'DP', '{"Simples Nacional", "Lucro Presumido", "Lucro Real"}', 20),
('INSS-DCTFWEB', 'DP', '{"Simples Nacional", "Lucro Presumido", "Lucro Real"}', 15);
