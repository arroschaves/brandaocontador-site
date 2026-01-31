
/**
 * Utilitário para comunicação com a Evolution API
 * Gerencia o disparo de mensagens e arquivos via WhatsApp.
 */

const API_URL = process.env.EVOLUTION_API_URL;
const API_KEY = process.env.EVOLUTION_API_KEY;
const INSTANCE = process.env.EVOLUTION_INSTANCE || 'Brandao';

export async function sendWhatsAppMessage(number: string, text: string) {
    if (!API_URL || !API_KEY) {
        console.error('[Evolution API] Credentials missing');
        return null;
    }

    // Limpar o número: manter apenas dígitos e garantir o sufixo @s.whatsapp.net se não for grupo
    const cleanNumber = number.replace(/\D/g, '');
    const jid = cleanNumber.includes('@') ? cleanNumber : `${cleanNumber}@s.whatsapp.net`;

    console.log(`[Evolution API] Enviando para: ${jid} | Instância: ${INSTANCE}`);

    try {
        const response = await fetch(`${API_URL}/message/sendText/${INSTANCE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': API_KEY
            },
            body: JSON.stringify({
                number: jid,
                text: text,
                delay: 1000,
                linkPreview: true
            })
        });

        const result = await response.json();
        console.log(`[Evolution API] Resultado do envio:`, result);
        return result;
    } catch (error) {
        console.error('[Evolution API] Erro fatal no envio:', error);
        return null;
    }
}

/**
 * Envia um arquivo do Google Drive diretamente para o WhatsApp
 * @param number Número do WhatsApp (com DDI)
 * @param base64 Arquivo em base64
 * @param fileName Nome do arquivo (ex: Guia_DAS.pdf)
 * @param caption Mensagem que acompanha o arquivo
 */
export async function sendWhatsAppMedia(number: string, base64: string, fileName: string, caption: string) {
    if (!API_URL || !API_KEY) return null;

    try {
        const response = await fetch(`${API_URL}/message/sendMedia/${INSTANCE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': API_KEY
            },
            body: JSON.stringify({
                number: number,
                mediaType: 'document',
                media: base64,
                fileName: fileName,
                caption: caption
            })
        });

        return await response.json();
    } catch (error) {
        console.error('Error sending WhatsApp media:', error);
        return null;
    }
}
