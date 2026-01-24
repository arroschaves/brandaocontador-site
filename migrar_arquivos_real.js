const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const pdf = require('node-pdf-parser');

/**
 * 💎 MIGRACÃO DIAMANTE REAL (v3.0 - AI PDF ID)
 * Agora identifica clientes lendo CPF/CNPJ dentro de PDFs.
 */

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Pasta Raiz de Destino no Google Drive (Disco G:)
const DESTINO_BASE = 'G:\\Meu Drive\\Brandão Contabilidade CRM';

// Pastas de Origem nos PCs locais
const FONTES = [
    { path: 'C:\\Users\\Alessandro\\Desktop\\SIMPLES NACIONAL', categoria: 'SIMPLES_NACIONAL' },
    { path: 'F:\\ACESSO RAPÍDO\\FOLHA PAGAMENTO\\RECIBO FOLHA', categoria: 'FOLHA_PAGAMENTO' },
    { path: 'F:\\ACESSO RAPÍDO\\FOLHA PAGAMENTO\\GUIA FGTS', categoria: 'FOLHA_PAGAMENTO' },
    { path: 'C:\\Users\\Alessandro\\Desktop\\LUCRO REAL', categoria: 'LUCRO_REAL' }
];

// Dicionário de Apelidos para pastas mapeadas pelo nome (Fallback)
const APELIDOS = {
    // Confirmados pelo Usuário
    'WILCELENE': 'WILCILENE',
    'CRISTINA CAPAO SECO': 'CRISTINA CAPÃO SECO',
    'MARCOS NANTES': 'MARCOS BRUNO NANTES',
    'REBSON BONADIMAN': 'REDSON BONADIMAN',
    'CADU': 'CADU CALHAS',
    'ITACIR PASSO FORMOSO': 'ITACIR BONADIMAN',
    'ITACIR TERRA DO SOL': 'ITACIR BONADIMAN',
    'SITIO JATOBA': 'LAURO FERREIRA DA SILVA',
    'FAZENDA PANTANAL': 'HELIO MOURA',
    'L A MANUTECAO': 'L. H. C. BENITES LTDA',
    'ESTANCIA 15 DE MAIO': 'GETULIO RODRIGUES',
    'GETULIO RODRIGUES': 'GETULIO RODRIGUES',
    'LAURO': 'LAURO FERREIRA DA SILVA',
    'MAQUITA': 'MAQUITA',
    'ALESSANDRO': 'ALESSANDRO BRANDÃO',
    'ITA TRANSPORTES': 'ITA TRANSPORTES',

    // Antigos Mapeamentos
    'FAZ ITAOCA': 'AROLDO CORREA',
    'FAZ FURNA DA ESTRELA': 'AROLDO CORREA',
    'FAZ ALTO DA SERRA': 'AROLDO CORREA',
    'FAZ NOVA QUERENCIA': 'AROLDO CORREA',
    'FAZ MATA SECA': 'AROLDO JUNIOR',
    'FAZ MENINA DE DEUS': 'AROLDO JUNIOR',
    'FAZ SANTO EXPEDITO': 'AROLDO JUNIOR',
    'FAZENDA TRIUNFO': 'AROLDO JUNIOR',
    'FAZENDA BATATA': 'AROLDO JUNIOR',
    'FAZENDA RONDA': 'AROLDO JUNIOR',
    'ITACIR PJ': 'ITACIR BONADIMAN',
    'ANA FLAVIA': 'ANA OTICAS',
    'ANTONIO MARCOS': 'ANTONIO M. NANTES',
    'AÇO MS': 'AABB',
    'CRIS SALIM': 'AROLDO CORREA'
};

// Pastas que NÃO devem ser importadas (Ex-clientes ou lixo)
const EX_CLIENTES = [
    'FAZ. NOVA QUERENCIA',
    'BHABA RESTAURANTE',
    'PC FILMS',
    'ICON STORE'
];

const MESES = [
    '01_Janeiro', '02_Fevereiro', '03_Marco', '04_Abril',
    '05_Maio', '06_Junho', '07_Julho', '08_Agosto',
    '09_Setembro', '10_Outubro', '11_Novembro', '12_Dezembro'
];

async function identificarClientePorPdf(filePath, baseDados) {
    if (!filePath.toLowerCase().endsWith('.pdf')) return null;
    try {
        const data = await pdf.parsepdf(filePath);
        const textoCompleto = data.pages.join(' ');
        const textoLimpo = textoCompleto.replace(/\D/g, '');

        const match = baseDados.find(c => textoLimpo.includes(c.doc));
        return match ? match.nome : null;
    } catch (e) {
        return null;
    }
}

async function executarMigracao() {
    console.log(`\n🚀 INICIANDO MIGRACAO DIAMANTE (v3.0 - AI PDF ID)`);
    console.log(`---------------------------------------------------`);

    let totalMigrado = 0;
    let totalPulado = 0;
    let totalIaIdentificado = 0;
    let inativos = new Set();

    try {
        // Carrega base de clientes do CRM
        const { data: clientes } = await supabase.from('clientes').select('nome, cnpj_cpf');
        const baseDados = (clientes || []).map(c => ({
            nome: c.nome,
            doc: c.cnpj_cpf ? c.cnpj_cpf.toString().replace(/\D/g, '') : ''
        })).filter(c => c.doc !== '');

        const nomesClientesCRM = baseDados.map(c => c.nome.toUpperCase());

        for (const fonte of FONTES) {
            if (!fs.existsSync(fonte.path)) {
                console.log(`⚠️  Pasta fonte não encontrada: ${fonte.path}`);
                continue;
            }

            console.log(`\n📂 Escaneando: ${fonte.categoria} (${fonte.path})`);
            const subpastas = fs.readdirSync(fonte.path, { withFileTypes: true });

            for (const item of subpastas) {
                if (item.isDirectory()) {
                    const nomePastaOriginal = item.name;
                    const nomePastaBusca = item.name.toUpperCase();

                    // PULA SE FOR EX-CLIENTE
                    if (EX_CLIENTES.includes(nomePastaBusca)) {
                        process.stdout.write(`☕`); // Ícone de "espera/café" para ignorados
                        continue;
                    }

                    const pathOrigem = path.join(fonte.path, item.name);
                    const arquivos = fs.readdirSync(pathOrigem);

                    for (const arquivo of arquivos) {
                        const fullPathOrigem = path.join(pathOrigem, arquivo);
                        if (fs.statSync(fullPathOrigem).isDirectory()) continue;

                        // 1. TENTA IDENTIFICAR POR IA (PDF Content)
                        let clienteFinal = await identificarClientePorPdf(fullPathOrigem, baseDados);
                        if (clienteFinal) totalIaIdentificado++;

                        // 2. FALLBACK 1: Dicionário de Apelidos
                        if (!clienteFinal) {
                            clienteFinal = APELIDOS[nomePastaBusca];
                        }

                        // 3. FALLBACK 2: Match por Nome Parcial da Pasta
                        if (!clienteFinal) {
                            clienteFinal = nomesClientesCRM.find(n => n.includes(nomePastaBusca) || nomePastaBusca.includes(n));
                        }

                        if (clienteFinal) {
                            const stats = fs.statSync(fullPathOrigem);
                            const ano = stats.mtime.getFullYear();
                            const mes = MESES[stats.mtime.getMonth()];

                            // Limpa nome para o Windows
                            const clientePathSafe = clienteFinal.replace(/[\\\/:*?"<>|]/g, '').trim();

                            // Lógica de Fazendas
                            let subPastaExtra = '';
                            if (nomePastaBusca.startsWith('FAZ')) {
                                subPastaExtra = nomePastaBusca.replace('FAZ ', '').replace('FAZENDA ', '').replace(/[\\\/:*?"<>|]/g, '').trim();
                            }

                            const pathDestinoBase = path.join(DESTINO_BASE, clientePathSafe, ano.toString(), mes, fonte.categoria, subPastaExtra);
                            if (!fs.existsSync(pathDestinoBase)) fs.mkdirSync(pathDestinoBase, { recursive: true });

                            const fullPathDestino = path.join(pathDestinoBase, arquivo);

                            // Smart Sync: Pula se já existir com mesmo tamanho
                            if (fs.existsSync(fullPathDestino)) {
                                const statsDestino = fs.statSync(fullPathDestino);
                                if (statsDestino.size === stats.size) {
                                    totalPulado++;
                                    continue;
                                }
                            }

                            try {
                                fs.copyFileSync(fullPathOrigem, fullPathDestino);
                                totalMigrado++;
                            } catch (e) {
                                console.log(`   ❌ Erro ao copiar ${arquivo}: ${e.message}`);
                            }
                        } else {
                            inativos.add(nomePastaOriginal);
                        }
                    }
                    process.stdout.write(`.`);
                }
            }
        }

        const listInativos = Array.from(inativos);
        fs.writeFileSync('relatorio_inativos.txt', `RELATÓRIO DE PASTAS NÃO IMPORTADAS\n\n${listInativos.join('\n')}`);

        console.log(`\n\n---------------------------------------------------`);
        console.log(`✨ MIGRACAO CONCLUÍDA!`);
        console.log(`✅ Arquivos Copiados: ${totalMigrado}`);
        console.log(`🤖 Identificados por IA (PDF): ${totalIaIdentificado}`);
        console.log(`⏭️ Arquivos Pulados (Smart Sync): ${totalPulado}`);
        console.log(`📄 Relatório: relatorio_inativos.txt`);
        console.log(`📍 Verifique em: ${DESTINO_BASE}`);
        console.log(`---------------------------------------------------`);

    } catch (err) {
        console.error('❌ Erro fatal:', err);
    }
}

executarMigracao();
