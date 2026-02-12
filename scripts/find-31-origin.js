require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function findThe31() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    console.log('🔍 Buscando a origem do dia 31 no banco de dados...');

    // 1. Verificar DEFAULTS de todas as colunas da tabela clientes
    const { data: cols, error: err1 } = await supabase.rpc('get_table_info', { t_name: 'clientes' });

    // Se a RPC não estiver disponível, tentamos via query direta na view de sistema
    const { data: colsRaw, error: err2 } = await supabase
        .from('information_schema.columns')
        .select('column_name, column_default, data_type')
        .eq('table_name', 'clientes');

    if (colsRaw) {
        console.log('\n--- Valores Padrão (DEFAULTS) ---');
        colsRaw.forEach(c => {
            if (c.column_default) {
                console.log(`Col: ${c.column_name} | Default: ${c.column_default}`);
            }
        });
    }

    // 2. Verificar TRIGGERS e suas definições
    const { data: triggers, error: err3 } = await supabase
        .from('information_schema.triggers')
        .select('trigger_name, event_manipulation, action_statement')
        .eq('event_object_table', 'clientes');

    if (triggers) {
        console.log('\n--- TRIGGERS Ativos ---');
        triggers.forEach(t => {
            console.log(`Trigger: ${t.trigger_name} | Evento: ${t.event_manipulation}`);
            console.log(`Ação: ${t.action_statement}`);
        });
    }

    // 3. Verificar se há colunas geradas (GENERATED ALWAYS)
    // Isso é mais difícil via PostgREST comum, mas vamos tentar ver se alguma coluna tem 'generated' no nome ou tipo
}

findThe31();
