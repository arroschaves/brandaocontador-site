import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { getRoutinesByClientType } from '@/lib/utils/accounting-intelligence'

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Buscar todos os clientes com Drive Folder ID
        const { data: clientes, error: clientError } = await supabase
            .from('clientes')
            .select('*');

        if (clientError) throw clientError;

        // 2. Configurar Google Drive
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON!);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });
        const drive = google.drive({ version: 'v3', auth });

        const results = [];
        const competenciaAtual = new Date();
        const mesStr = (competenciaAtual.getMonth() + 1).toString().padStart(2, '0');
        const anoStr = competenciaAtual.getFullYear().toString();

        for (const cliente of clientes) {
            if (!cliente.drive_folder_id) continue;

            const rotinas = getRoutinesByClientType(cliente.regime_tributario, !!cliente.cnae_principal?.startsWith('01'));

            for (const rotina of rotinas) {
                // Tenta localizar arquivo que indique conclusão da rotina
                // Padrão: {Regime}/{Ano}/{Mes}/{NomeDaRotina}
                const query = `'${cliente.drive_folder_id}' in parents and name contains '${rotina.taxGroup}' and mimeType = 'application/vnd.google-apps.folder'`;
                const folderRes = await drive.files.list({ q: query, fields: 'files(id, name)' });
                const mainFolder = folderRes.data.files?.[0];

                let status = 'pendente';
                if (mainFolder) {
                    const fileQuery = `'${mainFolder.id}' in parents and name contains '${rotina.name}' and trashed = false`;
                    const files = await drive.files.list({ q: fileQuery, fields: 'files(id, name)' });
                    if (files.data.files && files.data.files.length > 0) {
                        status = 'concluido';
                    }
                }

                // Atualizar Supabase (Obrigação do Mês)
                await supabase.from('obrigacoes_acessorias').upsert({
                    cliente_id: cliente.id,
                    tipo: rotina.name,
                    status: status,
                    competencia: new Date(competenciaAtual.getFullYear(), competenciaAtual.getMonth(), 1).toISOString()
                }, { onConflict: 'cliente_id, tipo, competencia' });
            }
            results.push({ id: cliente.id, nome: cliente.nome, status: 'Audited' });
        }

        return NextResponse.json({ success: true, auditedCount: results.length });

    } catch (error: any) {
        console.error('Audit Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
