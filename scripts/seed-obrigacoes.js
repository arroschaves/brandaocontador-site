/**
 * 🚀 Seed de Obrigações (CORRIGIDO) - Brandão Contador
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const OBRIGACOES_PADRAO = [
    { tipo: 'FGTS', diaVencimento: 7 },
    { tipo: 'INSS', diaVencimento: 20 },
    { tipo: 'DCTFWEB', diaVencimento: 15 },
    { tipo: 'PGDAS-D', diaVencimento: 20 },
];

async function run() {
    console.log('🔍 Buscando clientes...');
    const { data: clientes, error } = await supabase
        .from('clientes')
        .select('id, nome, cnpj_cpf');

    if (error) {
        console.error('❌ Erro ao buscar clientes:', error.message);
        return;
    }

    // Usando formato DATE (YYYY-MM-DD) para competência (primeiro dia do mês)
    const competencias = ['2026-01-01', '2026-02-01'];
    console.log(`✅ ${clientes.length} clientes encontrados. Gerando obrigações para ${competencias.join(', ')}...`);

    let totalCreated = 0;

    for (const client of clientes) {
        const cleanId = (client.cnpj_cpf || '').replace(/\D/g, '');
        const isPJ = cleanId.length === 14;

        for (const comp of competencias) {
            const [ano, mes, dia] = comp.split('-');

            for (const ob of OBRIGACOES_PADRAO) {
                if (!isPJ && (ob.tipo === 'PGDAS-D' || ob.tipo === 'DCTFWEB')) continue;

                const vencimento = `${ano}-${mes}-${ob.diaVencimento.toString().padStart(2, '0')}`;

                const { error: insertError } = await supabase
                    .from('obrigacoes_acessorias')
                    .insert({
                        cliente_id: client.id,
                        tipo: ob.tipo,
                        competencia: comp, // Agora enviando YYYY-MM-DD
                        vencimento: vencimento,
                        status: 'PENDENTE',
                        recorrencia: 'MENSAL'
                    });

                if (insertError) {
                    if (!insertError.message.includes('unique')) {
                        console.error(`❌ Erro em ${client.nome} (${ob.tipo}):`, insertError.message);
                    }
                } else {
                    totalCreated++;
                }
            }
        }
    }

    console.log(`\n✨ Sucesso! ${totalCreated} obrigações criadas.`);
}

run();
