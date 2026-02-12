require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testSingleField(fieldName, value) {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { error } = await supabase.from('clientes').insert([{
        nome: `TESTE ${fieldName}`,
        cnpj_cpf: Math.random().toString().substring(2, 16),
        [fieldName]: value
    }]);
    if (error && error.message.includes('2026-02-31')) {
        console.log(`❌ CAMPO [${fieldName}] CAUSA O ERRO!`);
    } else if (error) {
        console.log(`⚠️ CAMPO [${fieldName}] Erro: ${error.message}`);
    } else {
        console.log(`✅ CAMPO [${fieldName}] OK`);
    }
}

async function start() {
    const payload = {
        razao_social: "AGROPECUARIA ITAOCA LTDA",
        regime_tributario: "LUCRO_PRESUMIDO"
    };
    for (const k in payload) {
        await testSingleField(k, payload[k]);
    }
}
start();
