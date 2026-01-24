// Script para verificar se os atendimentos têm categoria e prioridade
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

async function checkAtendimentos() {
    console.log('🔍 Verificando campos de categoria e prioridade nos atendimentos...\n');

    try {
        // Buscar todos os atendimentos
        const { data: atendimentos, error } = await supabase
            .from('atendimentos')
            .select('id, mensagem, categoria_solicitacao, prioridade, status, created_at')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        console.log(`📊 Total de atendimentos (últimos 20): ${atendimentos.length}\n`);

        // Estatísticas
        const comCategoria = atendimentos.filter(a => a.categoria_solicitacao).length;
        const comPrioridade = atendimentos.filter(a => a.prioridade).length;
        const semCategoria = atendimentos.length - comCategoria;
        const semPrioridade = atendimentos.length - comPrioridade;

        console.log('📈 Estatísticas:');
        console.log(`   ✅ Com categoria: ${comCategoria}`);
        console.log(`   ❌ Sem categoria: ${semCategoria}`);
        console.log(`   ✅ Com prioridade: ${comPrioridade}`);
        console.log(`   ❌ Sem prioridade: ${semPrioridade}\n`);

        // Mostrar alguns exemplos
        console.log('📋 Exemplos de atendimentos:\n');
        atendimentos.slice(0, 5).forEach((atend, index) => {
            console.log(`${index + 1}. ${atend.mensagem?.substring(0, 50)}...`);
            console.log(`   Categoria: ${atend.categoria_solicitacao || '❌ NÃO DEFINIDA'}`);
            console.log(`   Prioridade: ${atend.prioridade || '❌ NÃO DEFINIDA'}`);
            console.log(`   Status: ${atend.status}`);
            console.log(`   Data: ${new Date(atend.created_at).toLocaleString('pt-BR')}\n`);
        });

        // Verificar se a coluna existe
        console.log('\n🔧 Verificando estrutura da tabela...');
        const { data: colunas, error: schemaError } = await supabase
            .from('atendimentos')
            .select('*')
            .limit(1);

        if (colunas && colunas.length > 0) {
            const campos = Object.keys(colunas[0]);
            console.log('✅ Campos disponíveis na tabela atendimentos:');
            console.log(campos.join(', '));

            if (!campos.includes('categoria_solicitacao')) {
                console.log('\n❌ PROBLEMA: Campo "categoria_solicitacao" NÃO EXISTE na tabela!');
            }
            if (!campos.includes('prioridade')) {
                console.log('❌ PROBLEMA: Campo "prioridade" NÃO EXISTE na tabela!');
            }
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

checkAtendimentos();
