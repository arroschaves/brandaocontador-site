import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Cérebro Multimídia Brandão - Processamento de Áudio, Imagem e Documentos
 * Usa Gemini 1.5 Flash para transcrição e análise proativa.
 */

export async function analyzeMedia(fileBuffer: Buffer, mimeType: string) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const part = {
            inlineData: {
                data: fileBuffer.toString("base64"),
                mimeType
            }
        };

        const prompt = `
            Você é o BRAIN MAESTRO, a inteligência central da Brandão Contabilidade. 
            Analise este arquivo (Áudio, PDF ou Imagem) e forneça um relatório técnico em português brasileiro:
            
            1. TÍTULO: Nome curto do documento ou ação.
            2. TRANSCRIÇÃO/CONTEÚDO: O que está escrito ou sendo dito.
            3. CLASSIFICAÇÃO: É Contrato, Certidão (CND), Guia (DAS/FGTS), ou Recibo?
            4. ALERTAS TÉCNICOS:
               - Prazos de validade ou vencimento detectados.
               - CNPJ/CPF divergente do esperado.
               - Erros visíveis no documento.
            5. AÇÃO SUGERIDA: O que o contador deve fazer agora? (ex: "Enviar para WhatsApp", "Arquivar na pasta Fiscal").

            MANTENHA O TOM PROFISSIONAL E ANALÍTICO.
        `;

        const result = await model.generateContent([prompt, part]);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("[AI Media Error]:", error);
        return "Erro ao processar mídia via IA.";
    }
}

/**
 * Classifica a urgência e categoria de um texto de atendimento
 */
export async function classifyText(text: string) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
            Classifique a seguinte solicitação de cliente contábil em JSON:
            Texto: "${text}"
            
            Campos necessários:
            {
                "categoria": "FISCAL" | "RH" | "SOCIETÁRIO" | "GERAL",
                "prioridade": "BAIXA" | "NORMAL" | "ALTA" | "CRITICA",
                "resumo": "Breve resumo da solicitação"
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text().replace(/```json|```/g, "").trim());
    } catch (error) {
        return { categoria: "GERAL", prioridade: "NORMAL", resumo: text };
    }
}
