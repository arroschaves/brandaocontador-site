const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getEnv() {
    try {
        const envPath = path.join(process.cwd(), '.env.local');
        const content = fs.readFileSync(envPath, 'utf8');
        const urlMatch = content.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
        const keyMatch = content.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
        return {
            url: urlMatch ? urlMatch[1].trim() : '',
            key: keyMatch ? keyMatch[1].trim() : ''
        };
    } catch (e) { return {}; }
}

const { url, key } = getEnv();
const supabase = createClient(url, key);

async function diagnose() {
    console.log('--- DIAGNÓSTICO PROFUNDO ---');

    // 1. Verificar um cliente específico (MAP)
    const { data: mapClient, error: mapError } = await supabase
        .from('clientes')
        .select('*')
        .ilike('nome', '%MAP%');

    if (mapError) {
        console.log('Erro ao buscar MAP:', mapError);
    } else {
        console.log('Dados do MAP no banco:', JSON.stringify(mapClient, null, 2));
    }

    // 2. Tentar um update manual simples para testar permissão
    console.log('\nTestando Update Manual...');
    if (mapClient && mapClient.length > 0) {
        const testId = mapClient[0].id;
        const { data, error } = await supabase
            .from('clientes')
            .update({ regime_tributario: 'TESTE_AUTOMACO' })
            .eq('id', testId)
            .select();

        if (error) {
            console.log('❌ FALHA NO UPDATE:', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ SUCESSO NO UPDATE:', JSON.stringify(data, null, 2));
        }
    }
}

diagnose();
