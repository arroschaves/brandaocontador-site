const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function check() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    console.log('--- AUDITORIA DETALHADA DE CONSTRAINTS ---');

    // 1. Atendimentos
    const sqlAtend = `
        SELECT conname as constraint, 
               conrelid::regclass as table, 
               confrelid::regclass as foreign_table,
               pg_get_constraintdef(oid) as definition
        FROM pg_constraint 
        WHERE conrelid = 'core.atendimentos'::regclass;
    `;
    const resAtend = await client.query(sqlAtend);
    console.log('\n[ATENDIMENTOS CONSTRAINTS]');
    console.table(resAtend.rows);

    // 2. Tarefas
    const sqlTarefas = `
        SELECT conname as constraint, 
               conrelid::regclass as table, 
               confrelid::regclass as foreign_table,
               pg_get_constraintdef(oid) as definition
        FROM pg_constraint 
        WHERE conrelid = 'workflow.tarefas'::regclass;
    `;
    const resTarefas = await client.query(sqlTarefas);
    console.log('\n[TAREFAS CONSTRAINTS]');
    console.table(resTarefas.rows);

    // 3. Eventos
    const sqlEventos = `
        SELECT conname as constraint, 
               conrelid::regclass as table, 
               confrelid::regclass as foreign_table,
               pg_get_constraintdef(oid) as definition
        FROM pg_constraint 
        WHERE conrelid = 'dp.eventos'::regclass;
    `;
    const resEventos = await client.query(sqlEventos);
    console.log('\n[EVENTOS CONSTRAINTS]');
    console.table(resEventos.rows);

    // 4. Calendario
    const sqlCal = `
        SELECT conname as constraint, 
               conrelid::regclass as table, 
               confrelid::regclass as foreign_table,
               pg_get_constraintdef(oid) as definition
        FROM pg_constraint 
        WHERE conrelid = 'fiscal.calendario'::regclass;
    `;
    const resCal = await client.query(sqlCal);
    console.log('\n[CALENDARIO CONSTRAINTS]');
    console.table(resCal.rows);

    await client.end();
}

check().catch(console.error);
