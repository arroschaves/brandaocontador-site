
const axios = require('axios');

function normalize(text) {
    return text?.toUpperCase().trim();
}

async function fetchFromReceitaWS(cnpj) {
    console.log(`[Test] Tentando Fallback para ReceitaWS para o CNPJ ${cnpj}...`);
    const response = await axios.get(`https://receitaws.com.br/v1/cnpj/${cnpj}`);
    const data = response.data;
    if (data.status === 'ERROR') throw new Error(data.message || 'Erro na API ReceitaWS');
    return { razao_social: normalize(data.nome), status_rfb: normalize(data.situacao) };
}

async function enrichRuralData(cpf) {
    console.log(`[Test] CPF Rural detectado (${cpf}).`);
    return {
        status_rfb: 'Pessoa Física - Consulta Manual Necessária',
        razao_social: 'REGISTRO DE PRODUTOR RURAL (CPF)'
    };
}

async function enrichCompanyData(identifier) {
    const cleanId = identifier.replace(/\D/g, '');
    if (cleanId.length === 11) return await enrichRuralData(cleanId);

    try {
        const response = await axios.get(`https://publica.cnpj.ws/cnpj/${cleanId}`);
        const data = response.data;
        return { razao_social: normalize(data.razao_social), status_rfb: normalize(data.estabelecimento?.situacao) };
    } catch (error) {
        if (error.response?.status === 429 || error.response?.status === 403 || error.code === 'ECONNABORTED') {
            return await fetchFromReceitaWS(cleanId);
        }
        throw error;
    }
}

async function run() {
    console.log('--- TESTE PJ (STAR SHOP) ---');
    try {
        const pj = await enrichCompanyData('43649257000181');
        console.log('PJ Result:', pj);
    } catch (e) { console.log('PJ Failed:', e.message); }

    console.log('\n--- TESTE CPF ---');
    try {
        const cpf = await enrichCompanyData('12648736972');
        console.log('CPF Result:', cpf);
    } catch (e) { console.log('CPF Failed:', e.message); }
}

run();
