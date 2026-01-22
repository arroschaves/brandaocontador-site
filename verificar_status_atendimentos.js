// Script para verificar e padronizar status dos atendimentos
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

async function verificarStatus() {
    console.log('🔍 Verificando status dos atendimentos...\n');

    try {
        // Buscar todos os atendimentos
        const { data: atendimentos, error } = await supabase
            .from('atendimentos')
            .select('id, status, categoria, prioridade, created_at')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        console.log(`📊 Total de atendimentos (últimos 20): ${atendimentos.length}\n`);

        // Agrupar por status
        const porStatus = {};
        atendimentos.forEach(a => {
            const status = a.status || 'NULL';
            porStatus[status] = (porStatus[status] || 0) + 1;
        });

        console.log('📈 Distribuição por Status:');
        Object.entries(porStatus).forEach(([status, count]) => {
            console.log(`   ${status}: ${count}`);
        });

        console.log('\n📋 Exemplos de atendimentos:\n');
        atendimentos.slice(0, 5).forEach((atend, index) => {
            console.log(`${index + 1}. Status: ${atend.status || '❌ NULL'}`);
            console.log(`   Categoria: ${atend.categoria || '❌ NULL'}`);
            console.log(`   Prioridade: ${atend.prioridade || '❌ NULL'}`);
            console.log(`   Data: ${new Date(atend.created_at).toLocaleString('pt-BR')}\n`);
        });

        // Verificar se há status inconsistentes
        const statusInconsistentes = atendimentos.filter(a =>
            !['ABERTO', 'EM_ATENDIMENTO', 'CONCLUIDO', 'pendente', 'em_atendimento', 'concluido'].includes(a.status)
        );

        if (statusInconsistentes.length > 0) {
            console.log(`⚠️  Encontrados ${statusInconsistentes.length} atendimentos com status inconsistente:`);
            statusInconsistentes.forEach(a => {
                console.log(`   ID: ${a.id}, Status: ${a.status || 'NULL'}`);
            });

            console.log('\n💡 Recomendação: Execute o script de correção para padronizar os status.');
        } else {
            console.log('✅ Todos os status estão consistentes!');
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

verificarStatus();
