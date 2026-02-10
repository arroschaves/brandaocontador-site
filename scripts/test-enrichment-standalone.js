
const axios = require('axios');

function normalize(text) {
    return text?.toUpperCase().trim();
}

async function fetchFromReceitaWS(cnpj) {
    console.log(`[Test] Tentando Fallback para ReceitaWS para o CNPJ ${cnpj}...`);
    const response = await axios.get(`https://receitaws.com.br/v1/cnpj/${cnpj}`);
    const data = response.data;

    if (data.status === 'ERROR') {
        throw new Error(data.message || 'Erro na API ReceitaWS');
    }

    return {
        razao_social: normalize(data.nome),
        logradouro: normalize(data.logradouro),
        numero: data.numero,
        status_rfb: normalize(data.situacao),
    };
}

async function testEnrichment(identifier) {
    const cleanId = identifier.replace(/\D/g, '');
    console.log(`Testando CNPJ: ${cleanId}`);

    try {
        const response = await axios.get(`https://publica.cnpj.ws/cnpj/${cleanId}`);
        const data = response.data;
        console.log('Sucesso CNPJ.ws:', data.razao_social);
    } catch (error) {
        console.log('Erro CNPJ.ws:', error.response?.status, error.response?.data || error.message);

        if (error.response?.status === 429 || error.code === 'ECONNABORTED' || error.response?.status === 403) {
            try {
                const fallback = await fetchFromReceitaWS(cleanId);
                console.log('Sucesso Fallback ReceitaWS:', fallback.razao_social);
            } catch (fallbackError) {
                console.log('Erro Fallback:', fallbackError.message);
            }
        }
    }
}

// CNPJ Google Brasil
testEnrichment('06990590000123');
