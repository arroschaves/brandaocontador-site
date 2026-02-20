
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ycgwmwmcyxwflkaehwds.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'REPLACE_ME_WITH_REAL_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupWikiTable() {
    console.log('--- Setting up core.cliente_wiki ---');

    // We try to use a simple query to see if it works, or execute SQL if possible.
    // Since we don't have a direct SQL execution tool in the SDK (it's restricted),
    // we'll try to use a raw query if enabled or just assume it needs creation via RPC if available.
    // If not, we'll suggest the user to run the migration.

    // Attempting to check if table exists
    const { error: checkError } = await supabase.schema('core').from('cliente_wiki').select('id').limit(1);

    if (checkError && checkError.code === 'PGRST205') {
        console.log('Table mission. Attempting to create via RPC run_sql if available...');
        const sql = `
            CREATE TABLE IF NOT EXISTS core.cliente_wiki (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                cliente_id UUID REFERENCES core.empresas(id) ON DELETE CASCADE,
                conteudo TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                CONSTRAINT unique_cliente_wiki UNIQUE (cliente_id)
            );
            GRANT ALL ON core.cliente_wiki TO authenticated;
            GRANT ALL ON core.cliente_wiki TO service_role;
            ALTER TABLE core.cliente_wiki ENABLE ROW LEVEL SECURITY;
            CREATE POLICY "Admin All Access Wiki" ON core.cliente_wiki FOR ALL USING (true);
        `;

        const { error: rpcError } = await supabase.rpc('run_sql', { sql });
        if (rpcError) {
            console.error('Failed to create table via RPC:', rpcError);
        } else {
            console.log('Table created successfully!');
        }
    } else if (checkError) {
        console.error('Error checking table:', checkError);
    } else {
        console.log('Table already exists.');
    }
}

setupWikiTable();
