const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// DICIONÁRIO DE APELIDOS (O "Cérebro" do script)
const APELIDOS = {
    // Fazendas do Aroldo Correa PF
    'FAZ ITAOCA': 'AROLDO CORREA',
    'FAZ FURNA DA ESTRELA': 'AROLDO CORREA',
    'FAZ ALTO DA SERRA': 'AROLDO CORREA',
    'FAZ NOVA QUERENCIA': 'AROLDO CORREA',

    // Fazendas do Aroldo Correa JR
    'FAZ MATA SECA': 'AROLDO JUNIOR',
    'FAZ MENINA DE DEUS': 'AROLDO JUNIOR',
    'FAZ SANTO EXPEDITO': 'AROLDO JUNIOR',
    'FAZENDA TRIUNFO': 'AROLDO JUNIOR',
    'FAZENDA BATATA': 'AROLDO JUNIOR',
    'FAZENDA RONDA': 'AROLDO JUNIOR',

    // Outros ajustes de nomes curtos/pastas
    'ITACIR PJ': 'ITACIR BONADIMAN',
    'ANA FLAVIA': 'ANA OTICAS',
    'ANTONIO MARCOS': 'ANTONIO M. NANTES',
    'AÇO MS': 'AABB', // Ajustar se for outro cliente
    'CRIS SALIM': 'AROLDO CORREA', // Ajustar se for outro
    'WILCELENE': 'WILCILENE'
};

const FONTES = [
    { path: 'C:\\Users\\Alessandro\\Desktop\\SIMPLES NACIONAL', categoria: 'SIMPLES_NACIONAL' },
    { path: 'F:\\ACESSO RAPÍDO\\FOLHA PAGAMENTO\\RECIBO FOLHA', categoria: 'FOLHA_PAGAMENTO' },
    { path: 'C:\\Users\\Alessandro\\Desktop\\LUCRO REAL', categoria: 'LUCRO_REAL' }
];

const DESTINO_BASE = 'G:\\Meu Drive\\Brandão Contabilidade CRM';
const MESES = [
    '01_Janeiro', '02_Fevereiro', '03_Marco', '04_Abril',
    '05_Maio', '06_Junho', '07_Julho', '08_Agosto',
    '09_Setembro', '10_Outubro', '11_Novembro', '12_Dezembro'
];

async function analisar() {
    console.log(`\n🧠 SIMULAÇÃO COM INTELIGÊNCIA DE APELIDOS`);
    console.log(`-----------------------------------------`);

    try {
        const { data: clientes } = await supabase.from('clientes').select('nome');
        const nomesClientes = clientes.map(c => c.nome.toUpperCase());

        for (const fonte of FONTES) {
            if (!fs.existsSync(fonte.path)) continue;

            const subpastas = fs.readdirSync(fonte.path, { withFileTypes: true });

            for (const item of subpastas) {
                if (item.isDirectory()) {
                    const nomePasta = item.name.toUpperCase();

                    // 1. Tenta por Apelido Primeiro
                    let clienteFinal = APELIDOS[nomePasta];

                    // 2. Se não tiver apelido, tenta busca por aproximação
                    if (!clienteFinal) {
                        clienteFinal = nomesClientes.find(n =>
                            n.includes(nomePasta) || nomePasta.includes(n)
                        );
                    }

                    if (clienteFinal) {
                        const pathPastaCliente = path.join(fonte.path, item.name);
                        const arquivos = fs.readdirSync(pathPastaCliente).filter(f => fs.statSync(path.join(pathPastaCliente, f)).isFile());

                        if (arquivos.length > 0) {
                            const stats = fs.statSync(path.join(pathPastaCliente, arquivos[0]));
                            const ano = stats.mtime.getFullYear();
                            const mes = MESES[stats.mtime.getMonth()];
                            console.log(`✅ [${clienteFinal}] <- Pasta: ${item.name} (${arquivos.length} arq)`);
                            console.log(`   ➡️ Destino: ...\\${ano}\\${mes}\\${fonte.categoria}`);
                        }
                    } else {
                        console.log(`❓ Desconhecido: ${item.name}`);
                    }
                }
            }
        }
        console.log(`\n-----------------------------------------`);
        console.log(`💡 Se os nomes acima estiverem certos, podemos MOVER os arquivos.`);
    } catch (err) {
        console.error('Erro:', err.message);
    }
}

analisar();
