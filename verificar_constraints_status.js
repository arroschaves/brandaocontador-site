// Script para verificar constraints da tabela atendimentos
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

async function verificarConstraints() {
    console.log('🔍 Verificando constraints da tabela atendimentos...\n');

    try {
        // Tentar atualizar um registro com cada status possível
        const statusParaTestar = ['ABERTO', 'EM_ATENDIMENTO', 'CONCLUIDO', 'pendente', 'em_atendimento', 'concluido'];

        // Buscar um atendimento qualquer para teste
        const { data: atendimentos } = await supabase
            .from('atendimentos')
            .select('id, status')
            .limit(1);

        if (!atendimentos || atendimentos.length === 0) {
            console.log('❌ Nenhum atendimento encontrado para teste');
            return;
        }

        const atendimentoTeste = atendimentos[0];
        const statusOriginal = atendimentoTeste.status;

        console.log(`📝 Testando com atendimento: ${atendimentoTeste.id}`);
        console.log(`   Status original: ${statusOriginal}\n`);

        for (const status of statusParaTestar) {
            const { data, error } = await supabase
                .from('atendimentos')
                .update({ status })
                .eq('id', atendimentoTeste.id)
                .select();

            if (error) {
                console.log(`❌ Status "${status}": ERRO - ${error.message}`);
            } else {
                console.log(`✅ Status "${status}": OK`);
            }
        }

        // Restaurar status original
        await supabase
            .from('atendimentos')
            .update({ status: statusOriginal })
            .eq('id', atendimentoTeste.id);

        console.log(`\n🔄 Status restaurado para: ${statusOriginal}`);

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

verificarConstraints();
