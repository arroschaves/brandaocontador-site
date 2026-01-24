
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function consolidate() {
    console.log('--- Iniciando Consolidação de Clientes ---');

    // 1. Buscar os clientes "Bons" (com contato)
    const { data: goodClients, error: e1 } = await supabase
        .from('clientes')
        .select('id, nome, cnpj_cpf')
        .or('telefone_whatsapp.not.is.null,email.not.is.null');

    if (e1) {
        console.error('Erro ao buscar clientes bons:', e1);
        return;
    }
    console.log(`Clientes válidos encontrados: ${goodClients.length}`);

    // 2. Buscar os clientes "Ruins" (sem contato)
    const { data: badClients, error: e2 } = await supabase
        .from('clientes')
        .select('id, nome, cnpj_cpf')
        .is('telefone_whatsapp', null)
        .is('email', null);

    if (e2) {
        console.error('Erro ao buscar clientes nulos:', e2);
        return;
    }
    console.log(`Clientes para limpeza/consolidação: ${badClients.length}`);

    let remappedCount = 0;
    let deletedCount = 0;

    for (const bad of badClients) {
        // Tentar encontrar um "Bom" correspondente por nome ou por CNPJ/CPF (se houver)
        let match = goodClients.find(g =>
            (g.nome && bad.nome && g.nome.trim().toUpperCase() === bad.nome.trim().toUpperCase()) ||
            (g.cnpj_cpf && bad.cnpj_cpf && g.cnpj_cpf === bad.cnpj_cpf)
        );

        if (match) {
            console.log(`Transferindo dados de [${bad.nome}] -> [${match.nome}]`);

            // Transferir obrigações
            const { error: err1 } = await supabase
                .from('obrigacoes_acessorias')
                .update({ cliente_id: match.id })
                .eq('cliente_id', bad.id);

            if (err1) console.error(`Erro ao transferir obrigações de ${bad.nome}:`, err1.message);

            // Transferir atendimentos
            const { error: err2 } = await supabase
                .from('atendimentos')
                .update({ cliente_id: match.id })
                .eq('cliente_id', bad.id);

            if (err2) console.error(`Erro ao transferir atendimentos de ${bad.nome}:`, err2.message);

            remappedCount++;
        }

        // Deletar o registro "Bad" (e suas obrigações residuais se houver, para não dar erro de constraint)
        // Como o usuário disse "o resto não preciso", se não houve match, deletamos as obrigações órfãs também
        if (!match) {
            await supabase.from('obrigacoes_acessorias').delete().eq('cliente_id', bad.id);
            await supabase.from('atendimentos').delete().eq('cliente_id', bad.id);
        }

        const { error: delErr } = await supabase
            .from('clientes')
            .delete()
            .eq('id', bad.id);

        if (delErr) {
            console.error(`Erro ao deletar cliente ${bad.nome}:`, delErr.message);
        } else {
            deletedCount++;
        }
    }

    console.log('\n--- Resultado Final ---');
    console.log(`Clientes remapeados para cadastros válidos: ${remappedCount}`);
    console.log(`Total de clientes excluídos: ${deletedCount}`);
    console.log(`Cadastro limpo! Devem sobrar aproximadamente os ${goodClients.length} que você mencionou.`);
}

consolidate();
