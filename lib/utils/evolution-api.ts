
/**
 * Utilitário para comunicação com a Evolution API
 * Gerencia o disparo de mensagens e arquivos via WhatsApp.
 */

const API_URL = process.env.EVOLUTION_API_URL;
const API_KEY = process.env.EVOLUTION_API_KEY;
const INSTANCE = process.env.EVOLUTION_INSTANCE || 'Brandao';

export async function sendWhatsAppMessage(number: string, text: string) {
    if (!API_URL || !API_KEY) {
        console.error('Evolution API credentials missing');
        return null;
    }

    try {
        const response = await fetch(`${API_URL}/message/sendText/${INSTANCE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': API_KEY
            },
            body: JSON.stringify({
                number: number,
                text: text,
                delay: 1200,
                linkPreview: true
            })
        });

        return await response.json();
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
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
