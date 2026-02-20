import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logAudit } from '@/lib/utils/audit'

/**
 * GET /api/clientes/[id]/certificados-digitais
 * Lista todos os certificados digitais de um cliente
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: clientId } = await params
        const supabase = await createClient()

        const { data, error } = await supabase
            .schema('core')
            .from('certificados_digitais')
            .select('*')
            .eq('empresa_id', clientId) // Update foreign key as per core.certificados_digitais
            .order('data_vencimento', { ascending: true })

        if (error) throw error

        return NextResponse.json(data || [])
    } catch (error: any) {
        console.error('[Certificados Digitais GET Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * POST /api/clientes/[id]/certificados-digitais
 * Cria novo certificado digital
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
            data_emissao,
            data_vencimento,
            arquivo_id,
            senha_criptografada,
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
            .schema('core')
            .from('certificados_digitais')
            .insert({
                empresa_id: clientId, // Use new foreign_key 'empresa_id'
                tipo,
                // data_emissao is removed in new schema, maybe use metadata, but schema says:
                // tipo, titular, validade, drive_file_id, senha_vault_ref, status
                validade: data_vencimento,
                drive_file_id: arquivo_id,
                senha_vault_ref: senha_criptografada,
                status: 'ATIVO'
            })
            .select()
            .single()

        if (error) throw error

        await logAudit({
            cliente_id: clientId,
            acao: 'SISTEMA',
            detalhes: `Certificado ${tipo} adicionado - Vencimento: ${data_vencimento}`,
            request
        })

        return NextResponse.json(data, { status: 201 })
    } catch (error: any) {
        console.error('[Certificados Digitais POST Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * PATCH /api/clientes/[id]/certificados-digitais
 * Atualiza certificado digital existente
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: clientId } = await params
        const body = await request.json()
        const { certificadoId, ...updates } = body

        if (!certificadoId) {
            return NextResponse.json(
                { error: 'ID do certificado é obrigatório' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        const { data, error } = await supabase
            .schema('core')
            .from('certificados_digitais')
            .update(updates)
            .eq('id', certificadoId)
            .eq('empresa_id', clientId) // Update foreign key string
            .select()
            .single()

        if (error) throw error

        await logAudit({
            cliente_id: clientId,
            acao: 'SISTEMA',
            detalhes: `Certificado ${certificadoId} atualizado`,
            request
        })

        return NextResponse.json(data)
    } catch (error: any) {
        console.error('[Certificados Digitais PATCH Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * DELETE /api/clientes/[id]/certificados-digitais
 * Remove certificado digital
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: clientId } = await params
        const { searchParams } = new URL(request.url)
        const certificadoId = searchParams.get('certificadoId')

        if (!certificadoId) {
            return NextResponse.json(
                { error: 'ID do certificado é obrigatório' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        const { error } = await supabase
            .schema('core')
            .from('certificados_digitais')
            .delete()
            .eq('id', certificadoId)
            .eq('empresa_id', clientId) // Use empresa_id

        if (error) throw error

        await logAudit({
            cliente_id: clientId,
            acao: 'SISTEMA',
            detalhes: `Certificado ${certificadoId} removido`,
            request
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('[Certificados Digitais DELETE Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
