
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function corrigirZeros() {
    console.log('🔧 Iniciando correção de zeros à esquerda no CRM...');

    const { data: clientes, error } = await supabase
        .from('clientes')
        .select('id, nome, cnpj_cpf');

    if (error) {
        console.error('Erro ao buscar clientes:', error);
        return;
    }

    for (const cliente of clientes) {
        if (!cliente.cnpj_cpf) continue;

        let original = cliente.cnpj_cpf.toString().replace(/\D/g, '');
        let novo = original;

        if (original.length === 13) {
            novo = '0' + original;
        } else if (original.length === 10) {
            novo = '0' + original;
        }

        if (novo !== original) {
            console.log(`📝 Corrigindo ${cliente.nome.padEnd(25)}: ${original} -> ${novo}`);

            // Aqui tentamos atualizar. Se a coluna for numérica, isso pode não "guardar" o zero.
            // Para garantir, o ideal é que a coluna seja TEXT.
            const { error: updError } = await supabase
                .from('clientes')
                .update({ cnpj_cpf: novo })
                .eq('id', cliente.id);

            if (updError) {
                console.error(`   ❌ Erro ao atualizar ${cliente.nome}:`, updError.message);
            }
        }
    }

    console.log('\n✨ Correção finalizada. Verifique se os zeros agora aparecem no CRM.');
    console.log('⚠️  DICA: Se os zeros não aparecerem, você precisará mudar o tipo da coluna cnpj_cpf para TEXT no Supabase.');
}

corrigirZeros();
