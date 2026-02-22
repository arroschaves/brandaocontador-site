const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function check() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    console.log('--- AUDITORIA DE RELACIONAMENTOS (PGRST201/200) ---');

    // 1. Verificar atendimentos -> empresas
    console.log('\n[1] Checando Foreign Keys para atendimentos:');
    const fks = await client.query(`
        SELECT
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name,
            tc.constraint_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name = 'atendimentos'
          AND tc.table_schema = 'core';
    `);
    console.table(fks.rows);

    // 2. Verificar tarefas -> equipe
    console.log('\n[2] Checando Foreign Keys para tarefas -> equipe:');
    const fksTarefas = await client.query(`
        SELECT
            tc.table_name, 
            kcu.column_name, 
            ccu.table_schema AS foreign_schema,
            ccu.table_name AS foreign_table_name,
            tc.constraint_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.table_name = 'tarefas'
          AND tc.table_schema = 'workflow';
    `);
    console.table(fksTarefas.rows);

    // 3. Verificar o que existe no schema cache do PostgREST
    console.log('\n[3] Checando tabelas de equipe/usuarios:');
    const tables = await client.query(`
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_name IN ('equipe', 'usuarios', 'empresas')
        ORDER BY table_name;
    `);
    console.table(tables.rows);

    await client.end();
}

check().catch(console.error);
