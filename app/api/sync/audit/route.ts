import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { getRoutinesByClientType } from '@/lib/utils/accounting-intelligence'

export async function POST(request: Request) {
    try {
        const { clientId } = await request.json();
        const supabase = await createClient();

        // 1. Buscar cliente(s)
        let queryBuilder = supabase.from('clientes').select('*');
        if (clientId) {
            queryBuilder = queryBuilder.eq('id', clientId);
        }

        const { data: clientes, error: clientError } = await queryBuilder;
        if (clientError) throw clientError;

        // 2. Configurar Google Drive
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON!);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });
        const drive = google.drive({ version: 'v3', auth });

        const results = [];
        const agora = new Date();

        // Determina a competência de referência (Jan se estivermos no início de Fev)
        const refDate = new Date(agora.getFullYear(), agora.getMonth() - (agora.getDate() < 15 ? 1 : 0), 1);
        const mesReferencia = refDate.getMonth() + 1;
        const anoReferencia = refDate.getFullYear();
        const competenciaStr = refDate.toISOString().split('T')[0];

        // Padrões de busca baseados na competência de referência
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const mesStr = mesReferencia.toString().padStart(2, '0');
        const monthFolderPatterns = [
            `${mesStr}_${monthNames[mesReferencia - 1]}`,
            `${mesStr}-${anoReferencia}`,
            monthNames[mesReferencia - 1],
            mesStr
        ];

        for (const cliente of clientes) {
            if (!cliente.drive_folder_id) continue;

            const rotinas = getRoutinesByClientType(cliente.regime_tributario, !!cliente.cnae_principal?.startsWith('01'));

            // Busca recursiva limitada: primeiro tenta achar a pasta do mês
            let targetFolders = [cliente.drive_folder_id];

            for (const pattern of monthFolderPatterns) {
                const q = `'${cliente.drive_folder_id}' in parents and name contains '${pattern}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
                const folders = await drive.files.list({ q, fields: 'files(id, name)' });
                if (folders.data.files && folders.data.files.length > 0) {
                    targetFolders.push(...folders.data.files.map(f => f.id!));
                }
            }

            for (const rotina of rotinas) {
                let status = 'pendente';

                // Mapeamento de nomes de arquivos comuns para cada rotina
                const namePatterns: any = {
                    'DAS': ['DAS', 'PGDAS', 'Apuração'],
                    'FGTS': ['FGTS', 'GFD', 'Guia_FGTS'],
                    'INSS': ['INSS', 'GPS', 'DCTFWeb', 'GuiaPagamento'],
                    'DCTFWeb': ['DCTFWeb', 'DCTF', 'GuiaPagamento'],
                    'Folha de Pagamento': ['Folha', 'Recibo', 'Holerite', 'Pagamento']
                };

                const patterns = namePatterns[rotina.name] || [rotina.name];

                // Busca o arquivo em todas as pastas candidatas (Raiz + Pastas de Mês encontradas)
                for (const folderId of targetFolders) {
                    if (status === 'concluido') break;

                    for (const p of patterns) {
                        const fileQuery = `'${folderId}' in parents and name contains '${p}' and name contains '${mesStr}' and trashed = false`;
                        const files = await drive.files.list({ q: fileQuery, fields: 'files(id, name)' });
                        if (files.data.files && files.data.files.length > 0) {
                            status = 'concluido';
                            break;
                        }
                    }
                }

                // Atualizar Supabase
                await supabase.from('obrigacoes_acessorias').upsert({
                    cliente_id: cliente.id,
                    tipo: rotina.name,
                    status: status,
                    competencia: competenciaStr
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
