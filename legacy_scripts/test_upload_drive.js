
const fs = require('fs');
const path = require('path');
const https = require('https');

// --- CONFIGURAÇÃO ---
const N8N_WEBHOOK_URL = 'https://webhook.brandaocontador.com.br/webhook/01f435a5-aa5c-44b3-a46d-1b22d2b1c825';

// Arquivo de teste (use um arquivo pequeno para teste)
const ARQUIVO_TESTE = path.join(__dirname, 'test_file.txt');

// --- UPLOAD PARA GOOGLE DRIVE VIA N8N ---
function uploadParaDrive(cnpjCpf, nomeArquivo, caminhoCompleto) {
    return new Promise((resolve) => {
        try {
            console.log(`📤 Lendo arquivo: ${nomeArquivo}`);

            // Lê o arquivo e converte para base64
            const fileBuffer = fs.readFileSync(caminhoCompleto);
            const fileBase64 = fileBuffer.toString('base64');

            console.log(`📦 Tamanho do arquivo: ${fileBuffer.length} bytes`);
            console.log(`📦 Tamanho base64: ${fileBase64.length} caracteres`);

            const payload = JSON.stringify({
                cnpj_cpf: cnpjCpf,
                file_name: nomeArquivo,
                file_data: fileBase64,
                file_path: caminhoCompleto
            });

            console.log(`🚀 Enviando para n8n webhook...`);

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
                    console.log(`📡 Status: ${res.statusCode}`);
                    console.log(`📡 Resposta: ${data}`);

                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        console.log(`✅ Upload enviado com sucesso!`);
                        resolve(true);
                    } else {
                        console.log(`⚠️  Erro no upload: ${res.statusCode}`);
                        resolve(false);
                    }
                });
            });

            req.on('error', (e) => {
                console.log(`❌ Erro na requisição: ${e.message}`);
                resolve(false);
            });

            req.write(payload);
            req.end();
        } catch (e) {
            console.log(`❌ Erro ao processar arquivo: ${e.message}`);
            resolve(false);
        }
    });
}

// --- MAIN ---
async function main() {
    console.log('🧪 TESTE DE UPLOAD PARA GOOGLE DRIVE 🧪\n');

    // Verifica se o arquivo existe
    if (!fs.existsSync(ARQUIVO_TESTE)) {
        console.log(`❌ Arquivo não encontrado: ${ARQUIVO_TESTE}`);
        return;
    }

    // Extrai CNPJ do nome do arquivo
    const nomeArquivo = path.basename(ARQUIVO_TESTE);
    console.log(`📄 Arquivo: ${nomeArquivo}`);

    // Para teste, vamos usar um CNPJ válido do banco
    const cnpjTeste = '81279876115'; // ANTONIO M. NANTES - cliente válido
    console.log(`🔑 CNPJ: ${cnpjTeste}\n`);

    // Faz o upload
    const sucesso = await uploadParaDrive(cnpjTeste, nomeArquivo, ARQUIVO_TESTE);

    if (sucesso) {
        console.log(`\n🎉 TESTE CONCLUÍDO COM SUCESSO!`);
    } else {
        console.log(`\n❌ TESTE FALHOU!`);
    }
}

main();
