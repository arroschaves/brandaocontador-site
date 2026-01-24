const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

/**
 * DIAMOND SYNC v2.1 - BRANDÃO CONTABILIDADE
 * Adiciona estrutura de 2025 e 2026.
 */

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const CAMINHO_BASE = 'G:\\Meu Drive\\Brandão Contabilidade CRM';

const CATEGORIAS = [
    'FOLHA_PAGAMENTO',
    'SIMPLES_NACIONAL',
    'LUCRO_REAL',
    'PENDENCIAS_FISCAIS',
    'XML_NFE'
];

const MESES = [
    '01_Janeiro', '02_Fevereiro', '03_Marco', '04_Abril',
    '05_Maio', '06_Junho', '07_Julho', '08_Agosto',
    '09_Setembro', '10_Outubro', '11_Novembro', '12_Dezembro'
];

const ANOS = ['2025', '2026']; // Agora criando os dois anos

async function syncAnos() {
    console.log(`\n💎 SINCRONIZAÇÃO DIAMANTE (2025 + 2026)`);
    console.log(`-----------------------------------------`);

    try {
        const { data: clientes, error } = await supabase
            .from('clientes')
            .select('nome')
            .order('nome');

        if (error) throw error;

        console.log(`📦 Processando ${clientes.length} clientes...`);

        for (const cliente of clientes) {
            const nomeLimpo = cliente.nome.replace(/[\\\/:*?"<>|]/g, '').trim();
            const pastaCliente = path.join(CAMINHO_BASE, nomeLimpo);

            if (!fs.existsSync(pastaCliente)) {
                fs.mkdirSync(pastaCliente, { recursive: true });
            }

            for (const ano of ANOS) {
                const pastaAno = path.join(pastaCliente, ano);
                if (!fs.existsSync(pastaAno)) fs.mkdirSync(pastaAno);

                for (const mes of MESES) {
                    const pMes = path.join(pastaAno, mes);
                    if (!fs.existsSync(pMes)) fs.mkdirSync(pMes);

                    for (const cat of CATEGORIAS) {
                        const pCat = path.join(pMes, cat);
                        if (!fs.existsSync(pCat)) fs.mkdirSync(pCat);
                    }
                }
            }
            process.stdout.write(`.`);
        }

        console.log('\n\n✅ Estrutura de 2025 e 2026 pronta no disco G:!');
        console.log(`🚀 Agora você já pode migrar seus documentos de 2025.`);

    } catch (err) {
        console.error('\n❌ Erro:', err.message);
    }
}

syncAnos();
