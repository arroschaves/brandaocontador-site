require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function deepAudit() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();

        const tables = await client.query(`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema IN ('public', 'core', 'fiscal', 'audit') 
            AND table_type = 'BASE TABLE'
            ORDER BY table_schema, table_name
        `);
        console.log('TABELAS:', JSON.stringify(tables.rows, null, 2));

        const fks = await client.query(`
            SELECT
                tc.table_schema, 
                tc.table_name, 
                kcu.column_name, 
                ccu.table_schema AS foreign_table_schema,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
        `);
        console.log('FKS:', JSON.stringify(fks.rows, null, 2));

    } catch (err) {
        console.error('❌ ERRO:', err);
    } finally {
        await client.end();
    }
}

deepAudit();
