import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logAudit } from '@/lib/utils/audit'

export async function POST(request: Request) {
    try {
        const { clientId, conteudo } = await request.json()
        const supabase = await createClient()

        if (!clientId) {
            return NextResponse.json({ error: 'Cliente ID é obrigatório' }, { status: 400 })
        }

        const { error } = await supabase
            .from('cliente_wiki')
            .upsert({
                cliente_id: clientId,
                conteudo,
                updated_at: new Date().toISOString()
            }, { onConflict: 'cliente_id' })

        if (error) throw error

        await logAudit({
            cliente_id: clientId,
            acao: 'SISTEMA',
            detalhes: 'Dossiê Técnico (Wiki) atualizado.',
            request
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('[Wiki Update Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
