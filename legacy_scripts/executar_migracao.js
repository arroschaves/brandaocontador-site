// Script para executar a migração completa no Supabase
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

async function executarMigracao() {
    console.log('🚀 Iniciando migração do sistema de atendimento...\n');

    try {
        // Ler o arquivo SQL
        const sqlPath = path.join(__dirname, 'MIGRACAO_ATENDIMENTO_COMPLETO.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

        console.log('📄 SQL carregado com sucesso!');
        console.log('⚠️  ATENÇÃO: Esta migração precisa ser executada no SQL Editor do Supabase.\n');
        console.log('📋 Instruções:');
        console.log('1. Acesse: https://db.brandaocontador.com.br/project/default/editor');
        console.log('2. Cole o conteúdo do arquivo MIGRACAO_ATENDIMENTO_COMPLETO.sql');
        console.log('3. Execute o script');
        console.log('4. Volte aqui e execute: node classificar_atendimentos_lote.js\n');

        console.log('💡 Ou copie e cole o SQL abaixo diretamente no editor:\n');
        console.log('═'.repeat(80));
        console.log(sqlContent);
        console.log('═'.repeat(80));

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

executarMigracao();
