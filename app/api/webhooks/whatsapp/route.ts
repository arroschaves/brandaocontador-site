import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { analyzeClientMessage } from '@/lib/utils/ai-service'
import { sendWhatsAppMessage } from '@/lib/utils/evolution-api'

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // URL do seu workflow n8n (o "cérebro" do sistema)
        const N8N_WEBHOOK_URL = 'https://webhook.brandaocontador.com.br/webhook/whatsapp-message';

        console.log(`[Webhook Proxy] Repassando evento ${body.event || 'desconhecido'} para o n8n...`);

        // Forward para o n8n de forma assíncrona para não travar a Evolution API
        fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).catch(err => console.error('[Webhook Proxy] Erro ao chamar n8n:', err));

        // Retornamos sucesso imediato para o WhatsApp não ficar reenviando
        return NextResponse.json({ success: true, proxy: 'n8n' })

    } catch (error: any) {
        console.error('Webhook Proxy Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
