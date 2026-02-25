-- 1. Expansão do Cadastro Soberano (core.empresas)
ALTER TABLE core.empresas
ADD COLUMN IF NOT EXISTS senha_govbr VARCHAR(255),
ADD COLUMN IF NOT EXISTS senha_sefaz VARCHAR(255),
ADD COLUMN IF NOT EXISTS senha_simples_nacional VARCHAR(255),
ADD COLUMN IF NOT EXISTS data_abertura DATE,
ADD COLUMN IF NOT EXISTS natureza_juridica VARCHAR(255),
ADD COLUMN IF NOT EXISTS capital_social NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS inscricao_produtor_rural VARCHAR(255),
ADD COLUMN IF NOT EXISTS honorario_valor NUMERIC(10,2) DEFAULT 0;

-- 2. Tabela core.alvaras
CREATE TABLE IF NOT EXISTS core.alvaras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES core.empresas(id) ON DELETE CASCADE,
    tipo VARCHAR(100) NOT NULL, -- 'Bombeiros', 'Prefeitura', 'Sanitário', 'Meio Ambiente', etc
    numero_alvara VARCHAR(100),
    data_emissao DATE,
    data_vencimento DATE NOT NULL,
    drive_file_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela core.certidoes
CREATE TABLE IF NOT EXISTS core.certidoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES core.empresas(id) ON DELETE CASCADE,
    orgao VARCHAR(100) NOT NULL, -- 'RFB', 'FGTS', 'Estadual', 'Trabalhista', 'Municipal'
    codigo_controle VARCHAR(255),
    data_emissao DATE,
    data_vencimento DATE NOT NULL,
    drive_file_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Válida',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS e Policies para as novas tabelas
ALTER TABLE core.alvaras ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.certidoes ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'alvaras' AND schemaname = 'core' AND policyname = 'Enable all operations for authenticated users'
    ) THEN
        CREATE POLICY "Enable all operations for authenticated users" ON core.alvaras FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'certidoes' AND schemaname = 'core' AND policyname = 'Enable all operations for authenticated users'
    ) THEN
        CREATE POLICY "Enable all operations for authenticated users" ON core.certidoes FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;
