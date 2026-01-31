import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendWhatsAppMessage } from '@/lib/utils/evolution-api'

/**
 * Automador de Validades
 * Verifica documentos (Alvarás, Certificados) vencendo em 30, 15 ou 5 dias.
 * Dispara alertas para o contador e para o cliente.
 */
export async function GET(request: Request) {
    try {
        const supabase = await createClient()

        // 1. Buscar validades pendentes (não concluídas) que vencem nos próximos 30 dias
        const hoje = new Date()
        const limite = new Date()
        limite.setDate(hoje.getDate() + 30)

        const { data: validades, error } = await supabase
            .from('controle_validades')
            .select(`
                *,
                clientes ( nome, telefone_whatsapp )
            `)
            .lte('vencimento', limite.toISOString())
            .neq('status', 'concluido')

        if (error) throw error

        const results = []

        for (const item of validades) {
            const diasFaltantes = Math.ceil((new Date(item.vencimento).getTime() - hoje.getTime()) / (1000 * 3600 * 24))

            // Só dispara alerta em marcos específicos ou se estiver vencido
            if ([30, 15, 7, 3, 1, 0].includes(diasFaltantes) || diasFaltantes < 0) {
                const statusTxt = diasFaltantes < 0 ? 'VENCIDO' : `vence em ${diasFaltantes} dias`
                const msg = `⚠️ *ALERTA DE VENCIMENTO*\n\nOlá ${item.clientes.nome}, identificamos que seu documento *${item.tipo}* ${statusTxt} (${new Date(item.vencimento).toLocaleDateString()}).\n\nFavor providenciar a renovação para evitar multas ou interrupção das atividades.`

                if (item.clientes.telefone_whatsapp) {
                    await sendWhatsAppMessage(item.clientes.telefone_whatsapp, msg)
                    results.push({ id: item.id, status: 'Notified', target: item.clientes.nome })
                }
            }
        }

        return NextResponse.json({ success: true, notificationsSent: results.length, detail: results })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
