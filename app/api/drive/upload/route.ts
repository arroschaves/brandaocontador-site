import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/utils/audit'
import { Readable } from 'stream'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const clientId = formData.get('clientId') as string
        const routineName = formData.get('routineName') as string

        if (!file || !clientId) {
            return NextResponse.json({ error: 'Arquivo e Cliente ID são obrigatórios' }, { status: 400 })
        }

        const supabase = await createClient()

        // 1. Buscar pasta do Drive do cliente
        const { data: cliente } = await supabase
            .from('clientes')
            .select('nome, drive_folder_id')
            .eq('id', clientId)
            .single()

        if (!cliente?.drive_folder_id) {
            throw new Error('Cliente não possui pasta no Google Drive configurada.')
        }

        // 2. Autenticar no Google Drive
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON!);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });
        const drive = google.drive({ version: 'v3', auth });

        // 3. Converter arquivo para Stream para o Drive
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const stream = new Readable()
        stream.push(buffer)
        stream.push(null)

        // 4. Fazer upload para a pasta do cliente
        const driveRes = await drive.files.create({
            requestBody: {
                name: file.name,
                parents: [cliente.drive_folder_id]
            },
            media: {
                mimeType: file.type,
                body: stream
            },
            fields: 'id, webViewLink'
        })

        const fileId = driveRes.data.id
        const fileLink = driveRes.data.webViewLink

        // 5. Registrar no Supabase (Obrigações)
        if (routineName) {
            await supabase.from('obrigacoes_acessorias').upsert({
                cliente_id: clientId,
                tipo: routineName,
                status: 'concluido',
                arquivo_url: fileLink,
                updated_at: new Date().toISOString()
            }, { onConflict: 'cliente_id, tipo' });
        }

        // 6. Registrar Auditoria
        await logAudit({
            cliente_id: clientId,
            acao: 'UPLOAD',
            detalhes: `Arquivo '${file.name}' enviado para o Drive do cliente.`,
            request
        });

        return NextResponse.json({ success: true, fileId, fileLink })

    } catch (error: any) {
        console.error('[Manual Upload Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
