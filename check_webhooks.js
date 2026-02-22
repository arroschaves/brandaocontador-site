const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function check() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    // Check triggers
    const res = await client.query(`
        SELECT event_object_schema as schema,
               event_object_table as table,
               trigger_name,
               action_statement
        FROM information_schema.triggers
        WHERE action_statement ILIKE '%http%' OR action_statement ILIKE '%net.http%' OR action_statement ILIKE '%webhook%';
    `);

    console.log('--- TRIGGERS WEBHOOK/HTTP ---');
    console.table(res.rows);

    await client.end();
}

check().catch(console.error);
