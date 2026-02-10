require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkActivities() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    console.log('🔍 Verificando Activity Log...');
    const { data, count, error } = await supabase
        .from('activity_log')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('❌ Erro:', error);
    } else {
        console.log(`📊 Total de atividades: ${count}`);
        if (data.length > 0) {
            console.log('Últimas 5 atividades:');
            data.forEach(a => {
                console.log(`- [${a.created_at}] ${a.tipo}: ${a.descricao} (${a.cliente_nome})`);
            });
        } else {
            console.log('ℹ️ Nenhuma atividade registrada ainda.');
        }
    }
}

checkActivities();
