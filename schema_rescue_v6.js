const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function fixSchema() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    console.log('--- INICIANDO REPARO DE SCHEMA V6 ---');

    try {
        // 1. Adicionando a coluna updated_at na tabela core.escritorios
        console.log('[1/3] Normalizando core.escritorios (Adicionando updated_at)...');
        await client.query(`
      ALTER TABLE core.escritorios 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    `);
        console.log('✅ Tabela core.escritorios normalizada.');

        // 2. Refresh do Cache do PostgREST
        console.log('[2/3] Forçando Refresh do Cache PostgREST...');
        await client.query("NOTIFY pgrst, 'reload schema'");
        console.log('✅ Notificação de reload enviada com sucesso.');

        // 3. Garantindo Permissões em Proxy Views (Evitar 406)
        console.log('[3/3] Reforçando permissões em Proxy Views...');
        const views = ['escritorios', 'atendimentos', 'tarefas', 'vw_radar_semanal', 'vw_vencimentos_semanais'];
        for (const viewName of views) {
            await client.query(`GRANT ALL ON public.${viewName} TO authenticated, anon;`);
        }
        console.log('✅ Permissões de Proxy Views reforçadas.');

    } catch (err) {
        console.error('❌ ERRO NO REPARO:', err.message);
    } finally {
        await client.end();
        console.log('--- OPERAÇÃO FINALIZADA ---');
    }
}

fixSchema();
