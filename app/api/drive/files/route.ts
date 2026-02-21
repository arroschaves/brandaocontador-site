import { NextResponse, NextRequest } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('clientId');
        let folderId = searchParams.get('folderId');

        if (!clientId && !folderId) {
            return NextResponse.json({ error: 'Cliente ID ou Folder ID é obrigatório' }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Buscar pasta do Drive do cliente SE folderId não foi fornecido
        if (!folderId) {
            const { data: cliente, error: clientErr } = await supabase
                .schema('core')
                .from('empresas')
                .select('drive_folder_id')
                .eq('id', clientId)
                .single();

            if (clientErr || !cliente?.drive_folder_id) {
                return NextResponse.json({ error: 'Cliente não possui pasta no Google Drive configurada.' }, { status: 404 });
            }
            folderId = cliente.drive_folder_id;
        }

        // 2. Autenticar no Google Drive
        const gCreds = process.env.GOOGLE_DRIVE_CREDENTIALS || process.env.GOOGLE_CREDENTIALS_JSON;
        if (!gCreds) {
            throw new Error('Credenciais do Google Drive não configuradas no servidor.');
        }

        const credentials = JSON.parse(gCreds);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });

        const drive = google.drive({ version: 'v3', auth });

        // 3. Listar Arquivos
        const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: 'files(id, name, mimeType, modifiedTime, webViewLink, webContentLink, iconLink)',
            orderBy: 'folder, modifiedTime desc',
            pageSize: 100
        });

        return NextResponse.json(response.data.files || []);

    } catch (error: any) {
        console.error('[Drive Files List Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
