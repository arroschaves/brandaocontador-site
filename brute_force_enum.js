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

const possible = [
    'MEI', 'LUCRO_REAL', 'LUCRO_PRESUMIDO', 'SIMPLES_NACIONAL',
    'PESSOA_FISICA', 'PF', 'PF_AUTONOMO', 'OUTROS', 'OUTRO', 'ISENTO'
];

async function bruteForce() {
    const { data } = await supabase.from('clientes').select('id').limit(1);
    const id = data[0].id;

    for (const p of possible) {
        const { error } = await supabase.from('clientes').update({ regime_tributario: p }).eq('id', id);
        if (!error) {
            console.log(`✅ ACEITO: ${p}`);
        } else {
            console.log(`❌ REJEITADO: ${p}`);
        }
    }
}
bruteForce();
