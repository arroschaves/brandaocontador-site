const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
    connectionString: "postgresql://postgres:fERrShUNLdC5NGeW@db.ycgwmwmcyxwflkaehwds.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        const sql = fs.readFileSync('supabase/migrations/20260222_fase_f_expansion.sql', 'utf8');
        await client.query(sql);
        console.log("Migration executed successfully");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await client.end();
    }
}
run();
