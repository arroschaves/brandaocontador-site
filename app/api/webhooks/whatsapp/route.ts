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
            const key = data.key
            const fromMe = key.fromMe
            const remoteJid = key.remoteJid

            if (fromMe) return NextResponse.json({ skipped: true })

            // Detectar o remetente (removendo sufixo JID se houver)
            const senderNumber = remoteJid.split('@')[0].replace(/\D/g, '');
            const pushName = data.pushName || 'Usuário WhatsApp';
            const messageBody = data.message?.conversation ||
                data.message?.extendedTextMessage?.text ||
                (data.messageType === 'audioMessage' ? '[Áudio]' : '[Mídia]');

            console.log(`[Webhook] Mensagem de ${senderNumber} (${pushName}): ${messageBody.substring(0, 50)}...`);

            // Tentar identificar o cliente no banco usando os últimos 8 dígitos
            const last8 = senderNumber.slice(-8);
            const { data: client } = await supabase
                .from('clientes')
                .select('id, nome')
                .ilike('telefone_whatsapp', `%${last8}`)
                .maybeSingle();

            // 1. Analisar com IA
            const aiAnalysis = await analyzeClientMessage(messageBody)

            // 2. Criar o Atendimento (Ticket)
            const { error: ticketError } = await supabase
                .from('atendimentos')
                .insert({
                    cliente_id: client?.id || null,
                    telefone_whatsapp: senderNumber,
                    mensagem: messageBody,
                    categoria_solicitacao: aiAnalysis.categoria,
                    prioridade: aiAnalysis.prioridade,
                    status: 'pendente',
                    atendimento_automatico: true,
                    resposta_automatica: aiAnalysis.resposta_cliente,
                    created_at: new Date().toISOString(),
                    pushName: client?.nome || pushName, // Usamos o nome oficial se houver
                    tipo_midia: data.messageType === 'audioMessage' ? 'audio' : 'texto'
                });

            if (ticketError) {
                console.error('[Webhook] Erro ao salvar atendimento:', ticketError);
            }

            // 3. Responder ao Cliente via Evolution API
            const whatsappRes = await sendWhatsAppMessage(senderNumber, aiAnalysis.resposta_cliente)
            console.log(`[Webhook] Resposta enviada. Resultado:`, whatsappRes)

            return NextResponse.json({ success: true, analysis: aiAnalysis.categoria, whatsappDetail: whatsappRes })
        }

        return NextResponse.json({ message: 'Event ignored' })
    } catch (error: any) {
        console.error('Webhook Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
