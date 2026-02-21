import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkAllCoreTables() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();

        // 1. Get all tables in 'core'
        const tablesRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'core';
        `);

        const tables = tablesRes.rows.map(r => r.table_name);
        console.log(`Encontradas ${tables.length} tabelas em CORE:`, tables.join(', '));

        for (const table of tables) {
            const cols = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_schema = 'core' AND table_name = $1;
            `, [table]);

            console.log(`\n--- core.${table} ---`);
            console.table(cols.rows.map(r => ({ column: r.column_name, type: r.data_type })));
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkAllCoreTables();
