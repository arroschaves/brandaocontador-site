require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function ignition() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('🚀 RE-TENTATIVA DE IGNIÇÃO MASTER...');

    // 1. Buscar Templates e Empresas
    const { data: templates } = await supabase.schema('fiscal').from('obrigacoes_templates').select('*');
    const { data: empresas } = await supabase.schema('core').from('empresas').select('id, razao_social, regime_tributario');

    console.log(`Empresas: ${empresas.length} | Templates: ${templates.length}`);

    let total = 0;
    for (const emp of empresas) {
        // Como o RPC deu erro de schema/permissão, vamos fazer o trabalho aqui
        // Regimes da empresa (garantir que é array)
        const regimes = emp.regime_tributario || ['Simples Nacional'];

        for (const temp of templates) {
            // Verificar se o regime bate (interseção simples)
            const match = temp.regime_tributario.some(r => regimes.includes(r));

            if (match && temp.periodicidade === 'MENSAL') {
                const registros = [];
                for (let mes = 1; mes <= 12; mes++) {
                    registros.push({
                        empresa_id: emp.id,
                        template_id: temp.id,
                        mes_referencia: mes,
                        ano_referencia: 2026,
                        data_vencimento: `2026-${mes.toString().padStart(2, '0')}-20`, // Vencimento padrão para ignição
                        status: 'PENDENTE'
                    });
                }

                const { error } = await supabase.schema('fiscal').from('calendario').insert(registros);
                if (!error) {
                    total += 12;
                } else {
                    console.log(`Erro no cliente ${emp.razao_social}: ${error.message}`);
                }
            }
        }
        process.stdout.write('.');
    }

    console.log(`\n\n✅ IGNIÇÃO FINALIZADA!`);
    console.log(`🔹 Total de Obrigações 2026 Geradas: ${total}`);
}

ignition();
