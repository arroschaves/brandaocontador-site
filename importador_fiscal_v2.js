
const fs = require('fs');
const path = require('path');
const https = require('https');

// --- CONFIGURAÇÃO ---
const RAIZ = String.raw`E:\PROJETOS\brandaocontador-site\ARQUIVOS  DAS FGTS INSS XML E SPED DARF`;
const N8N_WEBHOOK_URL = 'https://webhook.brandaocontador.com.br/webhook/01f435a5-aa5c-44b3-a46d-1b22d2b1c825';

// --- ENV ---
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

// --- HELPERS ---

function supabaseRequest(method, endpoint, body = null) {
    return new Promise((resolve) => {
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
                } else {
                    resolve({ error: true, status: res.statusCode, body: data });
                }
            });
        });
        req.on('error', (e) => resolve({ error: true, message: e.message }));
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
            headers: { 'User-Agent': 'BrandaoBot/5.0' }
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

// --- UPLOAD PARA GOOGLE DRIVE VIA N8N ---
function uploadParaDrive(cnpjCpf, nomeArquivo, caminhoCompleto) {
    return new Promise((resolve) => {
        try {
            // Lê o arquivo e converte para base64
            const fileBuffer = fs.readFileSync(caminhoCompleto);
            const fileBase64 = fileBuffer.toString('base64');

            const payload = JSON.stringify({
                cnpj_cpf: cnpjCpf,
                file_name: nomeArquivo,
                file_data: fileBase64,
                file_path: caminhoCompleto
            });

            const webhookUrl = new URL(N8N_WEBHOOK_URL);
            const options = {
                hostname: webhookUrl.hostname,
                path: webhookUrl.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', d => data += d);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        console.log(`      📤 Upload enviado para Drive: ${nomeArquivo}`);
                        resolve(true);
                    } else {
                        console.log(`      ⚠️  Erro no upload: ${res.statusCode}`);
                        resolve(false);
                    }
                });
            });

            req.on('error', (e) => {
                console.log(`      ❌ Erro na requisição: ${e.message}`);
                resolve(false);
            });

            req.write(payload);
            req.end();
        } catch (e) {
            console.log(`      ❌ Erro ao processar arquivo: ${e.message}`);
            resolve(false);
        }
    });
}

// --- XML ---
function extrairDadosXML(caminhoArquivo) {
    try {
        const content = fs.readFileSync(caminhoArquivo, 'utf-8');
        const matchDest = content.match(/<dest>([\s\S]*?)<\/dest>/);
        if (!matchDest) return null;

        const blocoDest = matchDest[1];
        const cnpjMatch = blocoDest.match(/<CNPJ>(\d+)<\/CNPJ>/);
        const cpfMatch = blocoDest.match(/<CPF>(\d+)<\/CPF>/);
        const nomeMatch = blocoDest.match(/<xNome>([^<]+)<\/xNome>/);
        const ieMatch = blocoDest.match(/<IE>([^<]+)<\/IE>/);

        if (cnpjMatch || cpfMatch) {
            return {
                doc: cnpjMatch ? cnpjMatch[1] : cpfMatch[1],
                tipoDoc: cnpjMatch ? 'CNPJ' : 'CPF',
                nome: nomeMatch ? nomeMatch[1] : null,
                ie: ieMatch ? ieMatch[1] : null
            };
        }
        return null;
    } catch (e) { return null; }
}

// --- MAIN ---
async function main() {
    console.log('🤖 IMPORTADOR FISCAL V9 - COM UPLOAD GOOGLE DRIVE 🤖');
    const arquivosCandidatos = [];
    let clientesNovos = 0;
    let uploadsRealizados = 0;

    // 1. Scan
    function scan(dir) {
        try {
            const itens = fs.readdirSync(dir);
            itens.forEach(item => {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) scan(fullPath);
                else if ((fullPath.includes('2025') || fullPath.includes('2026')) && item.match(/\.(pdf|xml)$/i)) {
                    arquivosCandidatos.push(fullPath);
                }
            });
        } catch (e) { }
    }
    console.log('📂 Escaneando arquivos...');
    scan(RAIZ);
    console.log(`📝 Encontrados ${arquivosCandidatos.length} arquivos.`);

    const processadosSession = new Set();
    const blacklistProcessados = new Set();

    for (const arquivo of arquivosCandidatos) {
        const ext = path.extname(arquivo).toLowerCase();
        let dadosCliente = null;

        // A. XML
        if (ext === '.xml') {
            const xmlData = extrairDadosXML(arquivo);
            if (xmlData) dadosCliente = { ...xmlData, origem: 'XML' };
        }

        // B. Nome (Guias)
        if (!dadosCliente) {
            const nomeArquivo = path.basename(arquivo);
            let doc = null;

            // Busca 14 digitos (CNPJ)
            const matches14 = nomeArquivo.match(/(\d{14})/g) || [];
            for (const m of matches14) {
                if (m.includes('2025') || m.includes('2026')) continue;
                doc = m;
                break;
            }
            // Busca 11 digitos (CPF)
            if (!doc) {
                const matches11 = nomeArquivo.match(/(\d{11})/g) || [];
                for (const m of matches11) {
                    if (m.includes('2025') || m.includes('2026')) continue;
                    doc = m;
                    break;
                }
            }
            if (doc) dadosCliente = { doc: doc, origem: 'PDF_NAME' };
        }

        // C. Execução
        if (dadosCliente && dadosCliente.doc) {
            const { doc, nome, ie } = dadosCliente;

            if (blacklistProcessados.has(doc)) continue;

            const busca = await supabaseRequest('GET', `clientes?cnpj_cpf=eq.${doc}&select=*`);
            let clienteId = null;

            if (busca && !busca.error && busca.length > 0) {
                clienteId = busca[0].id;
                // Atualiza IE via XML
                if (dadosCliente.origem === 'XML' && ie && !busca[0].inscricao_estadual) {
                    await supabaseRequest('PATCH', `clientes?id=eq.${clienteId}`, { inscricao_estadual: ie });
                }

                // 🆕 UPLOAD PARA GOOGLE DRIVE
                if (busca[0].drive_folder_id) {
                    const uploadSuccess = await uploadParaDrive(doc, path.basename(arquivo), arquivo);
                    if (uploadSuccess) uploadsRealizados++;
                }
            } else {
                // Cadastro Novo
                if (!processadosSession.has(doc)) {
                    processadosSession.add(doc);

                    let payload = { cnpj_cpf: doc };
                    let deveCadastrar = false;

                    if (nome) {
                        payload.nome = nome.toUpperCase();
                        payload.inscricao_estadual = ie;
                        payload.observacoes = 'Cadastro via XML (Destinatário)';
                        deveCadastrar = true;
                    } else {
                        // via PDF -> Consulta API
                        const api = await consultaReceita(doc);
                        if (api && api.razao_social) {
                            payload.nome = api.nome_fantasia || api.razao_social;
                            payload.regime_tributario = api.opcao_pelo_simples ? 'Simples Nacional' : 'Lucro Presumido/Real';
                            payload.status_rfb = api.descricao_situacao_cadastral;
                            deveCadastrar = true;
                        } else {
                            // Valida nome da pasta
                            const nomePasta = path.basename(path.dirname(arquivo)).toUpperCase();
                            const ehLixo = nomePasta.match(/^\d{2}-(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)/i) ||
                                nomePasta.match(/^\d{4}/) || nomePasta.length < 3;

                            if (!ehLixo) {
                                payload.nome = nomePasta;
                                payload.observacoes = 'Cadastro via Nome Arquivo';
                                deveCadastrar = true;
                            } else {
                                const pastaPai = path.basename(path.dirname(path.dirname(arquivo))).toUpperCase();
                                if (!pastaPai.match(/^\d{2}-/) && pastaPai.length > 3 && pastaPai !== 'SIMPLES NACIONAL') {
                                    payload.nome = pastaPai;
                                    payload.observacoes = 'Cadastro via Pasta Pai';
                                    deveCadastrar = true;
                                } else {
                                    blacklistProcessados.add(doc);
                                }
                            }
                        }
                    }

                    if (deveCadastrar) {
                        console.log(`   🆕 Cadastrando: ${doc} - ${payload.nome}`);
                        const insert = await supabaseRequest('POST', 'clientes', payload);
                        if (insert && !insert.error) {
                            clienteId = insert[0]?.id || insert.id;
                            clientesNovos++;
                        }
                    }
                }
            }

            // D. Cronograma
            if (clienteId) {
                await processarObrigacao(clienteId, path.basename(arquivo));
            }
        }
        await new Promise(r => setTimeout(r, 50));
    }
    console.log(`\n🎉 FIM!`);
    console.log(`   📊 ${clientesNovos} novos cadastros.`);
    console.log(`   📤 ${uploadsRealizados} uploads realizados para Google Drive.`);
}

async function processarObrigacao(clienteId, nomeArquivo) {
    let tipo = null;
    const n = nomeArquivo.toUpperCase();
    if (n.includes('DAS') || n.includes('SIMPLES')) tipo = 'DAS';
    else if (n.includes('FGTS') || n.includes('GRF')) tipo = 'FGTS';
    else if (n.includes('INSS') || n.includes('GPS')) tipo = 'INSS';
    else if (n.includes('DARF')) tipo = 'DARF';

    if (!tipo) return;

    const matchData = nomeArquivo.match(/(0[1-9]|1[0-2])[-_. ]?(202[5-6])/);
    if (!matchData) return;

    const comp = `${matchData[2]}-${matchData[1]}-01`;

    const check = await supabaseRequest('GET', `obrigacoes_acessorias?cliente_id=eq.${clienteId}&tipo=eq.${tipo}&competencia=eq.${comp}&select=id`);
    if (check && !check.error && check.length === 0) {
        await supabaseRequest('POST', 'obrigacoes_acessorias', {
            cliente_id: clienteId, tipo, competencia: comp, status: 'concluido', arquivo_url: nomeArquivo
        });
        console.log(`      📅 Obrigação ${tipo} / ${comp} registrada!`);
    }
}

main();
