import axios from 'axios';

/**
 * Service de Enriquecimento de Dados Cadastrais (CNPJ)
 * Utiliza a API pública do CNPJ.ws
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
}

export async function enrichCompanyData(cnpj: string): Promise<EnrichmentData> {
    const cleanCnpj = cnpj.replace(/\D/g, '');

    if (cleanCnpj.length !== 14) {
        throw new Error('CNPJ inválido para enriquecimento.');
    }

    try {
        // API Pública do CNPJ.ws - Limite de 3 req/min
        const response = await axios.get(`https://publica.cnpj.ws/cnpj/${cleanCnpj}`);
        const data = response.data;

        // Mapeamento dos dados do CNPJ.ws para o esquema da tabela 'clientes'
        const enriched: EnrichmentData = {
            razao_social: data.razao_social,
            logradouro: data.estabelecimento?.logradouro,
            numero: data.estabelecimento?.numero,
            complemento: data.estabelecimento?.complemento,
            bairro: data.estabelecimento?.bairro,
            cidade: data.estabelecimento?.cidade?.nome,
            estado: data.estabelecimento?.estado?.sigla,
            cep: data.estabelecimento?.cep,
            natureza_juridica: data.natureza_juridica?.descricao,
            data_abertura: data.estabelecimento?.data_inicio_atividade,
            cnae_principal: data.estabelecimento?.atividade_principal
                ? `${data.estabelecimento.atividade_principal.id} - ${data.estabelecimento.atividade_principal.descricao}`
                : undefined,
            cnaes_secundarios: data.estabelecimento?.atividades_secundarias?.map((a: any) => ({
                id: a.id,
                descricao: a.descricao
            })) || []
        };

        // Extrair Inscrição Estadual (IE)
        // O CNPJ.ws retorna uma lista de inscrições estaduais por estado
        if (data.estabelecimento?.inscricoes_estaduais && data.estabelecimento.inscricoes_estaduais.length > 0) {
            // Priorizamos a IE ativa ou a primeira da lista
            const activeIE = data.estabelecimento.inscricoes_estaduais.find((ie: any) => ie.estado.sigla === data.estabelecimento.estado.sigla);
            enriched.inscricao_estadual = (activeIE || data.estabelecimento.inscricoes_estaduais[0]).inscricao_estadual;
        }

        return enriched;
    } catch (error: any) {
        if (error.response?.status === 429) {
            throw new Error('Limite de requisições da API de consulta atingido. Tente novamente em 1 minuto.');
        }
        console.error('Erro no enrichment service:', error.response?.data || error.message);
        throw new Error('Não foi possível recuperar os dados cadastrais para este CNPJ.');
    }
}
