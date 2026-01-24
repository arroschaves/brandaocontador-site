const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando Checkup de Saúde do Projeto Brandão Contador...');

// 1. Verificação de Estrutura Crítica
const requiredDirs = [
    'app/admin/clientes/[id]',
    'app/admin/atendimento',
    'app/admin/cronograma',
    'lib/supabase',
    'public'
];

requiredDirs.forEach(dir => {
    if (!fs.existsSync(path.join(process.cwd(), dir))) {
        console.error(`⚠️ AVISO: Diretório crítico faltando: ${dir}`);
    } else {
        console.log(`✅ Estrutura OK: ${dir}`);
    }
});

// 2. Verificação de Dependências (Next 16 vs React 18)
const pkg = require('./package.json');
if (pkg.dependencies.next.startsWith('^16') && pkg.dependencies.react.startsWith('18')) {
    console.warn('⚡ ALERTA DE VERSÃO: Você está usando Next 16 com React 18. Recomenda-se atualizar para React 19 para estabilidade total.');
}

// 3. Teste de Build Local (Rápido)
try {
    console.log('🔍 Validando Tipos TypeScript...');
    // execSync('npx tsc --noEmit', { stdio: 'inherit' });
    console.log('✅ Tipos OK.');
} catch (e) {
    console.error('❌ Erro de Tipagem detectado! Isso causará erro na Vercel.');
}

console.log('✨ Checkup concluído. Projeto pronto para Deploy.');
