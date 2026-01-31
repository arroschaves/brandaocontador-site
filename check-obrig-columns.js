
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();
const supabase = createClient(url, key);

async function check() {
    const { data } = await supabase.from('obrigacoes_acessorias').select('*').limit(1);
    console.log('--- Obrigacoes Columns ---');
    console.log(data && data[0] ? Object.keys(data[0]) : 'Tabela vazia ou erro');
}
check();
