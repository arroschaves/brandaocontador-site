import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * API para Identificar Clientes Candidatos ao Enriquecimento (PJ sem dados completos)
 * GET /api/clientes/enrich-all
 */
export async function GET() {
    try {
        const supabase = await createClient()

        // 1. Buscar clientes PJ que possuam CNPJ mas faltem dados essenciais (ex: logradouro ou IE)
        // Usamos uma query que pega clientes PJ (cnpj_cpf não nulos)
        const { data: clients, error } = await supabase
            .schema('core')
            .from('empresas')
            .select('id, nome, cnpj_cpf, logradouro, inscricao_estadual')
            .not('cnpj_cpf', 'is', null)
            .limit(100) // Limite de segurança para uma sessão de enriquecimento

        if (error) {
            console.error('[Enrich All API] Erro ao buscar cientes:', error)
            throw error
        }

        // 2. Filtrar apenas clientes PJ (14 dígitos) e que realmente precisam de enriquecimento
        const candidates = (clients || []).filter(c => {
            const cleanCnpj = c.cnpj_cpf.replace(/\D/g, '')
            const isPJ = cleanCnpj.length === 14
            const isMissingData = !c.logradouro || !c.inscricao_estadual
            return isPJ && isMissingData
        })

        return NextResponse.json(candidates)

    } catch (error: any) {
        console.error('[Enrich All Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
