/**
 * ai-service.ts — RE-EXPORTA do gemini-service.ts para compatibilidade retroativa
 * 
 * MIGRAÇÃO: @google/generative-ai (DEPRECATED) → @google/genai (OFICIAL)
 * Modelo antigo: gemini-1.5-flash (DEPRECATED)
 * Modelo novo: gemini-3-flash-preview (ATUAL)
 * 
 * Todos os consumidores deste arquivo continuam funcionando sem alteração.
 * A implementação real está em lib/utils/gemini-service.ts
 */

// Re-exportar funcionalidades novas com nomes antigos para compatibilidade
export {
    analisarMidia as analyzeMedia,
    classificarTexto as classifyText,
    analisarXMLFiscal,
    mapearArquivoParaObrigacao,
    gerarResumoMensal,
} from "./gemini-service";

export type {
    ClassificacaoFiscal,
    AnaliseMidia,
    MapeamentoArquivo,
} from "./gemini-service";
