
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDigits() {
    const { data: clientes, error } = await supabase
        .from('clientes')
        .select('nome, cnpj_cpf');

    if (error) {
        console.error(error);
        return;
    }

    clientes.forEach(c => {
        const s = c.cnpj_cpf ? c.cnpj_cpf.toString() : '';
        if (s.length === 13 || s.length === 10 || s.length === 8) {
            console.log(`⚠️ ${c.nome.padEnd(30)} | ${s.padEnd(15)} | Tamanho: ${s.length}`);
        }
    });
}

checkDigits();
