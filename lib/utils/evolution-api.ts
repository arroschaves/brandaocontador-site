
/**
 * Utilitário para comunicação com a Evolution API
 * Gerencia o disparo de mensagens e arquivos via WhatsApp.
 */


export async function sendWhatsAppMessage(number: string, text: string) {
    const API_URL = process.env.EVOLUTION_API_URL;
    const API_KEY = process.env.EVOLUTION_API_KEY;
    const INSTANCE = process.env.EVOLUTION_INSTANCE;

    if (!API_URL || !API_KEY || !INSTANCE) {
        console.error('[Evolution API] Configurações ausentes no .env:', {
            hasUrl: !!API_URL,
            hasKey: !!API_KEY,
            hasInstance: !!INSTANCE
        });
        return { error: true, message: 'Configuração da API ausente no servidor' };
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
            console.error(`[Evolution API] sendWhatsAppMessage: Erro HTTP ${response.status} ao enviar mensagem para ${target}:`, result);
            return { error: true, message: `Erro ao enviar mensagem: ${result.message || 'Erro desconhecido'}`, details: result };
        } else {
            console.log(`[Evolution API] sendWhatsAppMessage: Mensagem enviada com sucesso para ${target}`);
            return result;
        }
    } catch (error: any) {
        console.error(`[Evolution API] sendWhatsAppMessage: Falha crítica na requisição para ${target}:`, error);
        return {
            error: true,
            message: `Falha na conexão: ${error.message === 'getaddrinfo EBUSY' ? 'DNS Ocupado/Bloqueado' : error.message}`
        };
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
    const API_URL = process.env.EVOLUTION_API_URL;
    const API_KEY = process.env.EVOLUTION_API_KEY;
    const INSTANCE = process.env.EVOLUTION_INSTANCE;

    if (!API_URL || !API_KEY || !INSTANCE) {
        console.error('[Evolution API] sendWhatsAppMedia: Configurações ausentes');
        return null;
    }

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
