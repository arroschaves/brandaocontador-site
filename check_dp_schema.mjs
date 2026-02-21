import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkDPSchema() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();

        const res = await client.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'dp'
            ORDER BY table_name, ordinal_position;
        `);

        let currentTable = '';
        res.rows.forEach(row => {
            if (row.table_name !== currentTable) {
                console.log(`\n\n--- dp.${row.table_name} ---`);
                currentTable = row.table_name;
            }
            console.log(`- ${row.column_name} (${row.data_type})`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkDPSchema();
