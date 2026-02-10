require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkSchema() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data, error } = await supabase.from('clientes').select('*').limit(1);

    if (error) {
        console.error('Erro:', error);
    } else if (data && data.length > 0) {
        console.log('Colunas encontradas:', Object.keys(data[0]).join(', '));
    } else {
        console.log('Nenhum dado encontrado para inferir esquema.');
    }
}

checkSchema();
