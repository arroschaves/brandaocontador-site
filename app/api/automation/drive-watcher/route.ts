import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { sendWhatsAppMessage } from '@/lib/utils/evolution-api'

/**
 * Drive Watcher - Auditoria em Tempo Real
 * Varre as pastas dos clientes em busca de novos documentos salvos manualmente.
 * Se encontrar algo novo, notifica o cliente via WhatsApp.
 */
export async function GET() {
    try {
        const supabase = await createClient()

        // 1. Buscar clientes com Drive Folder ID
        const { data: clientes } = await supabase
            .from('clientes')
            .select('id, nome, drive_folder_id, telefone_whatsapp')
            .not('drive_folder_id', 'is', null)

        if (!clientes) return NextResponse.json({ message: 'No clients found' })

        // 2. Configurar Drive
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON!);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });
        const drive = google.drive({ version: 'v3', auth });

        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

        for (const cliente of clientes) {
            // Buscar arquivos criados nos últimos 5 minutos na pasta do cliente
            const q = `'${cliente.drive_folder_id}' in parents and createdTime > '${fiveMinutesAgo}' and trashed = false`;
            const files = await drive.files.list({ q, fields: 'files(id, name, webViewLink)' });

            if (files.data.files && files.data.files.length > 0) {
                for (const file of files.data.files) {
                    const msg = `🔔 *NOVO DOCUMENTO DISPONÍVEL*\n\nOlá ${cliente.nome}, detectamos que um novo documento (*${file.name}*) foi disponibilizado na sua pasta do Google Drive.\n\nVocê pode visualizá-lo aqui: ${file.webViewLink}`;

                    if (cliente.telefone_whatsapp) {
                        await sendWhatsAppMessage(cliente.telefone_whatsapp, msg);
                    }
                }
            }
        }

        return NextResponse.json({ success: true, checked: clientes.length })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
