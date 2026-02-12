require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function debugProductionDB() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    console.log('--- BUSCANDO TRIGGERS (via pg_trigger) ---');
    const { data: triggers, error: tErr } = await supabase
        .from('pg_trigger')
        .select('tgname, tgfoid, tgenabled')
        .not('tgname', 'ilike', 'pg_%');

    if (triggers) console.log(JSON.stringify(triggers, null, 2));

    console.log('\n--- BUSCANDO DEFAULTS (via pg_attrdef) ---');
    // pg_attrdef é difícil de cruzar sem JOIN, mas vamos tentar ver o que tem
    const { data: defs, error: dErr } = await supabase
        .from('pg_attrdef')
        .select('adrelid, adnum, adbin');

    if (defs) console.log(`Encontrados ${defs.length} defaults.`);

    console.log('\n--- TESTE DE INSERT ISOLADO ---');
    const testPayload = { nome: "TESTE DIAGNOSTICO", cnpj_cpf: "00000000000000" };
    const { error: insErr } = await supabase.from('clientes').insert([testPayload]);

    if (insErr) {
        console.error('ERRO NO TESTE:', insErr.message);
        if (insErr.details) console.error('DETALHES:', insErr.details);
    } else {
        console.log('Sucesso no teste isolado? Estranho.');
    }
}

debugProductionDB();
