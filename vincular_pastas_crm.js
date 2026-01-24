const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function vincularPastasNoCRM() {
    console.log('🔗 Iniciando vínculo de pastas no CRM...');

    const clientesParaVincular = [
        'GETULIO RODRIGUES',
        'MAQUITA',
        'ALESSANDRO BRANDÃO',
        'ITA TRANSPORTES',
        'LAURO FERREIRA DA SILVA',
        'L. H. C. BENITES LTDA',
        'HELIO MOURA',
        'CRISTINA CAPÃO SECO',
        'WILCILENE',
        'REDSON BONADIMAN'
    ];

    for (const nome of clientesParaVincular) {
        process.stdout.write(`Viculando ${nome}... `);

        const { data, error } = await supabase
            .from('clientes')
            .update({ drive_folder_id: 'VINCULO_LOCAL' })
            .eq('nome', nome);

        if (error) {
            console.log(`❌ Erro: ${error.message}`);
        } else {
            console.log(`✅ OK`);
        }
    }

    console.log('\n✨ Todos os clientes foram marcados com pasta ativa no CRM.');
    console.log('Agora o botão "Ver no Google Drive" deve aparecer para eles.');
}

vincularPastasNoCRM();
