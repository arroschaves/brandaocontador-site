require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function migrateRazaoSocial() {
    console.log("🚀 Iniciando migração de 'nome' para 'razao_social'...");

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // 1. Buscar clientes onde razao_social é nulo ou vazio
    // Como não podemos fazer update em massa complexo via API simples do cliente JS sem stored procedure para este caso específico (copiar de uma coluna para outra na mesma tabela),
    // vamos iterar. Para 20-50 clientes é rápido. Se fossem milhares, usaríamos SQL direto.

    const { data: clientes, error } = await supabase
        .from('clientes')
        .select('id, nome, razao_social');

    if (error) {
        console.error("❌ Erro ao buscar clientes:", error.message);
        return;
    }

    console.log(`📋 Total de clientes encontrados: ${clientes.length}`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const cliente of clientes) {
        // Se razao_social estiver vazio/nulo, copiamos o nome
        if (!cliente.razao_social || cliente.razao_social.trim() === '') {
            const { error: updateError } = await supabase
                .from('clientes')
                .update({ razao_social: cliente.nome }) // Copia o nome atual (que é a Razão Social)
                .eq('id', cliente.id);

            if (updateError) {
                console.error(`❌ Erro ao atualizar cliente ${cliente.nome}:`, updateError.message);
            } else {
                console.log(`✅ [MIGRADADO] ${cliente.nome} -> Razão Social salva.`);
                updatedCount++;
            }
        } else {
            // Se já tem razão social, não mexemos (assume-se que está certo ou já foi migrado)
            // console.log(`⏭️ [PULADO] ${cliente.nome} já tem Razão Social: ${cliente.razao_social}`);
            skippedCount++;
        }
    }

    console.log("\n🏁 Migração Concluída!");
    console.log(`✅ Atualizados: ${updatedCount}`);
    console.log(`⏭️ Mantidos (já existiam): ${skippedCount}`);
}

migrateRazaoSocial();
