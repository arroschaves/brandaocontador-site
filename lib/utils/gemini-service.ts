/**
 * gemini-service.ts — Serviço centralizado do Gemini AI
 * 
 * SDK: @google/genai (oficial, substitui @google/generative-ai deprecated)
 * Modelos: gemini-3-flash-preview (rápido/volume) | gemini-3-pro-preview (complexo)
 * 
 * Casos de uso no projeto:
 * - Classificação fiscal de XMLs/SPEDs
 * - Análise multimodal de documentos (PDF, imagem, áudio)
 * - Mapeamento inteligente de arquivos no Maestro
 * - Triagem de atendimentos via WhatsApp
 */

import { GoogleGenAI } from "@google/genai";

// --- Inicialização do cliente Gemini ---
function getGeminiClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error(
            "[Gemini] GEMINI_API_KEY não configurada. " +
            "Obtenha sua chave em: https://aistudio.google.com/apikey"
        );
    }
    return new GoogleGenAI({ apiKey });
}

// --- Tipos de retorno ---
export interface ClassificacaoFiscal {
    categoria: "FISCAL" | "RH" | "SOCIETÁRIO" | "GERAL";
    prioridade: "BAIXA" | "NORMAL" | "ALTA" | "CRITICA";
    resumo: string;
    acao_sugerida?: string;
}

export interface AnaliseMidia {
    titulo: string;
    conteudo: string;
    classificacao: string;
    alertas: string[];
    acao_sugerida: string;
}

export interface MapeamentoArquivo {
    obrigacao: string;
    confianca: number;
    pasta_sugerida: string;
    competencia?: string;
}

/**
 * Analisa mídia (PDF, imagem, áudio) e retorna relatório estruturado
 * SUBSTITUI: analyzeMedia em ai-service.ts (usava gemini-1.5-flash DEPRECATED)
 */
export async function analisarMidia(
    fileBuffer: Buffer,
    mimeType: string
): Promise<string> {
    try {
        const ai = getGeminiClient();

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `Você é o BRAIN MAESTRO, a inteligência central da Brandão Contabilidade.
              Analise este arquivo (PDF, Imagem ou Áudio) e forneça um relatório técnico em português brasileiro:
              
              1. TÍTULO: Nome curto do documento ou ação.
              2. CONTEÚDO: O que está escrito ou sendo dito.
              3. CLASSIFICAÇÃO: É Contrato, Certidão (CND), Guia (DAS/FGTS/DARFs), ou Recibo?
              4. ALERTAS:
                 - Prazos de validade ou vencimento detectados.
                 - CNPJ/CPF divergente.
                 - Erros visíveis no documento.
              5. AÇÃO SUGERIDA: O que o contador deve fazer agora?
              
              MANTENHA O TOM PROFISSIONAL E ANALÍTICO.`,
                        },
                        {
                            inlineData: {
                                data: fileBuffer.toString("base64"),
                                mimeType,
                            },
                        },
                    ],
                },
            ],
        });

        return response.text ?? "Erro ao processar mídia.";
    } catch (error: any) {
        console.error("[Gemini] Erro ao analisar mídia:", error.message);
        return "Erro ao processar mídia via IA. Verifique GEMINI_API_KEY.";
    }
}

/**
 * Classifica texto de atendimento/solicitação de cliente
 * SUBSTITUI: classifyText em ai-service.ts (usava gemini-1.5-flash DEPRECATED)
 */
export async function classificarTexto(
    text: string
): Promise<ClassificacaoFiscal> {
    try {
        const ai = getGeminiClient();

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Classifique a seguinte solicitação de cliente contábil em JSON.
      Texto: "${text}"
      
      Retorne APENAS JSON válido com esta estrutura:
      {
        "categoria": "FISCAL" | "RH" | "SOCIETÁRIO" | "GERAL",
        "prioridade": "BAIXA" | "NORMAL" | "ALTA" | "CRITICA",
        "resumo": "Breve resumo da solicitação",
        "acao_sugerida": "O que fazer agora"
      }`,
            config: {
                responseMimeType: "application/json",
            },
        });

        const json = response.text ?? "{}";
        return JSON.parse(json);
    } catch (error: any) {
        console.error("[Gemini] Erro ao classificar texto:", error.message);
        // Fallback seguro sem quebrar o sistema
        return {
            categoria: "GERAL",
            prioridade: "NORMAL",
            resumo: text.substring(0, 100),
        };
    }
}

/**
 * Mapeamento inteligente de arquivos do Google Drive para obrigações fiscais
 * NOVA FUNÇÃO: Para o Maestro AI aprender padrões de nomenclatura
 */
export async function mapearArquivoParaObrigacao(
    nomeArquivo: string,
    nomePasta: string,
    nomeCliente: string
): Promise<MapeamentoArquivo> {
    try {
        const ai = getGeminiClient();

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Você é o Maestro AI da Brandão Contabilidade.
      
      Dado um arquivo no Google Drive de um cliente contábil, identifique a obrigação fiscal/contábil correspondente.
      
      Cliente: "${nomeCliente}"
      Pasta: "${nomePasta}"
      Arquivo: "${nomeArquivo}"
      
      Retorne APENAS JSON válido:
      {
        "obrigacao": "Nome da obrigação (ex: DCTF Mensal, Folha de Pagamento, DAS Simples Nacional)",
        "confianca": 0.0 a 1.0,
        "pasta_sugerida": "Pasta onde deve ser arquivado",
        "competencia": "MM/AAAA se detectado, ou null"
      }`,
            config: {
                responseMimeType: "application/json",
            },
        });

        const json = response.text ?? "{}";
        return JSON.parse(json);
    } catch (error: any) {
        console.error("[Gemini] Erro ao mapear arquivo:", error.message);
        return {
            obrigacao: "Desconhecida",
            confianca: 0,
            pasta_sugerida: "Geral",
        };
    }
}

/**
 * Analisa conteúdo de XML fiscal (NF-e, NFS-e, SPED)
 * NOVA FUNÇÃO: Processamento de documentos fiscais
 */
export async function analisarXMLFiscal(
    xmlContent: string,
    tipoDocumento: "NFe" | "NFSe" | "SPED" | "GNRE"
): Promise<Record<string, unknown>> {
    try {
        const ai = getGeminiClient();

        // Limitar tamanho para evitar exceder contexto
        const xmlTruncado = xmlContent.substring(0, 10000);

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Analise este XML fiscal (${tipoDocumento}) da Brandão Contabilidade e extraia os dados principais.
      
      XML: ${xmlTruncado}
      
      Retorne APENAS JSON com os campos relevantes encontrados:
      {
        "tipo": "${tipoDocumento}",
        "emitente_cnpj": "...",
        "emitente_nome": "...",
        "valor_total": 0.0,
        "data_emissao": "AAAA-MM-DD",
        "numero_documento": "...",
        "cfop": "...",
        "ncm": "...",
        "classificacao_fiscal": "...",
        "observacoes": "..."
      }`,
            config: {
                responseMimeType: "application/json",
            },
        });

        const json = response.text ?? "{}";
        return JSON.parse(json);
    } catch (error: any) {
        console.error("[Gemini] Erro ao analisar XML:", error.message);
        return { erro: "Falha na análise do XML", tipo: tipoDocumento };
    }
}

/**
 * Gera resumo executivo mensal para o cliente
 * NOVA FUNÇÃO: Relatórios automáticos com IA
 */
export async function gerarResumoMensal(
    nomeCliente: string,
    competencia: string,
    dadosContabeis: Record<string, unknown>
): Promise<string> {
    try {
        const ai = getGeminiClient();

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `Você é o assistente contábil da Brandão Contabilidade.
      
      Gere um resumo executivo mensal profissional em português para o cliente:
      
      Cliente: ${nomeCliente}
      Competência: ${competencia}
      Dados: ${JSON.stringify(dadosContabeis, null, 2)}
      
      O resumo deve incluir:
      1. Visão geral do período
      2. Principais obrigações cumpridas
      3. Pendências (se houver)
      4. Alertas e recomendações
      5. Próximos vencimentos importantes
      
      Tom: Profissional, direto e objetivo.`,
        });

        return response.text ?? "Erro ao gerar resumo.";
    } catch (error: any) {
        console.error("[Gemini] Erro ao gerar resumo:", error.message);
        return "Erro ao gerar resumo mensal.";
    }
}
