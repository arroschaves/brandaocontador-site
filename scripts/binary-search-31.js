require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function binarySearchCulprit() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const fullPayload = {
        nome: "TESTE BINARY SEARCH",
        cnpj_cpf: "99999999999999",
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

    const keys = Object.keys(fullPayload).filter(k => k !== 'nome' && k !== 'cnpj_cpf');

    console.log('--- BINARY SEARCH DE CAMPO CULPADO ---');

    for (const key of keys) {
        process.stdout.write(`Testando campo: ${key}... `);
        const { error } = await supabase.from('clientes').insert([{
            nome: `TESTE ${key}`,
            cnpj_cpf: Math.random().toString().substring(2, 16),
            [key]: fullPayload[key]
        }]);

        if (error && error.message.includes('2026-02-31')) {
            console.log('❌ FALHOU! Este é o culpado.');
        } else if (error) {
            console.log(`⚠️ Erro diferente: ${error.message}`);
        } else {
            console.log('✅ OK');
        }
    }
}

binarySearchCulprit();
