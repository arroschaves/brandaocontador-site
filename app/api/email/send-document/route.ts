import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/utils/audit'
import nodemailer from 'nodemailer'

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

        const toEmail = cliente.email;

        if (!toEmail) {
            throw new Error('Cliente sem e-mail cadastrado no sistema')
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

        // 5. Converter para Buffer
        const buffer = Buffer.from(fileRes.data as ArrayBuffer);

        // 6. Enviar E-mail via Nodemailer (Zoho Mail)
        const password = process.env.ZOHO_PASS_RH || process.env.ZOHO_PASS_ADM;
        if (!password) {
            throw new Error('Senha do Webmail (Zoho) não configurada no servidor')
        }

        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.com',
            port: 465,
            secure: true,
            auth: {
                user: 'contato@brandaocontador.com.br',
                pass: password,
            },
        });

        await transporter.sendMail({
            from: '"Brandão Contador" <contato@brandaocontador.com.br>',
            to: toEmail,
            subject: `Documento Fiscal - ${cliente.nome_fantasia || cliente.razao_social}`,
            text: caption || `Olá,\n\nSegue em anexo o documento: ${fileName}.\n\nPara qualquer dúvida, estamos à sua disposição.\n\nAtenciosamente,\nEquipe Brandão Contador`,
            attachments: [
                {
                    filename: fileName || 'Documento.pdf',
                    content: buffer
                }
            ]
        });

        // 7. Registrar Log de Atendimento
        await supabase.schema('core').from('atendimentos').insert({
            empresa_id: clientId,
            telefone_whatsapp: toEmail, // Reutilizando a coluna para armazenar o destino do email
            mensagem: `[E-mail Enviado: ${fileName}]`,
            status: 'concluido',
            created_at: new Date().toISOString()
        })

        // 8. Registrar Auditoria
        await logAudit({
            cliente_id: clientId,
            acao: 'ENVIO_EMAIL',
            detalhes: `Documento enviado via e-mail para ${toEmail}: ${fileName}`,
            request
        });

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('[Send Document Email Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
