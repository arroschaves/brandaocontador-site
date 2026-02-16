-- ============================================================
-- 🧠 MIGRATION MASTER COMPLETA — BRANDÃO CONTABILIDADE
-- Versão: 2.0 | Data: 2026-02-16
-- Baseado no PRD + BLUEPRINT MASTER + DIAGRAMA ARQUITETURAL
-- ============================================================
-- IMPORTANTE: Execute APÓS o 20260215_schema_master.sql
-- Este script complementa com tudo que faltava.
-- Usa IF NOT EXISTS para segurança.
-- ============================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. SCHEMAS (garantir que todos existem)
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS fiscal;
CREATE SCHEMA IF NOT EXISTS dp;
CREATE SCHEMA IF NOT EXISTS workflow;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS storage_docs;
CREATE SCHEMA IF NOT EXISTS financeiro;

-- ============================================================
-- SCHEMA CORE — CATÁLOGO DE SERVIÇOS
-- ============================================================

CREATE TABLE IF NOT EXISTS core.servicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO core.servicos (nome, descricao) VALUES
('Fiscal', 'Escrituração fiscal, apuração de impostos, SPED'),
('Contabil', 'Escrituração contábil, balanços, DRE'),
('Folha', 'Folha de pagamento, encargos, eSocial'),
('Consultoria', 'Consultoria tributária e planejamento'),
('Societario', 'Alterações contratuais, abertura/encerramento')
ON CONFLICT (nome) DO NOTHING;

-- ============================================================
-- SCHEMA CORE — SERVIÇOS CONTRATADOS POR EMPRESA
-- ============================================================

CREATE TABLE IF NOT EXISTS core.empresa_servicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES core.empresas(id) ON DELETE CASCADE,
    servico_id UUID REFERENCES core.servicos(id),
    data_inicio DATE DEFAULT CURRENT_DATE,
    data_fim DATE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(empresa_id, servico_id)
);

CREATE INDEX IF NOT EXISTS idx_empresa_servicos_empresa ON core.empresa_servicos(empresa_id);

-- ============================================================
-- SCHEMA CORE — CONTROLE DE ACESSO (TABELA PONTE)
-- Define quem pode ver/editar qual empresa
-- ============================================================

CREATE TABLE IF NOT EXISTS core.usuario_empresa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES core.empresas(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('RESPONSAVEL', 'EXECUTOR', 'LEITOR')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(usuario_id, empresa_id)
);

CREATE INDEX IF NOT EXISTS idx_usuario_empresa_user ON core.usuario_empresa(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_empresa_emp ON core.usuario_empresa(empresa_id);

-- ============================================================
-- SCHEMA CORE — HISTÓRICO DE REGIME TRIBUTÁRIO
-- NUNCA sobrescrever. Sempre versionar.
-- ============================================================

CREATE TABLE IF NOT EXISTS core.regime_historico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES core.empresas(id) ON DELETE CASCADE,
    regime TEXT NOT NULL,
    inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    fim DATE,
    ano_fiscal INTEGER,
    motivo_alteracao TEXT,
    alterado_por UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_regime_hist_empresa ON core.regime_historico(empresa_id);

-- ============================================================
-- SCHEMA CORE — CONTATOS DA EMPRESA
-- Sócios, responsáveis, procuradores
-- ============================================================

CREATE TABLE IF NOT EXISTS core.empresa_contatos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES core.empresas(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    cpf TEXT,
    email TEXT,
    telefone TEXT,
    cargo TEXT, -- Sócio, Procurador, Responsável, Contador
    principal BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SCHEMA CORE — CERTIFICADOS DIGITAIS
-- ============================================================

CREATE TABLE IF NOT EXISTS core.certificados_digitais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES core.empresas(id) ON DELETE CASCADE,
    tipo TEXT CHECK (tipo IN ('A1', 'A3', 'E-CPF', 'E-CNPJ')),
    titular TEXT,
    validade DATE NOT NULL,
    drive_file_id TEXT,
    senha_vault_ref TEXT, -- Referência segura, nunca texto plano
    status TEXT DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'VENCIDO', 'REVOGADO')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SCHEMA FISCAL — FERIADOS NACIONAIS
-- Necessário para cálculo correto de vencimentos
-- ============================================================

CREATE TABLE IF NOT EXISTS fiscal.feriados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data DATE NOT NULL UNIQUE,
    descricao TEXT NOT NULL,
    tipo TEXT DEFAULT 'NACIONAL' CHECK (tipo IN ('NACIONAL', 'ESTADUAL', 'MUNICIPAL')),
    uf TEXT, -- NULL = Nacional
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feriados nacionais 2026
INSERT INTO fiscal.feriados (data, descricao) VALUES
('2026-01-01', 'Confraternização Universal'),
('2026-02-16', 'Carnaval'),
('2026-02-17', 'Carnaval'),
('2026-04-03', 'Sexta-feira Santa'),
('2026-04-21', 'Tiradentes'),
('2026-05-01', 'Dia do Trabalho'),
('2026-06-04', 'Corpus Christi'),
('2026-09-07', 'Independência do Brasil'),
('2026-10-12', 'Nossa Senhora Aparecida'),
('2026-11-02', 'Finados'),
('2026-11-15', 'Proclamação da República'),
('2026-12-25', 'Natal'),
-- Feriados 2027
('2027-01-01', 'Confraternização Universal'),
('2027-02-08', 'Carnaval'),
('2027-02-09', 'Carnaval'),
('2027-03-26', 'Sexta-feira Santa'),
('2027-04-21', 'Tiradentes'),
('2027-05-01', 'Dia do Trabalho'),
('2027-05-27', 'Corpus Christi'),
('2027-09-07', 'Independência do Brasil'),
('2027-10-12', 'Nossa Senhora Aparecida'),
('2027-11-02', 'Finados'),
('2027-11-15', 'Proclamação da República'),
('2027-12-25', 'Natal')
ON CONFLICT (data) DO NOTHING;

-- ============================================================
-- SCHEMA FISCAL — ATUALIZAÇÃO DA TABELA DE TEMPLATES
-- Adicionar campos que faltam
-- ============================================================

ALTER TABLE fiscal.obrigacoes_templates
    ADD COLUMN IF NOT EXISTS descricao TEXT,
    ADD COLUMN IF NOT EXISTS periodicidade TEXT DEFAULT 'MENSAL'
        CHECK (periodicidade IN ('MENSAL', 'TRIMESTRAL', 'ANUAL', 'SEMESTRAL', 'EVENTUAL')),
    ADD COLUMN IF NOT EXISTS mes_entrega INTEGER, -- Para anuais: mês fixo de entrega
    ADD COLUMN IF NOT EXISTS orgao TEXT, -- RFB, SEFAZ, MTE, INSS
    ADD COLUMN IF NOT EXISTS sistema TEXT, -- SPED, e-CAC, Portal Simples, etc.
    ADD COLUMN IF NOT EXISTS postergavel BOOLEAN DEFAULT FALSE; -- DAS posterga ao invés de antecipar

-- ============================================================
-- LIMPAR TEMPLATES ANTIGOS E INSERIR COMPLETOS
-- ============================================================

DELETE FROM fiscal.obrigacoes_templates WHERE TRUE;

-- === SIMPLES NACIONAL ===
INSERT INTO fiscal.obrigacoes_templates
(nome, departamento, regime_tributario, dia_vencimento, periodicidade, descricao, orgao, sistema, antecipa_fds, postergavel) VALUES
('DAS', 'FISCAL', '{"Simples Nacional","MEI"}', 20, 'MENSAL',
 'Documento de Arrecadação do Simples Nacional', 'RFB', 'Portal Simples Nacional', FALSE, TRUE),
('PGDAS-D', 'FISCAL', '{"Simples Nacional"}', 20, 'MENSAL',
 'Programa Gerador do DAS - Declaratório', 'RFB', 'Portal Simples Nacional', TRUE, FALSE),
('DEFIS', 'FISCAL', '{"Simples Nacional"}', 31, 'ANUAL',
 'Declaração de Informações Socioeconômicas e Fiscais', 'RFB', 'Portal Simples Nacional', TRUE, FALSE),
('DESTDA', 'FISCAL', '{"Simples Nacional"}', 28, 'MENSAL',
 'Declaração de Substituição Tributária, Diferencial de Alíquotas e Antecipação', 'SEFAZ', 'SPED', TRUE, FALSE),

-- === LUCRO PRESUMIDO ===
('DCTF', 'FISCAL', '{"Lucro Presumido","Lucro Real"}', 15, 'MENSAL',
 'Declaração de Débitos e Créditos Tributários Federais (15º dia útil do 2º mês)', 'RFB', 'PGD DCTF', TRUE, FALSE),
('EFD-Contribuicoes', 'FISCAL', '{"Lucro Presumido","Lucro Real"}', 10, 'MENSAL',
 'Escrituração Fiscal Digital de PIS/COFINS (10º dia útil do 2º mês)', 'RFB', 'SPED', TRUE, FALSE),
('EFD-ICMS/IPI', 'FISCAL', '{"Lucro Presumido","Lucro Real"}', 25, 'MENSAL',
 'Escrituração Fiscal Digital do ICMS e IPI', 'SEFAZ', 'SPED', TRUE, FALSE),
('ECF', 'CONTABIL', '{"Lucro Presumido","Lucro Real"}', 31, 'ANUAL',
 'Escrituração Contábil Fiscal (último dia útil de julho)', 'RFB', 'SPED', TRUE, FALSE),
('ECD', 'CONTABIL', '{"Lucro Presumido","Lucro Real"}', 31, 'ANUAL',
 'Escrituração Contábil Digital (último dia útil de maio)', 'RFB', 'SPED', TRUE, FALSE),

-- === LUCRO REAL (adicional) ===
('LALUR', 'CONTABIL', '{"Lucro Real"}', 31, 'ANUAL',
 'Livro de Apuração do Lucro Real', 'RFB', 'SPED ECF', TRUE, FALSE),
('EFD-Reinf', 'FISCAL', '{"Lucro Presumido","Lucro Real"}', 15, 'MENSAL',
 'Escrituração Fiscal Digital de Retenções e Outras Informações Fiscais', 'RFB', 'SPED', TRUE, FALSE),

-- === OBRIGAÇÕES TRABALHISTAS (TODOS OS REGIMES) ===
('FGTS-Digital', 'DP', '{"Simples Nacional","Lucro Presumido","Lucro Real","MEI"}', 20, 'MENSAL',
 'FGTS Digital - Recolhimento mensal', 'CEF', 'FGTS Digital', TRUE, FALSE),
('eSocial', 'DP', '{"Simples Nacional","Lucro Presumido","Lucro Real","MEI"}', 15, 'MENSAL',
 'Sistema de Escrituração Digital das Obrigações Fiscais, Previdenciárias e Trabalhistas', 'MTE', 'eSocial', TRUE, FALSE),
('DCTFWeb', 'DP', '{"Simples Nacional","Lucro Presumido","Lucro Real"}', 15, 'MENSAL',
 'Declaração de Débitos e Créditos Tributários Federais Previdenciários', 'RFB', 'e-CAC', TRUE, FALSE),
('GFIP/SEFIP', 'DP', '{"Simples Nacional","Lucro Presumido","Lucro Real"}', 7, 'MENSAL',
 'Guia de Recolhimento do FGTS e Informações à Previdência Social', 'CEF', 'SEFIP', TRUE, FALSE),
('RAIS', 'DP', '{"Simples Nacional","Lucro Presumido","Lucro Real"}', 31, 'ANUAL',
 'Relação Anual de Informações Sociais (março)', 'MTE', 'RAIS Online', TRUE, FALSE),
('DIRF', 'DP', '{"Lucro Presumido","Lucro Real"}', 28, 'ANUAL',
 'Declaração do Imposto de Renda Retido na Fonte (fevereiro)', 'RFB', 'PGD DIRF', TRUE, FALSE),
('CAGED', 'DP', '{"Simples Nacional","Lucro Presumido","Lucro Real"}', 7, 'MENSAL',
 'Cadastro Geral de Empregados e Desempregados (via eSocial)', 'MTE', 'eSocial', TRUE, FALSE),

-- === PRODUTOR RURAL (PF) ===
('ITR', 'FISCAL', '{"Produtor Rural"}', 30, 'ANUAL',
 'Declaração do Imposto sobre a Propriedade Territorial Rural (setembro)', 'RFB', 'e-CAC', TRUE, FALSE),
('LCDPR', 'CONTABIL', '{"Produtor Rural"}', 31, 'ANUAL',
 'Livro Caixa Digital do Produtor Rural (receita >R$4,8M)', 'RFB', 'e-CAC', TRUE, FALSE),
('IRPF-Rural', 'FISCAL', '{"Produtor Rural"}', 30, 'ANUAL',
 'Declaração de Ajuste Anual do IRPF com atividade rural (abril)', 'RFB', 'e-CAC', TRUE, FALSE),
('CCIR', 'FISCAL', '{"Produtor Rural"}', NULL, 'ANUAL',
 'Certificado de Cadastro de Imóvel Rural', 'INCRA', 'SNCR', TRUE, FALSE),
('CAR', 'FISCAL', '{"Produtor Rural"}', NULL, 'EVENTUAL',
 'Cadastro Ambiental Rural', 'IBAMA', 'SICAR', TRUE, FALSE),
('GTA', 'FISCAL', '{"Produtor Rural"}', NULL, 'EVENTUAL',
 'Guia de Trânsito Animal', 'IAGRO', 'e-SISBI', TRUE, FALSE),
('NF-Produtor', 'FISCAL', '{"Produtor Rural"}', NULL, 'EVENTUAL',
 'Nota Fiscal de Produtor Eletrônica (NFP-e)', 'SEFAZ', 'NF-e', TRUE, FALSE),

-- === OBRIGAÇÕES COMUNS A TODOS ===
('DCTF-Mensal', 'FISCAL', '{"Simples Nacional","Lucro Presumido","Lucro Real"}', 15, 'MENSAL',
 'DCTF Mensal (15º dia útil do 2º mês subsequente)', 'RFB', 'PGD DCTF', TRUE, FALSE),
('GIA', 'FISCAL', '{"Lucro Presumido","Lucro Real"}', 15, 'MENSAL',
 'Guia de Informação e Apuração do ICMS', 'SEFAZ', 'GIA Eletrônica', TRUE, FALSE),
('SINTEGRA', 'FISCAL', '{"Lucro Presumido","Lucro Real"}', 15, 'MENSAL',
 'Sistema Integrado de Informações sobre Operações Interestaduais', 'SEFAZ', 'SPED', TRUE, FALSE),

-- === MEI ===
('DASN-SIMEI', 'FISCAL', '{"MEI"}', 31, 'ANUAL',
 'Declaração Anual do Simples Nacional para MEI (maio)', 'RFB', 'Portal Simples Nacional', TRUE, FALSE);

-- ============================================================
-- SCHEMA FISCAL — CALENDÁRIO (garantir índices)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_calendario_empresa ON fiscal.calendario(empresa_id);
CREATE INDEX IF NOT EXISTS idx_calendario_status ON fiscal.calendario(status);
CREATE INDEX IF NOT EXISTS idx_calendario_vencimento ON fiscal.calendario(data_vencimento);

-- ============================================================
-- SCHEMA WORKFLOW — TAREFAS OPERACIONAIS
-- ============================================================

CREATE TABLE IF NOT EXISTS workflow.tarefas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES core.empresas(id) ON DELETE CASCADE,
    calendario_id UUID REFERENCES fiscal.calendario(id) ON DELETE SET NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    responsavel_id UUID,
    status TEXT DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE','EM_ANDAMENTO','CONCLUIDA','CANCELADA','BLOQUEADA')),
    prioridade INTEGER DEFAULT 3 CHECK (prioridade BETWEEN 1 AND 5),
    data_limite DATE,
    data_conclusao TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tarefas_empresa ON workflow.tarefas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_resp ON workflow.tarefas(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON workflow.tarefas(status);

-- ============================================================
-- SCHEMA WORKFLOW — SOLICITAÇÕES AO ADMIN
-- ============================================================

CREATE TABLE IF NOT EXISTS workflow.solicitacoes_admin (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solicitante_id UUID REFERENCES auth.users(id),
    tipo TEXT NOT NULL CHECK (tipo IN ('DELETAR_EMPRESA','ALTERAR_REGIME','CANCELAR_OBRIGACAO','TRANSFERIR_RESPONSAVEL','OUTRO')),
    empresa_id UUID REFERENCES core.empresas(id),
    descricao TEXT NOT NULL,
    status TEXT DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE','APROVADA','REJEITADA')),
    aprovado_por UUID,
    data_aprovacao TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SCHEMA DP — DEPARTAMENTO PESSOAL
-- ============================================================

CREATE TABLE IF NOT EXISTS dp.eventos_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    departamento TEXT DEFAULT 'DP',
    prazo_dias INTEGER, -- Dias antes/depois do evento para entrega
    ativo BOOLEAN DEFAULT TRUE
);

INSERT INTO dp.eventos_templates (nome, descricao, prazo_dias) VALUES
('Admissao', 'Processo de admissão de funcionário', -1),
('Demissao', 'Processo de rescisão contratual', 10),
('Ferias', 'Programação e pagamento de férias', -30),
('13-Salario-1a-Parcela', 'Primeira parcela do 13º salário', NULL),
('13-Salario-2a-Parcela', 'Segunda parcela do 13º salário', NULL),
('Pro-Labore', 'Cálculo mensal do pró-labore dos sócios', NULL),
('Folha-Pagamento', 'Processamento da folha mensal', NULL),
('Encargos-Sociais', 'Cálculo de INSS, FGTS, IRRF', NULL),
('Exame-Admissional', 'Exame médico admissional (ASO)', -1),
('Exame-Periodico', 'Exame médico periódico', NULL),
('Exame-Demissional', 'Exame médico demissional', 0)
ON CONFLICT (nome) DO NOTHING;

CREATE TABLE IF NOT EXISTS dp.eventos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES core.empresas(id) ON DELETE CASCADE,
    template_id UUID REFERENCES dp.eventos_templates(id),
    funcionario_nome TEXT,
    funcionario_cpf TEXT,
    data_evento DATE NOT NULL,
    data_limite DATE,
    status TEXT DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE','EM_ANDAMENTO','CONCLUIDO','CANCELADO')),
    observacoes TEXT,
    responsavel_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dp_eventos_empresa ON dp.eventos(empresa_id);

-- ============================================================
-- SCHEMA STORAGE_DOCS — DOCUMENTOS
-- ============================================================

CREATE TABLE IF NOT EXISTS storage_docs.documentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES core.empresas(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('XML','SPED','PDF','PLANILHA','CONTRATO','CERTIDAO','OUTRO')),
    nome_arquivo TEXT NOT NULL,
    drive_file_id TEXT,
    supabase_path TEXT,
    tamanho_bytes BIGINT,
    competencia DATE,
    enviado_por UUID,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_docs_empresa ON storage_docs.documentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_docs_tipo ON storage_docs.documentos(tipo);

-- ============================================================
-- SCHEMA FINANCEIRO — COFRE (Acesso restrito ADMIN)
-- ============================================================

CREATE TABLE IF NOT EXISTS financeiro.honorarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES core.empresas(id) ON DELETE CASCADE,
    valor DECIMAL(12,2) NOT NULL,
    tipo TEXT DEFAULT 'MENSAL' CHECK (tipo IN ('MENSAL','AVULSO','CONSULTA')),
    descricao TEXT,
    mes_referencia INTEGER,
    ano_referencia INTEGER,
    status_pgto TEXT DEFAULT 'PENDENTE' CHECK (status_pgto IN ('PENDENTE','PAGO','ATRASADO','CANCELADO')),
    data_vencimento DATE,
    data_pagamento DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_honorarios_empresa ON financeiro.honorarios(empresa_id);

-- ============================================================
-- SCHEMA AUDIT — GARANTIR TRIGGER AUTOMÁTICO
-- ============================================================

CREATE OR REPLACE FUNCTION audit.log_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit.logs (usuario_id, tabela, acao, dados_antigos, dados_novos)
    VALUES (
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
        TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
        TG_OP,
        CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar auditoria nas tabelas críticas
DO $$ 
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT unnest(ARRAY[
        'core.empresas',
        'core.empresa_servicos', 
        'core.regime_historico',
        'core.certificados_digitais',
        'fiscal.calendario',
        'workflow.tarefas',
        'workflow.solicitacoes_admin',
        'financeiro.honorarios'
    ]) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_%s ON %s', 
            replace(replace(t, '.', '_'), 'core_', ''), t);
        EXECUTE format('CREATE TRIGGER trg_audit_%s AFTER INSERT OR UPDATE OR DELETE ON %s FOR EACH ROW EXECUTE FUNCTION audit.log_changes()',
            replace(replace(t, '.', '_'), 'core_', ''), t);
    END LOOP;
END $$;

-- ============================================================
-- RLS — SEGURANÇA MULTI-TENANT
-- ============================================================

ALTER TABLE core.empresa_servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.usuario_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.regime_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal.calendario ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow.tarefas ENABLE ROW LEVEL SECURITY;

-- Políticas: Usuario só vê dados das empresas vinculadas ao seu escritório
CREATE POLICY IF NOT EXISTS policy_empresa_servicos_read ON core.empresa_servicos
    FOR SELECT USING (empresa_id IN (
        SELECT id FROM core.empresas WHERE escritorio_id IN (
            SELECT escritorio_id FROM core.usuarios_escritorio WHERE id = auth.uid()
        )
    ));

CREATE POLICY IF NOT EXISTS policy_calendario_read ON fiscal.calendario
    FOR SELECT USING (empresa_id IN (
        SELECT id FROM core.empresas WHERE escritorio_id IN (
            SELECT escritorio_id FROM core.usuarios_escritorio WHERE id = auth.uid()
        )
    ));

CREATE POLICY IF NOT EXISTS policy_tarefas_read ON workflow.tarefas
    FOR SELECT USING (empresa_id IN (
        SELECT id FROM core.empresas WHERE escritorio_id IN (
            SELECT escritorio_id FROM core.usuarios_escritorio WHERE id = auth.uid()
        )
    ));

-- ============================================================
-- ✅ MIGRAÇÃO COMPLETA — ESTRUTURA DO BANCO PRONTA
-- ============================================================
SELECT 'MIGRATION MASTER COMPLETA — ESTRUTURA 100%' AS status;
