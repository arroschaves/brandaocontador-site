import axios from 'axios';

/**
 * Service de Enriquecimento de Dados Cadastrais (CNPJ/CPF)
 * Fontes: CNPJ.ws (Principal), ReceitaWS (Fallback)
 */

export interface EnrichmentData {
    razao_social?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    inscricao_estadual?: string;
    natureza_juridica?: string;
    data_abertura?: string;
    cnaes_secundarios?: any[];
    cnae_principal?: string;
    status_rfb?: string;
}

/**
 * Normaliza textos para o padrão do CRM (MAIÚSCULAS)
 */
function normalize(text?: string): string | undefined {
    return text?.toUpperCase().trim();
}

/**
 * Fallback: Consulta via ReceitaWS (Grátis: 3 req/min)
 */
async function fetchFromReceitaWS(cnpj: string): Promise<EnrichmentData> {
    const response = await axios.get(`https://receitaws.com.br/v1/cnpj/${cnpj}`);
    const data = response.data;

    if (data.status === 'ERROR') {
        throw new Error(data.message || 'Erro na API ReceitaWS');
    }

    return {
        razao_social: normalize(data.nome),
        logradouro: normalize(data.logradouro),
        numero: data.numero,
        complemento: normalize(data.complemento),
        bairro: normalize(data.bairro),
        cidade: normalize(data.municipio),
        estado: normalize(data.uf),
        cep: data.cep?.replace(/\D/g, ''),
        natureza_juridica: normalize(data.natureza_juridica),
        data_abertura: data.abertura,
        status_rfb: normalize(data.situacao),
        cnae_principal: data.atividade_principal?.[0]
            ? `${data.atividade_principal[0].code} - ${data.atividade_principal[0].text}`
            : undefined
    };
}

/**
 * Consulta de CPF (Suporte Inicial / Placeholder para API de Sintegra Rural)
 */
async function enrichRuralData(cpf: string): Promise<EnrichmentData> {
    // Nota: Atualmente não existe API pública gratuita e unificada para IE de Produtor Rural (Portais SEFAZ).
    // Implementaremos a lógica de scraping ou API específica de MS no futuro.
    console.log(`[Enrichment] CPF Rural detectado (${cpf}). Aguardando integração com SEFAZ-MS.`);

    // Retornamos um objeto vazio ou com erro amigável em vez de travar o processo
    return {
        status_rfb: 'Pessoa Física - Consulta Manual Necessária',
        razao_social: 'REGISTRO DE PRODUTOR RURAL (CPF)'
    };
}

export async function enrichCompanyData(identifier: string): Promise<EnrichmentData> {
    const cleanId = identifier.replace(/\D/g, '');

    // Rota para CPF (Produtor Rural)
    if (cleanId.length === 11) {
        return await enrichRuralData(cleanId);
    }

    if (cleanId.length !== 14) {
        throw new Error('Identificador inválido para enriquecimento. Use CNPJ ou CPF.');
    }

    try {
        // 1. Tentar API Principal (CNPJ.ws)
        const response = await axios.get(`https://publica.cnpj.ws/cnpj/${cleanId}`);
        const data = response.data;

        const enriched: EnrichmentData = {
            razao_social: normalize(data.razao_social),
            logradouro: normalize(data.estabelecimento?.logradouro),
            numero: data.estabelecimento?.numero,
            complemento: normalize(data.estabelecimento?.complemento),
            bairro: normalize(data.estabelecimento?.bairro),
            cidade: normalize(data.estabelecimento?.cidade?.nome),
            estado: normalize(data.estabelecimento?.estado?.sigla),
            cep: data.estabelecimento?.cep,
            natureza_juridica: normalize(data.natureza_juridica?.descricao),
            status_rfb: normalize(data.estabelecimento?.situacao_cadastral),
            data_abertura: data.estabelecimento?.data_inicio_atividade,
            cnae_principal: data.estabelecimento?.atividade_principal
                ? `${data.estabelecimento.atividade_principal.id} - ${data.estabelecimento.atividade_principal.descricao}`
                : undefined,
            cnaes_secundarios: data.estabelecimento?.atividades_secundarias?.map((a: any) => ({
                id: a.id,
                descricao: a.descricao
            })) || []
        };

        if (data.estabelecimento?.inscricoes_estaduais && data.estabelecimento.inscricoes_estaduais.length > 0) {
            const activeIE = data.estabelecimento.inscricoes_estaduais.find((ie: any) => ie.estado.sigla === data.estabelecimento.estado.sigla);
            enriched.inscricao_estadual = (activeIE || data.estabelecimento.inscricoes_estaduais[0]).inscricao_estadual;
        }

        return enriched;

    } catch (error: any) {
        // 2. Se falhar por limite (429), bloqueio (403/401) ou erro temporário, tentar Fallback
        if (error.response?.status === 429 || error.response?.status === 403 || error.response?.status === 401 || error.code === 'ECONNABORTED') {
            console.log(`[Enrichment] CNPJ.ws limitado. Tentando Fallback para ReceitaWS para o CNPJ ${cleanId}...`);
            try {
                return await fetchFromReceitaWS(cleanId);
            } catch (fallbackError: any) {
                throw new Error('Limite de consultas excedido em todas as fontes disponíveis. Tente novamente em alguns minutos.');
            }
        }

        console.error('Erro no enrichment service:', error.response?.data || error.message);
        throw new Error('Não foi possível recuperar os dados cadastrais. Verifique o CNPJ ou tente mais tarde.');
    }
}
