
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkColumns() {
    const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Erro ao buscar cliente:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Colunas disponíveis na tabela clientes:');
        console.log(Object.keys(data[0]).join(', '));
    } else {
        console.log('Nenhum cliente encontrado para verificar colunas.');
    }
}

checkColumns();
