const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function createRadarIntelligence() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    console.log('🚀 Criando Super Radar de Inteligência (Analytics) v2...');

    try {
        await client.connect();

        const sql = `
            -- 1. Garantir que o esquema analytics existe
            CREATE SCHEMA IF NOT EXISTS analytics;

            -- 2. Super View do Radar Semanal (O Coração do Relatório de Segunda-feira)
            -- Ajustada para usar 'fiscal.calendario' que é a tabela de instâncias atual.
            CREATE OR REPLACE VIEW analytics.vw_radar_semanal AS
            WITH VencimentosFiscais AS (
                SELECT 
                    'GUIA_FISC_IA' as origem,
                    dp.vencimento,
                    dp.tipo::text as descricao,
                    e.nome_fantasia as empresa,
                    dp.valor,
                    dp.empresa_id
                FROM compliance.documentos_processados dp
                JOIN core.empresas e ON e.id = dp.empresa_id
                WHERE dp.vencimento >= CURRENT_DATE 
                AND dp.vencimento <= CURRENT_DATE + INTERVAL '7 days'
            ),
            Certificados AS (
                SELECT 
                    'CERTIFICADO_DIGITAL' as origem,
                    validade as vencimento,
                    'Vencimento de Certificado (' || tipo || ')' as descricao,
                    e.nome_fantasia as empresa,
                    0 as valor,
                    c.empresa_id
                FROM core.certificados_digitais c
                JOIN core.empresas e ON e.id = c.empresa_id
                WHERE validade >= CURRENT_DATE 
                AND validade <= CURRENT_DATE + INTERVAL '15 days'
            ),
            Obrigacoes AS (
                SELECT 
                    'OBRIGACAO_FISCAL' as origem,
                    o.data_vencimento as vencimento,
                    t.nome as descricao,
                    e.nome_fantasia as empresa,
                    0 as valor,
                    o.empresa_id
                FROM fiscal.calendario o
                JOIN core.empresas e ON e.id = o.empresa_id
                JOIN fiscal.obrigacoes_templates t ON t.id = o.template_id
                WHERE o.status = 'pendente'
                AND o.data_vencimento >= CURRENT_DATE 
                AND o.data_vencimento <= CURRENT_DATE + INTERVAL '7 days'
            )
            SELECT * FROM VencimentosFiscais
            UNION ALL
            SELECT * FROM Certificados
            UNION ALL
            SELECT * FROM Obrigacoes;

            COMMENT ON VIEW analytics.vw_radar_semanal IS 'Radar centralizado para relatórios semanais e alertas proativos (v2).';
        `;

        await client.query(sql);
        console.log('✅ Radar de Inteligência Semanal criado com sucesso!');
    } catch (err) {
        console.error('❌ Erro no Radar:', err);
    } finally {
        await client.end();
    }
}

createRadarIntelligence();
