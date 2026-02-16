require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function deepAudit() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('🔍 INICIANDO AUDITORIA PROFUNDA DO BACKEND...');

    const report = {
        timestamp: new Date().toISOString(),
        schemas: {},
        triggers: [],
        functions: [],
        data_integrity: {}
    };

    // 1. Audit core schema
    console.log('--- Core Schema ---');
    const { count: empresasCount } = await supabase.schema('core').from('empresas').select('*', { count: 'exact', head: true });
    const { data: incompleteEmpresas } = await supabase.schema('core').from('empresas').select('razao_social, cnpj, regime_tributario').or('razao_social.is.null,cnpj.is.null,regime_tributario.is.null');

    report.schemas.core = {
        empresas_total: empresasCount,
        empresas_incompletas: incompleteEmpresas?.length || 0,
        amostra_incompletas: incompleteEmpresas?.slice(0, 5)
    };

    // 2. Audit fiscal schema
    console.log('--- Fiscal Schema ---');
    const { count: templateCount } = await supabase.schema('fiscal').from('obrigacoes_templates').select('*', { count: 'exact', head: true });
    const { count: calendarioCount } = await supabase.schema('fiscal').from('calendario').select('*', { count: 'exact', head: true });

    report.schemas.fiscal = {
        templates_total: templateCount,
        calendario_total: calendarioCount
    };

    // 3. Check for specific data health
    console.log('--- Data Health ---');
    let zeroTasks = [];
    try {
        const { data } = await supabase.rpc('get_empresas_sem_tarefas_2026');
        zeroTasks = data || [];
    } catch (e) {
        console.log('RPC get_empresas_sem_tarefas_2026 missing');
    }
    report.data_integrity.empresas_sem_tarefas = zeroTasks.length || 'N/A';

    // 4. List functions and triggers
    console.log('--- Functions Check ---');
    try {
        const { error: errFunc } = await supabase.rpc('gerar_calendario_empresa', { p_empresa_id: '00000000-0000-0000-0000-000000000000', p_ano: 2026 });
        report.functions.push({ name: 'gerar_calendario_empresa', status: errFunc?.code === 'PGRST202' ? 'Exists' : 'Check manually' });
    } catch (e) {
        report.functions.push({ name: 'gerar_calendario_empresa', status: 'Missing' });
    }

    console.log('\n--- RELATÓRIO FINAL ---');
    console.log(JSON.stringify(report, null, 2));

    const fs = require('fs');
    fs.writeFileSync('docs/BACKEND_DEEP_AUDIT.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Relatório salvo em docs/BACKEND_DEEP_AUDIT.json');
}

deepAudit();
