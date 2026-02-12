require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testInsert() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const payload = {
        nome: "AGROPECUARIA ITAOCA PIATA",
        cnpj_cpf: "49915583000250",
        bairro: "Zona Rural",
        cep: "79280000",
        cidade: "Porto Murtinho",
        cnae_principal: "151201 - Criação de bovinos para corte",
        email: "aroldofcorrea@gmail.com",
        estado: "MS",
        inscricao_estadual: "288823486",
        logradouro: "Rodovia Jardim Porto Murtinho, Km 51 a Esquerda",
        numero: "S/N",
        razao_social: "AGROPECUARIA ITAOCA LTDA",
        regime_tributario: "LUCRO_PRESUMIDO",
        status_rfb: "Ativa"
    };

    console.log('Tentando inserir cliente com payload:', JSON.stringify(payload, null, 2));
    const { data, error } = await supabase.from('clientes').insert([payload]);

    if (error) {
        console.error('❌ Erro no insert Supabase:', error);
    } else {
        console.log('✅ Inserido com sucesso!', data);
    }
}

testInsert();
