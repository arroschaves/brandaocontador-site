import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logAudit } from '@/lib/utils/audit'

/**
 * POST /api/agendamentos/cron
 * Job cron para processar alertas automáticos e atualizar status
 * 
 * Deve ser executado diariamente via cron job (Vercel Cron, etc.)
 * Requer autenticação via CRON_SECRET
 */
export async function POST(request: Request) {
    try {
        // Validar autenticação (CRON_SECRET)
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const supabase = await createClient()
        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)

        // ========================================================================
        // 1. ATUALIZAR STATUS (pendente → atrasado para vencimentos passados)
        // ========================================================================
        const { error: updateError } = await supabase.rpc('atualizar_status_atrasado')

        if (updateError) {
            console.error('[Cron] Erro ao atualizar status:', updateError)
        }

        // ========================================================================
        // 2. BUSCAR AGENDAMENTOS QUE PRECISAM DE ALERTA
        // ========================================================================
        const { data: agendamentos, error: fetchError } = await supabase
            .from('agendamentos_pendencias')
            .select(`
                *,
                clientes:cliente_id (
                    id,
                    nome,
                    razao_social,
                    email,
                    telefone,
                    cnpj_cpf
                )
            `)
            .eq('status', 'pendente')
            .gte('data_vencimento', hoje.toISOString().split('T')[0])

        if (fetchError) throw fetchError

        const alertasEnviados: any[] = []
        const erros: any[] = []

        // ========================================================================
        // 3. PROCESSAR CADA AGENDAMENTO
        // ========================================================================
        for (const agendamento of agendamentos || []) {
            const dataVenc = new Date(agendamento.data_vencimento)
            const diasRestantes = Math.ceil((dataVenc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

            const config = agendamento.alertas_config || { dias_antes: [7, 3, 1], canais: ['sistema'] }
            const diasAntes = config.dias_antes || [7, 3, 1]
            const canais = config.canais || ['sistema']

            // Verificar se hoje é dia de enviar alerta
            const deveAlertar = diasAntes.includes(diasRestantes)

            if (!deveAlertar) continue

            // Verificar se já foi enviado hoje
            const { data: jaEnviado } = await supabase
                .from('historico_alertas')
                .select('id')
                .eq('agendamento_id', agendamento.id)
                .gte('enviado_em', hoje.toISOString())
                .limit(1)

            if (jaEnviado && jaEnviado.length > 0) continue // Já enviou hoje

            // ====================================================================
            // 4. ENVIAR ALERTAS PELOS CANAIS CONFIGURADOS
            // ====================================================================
            for (const canal of canais) {
                try {
                    let statusEntrega = 'sucesso'
                    let detalhes = {}

                    if (canal === 'email') {
                        // Enviar email
                        const emailResult = await enviarEmailAlerta(agendamento, diasRestantes)
                        detalhes = emailResult
                        if (!emailResult.success) statusEntrega = 'falha'
                    } else if (canal === 'whatsapp') {
                        // Enviar WhatsApp
                        const whatsappResult = await enviarWhatsAppAlerta(agendamento, diasRestantes)
                        detalhes = whatsappResult
                        if (!whatsappResult.success) statusEntrega = 'falha'
                    } else if (canal === 'sistema') {
                        // Alerta sistema (apenas registrar no histórico)
                        detalhes = { message: 'Alerta registrado no sistema' }
                    }

                    // Registrar no histórico
                    const { error: historicoError } = await supabase
                        .from('historico_alertas')
                        .insert({
                            agendamento_id: agendamento.id,
                            canal,
                            status_entrega: statusEntrega,
                            detalhes
                        })

                    if (historicoError) {
                        console.error('[Cron] Erro ao registrar histórico:', historicoError)
                    }

                    alertasEnviados.push({
                        agendamento_id: agendamento.id,
                        canal,
                        status: statusEntrega
                    })

                    // Log de auditoria
                    await logAudit({
                        cliente_id: agendamento.cliente_id,
                        acao: 'ALERTA_ENVIADO',
                        detalhes: `Alerta enviado via ${canal} para: ${agendamento.descricao} (${diasRestantes} dias restantes)`,
                        request
                    })
                } catch (error: any) {
                    erros.push({
                        agendamento_id: agendamento.id,
                        canal,
                        erro: error.message
                    })
                }
            }
        }

        return NextResponse.json({
            success: true,
            processados: agendamentos?.length || 0,
            alertas_enviados: alertasEnviados.length,
            erros: erros.length,
            detalhes: { alertasEnviados, erros }
        })
    } catch (error: any) {
        console.error('[Agendamentos Cron Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

async function enviarEmailAlerta(agendamento: any, diasRestantes: number) {
    try {
        // TODO: Integrar com Nodemailer/Resend
        // Por enquanto, retornar mock
        const cliente = agendamento.clientes
        const email = cliente?.email

        if (!email) {
            return { success: false, error: 'Cliente sem email cadastrado' }
        }

        // Aqui você integraria com seu serviço de email
        console.log(`[EMAIL] Enviando para ${email}: ${agendamento.descricao} vence em ${diasRestantes} dias`)

        return {
            success: true,
            destinatario: email,
            assunto: `Lembrete: ${agendamento.descricao}`,
            diasRestantes
        }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

async function enviarWhatsAppAlerta(agendamento: any, diasRestantes: number) {
    try {
        // TODO: Integrar com Evolution API existente
        const cliente = agendamento.clientes
        const telefone = cliente?.telefone

        if (!telefone) {
            return { success: false, error: 'Cliente sem telefone cadastrado' }
        }

        // Aqui você integraria com a Evolution API
        console.log(`[WHATSAPP] Enviando para ${telefone}: ${agendamento.descricao} vence em ${diasRestantes} dias`)

        return {
            success: true,
            destinatario: telefone,
            mensagem: `🔔 *Lembrete Importante*\n\n${agendamento.descricao}\n\nVencimento: ${new Date(agendamento.data_vencimento).toLocaleDateString('pt-BR')}\nFaltam *${diasRestantes} dias*`,
            diasRestantes
        }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
