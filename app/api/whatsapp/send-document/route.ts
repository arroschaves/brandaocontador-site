import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { sendWhatsAppMedia } from '@/lib/utils/evolution-api'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/utils/audit'

export async function POST(request: Request) {
    try {
        const { clientId, fileId, fileName, caption } = await request.json()
        const supabase = await createClient()

        if (!clientId || !fileId) {
            return NextResponse.json({ error: 'Dados insuficientes' }, { status: 400 })
        }

        // 1. Buscar dados do cliente
        const { data: cliente, error: clientError } = await supabase
            .schema('core')
            .from('empresas')
            .select('*')
            .eq('id', clientId)
            .single()

        if (clientError || !cliente) {
            throw new Error('Cliente não encontrado')
        }

        if (!cliente.telefone) {
            throw new Error('Cliente sem telefone cadastrado')
        }

        // 2. Extrair ID do arquivo se for uma URL do Drive
        let actualFileId = fileId;
        if (fileId.includes('id=')) {
            actualFileId = fileId.split('id=')[1].split('&')[0];
        } else if (fileId.includes('/d/')) {
            actualFileId = fileId.split('/d/')[1].split('/')[0];
        }

        // 3. Configurar Google Drive para buscar o arquivo
        const gCreds = process.env.GOOGLE_DRIVE_CREDENTIALS || process.env.GOOGLE_CREDENTIALS_JSON;
        const credentials = JSON.parse(gCreds!);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });
        const drive = google.drive({ version: 'v3', auth });

        // 4. Baixar o arquivo do Drive
        const fileRes = await drive.files.get(
            { fileId: actualFileId, alt: 'media' },
            { responseType: 'arraybuffer' }
        );

        // 5. Converter para Base64
        const buffer = Buffer.from(fileRes.data as ArrayBuffer);
        const base64 = buffer.toString('base64');

        // 6. Enviar via Evolution API
        const whatsappRes = await sendWhatsAppMedia(
            cliente.telefone,
            base64,
            fileName || 'Documento.pdf',
            caption || `Olá ${cliente.nome_fantasia || cliente.razao_social}, segue sua guia de contabilidade.`
        );

        if (whatsappRes?.status === 'error') {
            throw new Error(whatsappRes.message || 'Erro no envio do WhatsApp')
        }

        // 7. Registrar Log de Atendimento
        await supabase.schema('core').from('atendimentos').insert({
            empresa_id: clientId,
            telefone_whatsapp: cliente.telefone,
            mensagem: `[Documento Enviado WhatsApp: ${fileName}]`,
            status: 'concluido',
            created_at: new Date().toISOString()
        })

        // 8. Registrar Auditoria
        await logAudit({
            cliente_id: clientId,
            acao: 'ENVIO_WA',
            detalhes: `Documento enviado via WhatsApp: ${fileName}`,
            request
        });

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('[Send Document WA Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
