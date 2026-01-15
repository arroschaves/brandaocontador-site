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

if (!url || !key) {
    console.error('Chaves não encontradas no .env.local');
    process.exit(1);
}

const supabase = createClient(url, key);

async function checkAtendimentos() {
    console.log('--- Verificando Atendimentos Recentes ---');
    const { data, error } = await supabase
        .from('atendimentos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Erro ao buscar atendimentos:', error);
    } else {
        console.log(`Encontrados ${data.length} atendimentos recentes.`);
        data.forEach(t => {
            console.log(`[${t.created_at}] De: ${t.pushName || t.numero_whatsapp} - Msgs: ${t.mensagem.substring(0, 50)}...`);
        });
    }

    console.log('\n--- Verificando Clientes ---');
    const { count, error: countError } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Erro ao contar clientes:', countError);
    } else {
        console.log(`Total de clientes no banco: ${count}`);
    }
}

checkAtendimentos();
