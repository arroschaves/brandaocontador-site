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
            .schema('core')
            .from('empresas')
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

        // 3. Sanitizar dados antes de enviar ao Supabase
        const safeData: Record<string, any> = {};
        const DATE_FIELDS = ['data_abertura', 'data_situacao_cadastral'];
        const SKIP_FIELDS = ['cnaes_secundarios']; // Array, não é coluna

        for (const [key, value] of Object.entries(enrichedData)) {
            if (SKIP_FIELDS.includes(key)) continue;
            if (value === null || value === undefined || value === '') continue;

            // Validar datas
            if (DATE_FIELDS.includes(key)) {
                const dateStr = String(value).substring(0, 10);
                const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                if (match) {
                    const d = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
                    if (d.getFullYear() === parseInt(match[1]) && d.getMonth() === parseInt(match[2]) - 1 && d.getDate() === parseInt(match[3])) {
                        safeData[key] = dateStr;
                    } else {
                        console.warn(`[Enrichment] Data inválida ignorada: ${key}=${value}`);
                    }
                } else {
                    console.warn(`[Enrichment] Formato de data não reconhecido: ${key}=${value}`);
                }
                continue;
            }

            safeData[key] = value;
        }

        // 4. Atualizar o cliente no Supabase com os dados validados
        const { error: updateErr } = await supabase
            .schema('core')
            .from('empresas')
            .update(safeData)
            .eq('id', clientId)

        if (updateErr) {
            console.error('[Enrichment API] Erro ao atualizar cliente:', updateErr)
            throw new Error(`Erro ao salvar no banco: ${updateErr.message}`)
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
            {
                error: error.message || 'Erro interno ao processar enriquecimento.',
                details: error.response?.data || error.stack
            },
            { status: error.message?.includes('Limite') ? 429 : 500 }
        )
    }
}
