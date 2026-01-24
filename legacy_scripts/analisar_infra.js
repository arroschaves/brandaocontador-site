const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getEnv() {
    try {
        const envPath = path.join(process.cwd(), '.env.local');
        const content = fs.readFileSync(envPath, 'utf8');
        const urlMatch = content.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
        const keyMatch = content.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
        return {
            url: urlMatch ? urlMatch[1].trim() : '',
            key: keyMatch ? keyMatch[1].trim() : ''
        };
    } catch (e) { return {}; }
}

const { url, key } = getEnv();
const supabase = createClient(url, key);

async function runAnalysis() {
    console.log('--- RELATÓRIO DE INFRAESTRUTURA BRANDÃO CONTADOR ---');

    // 1. Clientes
    const { count: totalClientes } = await supabase.from('clientes').select('*', { count: 'exact', head: true });
    const { count: clientesComDrive } = await supabase.from('clientes').select('*', { count: 'exact', head: true }).not('drive_folder_id', 'is', null);

    // 2. Atendimentos
    const { count: totalAtendimentos } = await supabase.from('atendimentos').select('*', { count: 'exact', head: true });
    const { count: atendimentosIA } = await supabase.from('atendimentos').select('*', { count: 'exact', head: true }).not('categoria_solicitacao', 'is', null);

    // 3. Obrigações
    const { count: totalObrigacoes } = await supabase.from('obrigacoes_acessorias').select('*', { count: 'exact', head: true });

    // 4. Categorias de Atendimento
    const { data: categorias } = await supabase.from('atendimentos').select('categoria_solicitacao');
    const catMap = {};
    categorias?.forEach(c => {
        if (c.categoria_solicitacao) {
            catMap[c.categoria_solicitacao] = (catMap[c.categoria_solicitacao] || 0) + 1;
        }
    });

    console.log(`\n📊 ESTATÍSTICAS DO BANCO:`);
    console.log(`- Total de Clientes: ${totalClientes}`);
    console.log(`- Clientes com Google Drive: ${clientesComDrive} (${((clientesComDrive / totalClientes) * 100).toFixed(1)}%)`);
    console.log(`- Total de Atendimentos (WhatsApp): ${totalAtendimentos}`);
    console.log(`- Atendimentos Classificados por IA: ${atendimentosIA}`);
    console.log(`- Total de Obrigações Fiscais Automatizadas: ${totalObrigacoes}`);

    console.log(`\n🏷️ CATEGORIAS MAIS FREQUENTES:`);
    Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([cat, count]) => {
        console.log(`- ${cat}: ${count}`);
    });

    console.log(`\n✅ ANÁLISE CONCLUÍDA`);
}

runAnalysis();
