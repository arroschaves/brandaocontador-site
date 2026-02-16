import { NextResponse } from 'next/server'
import { sendProfessionalEmail } from '@/lib/utils/email-service'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/utils/audit'

export async function POST(request: Request) {
    try {
        const { ticketId, to, subject, message, fromAccount } = await request.json()
        const supabase = await createClient()

        if (!to || !message || !subject) {
            return NextResponse.json({ error: 'Destinatário, assunto e mensagem são obrigatórios' }, { status: 400 })
        }

        // 1. Enviar via Email Service
        const result = await sendProfessionalEmail({
            from: fromAccount || 'ADM',
            to,
            subject,
            text: message,
            html: `<div style="font-family: sans-serif; line-height: 1.5; color: #333;">
                    ${message.replace(/\n/g, '<br>')}
                   </div>`
        })

        if (!result.success) {
            const errorMessage = typeof result.error === 'string' ? result.error : 'Erro ao enviar e-mail';
            throw new Error(errorMessage);
        }

        // 2. Registrar no banco de dados (se houver ticketId)
        if (ticketId) {
            await supabase.schema('core').from('atendimentos').update({
                status: 'em_atendimento',
                observacoes_internas: `E-mail enviado via CRM para ${to}: ${message}`
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
                acao: 'ENVIO_EMAIL',
                detalhes: `E-mail enviado para ${to}: ${subject}`,
                request
            });
        }

        return NextResponse.json({ success: true, detail: 'E-mail enviado com sucesso' })

    } catch (error: any) {
        console.error('[Email Responder Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
