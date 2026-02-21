import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkDriveFolders() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();

        const res = await client.query(`
            SELECT id, razao_social, drive_folder_id 
            FROM core.empresas 
            WHERE drive_folder_id IS NOT NULL;
        `);

        console.table(res.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkDriveFolders();
