
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

    // Sanitizar URL (remover barra final se houver)
    const sanitizedUrl = API_URL.replace(/\/$/, '');

    // Se já for um JID (@s.whatsapp.net ou @g.us), mantemos como está
    // Caso contrário, limpamos o número e formatamos
    let target = number;
    if (!number.includes('@')) {
        let cleanNumber = number.replace(/\D/g, '');
        // Adicionar 55 se parecer número brasileiro sem DDI
        if ((cleanNumber.length === 10 || cleanNumber.length === 11) && !cleanNumber.startsWith('55')) {
            cleanNumber = '55' + cleanNumber;
        }
        target = cleanNumber;
    }

    console.log(`[Evolution API] Tentando enviar para ${target} (original: ${number})`);

    try {
        const response = await fetch(`${sanitizedUrl}/message/sendText/${INSTANCE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': API_KEY
            },
            body: JSON.stringify({
                number: target,
                text: text,
                delay: 1200,
                linkPreview: false
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error(`[Evolution API] Erro HTTP ${response.status}:`, result);
        } else {
            console.log(`[Evolution API] Mensagem enviada com sucesso para ${target}`);
        }
        return result;
    } catch (error) {
        console.error('[Evolution API] Falha crítica na requisição:', error);
        return { error: true, message: 'Falha na conexão com a Evolution API' };
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
