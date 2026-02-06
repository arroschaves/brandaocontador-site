import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { enrichCompanyData } from '@/lib/services/enrichment-service'
import { logAudit } from '@/lib/utils/audit'

/**
 * API para Enriquecimento de Dados de Cliente (CNPJ)
 * POST /api/clientes/[id]/enrich
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: clientId } = await params
        const supabase = await createClient()

        // 1. Buscar o CNPJ do cliente no banco
        const { data: client, error: fetchErr } = await supabase
            .from('clientes')
            .select('cnpj_cpf, nome')
            .eq('id', clientId)
            .single()

        if (fetchErr || !client) {
            console.error('[Enrichment API] Cliente não encontrado:', fetchErr)
            return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 })
        }

        if (!client.cnpj_cpf) {
            return NextResponse.json({ error: 'Este cliente não possui CNPJ cadastrado para consulta.' }, { status: 400 })
        }

        // 2. Chamar o service de enriquecimento (CNPJ.ws)
        console.log(`[Enrichment API] Iniciando consulta para CNPJ: ${client.cnpj_cpf}`)
        const enrichedData = await enrichCompanyData(client.cnpj_cpf)

        // 3. Atualizar o cliente no Supabase com os novos dados
        const { error: updateErr } = await supabase
            .from('clientes')
            .update({
                ...enrichedData,
                updated_at: new Date().toISOString()
            })
            .eq('id', clientId)

        if (updateErr) {
            console.error('[Enrichment API] Erro ao atualizar cliente:', updateErr)
            throw new Error('Falha ao salvar dados enriquecidos no banco de dados.')
        }

        // 4. Registrar a ação na auditoria
        await logAudit({
            cliente_id: clientId,
            acao: 'ENRIQUECIMENTO',
            detalhes: `Enriquecimento automático de dados cadastrais realizado via API CNPJ.ws para o cliente ${client.nome}. Campos atualizados: Razão Social, Endereço, CNAE e IE.`,
            request
        })

        return NextResponse.json({
            success: true,
            message: 'Dados enriquecidos e salvos com sucesso.',
            data: enrichedData
        })

    } catch (error: any) {
        console.error('[Enrichment API Error]:', error)
        return NextResponse.json(
            { error: error.message || 'Erro interno ao processar enriquecimento.' },
            { status: error.message.includes('Limite') ? 429 : 500 }
        )
    }
}
