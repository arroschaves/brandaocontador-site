require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applyMasterSecurity() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        console.log('🔗 Conectando diretamente ao PostgreSQL...');
        await client.connect();
        console.log('✅ Conectado!');

        const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260216_seguranca_master_rls.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🛡️ Aplicando Protocolo de LOCKDOWN (RLS)...');
        await client.query(sql);
        console.log('✅ SEGURANÇA APLICADA COM SUCESSO!');

        // Extra: Garantir que o Dashboard tenha as Views necessárias se não existirem
        console.log('📊 Verificando Views do Dashboard...');
        const viewsSql = `
            CREATE OR REPLACE VIEW fiscal.vw_resumo_dashboard AS
            SELECT 
                (SELECT count(*) FROM core.empresas WHERE status = 'ATIVO') as total_clientes,
                (SELECT count(*) FROM fiscal.calendario WHERE status = 'PENDENTE' AND mes_referencia = EXTRACT(MONTH FROM CURRENT_DATE) AND ano_referencia = EXTRACT(YEAR FROM CURRENT_DATE)) as pendentes_mes,
                (SELECT count(*) FROM fiscal.calendario WHERE status = 'CONCLUIDO' AND mes_referencia = EXTRACT(MONTH FROM CURRENT_DATE) AND ano_referencia = EXTRACT(YEAR FROM CURRENT_DATE)) as concluidos_mes;
        `;
        await client.query(viewsSql);
        console.log('✅ Views de Auditoria Criadas!');

    } catch (err) {
        console.error('❌ ERRO CRÍTICO NA OPERAÇÃO:', err.message);
    } finally {
        await client.end();
        console.log('🔌 Conexão encerrada.');
    }
}

applyMasterSecurity();
