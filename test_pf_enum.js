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

async function testPF() {
    // Pegar um CPF
    const { data } = await supabase.from('clientes').select('id, nome').ilike('nome', '%LUIZ MARIO%').limit(1);
    if (data && data.length > 0) {
        const { error } = await supabase.from('clientes').update({ regime_tributario: 'PESSOA_FISICA' }).eq('id', data[0].id);
        if (error) {
            console.log('❌ PESSOA_FISICA falhou:', error.message);
            // Tentar com espaço
            const { error: error2 } = await supabase.from('clientes').update({ regime_tributario: 'PF' }).eq('id', data[0].id);
            if (error2) console.log('❌ PF falhou:', error2.message);
        } else {
            console.log('✅ PESSOA_FISICA funcionou!');
        }
    }
}
testPF();
