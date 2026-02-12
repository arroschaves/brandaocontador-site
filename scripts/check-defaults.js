require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkDefaults() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    // Consulta direta ao information_schema para ver as colunas e valores default da tabela clientes
    const { data, error } = await supabase.rpc('get_table_info', { t_name: 'clientes' });

    if (error) {
        // Se a RPC não existir, tentamos via query bruta (se o usuário tiver privilégios)
        const { data: data2, error: error2 } = await supabase.from('information_schema.columns')
            .select('column_name, column_default, data_type')
            .eq('table_name', 'clientes');

        if (error2) {
            console.error('Erro ao buscar metadados:', error2);
        } else {
            console.log('--- DEFAULT VALUES (Table: clientes) ---');
            data2.forEach(col => {
                if (col.column_default) {
                    console.log(`${col.column_name} (${col.data_type}): DEFAULT ${col.column_default}`);
                }
            });
        }
    } else {
        console.log('Data:', data);
    }
}

checkDefaults();
