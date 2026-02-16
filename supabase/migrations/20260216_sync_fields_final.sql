-- ============================================================
-- 🛠️ SINCRONIZAÇÃO FINAL DE CAMPOS — CORE.EMPRESAS
-- Garante que o Cérebro (DB) e o Sistema Nervoso (API/N8N)
-- falem a mesma língua (CNPJ vs CNPJ_CPF vs DOCUMENTO)
-- ============================================================

-- 1. Adicionar ALIASES e campos que a API/N8N esperam
ALTER TABLE core.empresas 
    ADD COLUMN IF NOT EXISTS nome TEXT, 
    ADD COLUMN IF NOT EXISTS cnpj_cpf TEXT, 
    ADD COLUMN IF NOT EXISTS telefone_whatsapp TEXT,
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS logradouro TEXT,
    ADD COLUMN IF NOT EXISTS numero TEXT,
    ADD COLUMN IF NOT EXISTS bairro TEXT,
    ADD COLUMN IF NOT EXISTS cep TEXT,
    ADD COLUMN IF NOT EXISTS cidade TEXT,
    ADD COLUMN IF NOT EXISTS estado TEXT,
    ADD COLUMN IF NOT EXISTS inscricao_estadual TEXT,
    ADD COLUMN IF NOT EXISTS inscricao_municipal TEXT,
    ADD COLUMN IF NOT EXISTS status_rfb TEXT,
    ADD COLUMN IF NOT EXISTS telefone TEXT,
    ADD COLUMN IF NOT EXISTS natureza_juridica TEXT,
    ADD COLUMN IF NOT EXISTS porte TEXT,
    ADD COLUMN IF NOT EXISTS atividade_principal TEXT,
    ADD COLUMN IF NOT EXISTS tipo_pessoa TEXT,
    ADD COLUMN IF NOT EXISTS cnae_principal TEXT,
    ADD COLUMN IF NOT EXISTS status_setup TEXT DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS vencimento_alvara_funcionamento DATE,
    ADD COLUMN IF NOT EXISTS vencimento_alvara_sanitario DATE,
    ADD COLUMN IF NOT EXISTS vencimento_alvara_bombeiros DATE,
    ADD COLUMN IF NOT EXISTS vencimento_alvara_ambiental DATE,
    ADD COLUMN IF NOT EXISTS vencimento_certidao_negativa_federal DATE,
    ADD COLUMN IF NOT EXISTS vencimento_certidao_negativa_estadual DATE,
    ADD COLUMN IF NOT EXISTS vencimento_certidao_negativa_municipal DATE,
    ADD COLUMN IF NOT EXISTS vencimento_certidao_fgts DATE;

-- 2. Corrigir Trigger de Classificação para suportar cnpj_cpf
CREATE OR REPLACE FUNCTION core.trigger_classificar_cliente()
RETURNS TRIGGER AS $$
BEGIN
    -- Priorizar cnpj_cpf se existir
    IF NEW.cnpj_cpf IS NOT NULL THEN
        NEW.cnpj_cpf := REGEXP_REPLACE(NEW.cnpj_cpf, '[^0-9]', '', 'g');
        -- Sincronizar com campo legado 'cnpj' para compatibilidade
        NEW.cnpj := NEW.cnpj_cpf;
        
        IF LENGTH(NEW.cnpj_cpf) = 11 THEN
            NEW.tipo_pessoa := 'PF';
        ELSIF LENGTH(NEW.cnpj_cpf) = 14 THEN
            NEW.tipo_pessoa := 'PJ';
        END IF;
    END IF;

    -- Se 'nome' for nulo mas 'razao_social' não, preenche 'nome'
    IF NEW.nome IS NULL AND NEW.razao_social IS NOT NULL THEN
        NEW.nome := NEW.razao_social;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Garantir que o N8N tenha permissão de leitura/escrita no schema core
-- (Isso deve ser feito via painel do Supabase, mas garantimos RLS aqui)
ALTER TABLE core.empresas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "N8N Multi-tenant Access" ON core.empresas;
CREATE POLICY "N8N Multi-tenant Access" ON core.empresas
    FOR ALL
    USING (true) -- Em produção, restringir ao service_role
    WITH CHECK (true);

-- 4. Criar VIEW de compatibilidade no public para n8n não quebrar se não usar schema prefix
CREATE OR REPLACE VIEW public.clientes AS SELECT * FROM core.empresas;
CREATE OR REPLACE VIEW public.atendimentos AS SELECT * FROM core.atendimentos;

SELECT 'SINCRONIZAÇÃO COMPLETA — CORE.EMPRESAS PRONTA' as status;
