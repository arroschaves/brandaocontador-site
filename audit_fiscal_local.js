
const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuração
const RAIZ = String.raw`E:\PROJETOS\brandaocontador-site\ARQUIVOS  DAS FGTS INSS XML E SPED DARF`;
const LOG_FILE = 'relatorio_auditoria.txt';

// Helpers de API
function consultaCNPJ(cnpj) {
    return new Promise((resolve) => {
        // Limpa CNPJ
        const limpo = cnpj.replace(/\D/g, '');
        if (limpo.length !== 14) return resolve(null);

        const options = {
            hostname: 'brasilapi.com.br',
            path: `/api/cnpj/v1/${limpo}`,
            method: 'GET',
            headers: { 'User-Agent': 'BrandaoBot/1.0' } // Boa prática
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch { resolve(null); }
            });
        });
        req.on('error', () => resolve(null));
        req.end();
    });
}

async function audit() {
    console.log(`Iniciando auditoria em: ${RAIZ}`);
    const files = [];

    // 1. Scan Recursivo
    function walk(dir) {
        try {
            const list = fs.readdirSync(dir);
            list.forEach(file => {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);
                if (stat && stat.isDirectory()) {
                    walk(fullPath);
                } else {
                    // Filtra apenas interesse
                    if (file.match(/\.(pdf|xml)$/i)) {
                        files.push(fullPath);
                    }
                }
            });
        } catch (e) {
            console.error(`Erro ao ler ${dir}: ${e.message}`);
        }
    }

    walk(RAIZ);
    console.log(`Encontrados ${files.length} arquivos interessantes (PDF/XML).`);

    let logContent = `RELATÓRIO DE AUDITORIA FISCAL - ${new Date().toLocaleString()}\n`;
    logContent += `Total Arquivos: ${files.length}\n\n`;

    // 2. Análise de Amostra (Primeiros 50 para não demorar)
    const amostra = files.slice(0, 50);

    for (const f of amostra) {
        const nome = path.basename(f);
        const pastaPai = path.basename(path.dirname(f));

        logContent += `[Arquivo] ${nome}\n`;
        logContent += `   Pasta: ${pastaPai}\n`;

        // Tentativa de Extração de CNPJ do nome ou pasta
        const matchCNPJ = nome.match(/(\d{14})/) || pastaPai.match(/(\d{14})/) || pastaPai.match(/(\d{11})/);

        if (matchCNPJ) {
            const doc = matchCNPJ[0];
            logContent += `   Identificado DOC: ${doc}\n`;

            // Se for CNPJ (14 digitos), consulta API
            if (doc.length === 14) {
                const dados = await consultaCNPJ(doc);
                if (dados && dados.razao_social) {
                    logContent += `   Receita Federal: ${dados.razao_social}\n`;
                    logContent += `   Simples Nacional: ${dados.opcao_pelo_simples ? 'SIM' : 'NÃO'}\n`;
                    logContent += `   CNAE Principal: ${dados.cnae_fiscal_descricao}\n`;
                }
            } else {
                logContent += `   (Provável CPF ou incompleto)\n`;
            }
        }
        logContent += '-----------------------------------\n';

        // Pequeno delay para não bloquear API
        await new Promise(r => setTimeout(r, 200));
    }

    fs.writeFileSync(LOG_FILE, logContent);
    console.log(`Relatório salvo em ${LOG_FILE}`);
}

audit();
