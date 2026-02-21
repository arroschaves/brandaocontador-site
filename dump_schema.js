require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function dumpSchema() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('No DATABASE_URL found in .env.local');
        return;
    }

    const client = new Client({
        connectionString: connectionString,
    });

    try {
        await client.connect();

        // Query to get all user tables
        const tablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `;
        const resTables = await client.query(tablesQuery);
        const tables = resTables.rows.map(row => row.table_name);

        const schema = {};

        for (const table of tables) {
            const columnsQuery = `
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = $1
                ORDER BY ordinal_position;
            `;
            const resColumns = await client.query(columnsQuery, [table]);
            schema[table] = resColumns.rows;
        }

        console.log("=== SUPABASE SCHEMA DUMP ===");
        console.log(JSON.stringify(schema, null, 2));

    } catch (err) {
        console.error('Error executing query', err);
    } finally {
        await client.end();
    }
}

dumpSchema();
