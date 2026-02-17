const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function setupAuditAndMaestro() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const sql = `
            -- 1. Garantir audit.logs existe
            CREATE SCHEMA IF NOT EXISTS audit;
            CREATE TABLE IF NOT EXISTS audit.logs (
                id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                usuario_id uuid,
                acao text,
                tabela text,
                registro_id uuid,
                antes jsonb,
                depois jsonb,
                created_at timestamptz DEFAULT now()
            );

            CREATE OR REPLACE FUNCTION audit.log_geral()
            RETURNS trigger AS $$
            DECLARE
                v_user_id uuid;
            BEGIN
                BEGIN
                    v_user_id := auth.uid();
                EXCEPTION WHEN OTHERS THEN
                    v_user_id := NULL;
                END;

                INSERT INTO audit.logs(usuario_id, acao, tabela, registro_id, antes, depois)
                VALUES(v_user_id, tg_op, tg_table_name, COALESCE(new.id, old.id), to_jsonb(old), to_jsonb(new));
                RETURN new;
            END;
            $$ LANGUAGE plpgsql;

            -- 3. Iniciar Migração Maestro Vision
            CREATE SCHEMA IF NOT EXISTS compliance;

            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_documento_maestro') THEN
                    CREATE TYPE compliance.tipo_documento_maestro AS ENUM (
                        'DAS', 'FGTS', 'INSS', 'DARF', 'PGDAS', 'DEFIS', 'ITR', 'CCIR', 
                        'HOLERITE', 'GUIA_DAEMS', 'CERTIDAO', 'CNPJ', 'CPF', 'RG', 'CNH', 
                        'PROCESSO_JUCEMS', 'CONTRATO_SOCIAL', 'NOTA_FISCAL', 'IBAMA', 'IAGRO', 
                        'SEFAZ_MS', 'RECEITA_FEDERAL', 'SST_PCMSO', 'SST_PGR', 'SST_LTCAT', 'SST_ASO',
                        'OUTROS'
                    );
                END IF;
            END $$;

            CREATE TABLE IF NOT EXISTS compliance.documentos_processados (
                id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                documento_id uuid REFERENCES storage_docs.documentos(id),
                empresa_id uuid REFERENCES core.empresas(id),
                tipo compliance.tipo_documento_maestro NOT NULL,
                competencia date,
                vencimento date,
                valor numeric(15,2),
                metadata_ia jsonb DEFAULT '{}',
                status_processamento text DEFAULT 'sucesso' CHECK (status_processamento IN ('sucesso', 'erro', 'revisao')),
                processado_em timestamptz DEFAULT now(),
                criado_por uuid
            );

            CREATE INDEX IF NOT EXISTS idx_doc_proc_empresa ON compliance.documentos_processados(empresa_id);
            CREATE INDEX IF NOT EXISTS idx_doc_proc_vencimento ON compliance.documentos_processados(vencimento);
            CREATE INDEX IF NOT EXISTS idx_doc_proc_tipo ON compliance.documentos_processados(tipo);

            DROP TRIGGER IF EXISTS audit_doc_processados ON compliance.documentos_processados;
            CREATE TRIGGER audit_doc_processados
            AFTER INSERT OR UPDATE OR DELETE ON compliance.documentos_processados
            FOR EACH ROW EXECUTE FUNCTION audit.log_geral();

            CREATE OR REPLACE VIEW compliance.vw_vencimentos_semanais AS
            SELECT 
                dp.vencimento,
                dp.tipo,
                e.nome_fantasia,
                e.razao_social,
                dp.valor,
                d.drive_file_id
            FROM compliance.documentos_processados dp
            JOIN core.empresas e ON e.id = dp.empresa_id
            JOIN storage_docs.documentos d ON d.id = dp.documento_id
            WHERE dp.vencimento >= CURRENT_DATE 
            AND dp.vencimento <= CURRENT_DATE + INTERVAL '7 days'
            ORDER BY dp.vencimento ASC;
        `;

        await client.query(sql);
        console.log('✅ Tudo configurado: Auditoria + Maestro Vision!');
    } catch (err) {
        console.error('❌ Erro Fatal:', err);
    } finally {
        await client.end();
    }
}

setupAuditAndMaestro();
