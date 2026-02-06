import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logAudit } from '@/lib/utils/audit'

/**
 * GET /api/clientes/[id]/certidoes
 * Lista todas as certidões negativas de um cliente
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: clientId } = await params
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('certidoes_negativas')
            .select('*')
            .eq('cliente_id', clientId)
            .order('data_vencimento', { ascending: true })

        if (error) throw error

        return NextResponse.json(data || [])
    } catch (error: any) {
        console.error('[Certidões GET Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * POST /api/clientes/[id]/certidoes
 * Cria nova certidão negativa
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: clientId } = await params
        const body = await request.json()

        const {
            tipo,
            numero,
            data_emissao,
            data_vencimento,
            arquivo_url,
            orgao_emissor,
            observacoes,
            metadata
        } = body

        if (!tipo || !data_vencimento) {
            return NextResponse.json(
                { error: 'Tipo e data de vencimento são obrigatórios' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        const { data, error } = await supabase
            .from('certidoes_negativas')
            .insert({
                cliente_id: clientId,
                tipo,
                numero,
                data_emissao,
                data_vencimento,
                arquivo_url,
                orgao_emissor,
                observacoes,
                metadata,
                status: 'valida'
            })
            .select()
            .single()

        if (error) throw error

        await logAudit({
            cliente_id: clientId,
            acao: 'SISTEMA',
            detalhes: `Certidão ${tipo} adicionada - Vencimento: ${data_vencimento}`,
            request
        })

        return NextResponse.json(data, { status: 201 })
    } catch (error: any) {
        console.error('[Certidões POST Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * PATCH /api/clientes/[id]/certidoes
 * Atualiza certidão existente
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: clientId } = await params
        const body = await request.json()
        const { certidaoId, ...updates } = body

        if (!certidaoId) {
            return NextResponse.json(
                { error: 'ID da certidão é obrigatório' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        const { data, error } = await supabase
            .from('certidoes_negativas')
            .update(updates)
            .eq('id', certidaoId)
            .eq('cliente_id', clientId)
            .select()
            .single()

        if (error) throw error

        await logAudit({
            cliente_id: clientId,
            acao: 'SISTEMA',
            detalhes: `Certidão ${certidaoId} atualizada`,
            request
        })

        return NextResponse.json(data)
    } catch (error: any) {
        console.error('[Certidões PATCH Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * DELETE /api/clientes/[id]/certidoes
 * Remove certidão
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: clientId } = await params
        const { searchParams } = new URL(request.url)
        const certidaoId = searchParams.get('certidaoId')

        if (!certidaoId) {
            return NextResponse.json(
                { error: 'ID da certidão é obrigatório' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        const { error } = await supabase
            .from('certidoes_negativas')
            .delete()
            .eq('id', certidaoId)
            .eq('cliente_id', clientId)

        if (error) throw error

        await logAudit({
            cliente_id: clientId,
            acao: 'SISTEMA',
            detalhes: `Certidão ${certidaoId} removida`,
            request
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('[Certidões DELETE Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
