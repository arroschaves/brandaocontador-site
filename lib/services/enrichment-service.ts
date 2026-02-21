import axios from 'axios';
import consultarCNPJ from 'consultar-cnpj';

/**
 * Service de Enriquecimento de Dados Cadastrais (CNPJ/CPF)
 * Fontes: consultar-cnpj (CNPJ.ws), ReceitaWS (Fallback)
 */

export interface EnrichmentData {
    razao_social?: string;
    nome_fantasia?: string;
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
    cnaes_secundarios?: string; // Armazenaremos como string concatenada para consistência com o frontend
    cnae_principal?: string;
    status_rfb?: string;
    porte?: string;
    capital_social?: number;
    email?: string;
    telefone?: string;
    simples_nacional?: boolean;
    regime_tributario?: string;
    quadro_societario?: string;
    tipo_cadastro?: string;
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
        nome_fantasia: normalize(data.fantasia),
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
            : undefined,
        telefone: data.telefone?.replace(/\D/g, ''),
        email: normalize(data.email),
        capital_social: data.capital_social ? parseFloat(data.capital_social) : 0,
        porte: normalize(data.porte),
    };
}

/**
 * Consulta de CPF (Suporte Inicial / Placeholder para API de Sintegra Rural)
 */
async function enrichRuralData(cpf: string): Promise<EnrichmentData> {
    console.log(`[Enrichment] CPF Rural detectado (${cpf}). Aguardando integração com SEFAZ-MS.`);
    return {
        status_rfb: 'Pessoa Física - Consulta Manual Necessária',
        razao_social: 'REGISTRO DE PRODUTOR RURAL (CPF)',
        tipo_cadastro: 'PF'
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
        // 1. Tentar API Principal (CNPJ.ws via pacote)
        console.log(`[Enrichment] Consultando CNPJ.ws (via pacote consultar-cnpj): ${cleanId}`);
        const data = await consultarCNPJ(cleanId);

        if (!data || !data.estabelecimento) {
            throw new Error('Retorno inválido do consultar-cnpj');
        }

        const est = data.estabelecimento;
        const porte = data.porte?.descricao || '';
        const isSimples = (data.simples as any)?.optante ?? false;

        // Format phones if available
        let telefone = '';
        if (est.ddd1 && est.telefone1) {
            telefone = `${est.ddd1}${est.telefone1}`;
        }

        const enriched: EnrichmentData = {
            razao_social: normalize(data.razao_social),
            nome_fantasia: normalize(est.nome_fantasia || data.razao_social || undefined),
            logradouro: normalize(est.logradouro || undefined),
            numero: est.numero || undefined,
            complemento: normalize(est.complemento || undefined),
            bairro: normalize(est.bairro || undefined),
            cidade: normalize(est.cidade?.nome || undefined),
            estado: normalize(est.estado?.sigla || undefined),
            cep: est.cep || undefined,
            natureza_juridica: normalize(data.natureza_juridica?.descricao || undefined),
            status_rfb: normalize(est.situacao_cadastral || undefined),
            data_abertura: est.data_inicio_atividade || undefined,
            cnae_principal: est.atividade_principal
                ? `${est.atividade_principal.id} - ${est.atividade_principal.descricao}`
                : undefined,
            cnaes_secundarios: est.atividades_secundarias ? est.atividades_secundarias.map((a: any) => `${a.id} - ${a.descricao}`).join('; ') : '',
            porte: normalize(porte || undefined),
            capital_social: data.capital_social ? parseFloat(data.capital_social) : 0,
            email: normalize(est.email || undefined),
            telefone: telefone,
            simples_nacional: isSimples,
            regime_tributario: isSimples ? 'SIMPLES_NACIONAL' : 'LUCRO_PRESUMIDO', // default assumption se optante_simples for false e for cnpj.ws
            quadro_societario: data.socios ? data.socios.map((s: any) => normalize(s.nome)).join(', ') : ''
        };

        if (est.inscricoes_estaduais && est.inscricoes_estaduais.length > 0) {
            const activeIE = est.inscricoes_estaduais.find((ie: any) => ie.estado.sigla === est.estado.sigla);
            enriched.inscricao_estadual = (activeIE || est.inscricoes_estaduais[0]).inscricao_estadual;
        }

        return enriched;

    } catch (error: any) {
        // 2. Fallback
        console.log(`[Enrichment] CNPJ.ws falhou. Erro: ${error.message}. Tentando Fallback para ReceitaWS para o CNPJ ${cleanId}...`);
        try {
            return await fetchFromReceitaWS(cleanId);
        } catch (fallbackError: any) {
            console.error('Erro no enrichment service fallback:', fallbackError.message);
            throw new Error('Não foi possível recuperar os dados cadastrais em nenhuma das fontes. Tente novamente em alguns minutos.');
        }
    }
}
