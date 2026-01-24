const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Carrega .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Erro: NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não encontrados no .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosticoAutomacao() {
    console.log('=== DIAGNÓSTICO DE AUTOMAÇÃO ===\n');

    try {
        // 1. Verificar Atendimentos Pendentes
        const { count: atendimentosPendentes } = await supabase
            .from('atendimentos')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pendente');

        const { count: atendimentosIA } = await supabase
            .from('atendimentos')
            .select('*', { count: 'exact', head: true })
            .not('categoria_solicitacao', 'is', null);

        console.log(`- Atendimentos Pendentes: ${atendimentosPendentes}`);
        console.log(`- Atendimentos já classificados por IA: ${atendimentosIA}`);

        // 2. Verificar Clientes sem Pasta no Drive
        const { count: clientesSemDrive } = await supabase
            .from('clientes')
            .select('*', { count: 'exact', head: true })
            .is('drive_folder_id', null);

        console.log(`- Clientes aguardando criação de pasta no Drive: ${clientesSemDrive}`);

        // 3. Verificar Obrigações Acessórias
        const { count: obrigacoesPendentes } = await supabase
            .from('obrigacoes_acessorias')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pendente');

        const { data: ultimasObrigacoes } = await supabase
            .from('obrigacoes_acessorias')
            .select('tipo, competencia, status')
            .limit(5)
            .order('created_at', { ascending: false });

        console.log(`- Obrigações Fiscais Pendentes: ${obrigacoesPendentes}`);
        if (ultimasObrigacoes && ultimasObrigacoes.length > 0) {
            console.log('\nÚltimas obrigações registradas:');
            ultimasObrigacoes.forEach(o => {
                console.log(`  [${o.status.toUpperCase()}] ${o.tipo} - Competência: ${o.competencia}`);
            });
        } else {
            console.log('- Nenhuma obrigação acessória encontrada na tabela.');
        }

        console.log('\n=== FIM DO DIAGNÓSTICO ===');

    } catch (err) {
        console.error('Erro durante o diagnóstico:', err.message);
    }
}

diagnosticoAutomacao();
