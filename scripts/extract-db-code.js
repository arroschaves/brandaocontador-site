require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function dumpFunctions() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    console.log('🔍 ANALISANDO FUNÇÕES DO BANCO DE DADOS...');

    // Busca funções que contenham lógica de data ou '31'
    const { data: functions, error } = await supabase.rpc('exec_sql', {
        sql_query: `
            SELECT p.proname, p.prosrc 
            FROM pg_proc p 
            INNER JOIN pg_namespace n ON p.pronamespace = n.oid 
            WHERE n.nspname = 'public' 
              AND (p.prosrc ILIKE '%31%' OR p.prosrc ILIKE '%interval%' OR p.prosrc ILIKE '%regime_tributario%')
        `
    });

    if (error) {
        // Se RPC falhar, tentamos via query direta na view pg_proc se acessível
        console.warn('⚠️ RPC exec_sql falhou. Tentando query direta...');
        const { data: rawFuncs, error: rawErr } = await supabase
            .from('pg_proc')
            .select('proname, prosrc');

        if (rawErr) {
            console.error('❌ Erro total ao acessar metadados:', rawErr.message);
        } else {
            rawFuncs.forEach(f => {
                if (f.prosrc.includes('31') || f.prosrc.includes('regime_tributario')) {
                    console.log(`\n--- FUNÇÃO ENCONTRADA: ${f.proname} ---`);
                    console.log(f.prosrc);
                }
            });
        }
    } else {
        functions.forEach(f => {
            console.log(`\n--- FUNÇÃO ENCONTRADA: ${f.proname} ---`);
            console.log(f.prosrc);
        });
    }
}

dumpFunctions();
