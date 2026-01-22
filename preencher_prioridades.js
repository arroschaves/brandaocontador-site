// Script para preencher prioridades faltantes nos atendimentos
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Ler .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');

let supabaseUrl = '';
let supabaseKey = '';

envLines.forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
        supabaseKey = line.split('=')[1].trim();
    }
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function preencherPrioridades() {
    console.log('🔧 Preenchendo prioridades faltantes...\n');

    try {
        // Buscar atendimentos sem prioridade
        const { data: atendimentos, error } = await supabase
            .from('atendimentos')
            .select('id, categoria, prioridade')
            .is('prioridade', null);

        if (error) throw error;

        console.log(`📊 Total de atendimentos sem prioridade: ${atendimentos.length}\n`);

        if (atendimentos.length === 0) {
            console.log('✅ Todos os atendimentos já têm prioridade definida!');
            return;
        }

        let atualizados = 0;
        let falhas = 0;

        for (const atendimento of atendimentos) {
            // Definir prioridade baseada na categoria
            let prioridade = 'NORMAL'; // Padrão

            // Categorias urgentes
            if (['CERTIDAO_NEGATIVA', 'CERTIDAO_JUCEMS', 'ALVARA'].includes(atendimento.categoria)) {
                prioridade = 'ALTA';
            }

            // Categorias críticas (prazos curtos)
            if (['SIMPLES_NACIONAL_DAS', 'DARF', 'FGTS', 'INSS'].includes(atendimento.categoria)) {
                prioridade = 'CRITICA';
            }

            // Conversas são sempre normais
            if (atendimento.categoria === 'CONVERSA') {
                prioridade = 'NORMAL';
            }

            // Atualizar no banco
            const { error: updateError } = await supabase
                .from('atendimentos')
                .update({ prioridade })
                .eq('id', atendimento.id);

            if (updateError) {
                console.error(`❌ Erro ao atualizar ${atendimento.id}: ${updateError.message}`);
                falhas++;
            } else {
                console.log(`✅ Atendimento ${atendimento.id}: ${atendimento.categoria} → ${prioridade}`);
                atualizados++;
            }
        }

        console.log('\n' + '═'.repeat(80));
        console.log('📈 RESUMO:');
        console.log(`   Total processados: ${atendimentos.length}`);
        console.log(`   ✅ Atualizados: ${atualizados}`);
        console.log(`   ❌ Falhas: ${falhas}`);
        console.log('═'.repeat(80));

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

preencherPrioridades();
