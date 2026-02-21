import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function reloadCache() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    try {
        await client.connect();
        await client.query(`NOTIFY pgrst, 'reload schema'`);
        console.log('Schema cache reloaded successfully.');
    } catch (e) {
        console.log("Error reloading schema", e);
    } finally {
        await client.end();
    }
}
reloadCache();
