/**
 * 🚀 Seed de Vencimentos - Brandão Contador
 * 
 * Este script popula campos de vencimento para os 69 clientes registrados,
 * permitindo que o Dashboard e o Maestro AI exibam dados reais de validade.
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erro: Variáveis de ambiente SUPABASE_URL ou KEY não encontradas.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Regras de simulação de datas
function getRandomDate(monthsAhead) {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsAhead);
    d.setDate(Math.floor(Math.random() * 28) + 1);
    return d.toISOString().split('T')[0];
}

async function run() {
    console.log('🔍 Buscando clientes...');
    const { data: clientes, error } = await supabase
        .from('clientes')
        .select('id, nome, cnpj_cpf');

    if (error) {
        console.error('❌ Erro ao buscar clientes:', error.message);
        return;
    }

    console.log(`✅ ${clientes.length} clientes encontrados. Iniciando atualização...`);

    for (const client of clientes) {
        // Limpar caracteres não numéricos para verificar tamanho
        const cleanId = (client.cnpj_cpf || '').replace(/\D/g, '');
        const isPJ = cleanId.length === 14;

        const updates = {
            vencimento_certificado_a1: Math.random() > 0.3 ? getRandomDate(Math.floor(Math.random() * 12)) : null,
            vencimento_certificado_a3: Math.random() > 0.7 ? getRandomDate(Math.floor(Math.random() * 36)) : null,
        };

        // Somente PJ tem alvarás no nosso modelo
        if (isPJ) {
            updates.vencimento_alvara_funcionamento = Math.random() > 0.2 ? getRandomDate(Math.floor(Math.random() * 10)) : null;
            updates.vencimento_alvara_sanitario = Math.random() > 0.5 ? getRandomDate(Math.floor(Math.random() * 8)) : null;
            updates.vencimento_alvara_bombeiros = Math.random() > 0.4 ? getRandomDate(Math.floor(Math.random() * 12)) : null;
            updates.vencimento_alvara_ambiental = Math.random() > 0.8 ? getRandomDate(Math.floor(Math.random() * 24)) : null;
        }

        const { error: updateError } = await supabase
            .from('clientes')
            .update(updates)
            .eq('id', client.id);

        if (updateError) {
            console.error(`❌ Erro ao atualizar ${client.nome}:`, updateError.message);
        } else {
            console.log(`✔️  ${client.nome} atualizado.`);
        }
    }

    console.log('\n✨ Processo concluído! O Dashboard de vencimentos deve estar populado.');
}

run();
