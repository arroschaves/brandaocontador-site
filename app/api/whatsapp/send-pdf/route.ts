import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { sendWhatsAppMedia } from '@/lib/utils/evolution-api'

/**
 * Rota para envio manual de PDF via WhatsApp
 * Busca o arquivo no Drive e dispara pela Evolution API.
 */
export async function POST(request: Request) {
    try {
        const { clientId, fileId, fileName, caption } = await request.json()
        const supabase = await createClient()

        // 1. Buscar dados do cliente (número de telefone)
        const { data: cliente, error: clientErr } = await supabase
            .from('clientes')
            .select('nome, telefone_whatsapp')
            .eq('id', clientId)
            .single()

        if (clientErr || !cliente?.telefone_whatsapp) {
            throw new Error('Cliente sem telefone cadastrado')
        }

        // 2. Configurar Google Drive para buscar o arquivo
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON!);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });
        const drive = google.drive({ version: 'v3', auth });

        // 3. Baixar o arquivo do Drive
        const fileRes = await drive.files.get(
            { fileId: fileId, alt: 'media' },
            { responseType: 'arraybuffer' }
        );

        // 4. Converter para Base64
        const buffer = Buffer.from(fileRes.data as ArrayBuffer);
        const base64 = buffer.toString('base64');

        // 5. Enviar via Evolution API
        const whatsappRes = await sendWhatsAppMedia(
            cliente.telefone_whatsapp,
            base64,
            fileName || 'Documento.pdf',
            caption || `Olá ${cliente.nome}, segue sua guia de contabilidade.`
        );

        if (whatsappRes?.status === 'error') {
            throw new Error(whatsappRes.message || 'Erro no envio do WhatsApp')
        }

        // 6. Registrar Log de Envio no Supabase
        await supabase.from('atendimentos').insert({
            cliente_id: clientId,
            numero_whatsapp: cliente.telefone_whatsapp,
            mensagem: `[Documento Enviado: ${fileName}]`,
            status: 'concluido',
            created_at: new Date().toISOString()
        })

        return NextResponse.json({ success: true, detail: 'PDF enviado com sucesso' })

    } catch (error: any) {
        console.error('Send PDF Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
