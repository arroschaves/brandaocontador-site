import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getRoutinesByClientType } from '@/lib/utils/accounting-intelligence'

/**
 * Auditoria de GAP (Faltantes)
 * Identifica obrigações que deveriam ter sido geradas mas não constam no banco/drive.
 */
export async function GET(request: Request) {
    try {
        const supabase = await createClient()

        // 1. Buscar todos os clientes
        const { data: clientes, error: clientErr } = await supabase.from('clientes').select('*')
        if (clientErr) throw clientErr

        // 2. Buscar obrigações já registradas no mês atual
        const competenciaAtual = new Date()
        competenciaAtual.setDate(1) // Primeiro dia do mês
        const competenciaStr = competenciaAtual.toISOString().split('T')[0]

        const { data: obrigaçõesExistentes } = await supabase
            .from('obrigacoes_acessorias')
            .select('*')
            .eq('competencia', competenciaStr)

        const gaps = []

        for (const cliente of clientes) {
            // Pegar o que é ESPERADO para este cliente
            const isAgro = !!cliente.cnae_principal?.startsWith('01') || cliente.regime_tributario === 'PF_FAZENDA'
            const expected = getRoutinesByClientType(cliente.regime_tributario, isAgro)

            for (const routine of expected) {
                // Verificar se já temos registro de 'concluido' para esta rotina
                const exists = obrigaçõesExistentes?.find(o =>
                    o.cliente_id === cliente.id &&
                    o.tipo === routine.name &&
                    o.status === 'concluido'
                )

                if (!exists) {
                    gaps.push({
                        clienteId: cliente.id,
                        clienteNome: cliente.nome,
                        regime: cliente.regime_tributario,
                        obrigacao: routine.name,
                        grupo: routine.taxGroup,
                        prioridade: routine.taxGroup === 'Fiscal' ? 'ALTA' : 'NORMAL'
                    })
                }
            }
        }

        // Ordenar por prioridade e nome
        const sortedGaps = gaps.sort((a, b) => a.prioridade === 'ALTA' ? -1 : 1)

        return NextResponse.json({
            success: true,
            count: sortedGaps.length,
            gaps: sortedGaps.slice(0, 50) // Limitar aos primeiros 50 mais urgentes
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
