
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();
const supabase = createClient(url, key);

async function checkConstraints() {
    // Tentar inserir um cliente PF de teste para ver exatamente qual erro o banco retorna
    const testData = {
        nome: 'TESTE PF',
        cnpj_cpf: '00000000000',
        regime_tributario: 'PESSOA_FISICA',
        status_rfb: 'ATIVA',
        tipo_pessoa: 'PF'
    };

    console.log('--- Testando Inserção PF ---');
    const { error } = await supabase.from('clientes').insert([testData]);
    if (error) {
        console.log('Erro Real do Banco:', error);
    } else {
        console.log('Inserção teste OK - Deletando...');
        await supabase.from('clientes').delete().eq('nome', 'TESTE PF');
    }
}
checkConstraints();
