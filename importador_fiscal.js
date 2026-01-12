
const fs = require('fs');
const path = require('path');
const https = require('https');

// --- CONFIGURAÇÃO ---
const RAIZ = String.raw`E:\PROJETOS\brandaocontador-site\ARQUIVOS  DAS FGTS INSS XML E SPED DARF`;
const ANOS_FOCO = ['2025', '2026'];

// --- LEITURA DE ENV PARA SUPABASE ---
// (Reaproveitando a lógica de ler .env.local via regex para não depender de pacotes)
function getEnv() {
    try {
        const envPath = path.join(__dirname, '.env.local');
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
if (!url || !key) { console.error('❌ .env.local não encontrado ou sem chaves.'); process.exit(1); }

// --- HELPERS DE API (Supabase & BrasilAPI) ---

function supabaseRequest(method, endpoint, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            method: method,
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        };
        const req = https.request(`${url}/rest/v1/${endpoint}`, options, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try { resolve(data ? JSON.parse(data) : null); } catch { resolve(data); }
                } else { resolve(null); } // Não quebra o loop em erro 409 etc
            });
        });
        req.on('error', (e) => resolve(null));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

function consultaReceita(cnpj) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'brasilapi.com.br',
            path: `/api/cnpj/v1/${cnpj}`,
            method: 'GET',
            headers: { 'User-Agent': 'BrandaoBot/2.0' }
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

// --- CORE ---

async function main() {
    console.log('🤖 INICIANDO IMPORTADOR FISCAL 2025-2026 🤖');
    console.log(`Pasta Raiz: ${RAIZ}`);

    const arquivosCandidatos = [];
    const cnpjsProcessados = new Set(); // Para não consultar o mesmo CNPJ mil vezes
    let clientesNovos = 0;
    let clientesAtualizados = 0;

    // 1. Scan
    console.log('📂 Escaneando arquivos...');
    function scan(dir) {
        try {
            const itens = fs.readdirSync(dir);
            itens.forEach(item => {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    scan(fullPath);
                } else {
                    // Filtro de Anos e Extensão
                    if ((fullPath.includes('2025') || fullPath.includes('2026')) &&
                        item.match(/\.(pdf|xml)$/i)) {
                        arquivosCandidatos.push(fullPath);
                    }
                }
            });
        } catch (e) { }
    }
    scan(RAIZ);
    console.log(`📝 Encontrados ${arquivosCandidatos.length} arquivos relevantes dos anos 2025/2026.`);

    // 2. Processamento
    console.log('🔎 Iniciando análise e cadastro...');

    for (const arquivo of arquivosCandidatos) {
        const nomeArquivo = path.basename(arquivo);
        const nomePasta = path.basename(path.dirname(arquivo));

        // Tenta achar CNPJ (14 dígitos)
        const match = nomeArquivo.match(/(\d{14})/) || nomePasta.match(/(\d{14})/);

        if (match) {
            const cnpj = match[0];

            // Se já processamos esse CNPJ nesta rodada, ignora (cache local de execução)
            if (cnpjsProcessados.has(cnpj)) continue;
            cnpjsProcessados.add(cnpj);

            console.log(`\n🔍 Analisando CNPJ: ${cnpj} (Encontrado em: ${nomeArquivo})`);

            // A. Verifica se existe no Supabase
            const buscaBanco = await supabaseRequest('GET', `clientes?cnpj_cpf=eq.${cnpj}&select=*`);

            if (buscaBanco && buscaBanco.length > 0) {
                // Cliente já existe -> Vamos atualizar dados fiscais se faltar
                const cliente = buscaBanco[0];
                if (!cliente.regime_tributario) {
                    console.log(`   ⏳ Cliente existe (${cliente.nome}), mas sem regime. Consultando Receita...`);
                    const dadosReceita = await consultaReceita(cnpj);
                    if (dadosReceita && dadosReceita.razao_social) {
                        const regime = dadosReceita.opcao_pelo_simples ? 'Simples Nacional' : 'Lucro Presumido/Real';
                        await supabaseRequest('PATCH', `clientes?id=eq.${cliente.id}`, {
                            regime_tributario: regime,
                            cnae_principal: dadosReceita.cnae_fiscal_descricao,
                            status_rfb: dadosReceita.descricao_situacao_cadastral,
                            log_atualizacao: new Date()
                        });
                        console.log(`   ✅ Atualizado para: ${regime}`);
                        clientesAtualizados++;
                    }
                } else {
                    console.log(`   🆗 Já cadastrado e completo: ${cliente.nome}`);
                }
            } else {
                // Cliente NÃO existe -> Cadastrar!
                console.log(`   🆕 Cliente NOVO! Consultando Receita...`);
                const dadosReceita = await consultaReceita(cnpj);
                if (dadosReceita && dadosReceita.razao_social) {
                    const novoCliente = {
                        nome: dadosReceita.nome_fantasia || dadosReceita.razao_social, // Prefere fantasia
                        cnpj_cpf: cnpj,
                        email: null, // Não temos email no nome do arquivo
                        telefone_whatsapp: dadosReceita.ddd_telefone_1 ? '55' + dadosReceita.ddd_telefone_1.replace(/\D/g, '') : null,
                        regime_tributario: dadosReceita.opcao_pelo_simples ? 'Simples Nacional' : 'Lucro Presumido/Real',
                        cnae_principal: dadosReceita.cnae_fiscal_descricao,
                        status_rfb: dadosReceita.descricao_situacao_cadastral,
                        observacoes: `Importado automaticamente via BrandãoBot (Fonte: ${nomeArquivo})`
                    };

                    const resInsert = await supabaseRequest('POST', 'clientes', novoCliente);
                    if (resInsert) {
                        console.log(`   ✨ CADASTRO REALIZADO: ${novoCliente.nome}`);
                        clientesNovos++;
                    } else {
                        console.error(`   ❌ Falha ao cadastrar.`);
                    }
                } else {
                    console.log(`   ⚠️ CNPJ não encontrado na Receita ou API fora do ar.`);
                }
            }

            // Delay para respeitar API pública (evitar bloqueio)
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    console.log('\n--- RESUMO DA OPERAÇÃO ---');
    console.log(`CNPJs Únicos Encontrados: ${cnpjsProcessados.size}`);
    console.log(`Novos Clientes Cadastrados: ${clientesNovos}`);
    console.log(`Clientes Atualizados: ${clientesAtualizados}`);
    console.log('🤖 FIM DA IMPORTAÇÃO 🤖');
}

main();
