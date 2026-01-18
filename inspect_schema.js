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

async function inspectSchema() {
    console.log('--- INSPECIONANDO SCHEMA SUPABASE ---');

    // Tabela clientes
    const { data: colsClientes } = await supabase.rpc('get_column_details', { table_name: 'clientes' });
    if (colsClientes) {
        console.log('\nTabela: clientes');
        colsClientes.forEach(c => console.log(`- ${c.column_name}: ${c.data_type}`));
    }

    // Tabela obrigacoes_acessorias
    const { data: colsObrigacoes } = await supabase.rpc('get_column_details', { table_name: 'obrigacoes_acessorias' });
    if (colsObrigacoes) {
        console.log('\nTabela: obrigacoes_acessorias');
        colsObrigacoes.forEach(c => console.log(`- ${c.column_name}: ${c.data_type}`));
    } else {
        // Se RPC não existir, tentamos buscar um registro para ver as chaves
        const { data: sample } = await supabase.from('obrigacoes_acessorias').select('*').limit(1);
        if (sample && sample.length > 0) {
            console.log('\nTabela: obrigacoes_acessorias (campos detectados)');
            Object.keys(sample[0]).forEach(k => console.log(`- ${k}`));
        } else {
            console.log('\nNão foi possível obter esquema de obrigacoes_acessorias.');
        }
    }
}

inspectSchema();
