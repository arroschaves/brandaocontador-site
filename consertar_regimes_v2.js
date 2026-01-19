const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');

function getEnv() {
    try {
        const envPath = path.join(process.cwd(), '.env.local');
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
const supabase = createClient(url, key);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function consultaReceita(cnpj) {
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

async function fixRegimesCorrected() {
    console.log('--- INICIANDO CORREÇÃO DE REGIMES TRIBUTÁRIOS (VALORES ENUM) ---');
    const { data: clientes } = await supabase
        .from('clientes')
        .select('*')
        .is('regime_tributario', null);

    console.log(`Encontrados ${clientes?.length || 0} clientes para analisar.`);

    for (const c of (clientes || [])) {
        let val = c.cnpj_cpf || '';
        let doc = String(val).replace(/\D/g, '');

        if (doc.length >= 12 && doc.length <= 14) {
            const cnpj = doc.padStart(14, '0');
            console.log(`🔍 Analisando ${c.nome} (CNPJ: ${cnpj})...`);

            const info = await consultaReceita(cnpj);
            if (info && info.razao_social) {
                // MAPEAMENTO PARA OS VALORES ACEITOS PELO DB
                const regime = info.opcao_pelo_simples ? 'SIMPLES_NACIONAL' : 'LUCRO_PRESUMIDO';
                const statusRFB = info.descricao_situacao_cadastral;

                const { error } = await supabase
                    .from('clientes')
                    .update({
                        regime_tributario: regime,
                        status_rfb: statusRFB
                    })
                    .eq('id', c.id);

                if (error) {
                    console.log(`   ❌ Erro ao atualizar ${c.nome}: ${error.message}`);
                } else {
                    console.log(`   ✅ Atualizado: ${regime} (${statusRFB})`);
                }
            } else {
                console.log(`   ❌ Não encontrado na API.`);
            }
            await sleep(1000);
        } else if (doc.length === 11) {
            // Tentar descobrir o valor para PF
            // Como PESSOA_FISICA falhou, talvez seja SIMPLES_NACIONAL (se o contador tratar assim) ou omitir.
            // Mas vamos tentar 'FISICA' ou 'OUTRO' para testar.
            // Na dúvida, vamos apenas logar por enquanto ou tentar um padrão.
            console.log(`ℹ️ ${c.nome} é CPF, pulando por enquanto.`);
        }
    }
    console.log('--- FINALIZADO ---');
}

fixRegimesCorrected();
