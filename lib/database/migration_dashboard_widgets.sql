-- ============================================================================
-- MIGRATION: Dashboard Avançado - Sistema de Widgets
-- Descrição: Criação de tabelas para dados expandidos do cliente
-- Autor: Antigravity AI
-- Data: 2026-02-06
-- ============================================================================

-- Habilitar extensão UUID (caso não esteja habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABELA: certificados_digitais
-- Descrição: Gerenciamento de certificados digitais (CPF/CNPJ A1/A3) com vencimentos
-- ============================================================================

CREATE TABLE IF NOT EXISTS certificados_digitais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('cpf_a1', 'cpf_a3', 'cnpj_a1', 'cnpj_a3')),
    data_emissao DATE,
    data_vencimento DATE NOT NULL,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'vencido', 'renovado', 'cancelado')),
    arquivo_id UUID REFERENCES cliente_certificados(id), -- Vínculo com vault de certificados
    senha_criptografada TEXT, -- Senha do certificado (criptografada)
    observacoes TEXT,
    metadata JSONB, -- Dados extras: emissor, número de série, etc
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_cert_dig_cliente ON certificados_digitais(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cert_dig_vencimento ON certificados_digitais(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_cert_dig_status ON certificados_digitais(status);
CREATE INDEX IF NOT EXISTS idx_cert_dig_tipo ON certificados_digitais(tipo);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_certificados_digitais_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_certificados_digitais_updated_at
BEFORE UPDATE ON certificados_digitais
FOR EACH ROW
EXECUTE FUNCTION update_certificados_digitais_timestamp();

-- Trigger para atualizar status automaticamente (vencido)
CREATE OR REPLACE FUNCTION atualizar_status_certificado()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.data_vencimento < CURRENT_DATE AND NEW.status = 'ativo' THEN
        NEW.status = 'vencido';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_status_certificado_vencimento
BEFORE INSERT OR UPDATE ON certificados_digitais
FOR EACH ROW
EXECUTE FUNCTION atualizar_status_certificado();

-- Row Level Security (RLS)
ALTER TABLE certificados_digitais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver certificados dos seus clientes"
ON certificados_digitais FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem inserir certificados"
ON certificados_digitais FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem atualizar certificados"
ON certificados_digitais FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem deletar certificados"
ON certificados_digitais FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE certificados_digitais;

-- ============================================================================
-- TABELA: certidoes_negativas
-- Descrição: Gerenciamento de certidões negativas (Federal, Estadual, Municipal, FGTS, TRT)
-- ============================================================================

CREATE TABLE IF NOT EXISTS certidoes_negativas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('federal', 'estadual', 'municipal', 'fgts', 'trt', 'sefaz_ms')),
    numero TEXT, -- Número/Código da certidão
    data_emissao DATE,
    data_vencimento DATE NOT NULL,
    arquivo_url TEXT, -- Link do Google Drive ou caminho local
    status TEXT DEFAULT 'valida' CHECK (status IN ('valida', 'vencida', 'renovada', 'pendente')),
    orgao_emissor TEXT, -- Ex: "Receita Federal do Brasil"
    observacoes TEXT,
    metadata JSONB, -- Dados extras
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_certidao_cliente ON certidoes_negativas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_certidao_vencimento ON certidoes_negativas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_certidao_status ON certidoes_negativas(status);
CREATE INDEX IF NOT EXISTS idx_certidao_tipo ON certidoes_negativas(tipo);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_certidoes_negativas_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_certidoes_negativas_updated_at
BEFORE UPDATE ON certidoes_negativas
FOR EACH ROW
EXECUTE FUNCTION update_certidoes_negativas_timestamp();

-- Trigger para atualizar status automaticamente (vencida)
CREATE OR REPLACE FUNCTION atualizar_status_certidao()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.data_vencimento < CURRENT_DATE AND NEW.status = 'valida' THEN
        NEW.status = 'vencida';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_status_certidao_vencimento
BEFORE INSERT OR UPDATE ON certidoes_negativas
FOR EACH ROW
EXECUTE FUNCTION atualizar_status_certidao();

-- Row Level Security (RLS)
ALTER TABLE certidoes_negativas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver certidões dos seus clientes"
ON certidoes_negativas FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem inserir certidões"
ON certidoes_negativas FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem atualizar certidões"
ON certidoes_negativas FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem deletar certidões"
ON certidoes_negativas FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE certidoes_negativas;

-- ============================================================================
-- TABELA: alvaras_licencas
-- Descrição: Gerenciamento de alvarás e licenças (Bombeiro, Funcionamento, Sanitário, etc)
-- ============================================================================

CREATE TABLE IF NOT EXISTS alvaras_licencas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('bombeiro', 'funcionamento', 'vigilancia_sanitaria', 'meio_ambiente', 'policia_civil', 'policia_militar', 'outro')),
    numero TEXT,
    orgao_emissor TEXT, -- Ex: "Corpo de Bombeiros - SP"
    data_emissao DATE,
    data_vencimento DATE,
    proxima_inspecao DATE, -- Para alvarás que exigem inspeção periódica
    valor_renovacao NUMERIC(10,2), -- Custo estimado
    status TEXT DEFAULT 'valido' CHECK (status IN ('valido', 'vencido', 'em_renovacao', 'pendente', 'isento')),
    documentos_necessarios JSONB, -- Lista de documentos para renovação
    arquivo_url TEXT, -- Link do documento
    observacoes TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_alvara_cliente ON alvaras_licencas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_alvara_vencimento ON alvaras_licencas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_alvara_status ON alvaras_licencas(status);
CREATE INDEX IF NOT EXISTS idx_alvara_tipo ON alvaras_licencas(tipo);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_alvaras_licencas_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_alvaras_licencas_updated_at
BEFORE UPDATE ON alvaras_licencas
FOR EACH ROW
EXECUTE FUNCTION update_alvaras_licencas_timestamp();

-- Trigger para atualizar status automaticamente (vencido)
CREATE OR REPLACE FUNCTION atualizar_status_alvara()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.data_vencimento IS NOT NULL AND NEW.data_vencimento < CURRENT_DATE AND NEW.status = 'valido' THEN
        NEW.status = 'vencido';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_status_alvara_vencimento
BEFORE INSERT OR UPDATE ON alvaras_licencas
FOR EACH ROW
EXECUTE FUNCTION atualizar_status_alvara();

-- Row Level Security (RLS)
ALTER TABLE alvaras_licencas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver alvarás dos seus clientes"
ON alvaras_licencas FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem inserir alvarás"
ON alvaras_licencas FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem atualizar alvarás"
ON alvaras_licencas FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem deletar alvarás"
ON alvaras_licencas FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE alvaras_licencas;

-- ============================================================================
-- TABELA: situacao_fiscal_historico
-- Descrição: Histórico de consultas de situação fiscal (Federal, Estadual, Municipal)
-- ============================================================================

CREATE TABLE IF NOT EXISTS situacao_fiscal_historico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    esfera TEXT NOT NULL CHECK (esfera IN ('federal', 'estadual', 'municipal')),
    situacao TEXT NOT NULL CHECK (situacao IN ('regular', 'irregular', 'pendente', 'suspensa', 'baixada', 'inapta')),
    detalhes JSONB, -- Débitos, pendências, motivo da irregularidade, etc
    data_consulta TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    consultado_por TEXT, -- User ID ou 'sistema_automatico'
    fonte TEXT, -- API utilizada: 'receitaws', 'sintegra', etc
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_situacao_cliente ON situacao_fiscal_historico(cliente_id);
CREATE INDEX IF NOT EXISTS idx_situacao_data ON situacao_fiscal_historico(data_consulta DESC);
CREATE INDEX IF NOT EXISTS idx_situacao_esfera ON situacao_fiscal_historico(esfera);
CREATE INDEX IF NOT EXISTS idx_situacao_status ON situacao_fiscal_historico(situacao);

-- Row Level Security (RLS)
ALTER TABLE situacao_fiscal_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver situação fiscal dos seus clientes"
ON situacao_fiscal_historico FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem inserir registros de situação fiscal"
ON situacao_fiscal_historico FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem deletar registros de situação fiscal"
ON situacao_fiscal_historico FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE situacao_fiscal_historico;

-- ============================================================================
-- TABELA: propriedades_rurais
-- Descrição: Propriedades rurais vinculadas a clientes CPF (Produtores Rurais)
-- ============================================================================

CREATE TABLE IF NOT EXISTS propriedades_rurais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    nome_fazenda TEXT NOT NULL,
    car TEXT UNIQUE, -- Cadastro Ambiental Rural
    itr TEXT, -- Inscrição ITR
    ccir TEXT, -- Certificado de Cadastro de Imóvel Rural
    area_hectares NUMERIC(10,2),
    municipio TEXT,
    uf TEXT CHECK (LENGTH(uf) = 2),
    endereco_completo TEXT,
    atividade_principal TEXT, -- Ex: "Pecuária de Corte", "Agricultura - Soja"
    atividades_secundarias TEXT[], -- Array de atividades
    coordenadas_gps TEXT, -- Lat, Long
    observacoes TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_propriedade_cliente ON propriedades_rurais(cliente_id);
CREATE INDEX IF NOT EXISTS idx_propriedade_municipio ON propriedades_rurais(municipio);
CREATE INDEX IF NOT EXISTS idx_propriedade_uf ON propriedades_rurais(uf);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_propriedades_rurais_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_propriedades_rurais_updated_at
BEFORE UPDATE ON propriedades_rurais
FOR EACH ROW
EXECUTE FUNCTION update_propriedades_rurais_timestamp();

-- Row Level Security (RLS)
ALTER TABLE propriedades_rurais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver propriedades dos seus clientes"
ON propriedades_rurais FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem inserir propriedades"
ON propriedades_rurais FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem atualizar propriedades"
ON propriedades_rurais FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem deletar propriedades"
ON propriedades_rurais FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE propriedades_rurais;

-- ============================================================================
-- VIEWS ÚTEIS
-- ============================================================================

-- View: Certificados próximos do vencimento (< 60 dias)
CREATE OR REPLACE VIEW vw_certificados_vencendo AS
SELECT 
    c.id,
    c.cliente_id,
    cl.nome as cliente_nome,
    cl.cnpj_cpf,
    c.tipo,
    c.data_vencimento,
    c.status,
    (c.data_vencimento - CURRENT_DATE) as dias_restantes
FROM certificados_digitais c
JOIN clientes cl ON c.cliente_id = cl.id
WHERE c.status = 'ativo' 
  AND c.data_vencimento BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '60 days')
ORDER BY c.data_vencimento ASC;

-- View: Certidões próximas do vencimento (< 30 dias)
CREATE OR REPLACE VIEW vw_certidoes_vencendo AS
SELECT 
    cert.id,
    cert.cliente_id,
    cl.nome as cliente_nome,
    cl.cnpj_cpf,
    cert.tipo,
    cert.data_vencimento,
    cert.status,
    (cert.data_vencimento - CURRENT_DATE) as dias_restantes
FROM certidoes_negativas cert
JOIN clientes cl ON cert.cliente_id = cl.id
WHERE cert.status = 'valida' 
  AND cert.data_vencimento BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30 days')
ORDER BY cert.data_vencimento ASC;

-- View: Alvarás próximos do vencimento (< 90 dias)
CREATE OR REPLACE VIEW vw_alvaras_vencendo AS
SELECT 
    a.id,
    a.cliente_id,
    cl.nome as cliente_nome,
    cl.cnpj_cpf,
    a.tipo,
    a.data_vencimento,
    a.status,
    (a.data_vencimento - CURRENT_DATE) as dias_restantes
FROM alvaras_licencas a
JOIN clientes cl ON a.cliente_id = cl.id
WHERE a.status = 'valido' 
  AND a.data_vencimento IS NOT NULL
  AND a.data_vencimento BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '90 days')
ORDER BY a.data_vencimento ASC;

-- View: Última situação fiscal de cada cliente
CREATE OR REPLACE VIEW vw_situacao_fiscal_atual AS
SELECT DISTINCT ON (cliente_id, esfera)
    sfh.cliente_id,
    cl.nome as cliente_nome,
    cl.cnpj_cpf,
    sfh.esfera,
    sfh.situacao,
    sfh.detalhes,
    sfh.data_consulta
FROM situacao_fiscal_historico sfh
JOIN clientes cl ON sfh.cliente_id = cl.id
ORDER BY cliente_id, esfera, data_consulta DESC;

-- ============================================================================
-- FUNCTIONS UTILITÁRIAS
-- ============================================================================

-- Função: Buscar próximos vencimentos de um cliente
CREATE OR REPLACE FUNCTION get_proximos_vencimentos(p_cliente_id UUID)
RETURNS TABLE (
    tipo_item TEXT,
    descricao TEXT,
    data_vencimento DATE,
    dias_restantes INT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Certificados
    SELECT 
        'certificado'::TEXT,
        c.tipo::TEXT,
        c.data_vencimento,
        (c.data_vencimento - CURRENT_DATE)::INT,
        c.status
    FROM certificados_digitais c
    WHERE c.cliente_id = p_cliente_id
      AND c.status = 'ativo'
      AND c.data_vencimento > CURRENT_DATE
    UNION ALL
    -- Certidões
    SELECT 
        'certidao'::TEXT,
        cert.tipo::TEXT,
        cert.data_vencimento,
        (cert.data_vencimento - CURRENT_DATE)::INT,
        cert.status
    FROM certidoes_negativas cert
    WHERE cert.cliente_id = p_cliente_id
      AND cert.status = 'valida'
      AND cert.data_vencimento > CURRENT_DATE
    UNION ALL
    -- Alvarás
    SELECT 
        'alvara'::TEXT,
        a.tipo::TEXT,
        a.data_vencimento,
        (a.data_vencimento - CURRENT_DATE)::INT,
        a.status
    FROM alvaras_licencas a
    WHERE a.cliente_id = p_cliente_id
      AND a.status = 'valido'
      AND a.data_vencimento IS NOT NULL
      AND a.data_vencimento > CURRENT_DATE
    ORDER BY data_vencimento ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DADOS DE EXEMPLO (OPCIONAL - COMENTADO)
-- ============================================================================

/*
-- Inserir certificado de exemplo
INSERT INTO certificados_digitais (cliente_id, tipo, data_emissao, data_vencimento) 
VALUES (
    (SELECT id FROM clientes LIMIT 1),
    'cnpj_a1',
    '2025-06-01',
    '2026-06-01'
);

-- Inserir certidão de exemplo
INSERT INTO certidoes_negativas (cliente_id, tipo, data_emissao, data_vencimento)
VALUES (
    (SELECT id FROM clientes LIMIT 1),
    'federal',
    '2025-12-01',
    '2026-02-28'
);
*/

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

COMMENT ON TABLE certificados_digitais IS 'Gerenciamento de certificados digitais (CPF/CNPJ A1/A3) com controle de vencimentos';
COMMENT ON TABLE certidoes_negativas IS 'Gerenciamento de certidões negativas (Federal, Estadual, Municipal, FGTS, TRT)';
COMMENT ON TABLE alvaras_licencas IS 'Gerenciamento de alvarás e licenças (Bombeiro, Funcionamento, Sanitário, Ambiental)';
COMMENT ON TABLE situacao_fiscal_historico IS 'Histórico de consultas de situação fiscal nas 3 esferas';
COMMENT ON TABLE propriedades_rurais IS 'Propriedades rurais vinculadas a produtores rurais (CPF)';
