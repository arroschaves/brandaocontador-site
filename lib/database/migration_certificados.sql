-- Tabela para Armazenamento Seguro de Certificados Digitais (Vault)
CREATE TABLE IF NOT EXISTS cliente_certificados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL DEFAULT 'A1',
    nome_arquivo TEXT NOT NULL,
    data_vencimento DATE,
    
    -- Dados de Criptografia do Certificado (lib/vault.ts)
    arquivo_dados TEXT NOT NULL, -- Base64 do dado encriptado
    arquivo_iv TEXT NOT NULL,    -- Hex
    arquivo_tag TEXT NOT NULL,   -- Hex
    
    -- Dados de Criptografia da Senha
    senha_dados TEXT NOT NULL,   -- Base64
    senha_iv TEXT NOT NULL,      -- Hex
    senha_tag TEXT NOT NULL,     -- Hex
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS
ALTER TABLE cliente_certificados ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS: Apenas usuários autenticados (ou admin se houver role)
CREATE POLICY "Acesso total para autenticados" ON cliente_certificados
    FOR ALL USING (auth.role() = 'authenticated');

-- Auditoria Zero-Trust: Trigger para registrar visualização? 
-- Na verdade a visualização será via API, onde faremos o log manualmente.
