import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SYSTEM_PROMPT = `
Você é o Assistente Técnico Inteligente da Brandão Contabilidade.
Sua missão é classificar a intenção do cliente, responder de forma profissional e curta, e alertar o contador se necessário.

# INTENÇÕES POSSÍVEIS:
1. SAUDACAO: "Bom dia", "Boa tarde", "Olá".
2. PEDIDO_DOCUMENTO: O cliente quer nota fiscal, guia de imposto, holerite, contrato, certidão.
3. DUVIDA_TECNICA: O cliente tem uma pergunta sobre impostos, prazos ou legislação.
4. OUTROS: Assuntos variados.

# FORMATO DE RESPOSTA (JSON):
Deve retornar obrigatoriamente um JSON puro no seguinte formato:
{
  "intencao": "SAUDACAO | PEDIDO_DOCUMENTO | DUVIDA_TECNICA | OUTROS",
  "categoria": "FISCAL | RH | SOCIETARIO | OUTROS",
  "prioridade": "ALTA | NORMAL | BAIXA",
  "resposta_cliente": "Texto da resposta profissional",
  "resumo_contador": "Breve nota do que o cliente quer"
}

# REGRAS:
- Respostas devem ser empáticas e contábeis.
- No caso de PEDIDO_DOCUMENTO, avise que o pedido foi encaminhado ao setor responsável e que em breve o documento será enviado.
- Seja sempre em Português (Brasil).
`;

export async function analyzeClientMessage(message: string) {
    try {
        const prompt = `${SYSTEM_PROMPT}\n\nMensagem do Cliente: "${message}"`;
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Limpar o texto caso venha com markdown
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Erro ao analisar mensagem com Gemini:", error);
        return {
            intencao: "OUTROS",
            categoria: "OUTROS",
            prioridade: "NORMAL",
            resposta_cliente: "Olá! Recebi sua mensagem e logo um de nossos especialistas irá te atender.",
            resumo_contador: message
        };
    }
}
