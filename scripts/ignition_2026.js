require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function ignition() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('🚀 INICIANDO PROTOCOLO DE IGNIÇÃO FÍSICA...');

    // 1. Garantir que os regimes estão como Array
    console.log('Step 1: Padronizando Regimes Tributários...');
    const { error: errUpdate } = await supabase
        .schema('core')
        .from('empresas')
        .update({ regime_tributario: ['Simples Nacional'] })
        .filter('regime_tributario', 'is', null);

    if (errUpdate) console.error('Erro Update:', errUpdate.message);

    // 2. Buscar empresas reais
    const { data: empresas, error: errEmp } = await supabase
        .schema('core')
        .from('empresas')
        .select('id, razao_social, regime_tributario');

    if (errEmp) {
        console.error('Erro Empresas:', errEmp.message);
        return;
    }

    console.log(`Step 2: Processando ${empresas.length} empresas...`);

    let totalObrigacoes = 0;
    for (const emp of empresas) {
        // Tentar usar o RPC do banco (Big Bang)
        const { data: count, error: errRpc } = await supabase.rpc('gerar_calendario_empresa', {
            p_empresa_id: emp.id,
            p_ano: 2026
        });

        if (errRpc) {
            console.log(`❌ ${emp.razao_social}: ${errRpc.message}`);
        } else {
            console.log(`✅ ${emp.razao_social}: ${count} tarefas geradas.`);
            totalObrigacoes += (count || 0);
        }
    }

    console.log(`\n🌌 IGNIÇÃO COMPLETA!`);
    console.log(`🔹 Clientes Ativados: ${empresas.length}`);
    console.log(`🔹 Total de Obrigações 2026: ${totalObrigacoes}`);
}

ignition();
