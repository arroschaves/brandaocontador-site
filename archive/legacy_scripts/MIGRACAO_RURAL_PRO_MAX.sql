-- 💎 Migração: Sistema Rural e Empresarial Pro Max
-- Objetivo: Suporte a múltiplos CAEPF, CEI, Inscrições Estaduais e Unidades (Fazendas/Filiais)

-- 1. Tabela de Unidades Fiscais (Fazendas ou Filiais)
CREATE TABLE IF NOT EXISTS unidades_fiscais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    nome_identificador TEXT NOT NULL,          -- Ex: 'Fazenda Itaoca', 'Filial 02'
    tipo_unidade TEXT DEFAULT 'MATRIZ',        -- 'MATRIZ', 'FILIAL', 'PROPRIEDADE_RURAL'
    
    -- Documentação Específica
    documento_id TEXT,                         -- CNPJ (filial), CAEPF ou CEI
    inscricao_estadual TEXT,
    
    -- Campos Rurais (INCRA, CCIR, NIRF)
    numero_incra TEXT,
    numero_ccir TEXT,
    numero_nirf_sib TEXT,
    
    -- Localização da Unidade
    logradouro TEXT,
    cidade TEXT DEFAULT 'Sidrolândia',
    estado TEXT DEFAULT 'MS',
    cep TEXT,
    
    status TEXT DEFAULT 'ATIVA',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Controle de Validades (Alarmes do CRM)
CREATE TABLE IF NOT EXISTS controle_validades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    unidade_id UUID REFERENCES unidades_fiscais(id) ON DELETE CASCADE,
    
    tipo_documento TEXT NOT NULL,              -- 'CERTIFICADO_A1', 'CERTIFICADO_A3', 'CND_FEDERAL', 'CND_ESTADUAL', 'ALVARA', 'PROCURACAO', 'ITR', 'CCIR'
    numero_documento TEXT,
    data_emissao DATE,
    data_vencimento DATE NOT NULL,
    
    link_arquivo TEXT,                         -- Link para o Google Drive
    observacoes TEXT,
    
    notificado_30_dias BOOLEAN DEFAULT FALSE,
    notificado_07_dias BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Adicionar campos vitais ao Cliente (Pessoa Física)
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS data_nascimento DATE;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS nome_pai TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS nome_mae TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS rg_numero TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS rg_orgao_emissor TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS data_ultimo_registro_junta DATE; -- Alerta de 10 anos

-- 4. Índices para Performance
CREATE INDEX IF NOT EXISTS idx_unidades_cliente ON unidades_fiscais(cliente_id);
CREATE INDEX IF NOT EXISTS idx_validades_vencimento ON controle_validades(data_vencimento);

-- Comentários
COMMENT ON TABLE unidades_fiscais IS 'Armazena fazendas (para PF) ou filiais (para PJ)';
COMMENT ON TABLE controle_validades IS 'Cérebro de alarmes do CRM para CNDs e Certificados';
