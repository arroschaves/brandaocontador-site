const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function addMoreClients() {
    const missing = [
        { nome: 'ITA TRANSPORTES' },
        { nome: 'MAQUITA' },
        { nome: 'ALESSANDRO BRANDÃO' }
    ];

    console.log('🚀 Cadastrando novos clientes solicitados...');

    for (const c of missing) {
        // Check if exists
        const { data: existing } = await supabase
            .from('clientes')
            .select('id')
            .eq('nome', c.nome)
            .maybeSingle();

        if (existing) {
            console.log(`🟡 ${c.nome} já existe.`);
            continue;
        }

        const { error } = await supabase
            .from('clientes')
            .insert(c);

        if (error) {
            console.error(`❌ Erro ao cadastrar ${c.nome}:`, error.message);
        } else {
            console.log(`✅ ${c.nome} cadastrado.`);
        }
    }
}

addMoreClients();
