-- Tabela para Armazenamento Seguro de Certificados Digitais (Vault)
-- Esta tabela armazena o tipo como 'A1 PF' ou 'A1 PJ' na coluna 'tipo'
CREATE TABLE IF NOT EXISTS cliente_certificados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL DEFAULT 'A1', -- Armazena 'A1 PF' ou 'A1 PJ'
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
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS
ALTER TABLE cliente_certificados ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Acesso total para autenticados" ON cliente_certificados
    FOR ALL USING (auth.role() = 'authenticated');
