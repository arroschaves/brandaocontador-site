require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testBrainTrigger() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('🧠 TESTE DE ESTRESSE DO CÉREBRO (SUPABASE)...');

    const testCnpj = '99999999999999';
    const testName = 'EMPRESA TESTE TRG ' + Date.now();

    console.log(`1. Criando empresa: ${testName}`);

    const { data: empresa, error } = await supabase
        .schema('core')
        .from('empresas')
        .insert({
            razao_social: testName,
            cnpj: testCnpj,
            regime_tributario: ['Simples Nacional'],
            status: 'ATIVO'
        })
        .select()
        .single();

    if (error) {
        console.error('❌ Erro ao criar empresa:', error.message);
        return;
    }

    console.log(`✅ Empresa criada com ID: ${empresa.id}`);
    console.log('⏳ Aguardando 3 segundos para o trigger processar...');

    await new Promise(r => setTimeout(r, 3000));

    console.log('2. Verificando geração de calendário fiscal...');
    const { count, error: errCal } = await supabase
        .schema('fiscal')
        .from('calendario')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresa.id);

    if (errCal) {
        console.error('❌ Erro ao consultar calendário:', errCal.message);
    } else if (count > 0) {
        console.log(`🚀 SUCESSO! O cérebro gerou ${count} tarefas automaticamente para a nova empresa.`);
    } else {
        console.log('⚠️ O cérebro não reagiu. O trigger trg_empresa_criada pode estar inativo ou com erro.');

        // Diagnóstico: Verificar se o template_id existe
        const { count: tempCount } = await supabase.schema('fiscal').from('obrigacoes_templates').select('*', { count: 'exact', head: true });
        console.log(`Info: Existem ${tempCount} templates no banco.`);
    }

    // Limpeza
    console.log('🧹 Limpando dados de teste...');
    await supabase.schema('fiscal').from('calendario').delete().eq('empresa_id', empresa.id);
    await supabase.schema('core').from('empresas').delete().eq('id', empresa.id);
    console.log('Teste concluído.');
}

testBrainTrigger();
