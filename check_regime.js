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

async function checkRegime() {
    const { data, count } = await supabase
        .from('clientes')
        .select('id, nome, cnpj_cpf, regime_tributario', { count: 'exact' });

    const semRegime = data.filter(c => !c.regime_tributario);
    console.log(`Total de clientes: ${count}`);
    console.log(`Clientes sem Regime Tributário: ${semRegime.length}`);

    semRegime.slice(0, 10).forEach(c => {
        console.log(`- ${c.nome} (${c.cnpj_cpf})`);
    });
}

checkRegime();
