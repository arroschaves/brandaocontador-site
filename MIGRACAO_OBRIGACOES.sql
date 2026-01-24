-- 💎 Migração: Sistema de Controle de Obrigações Contábeis
-- Objetivo: Rastrear entregas de declarações e guias baseadas na estrutura de pastas.

-- 1. Tabela de Configuração de Obrigações (O que deve ser entregue)
CREATE TABLE IF NOT EXISTS configuracao_obrigacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,                     -- Ex: 'DAS', 'FGTS', 'DCTF'
    categoria_pasta TEXT NOT NULL,          -- Deve coincidir com as pastas: 'SIMPLES_NACIONAL', 'FOLHA_PAGAMENTO', etc.
    regime_tributario TEXT[],               -- Array de regimes: {'Simples Nacional', 'Lucro Presumido', 'Lucro Real', 'Pessoa Física'}
    descricao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Status de Obrigações Mensais (O acompanhamento real)
CREATE TABLE IF NOT EXISTS status_obrigacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    config_id UUID REFERENCES configuracao_obrigacoes(id),
    mes INTEGER NOT NULL,                   -- 1 a 12
    ano INTEGER NOT NULL,                   -- 2025, 2026...
    status TEXT DEFAULT 'pendente',         -- 'pendente', 'concluido', 'atrasado'
    data_conclusao TIMESTAMPTZ,
    url_drive TEXT,                         -- Link direto para o arquivo se houver
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cliente_id, config_id, mes, ano)
);

-- 3. Popular configurações básicas (Sugestão inicial)
INSERT INTO configuracao_obrigacoes (nome, categoria_pasta, regime_tributario) VALUES
('DAS - Simples Nacional', 'SIMPLES_NACIONAL', '{"Simples Nacional"}'),
('DEFIS', 'SIMPLES_NACIONAL', '{"Simples Nacional"}'),
('Recibo de Folha (Holerite)', 'FOLHA_PAGAMENTO', '{"Simples Nacional", "Lucro Presumido", "Lucro Real", "Pessoa Física"}'),
('Guia de FGTS', 'FOLHA_PAGAMENTO', '{"Simples Nacional", "Lucro Presumido", "Lucro Real", "Pessoa Física"}'),
('Guia de INSS', 'FOLHA_PAGAMENTO', '{"Simples Nacional", "Lucro Presumido", "Lucro Real", "Pessoa Física"}'),
('DCTF Mensal', 'LUCRO_REAL', '{"Lucro Presumido", "Lucro Real"}'),
('EFD Contribuições', 'LUCRO_REAL', '{"Lucro Presumido", "Lucro Real"}'),
('EFD ICMS/IPI', 'LUCRO_REAL', '{"Lucro Presumido", "Lucro Real"}'),
('DARF IRPJ/CSLL', 'LUCRO_REAL', '{"Lucro Presumido", "Lucro Real"}');

-- 4. View para o Dashboard de Pendências
CREATE OR REPLACE VIEW vw_pendencias_fiscais AS
SELECT 
    c.nome as cliente,
    c.regime_tributario,
    o.nome as obrigacao,
    s.mes,
    s.ano,
    s.status,
    s.updated_at as ultima_verificacao
FROM status_obrigacoes s
JOIN clientes c ON s.cliente_id = c.id
JOIN configuracao_obrigacoes o ON s.config_id = o.id
WHERE s.status != 'concluido'
ORDER BY s.ano DESC, s.mes DESC, c.nome ASC;

-- 5. Monitoramento de Situação Fiscal (CNDs)
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS situacao_federal TEXT DEFAULT 'NÃO CONSULTADO'; -- 'REGULAR', 'PENDENTE', 'ERRO'
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS situacao_estadual TEXT DEFAULT 'NÃO CONSULTADO'; -- 'REGULAR', 'PENDENTE', 'ERRO'
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS data_ultima_consulta_fiscal TIMESTAMPTZ;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS link_ultima_cnd TEXT;

COMMENT ON COLUMN clientes.situacao_federal IS 'Status da CND na Receita Federal (e-CAC)';
COMMENT ON COLUMN clientes.situacao_estadual IS 'Status da CND na SEFAZ (MS)';
COMMENT ON COLUMN clientes.data_ultima_consulta_fiscal IS 'Data e hora da última verificação automática ou manual';

-- Comentários para documentação
COMMENT ON TABLE configuracao_obrigacoes IS 'Define quais obrigações cada tipo de regime deve cumprir';
COMMENT ON TABLE status_obrigacoes IS 'Rastreia a entrega mensal de cada obrigação por cliente';
