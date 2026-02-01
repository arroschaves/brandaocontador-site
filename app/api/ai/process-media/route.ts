import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeMedia } from '@/lib/utils/ai-service'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const atendimentoId = formData.get('atendimentoId') as string

        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const mimeType = file.type

        // Processa via Gemini
        const analysis = await analyzeMedia(buffer, mimeType)

        // Salva no Banco
        const supabase = await createClient()

        if (atendimentoId) {
            await supabase
                .from('atendimentos')
                .update({
                    transcricao_ia: analysis,
                    status_ia: 'PROCESSADO'
                })
                .eq('id', atendimentoId)
        }

        return NextResponse.json({
            success: true,
            analysis
        })

    } catch (error: any) {
        console.error('[Process Media Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
