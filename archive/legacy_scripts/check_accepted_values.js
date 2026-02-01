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

async function findValues() {
    console.log('--- BUSCANDO VALORES ACEITOS ---');

    // Pegar os 6 que funcionam
    const { data: validOnes } = await supabase
        .from('clientes')
        .select('regime_tributario')
        .not('regime_tributario', 'is', null)
        .limit(10);

    const distinct = [...new Set(validOnes.map(x => x.regime_tributario))];
    console.log('Valores encontrados no banco:', distinct);

    // Tentar descobrir os outros via erro provocado (tentando um valor qualquer)
}

findValues();
