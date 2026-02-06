-- ============================================================================
-- Migration: Cliente Wiki (Dossiê Técnico)
-- Descrição: Corrige erro crítico - cria tabela cliente_wiki que estava faltando
-- ============================================================================

-- Criar tabela principal
CREATE TABLE IF NOT EXISTS cliente_wiki (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID UNIQUE NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    conteudo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para busca rápida por cliente
CREATE INDEX IF NOT EXISTS idx_cliente_wiki_cliente_id ON cliente_wiki(cliente_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_cliente_wiki_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_cliente_wiki_updated_at ON cliente_wiki;
CREATE TRIGGER trigger_cliente_wiki_updated_at
    BEFORE UPDATE ON cliente_wiki
    FOR EACH ROW
    EXECUTE FUNCTION update_cliente_wiki_timestamp();

-- Habilitar Row Level Security (RLS)
ALTER TABLE cliente_wiki ENABLE ROW LEVEL SECURITY;

-- Política de acesso: usuários autenticados podem acessar todos os registros
CREATE POLICY "Acesso total para autenticados" ON cliente_wiki
    FOR ALL USING (auth.role() = 'authenticated');

-- Habilitar Realtime para sincronização em tempo real
ALTER PUBLICATION supabase_realtime ADD TABLE cliente_wiki;

-- Comentários
COMMENT ON TABLE cliente_wiki IS 'Armazena dossiês técnicos e notas sobre clientes';
COMMENT ON COLUMN cliente_wiki.conteudo IS 'Conteúdo do dossiê técnico em formato texto';
