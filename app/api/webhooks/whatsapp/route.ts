import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { analyzeClientMessage } from '@/lib/utils/ai-service'
import { sendWhatsAppMessage } from '@/lib/utils/evolution-api'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const supabase = await createClient()

        if (body.event === 'messages.upsert') {
            const data = body.data
            const message = data.message
            const pushName = data.pushName
            const key = data.key
            const fromMe = key.fromMe
            const remoteJid = key.remoteJid

            if (fromMe) return NextResponse.json({ skipped: true })

            const phone = remoteJid.split('@')[0]

            // Extrair conteúdo da mensagem
            let content = ''
            if (message.conversation) content = message.conversation
            else if (message.extendedTextMessage) content = message.extendedTextMessage.text
            else return NextResponse.json({ skipped: true, detail: 'Not a text message' })

            // 1. Analisar com IA
            const aiAnalysis = await analyzeClientMessage(content)

            // 2. Localizar Cliente (Busca robusta pelos últimos 8 dígitos)
            const cleanPhone = phone.replace(/\D/g, '');
            const lastDigits = cleanPhone.slice(-8);

            const { data: cliente } = await supabase
                .from('clientes')
                .select('id, nome')
                .filter('telefone_whatsapp', 'ilike', `%${lastDigits}%`)
                .maybeSingle()

            // 3. Salvar no CRM
            const { error: insertError } = await supabase
                .from('atendimentos')
                .insert({
                    cliente_id: cliente?.id || null,
                    telefone_whatsapp: phone,
                    mensagem: content,
                    categoria_solicitacao: aiAnalysis.categoria,
                    prioridade: aiAnalysis.prioridade,
                    status: 'pendente',
                    atendimento_automatico: true,
                    resposta_automatica: aiAnalysis.resposta_cliente,
                    created_at: new Date().toISOString()
                })

            if (insertError) throw insertError

            // 4. Responder ao Cliente via Evolution API
            const whatsappRes = await sendWhatsAppMessage(phone, aiAnalysis.resposta_cliente)
            console.log(`[Webhook] Resposta enviada para ${phone}. Resultado:`, whatsappRes)

            return NextResponse.json({ success: true, analysis: aiAnalysis.intencao, whatsappDetail: whatsappRes })
        }

        return NextResponse.json({ message: 'Event ignored' })
    } catch (error: any) {
        console.error('Webhook Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
