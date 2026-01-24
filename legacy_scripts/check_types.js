
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkColumnTypes() {
    const { data, error } = await supabase.rpc('get_column_types', { table_name: 'clientes' });

    if (error) {
        // Fallback: check via a direct query to information_schema if possible
        const { data: infoSchema, error: infoError } = await supabase
            .from('clientes')
            .select('*')
            .limit(1);

        if (infoError) {
            console.error('Erro:', infoError);
            return;
        }

        console.log('Exemplo de dado em cnpj_cpf:', infoSchema[0]?.cnpj_cpf);
        console.log('Tipo detectado pelo JS:', typeof infoSchema[0]?.cnpj_cpf);
    } else {
        console.log('Tipos das colunas:', data);
    }
}

checkColumnTypes();
