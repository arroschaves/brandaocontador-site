require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkObrigacoes() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { count, error } = await supabase
        .from('obrigacoes_acessorias')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Erro ao contar obrigações:', error);
    } else {
        console.log(`Total de obrigações no banco: ${count}`);
    }
}

checkObrigacoes();
