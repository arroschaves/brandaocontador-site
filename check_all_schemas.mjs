import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkAllSchemasAndTables() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();

        const schemas = ['core', 'fiscal', 'dp', 'workflow', 'audit', 'compliance'];

        for (const schema of schemas) {
            console.log(`\n================ SCHEMA: ${schema.toUpperCase()} ================`);

            const tablesRes = await client.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = $1;
            `, [schema]);

            const tables = tablesRes.rows.map(r => r.table_name);

            if (tables.length === 0) {
                console.log(`Nenhuma tabela encontrada no schema '${schema}'.`);
                continue;
            }

            console.log(`Tabelas (${tables.length}):`, tables.join(', '));

            for (const table of tables) {
                const cols = await client.query(`
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_schema = $1 AND table_name = $2;
                `, [schema, table]);

                console.log(`\n--- ${schema}.${table} ---`);
                console.table(cols.rows.map(r => ({ column: r.column_name, type: r.data_type })));
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkAllSchemasAndTables();
