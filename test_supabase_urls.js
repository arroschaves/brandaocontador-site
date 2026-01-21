// Teste para descobrir qual URL do Supabase funciona
const testUrls = [
    'https://db.brandaocontador.com.br',
    'https://escritoriobrandao-supabase.3ow2vi.easypanel.host',
];

const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

async function testUrl(baseUrl) {
    console.log(`\n🔍 Testando: ${baseUrl}`);

    try {
        const url = `${baseUrl}/rest/v1/clientes?limit=1`;
        console.log(`   URL completa: ${url}`);

        const response = await fetch(url, {
            headers: {
                'apikey': anonKey,
                'Authorization': `Bearer ${anonKey}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`   Status: ${response.status}`);
        console.log(`   Status Text: ${response.statusText}`);

        const contentType = response.headers.get('content-type');
        console.log(`   Content-Type: ${contentType}`);

        if (response.ok) {
            const data = await response.json();
            console.log(`   ✅ SUCESSO! Retornou ${data.length} registros`);
            if (data.length > 0) {
                console.log(`   Primeiro cliente: ${data[0].nome}`);
            }
            return true;
        } else {
            const text = await response.text();
            console.log(`   ❌ Erro: ${text.substring(0, 200)}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Exceção: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('🚀 Testando URLs do Supabase...\n');

    for (const url of testUrls) {
        const success = await testUrl(url);
        if (success) {
            console.log(`\n✅ URL CORRETA: ${url}`);
            console.log(`\nConfigure no Vercel:`);
            console.log(`NEXT_PUBLIC_SUPABASE_URL=${url}`);
            console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`);
            break;
        }
    }
}

main();
