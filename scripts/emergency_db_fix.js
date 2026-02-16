require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function emergencyFix() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log('🔗 Conectado ao banco para Correção de Emergência...');

        const sql = `
            -- 1. Criar Foreign Key faltante entre Calendário e Empresas
            -- Isso resolve o erro "Could not find a relationship"
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'calendario_empresa_id_fkey') THEN
                    ALTER TABLE fiscal.calendario 
                    ADD CONSTRAINT calendario_empresa_id_fkey 
                    FOREIGN KEY (empresa_id) REFERENCES core.empresas(id) ON DELETE CASCADE;
                END IF;
            END $$;

            -- 2. Criar tabelas de apoio que sumiram ou estão desalinhadas
            CREATE TABLE IF NOT EXISTS core.atendimentos (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                empresa_id UUID REFERENCES core.empresas(id) ON DELETE CASCADE,
                mensagem TEXT,
                pushname TEXT,
                status TEXT DEFAULT 'pendente',
                created_at TIMESTAMPTZ DEFAULT now()
            );

            CREATE TABLE IF NOT EXISTS core.unidades_fiscais (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                empresa_id UUID REFERENCES core.empresas(id) ON DELETE CASCADE,
                nome TEXT,
                tipo TEXT,
                created_at TIMESTAMPTZ DEFAULT now()
            );

            -- 3. Garantir Permissões de Leitura para Web (PostgREST)
            GRANT USAGE ON SCHEMA core TO anon, authenticated;
            GRANT USAGE ON SCHEMA fiscal TO anon, authenticated;
            GRANT USAGE ON SCHEMA audit TO anon, authenticated;

            GRANT SELECT ON ALL TABLES IN SCHEMA core TO anon, authenticated;
            GRANT SELECT ON ALL TABLES IN SCHEMA fiscal TO anon, authenticated;
            GRANT SELECT ON ALL TABLES IN SCHEMA audit TO anon, authenticated;

            -- 4. Habilitar RLS e criar políticas de leitura pública controlada
            ALTER TABLE core.atendimentos ENABLE ROW LEVEL SECURITY;
            ALTER TABLE core.unidades_fiscais ENABLE ROW LEVEL SECURITY;

            DROP POLICY IF EXISTS "Leitura Pública Atendimentos" ON core.atendimentos;
            CREATE POLICY "Leitura Pública Atendimentos" ON core.atendimentos FOR SELECT TO public USING (true);

            DROP POLICY IF EXISTS "Leitura Pública Unidades" ON core.unidades_fiscais;
            CREATE POLICY "Leitura Pública Unidades" ON core.unidades_fiscais FOR SELECT TO public USING (true);

            -- 5. Recriar a View de Resumo do Dashboard (para garantir que funcione)
            CREATE OR REPLACE VIEW fiscal.vw_resumo_dashboard AS
            SELECT 
                (SELECT count(*) FROM core.empresas) as total_clientes,
                (SELECT count(*) FROM fiscal.calendario WHERE status = 'PENDENTE' AND mes_referencia = EXTRACT(MONTH FROM CURRENT_DATE) AND ano_referencia = EXTRACT(YEAR FROM CURRENT_DATE)) as pendentes_mes,
                (SELECT count(*) FROM fiscal.calendario WHERE status = 'CONCLUIDO' AND mes_referencia = EXTRACT(MONTH FROM CURRENT_DATE) AND ano_referencia = EXTRACT(YEAR FROM CURRENT_DATE)) as concluidos_mes;

            GRANT SELECT ON fiscal.vw_resumo_dashboard TO anon, authenticated;
        `;

        await client.query(sql);
        console.log('✅ CORREÇÃO DE INFRAESTRUTURA APLICADA!');

    } catch (err) {
        console.error('❌ ERRO NA CORREÇÃO:', err.message);
    } finally {
        await client.end();
    }
}

emergencyFix();
