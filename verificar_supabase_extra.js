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

async function checkActualDB() {
    console.log('--- VERIFICANDO DADOS REAIS NO SUPABASE ---');
    const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, cnpj_cpf, regime_tributario')
        .not('regime_tributario', 'is', null)
        .limit(10);

    if (error) {
        console.error('Erro ao buscar dados:', error);
        return;
    }

    console.log(`Encontrados ${data.length} registros COM regime preenchido.`);
    data.forEach(c => {
        console.log(`- ${c.nome}: ${c.regime_tributario}`);
    });

    const { count } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .is('regime_tributario', null);

    console.log(`\nClientes que ainda estão SEM regime: ${count}`);
}

checkActualDB();
