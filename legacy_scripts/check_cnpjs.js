require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkCNPJs() {
    console.log('🔍 Verificando CNPJs no banco...\n');

    const { data, error } = await supabase
        .from('clientes')
        .select('cnpj_cpf, nome, drive_folder_id')
        .limit(10);

    if (error) {
        console.error('❌ Erro:', error);
        return;
    }

    console.log(`📊 Total de clientes encontrados: ${data.length}\n`);

    data.forEach((cliente, index) => {
        console.log(`${index + 1}. CNPJ/CPF: ${cliente.cnpj_cpf}`);
        console.log(`   Nome: ${cliente.nome}`);
        console.log(`   Pasta Drive: ${cliente.drive_folder_id || '❌ SEM PASTA'}`);
        console.log('');
    });
}

checkCNPJs();
