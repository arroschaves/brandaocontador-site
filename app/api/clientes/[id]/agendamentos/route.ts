import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logAudit } from '@/lib/utils/audit'

/**
 * GET /api/clientes/[id]/agendamentos
 * Lista todos os agendamentos de um cliente com filtros opcionais
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: clientId } = await params
        const { searchParams } = new URL(request.url)

        // Filtros opcionais
        const status = searchParams.get('status')
        const tipo = searchParams.get('tipo')
        const dataInicio = searchParams.get('dataInicio')
        const dataFim = searchParams.get('dataFim')

        const supabase = await createClient()

        // Query base
        let query = supabase
            .from('agendamentos_pendencias')
            .select('*')
            .eq('cliente_id', clientId)
            .order('data_vencimento', { ascending: true })

        // Aplicar filtros
        if (status) query = query.eq('status', status)
        if (tipo) query = query.eq('tipo_pendencia', tipo)
        if (dataInicio) query = query.gte('data_vencimento', dataInicio)
        if (dataFim) query = query.lte('data_vencimento', dataFim)

        const { data, error } = await query

        if (error) throw error

        return NextResponse.json(data || [])
    } catch (error: any) {
        console.error('[Agendamentos GET Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * POST /api/clientes/[id]/agendamentos
 * Cria novo agendamento de pendência
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: clientId } = await params
        const body = await request.json()

        const {
            tipo_pendencia,
            subtipo,
            descricao,
            data_vencimento,
            alertas_config,
            metadata
        } = body

        // Validações
        if (!tipo_pendencia || !descricao || !data_vencimento) {
            return NextResponse.json(
                { error: 'Tipo, descrição e data de vencimento são obrigatórios' },
                { status: 400 }
            )
        }

        // Validar data não está no passado (para novos agendamentos)
        const dataVenc = new Date(data_vencimento)
        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)

        if (dataVenc < hoje) {
            return NextResponse.json(
                { error: 'Data de vencimento não pode ser no passado' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Criar agendamento
        const { data, error } = await supabase
            .from('agendamentos_pendencias')
            .insert({
                cliente_id: clientId,
                tipo_pendencia,
                subtipo,
                descricao,
                data_vencimento,
                alertas_config: alertas_config || { dias_antes: [7, 3, 1], canais: ['sistema'] },
                metadata,
                status: 'pendente'
            })
            .select()
            .single()

        if (error) throw error

        // Log de auditoria
        await logAudit({
            cliente_id: clientId,
            acao: 'SISTEMA',
            detalhes: `Nova pendência criada: ${descricao} (${tipo_pendencia}) - Vence em ${data_vencimento}`,
            request
        })

        return NextResponse.json(data, { status: 201 })
    } catch (error: any) {
        console.error('[Agendamentos POST Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * PATCH /api/clientes/[id]/agendamentos
 * Atualiza agendamento (marcar como concluído, editar data, etc.)
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: clientId } = await params
        const body = await request.json()
        const { agendamentoId, ...updates } = body

        if (!agendamentoId) {
            return NextResponse.json(
                { error: 'ID do agendamento é obrigatório' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Atualizar agendamento
        const { data, error } = await supabase
            .from('agendamentos_pendencias')
            .update(updates)
            .eq('id', agendamentoId)
            .eq('cliente_id', clientId) // Garantir que pertence ao cliente
            .select()
            .single()

        if (error) throw error

        // Log de auditoria
        await logAudit({
            cliente_id: clientId,
            acao: 'SISTEMA',
            detalhes: `Agendamento ${agendamentoId} atualizado: ${JSON.stringify(updates)}`,
            request
        })

        return NextResponse.json(data)
    } catch (error: any) {
        console.error('[Agendamentos PATCH Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * DELETE /api/clientes/[id]/agendamentos
 * Remove agendamento
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: clientId } = await params
        const { searchParams } = new URL(request.url)
        const agendamentoId = searchParams.get('agendamentoId')

        if (!agendamentoId) {
            return NextResponse.json(
                { error: 'ID do agendamento é obrigatório' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Deletar agendamento
        const { error } = await supabase
            .from('agendamentos_pendencias')
            .delete()
            .eq('id', agendamentoId)
            .eq('cliente_id', clientId) // Garantir que pertence ao cliente

        if (error) throw error

        // Log de auditoria
        await logAudit({
            cliente_id: clientId,
            acao: 'SISTEMA',
            detalhes: `Agendamento ${agendamentoId} removido`,
            request
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('[Agendamentos DELETE Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
