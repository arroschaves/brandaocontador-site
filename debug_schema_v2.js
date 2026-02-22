const { Client } = require('pg');
require('dotenv').config();

async function runDiagnosis() {
    // Conexão com o banco de dados via DATABASE_URL
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    console.log('--- DIAGNÓSTICO DE SCHEMA SOBERANO ---');

    try {
        // 1. Verificando colunas da tabela core.escritorios
        console.log('\n[1] Verificando core.escritorios:');
        const colsRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'core' AND table_name = 'escritorios'
    `);
        console.table(colsRes.rows);

        // 2. Verificando configuração do PostgREST (db_schemas)
        console.log('\n[2] Verificando pgrst.db_schemas:');
        const pgrstRes = await client.query("SHOW pgrst.db_schemas");
        console.log('pgrst.db_schemas:', pgrstRes.rows[0]);

        // 3. Verificando search_path atual
        console.log('\n[3] Verificando search_path:');
        const searchPathRes = await client.query("SHOW search_path");
        console.log('search_path:', searchPathRes.rows[0]);

        // 4. Verificando proxies no schema public (onde ocorrem os erros 406)
        console.log('\n[4] Verificando Proxies em public:');
        const proxiesRes = await client.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name = 'escritorios' OR table_name = 'atendimentos' OR table_name = 'tarefas')
    `);
        console.table(proxiesRes.rows);

        // 5. Verificando se as views estão apontando corretamente
        console.log('\n[5] Definição da View vw_radar_semanal (Exemplo de 406):');
        const viewDef = await client.query(`
      SELECT view_definition 
      FROM information_schema.views 
      WHERE table_schema = 'public' AND table_name = 'vw_radar_semanal'
    `);
        if (viewDef.rows.length > 0) {
            console.log('Definição:', viewDef.rows[0].view_definition);
        } else {
            console.log('View vw_radar_semanal não encontrada em public.');
        }

    } catch (err) {
        console.error('ERRO CRÍTICO NO DIAGNÓSTICO:', err.message);
    } finally {
        await client.end();
        console.log('\n--- FIM DO DIAGNÓSTICO ---');
    }
}

runDiagnosis();
