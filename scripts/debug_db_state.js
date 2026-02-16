require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function checkTables() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema IN ('public', 'core', 'fiscal', 'audit') 
            ORDER BY table_schema, table_name
        `);
        console.log('--- TABLES IN DB ---');
        console.table(res.rows);

        const rels = await client.query(`
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
              AND tc.table_name = 'calendario'
        `);
        console.log('--- RELATIONSHIPS FOR CALENDARIO ---');
        console.table(rels.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkTables();
