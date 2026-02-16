import { NextResponse } from 'next/server'
import { sendWhatsAppMessage } from '@/lib/utils/evolution-api'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/utils/audit'

export async function POST(request: Request) {
    try {
        const { ticketId, number, message } = await request.json()
        const supabase = await createClient()

        if (!number || !message) {
            return NextResponse.json({ error: 'Número e mensagem são obrigatórios' }, { status: 400 })
        }

        // 1. Enviar via Evolution API
        const result = await sendWhatsAppMessage(number, message)

        if (!result || result.error) {
            throw new Error(result?.message || 'Erro ao enviar via Evolution API')
        }

        // 2. Registrar no banco de dados (se houver ticketId)
        if (ticketId) {
            await supabase.schema('core').from('atendimentos').update({
                status: 'em_atendimento',
                observacoes_internas: `Mensagem enviada via CRM: ${message}`
            }).eq('id', ticketId)

            // Registrar Auditoria
            const { data: atendimentoData } = await supabase
                .schema('core')
                .from('atendimentos')
                .select('empresa_id')
                .eq('id', ticketId)
                .single();

            await logAudit({
                cliente_id: atendimentoData?.empresa_id,
                acao: 'ENVIO_WA',
                detalhes: `Mensagem enviada para ${number}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
                request
            });
        }

        return NextResponse.json({ success: true, detail: 'Mensagem enviada com sucesso' })

    } catch (error: any) {
        console.error('[WhatsApp Responder Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
