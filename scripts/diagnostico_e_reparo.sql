-- ============================================================
-- SCRIPT DE DIAGNÓSTICO E REPARO — Brandão CRM
-- Execute no SQL Editor do Supabase
-- Data: 23/02/2026
-- ============================================================

-- 1. DIAGNÓSTICO: Clientes sem pasta no Google Drive
SELECT 
    id,
    razao_social,
    nome_fantasia,
    documento,
    created_at,
    drive_folder_id
FROM core.empresas
WHERE drive_folder_id IS NULL
ORDER BY created_at DESC;

-- ============================================================
-- 2. DIAGNÓSTICO: Total de clientes por situação
-- ============================================================
SELECT 
    COUNT(*) FILTER (WHERE drive_folder_id IS NOT NULL) AS com_pasta_drive,
    COUNT(*) FILTER (WHERE drive_folder_id IS NULL) AS sem_pasta_drive,
    COUNT(*) AS total_clientes
FROM core.empresas;

-- ============================================================
-- 3. DIAGNÓSTICO: Tabelas de log e atividade
-- ============================================================

-- Ver últimas atividades do Drive Watcher
SELECT 
    created_at,
    cliente_nome,
    tipo,
    categoria,
    descricao,
    arquivo_nome,
    status
FROM activity_log
ORDER BY created_at DESC
LIMIT 20;

-- Ver último scan do Drive Watcher
SELECT * FROM drive_scan_state ORDER BY last_scan_at DESC LIMIT 5;

-- ============================================================
-- 4. APLICAR MIGRATION PENDENTE (Fase F)
-- Execute este bloco separadamente:
-- ============================================================

-- 4a. Expansão do Cadastro Soberano (core.empresas)
ALTER TABLE core.empresas
ADD COLUMN IF NOT EXISTS senha_govbr VARCHAR(255),
ADD COLUMN IF NOT EXISTS senha_sefaz VARCHAR(255),
ADD COLUMN IF NOT EXISTS senha_simples_nacional VARCHAR(255),
ADD COLUMN IF NOT EXISTS data_abertura DATE,
ADD COLUMN IF NOT EXISTS natureza_juridica VARCHAR(255),
ADD COLUMN IF NOT EXISTS capital_social NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS inscricao_produtor_rural VARCHAR(255),
ADD COLUMN IF NOT EXISTS honorario_valor NUMERIC(10,2) DEFAULT 0;

-- 4b. Tabela core.alvaras
CREATE TABLE IF NOT EXISTS core.alvaras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES core.empresas(id) ON DELETE CASCADE,
    tipo VARCHAR(100) NOT NULL,
    numero_alvara VARCHAR(100),
    data_emissao DATE,
    data_vencimento DATE NOT NULL,
    drive_file_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4c. Tabela core.certidoes
CREATE TABLE IF NOT EXISTS core.certidoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES core.empresas(id) ON DELETE CASCADE,
    orgao VARCHAR(100) NOT NULL,
    codigo_controle VARCHAR(255),
    data_emissao DATE,
    data_vencimento DATE NOT NULL,
    drive_file_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Válida',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE core.alvaras ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.certidoes ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'alvaras' AND schemaname = 'core'
    ) THEN
        CREATE POLICY "Enable all for authenticated" ON core.alvaras 
        FOR ALL USING (auth.role() = 'authenticated') 
        WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'certidoes' AND schemaname = 'core'
    ) THEN
        CREATE POLICY "Enable all for authenticated" ON core.certidoes 
        FOR ALL USING (auth.role() = 'authenticated') 
        WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

RAISE NOTICE '✅ Migration Fase F aplicada com sucesso!';

-- ============================================================
-- 5. VERIFICAÇÃO FINAL
-- ============================================================
SELECT 
    table_schema,
    table_name
FROM information_schema.tables
WHERE table_schema IN ('core', 'fiscal', 'audit', 'storage_docs', 'compliance', 'public')
ORDER BY table_schema, table_name;
