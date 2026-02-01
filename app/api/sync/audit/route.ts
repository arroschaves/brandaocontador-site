import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { getRoutinesByClientType } from '@/lib/utils/accounting-intelligence'

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const clientId = body.clientId;
        const supabase = await createClient();

        // 1. Buscar cliente(s)
        let queryBuilder = supabase.from('clientes').select('*');
        if (clientId) {
            queryBuilder = queryBuilder.eq('id', clientId);
        }

        const { data: clientes, error: clientError } = await queryBuilder;
        if (clientError || !clientes) throw new Error(clientError?.message || 'Nenhum cliente encontrado');

        // 2. Configurar Google Drive (com verificação de segurança)
        if (!process.env.GOOGLE_CREDENTIALS_JSON) {
            throw new Error('Configuração do Google Drive ausente (GOOGLE_CREDENTIALS_JSON)');
        }

        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });
        const drive = google.drive({ version: 'v3', auth });

        const results = [];
        const agora = new Date();

        // Determina a competência de referência (Jan se estivermos no início de Fev)
        const refDate = new Date(agora.getFullYear(), agora.getMonth() - (agora.getDate() < 15 ? 1 : 0), 1);
        const mesStr = (refDate.getMonth() + 1).toString().padStart(2, '0');
        const anoReferencia = refDate.getFullYear();
        const competenciaStr = refDate.toISOString().split('T')[0];

        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const monthFolderPatterns = [
            `${mesStr}_${monthNames[refDate.getMonth()]}`,
            `${mesStr}-${anoReferencia}`,
            monthNames[refDate.getMonth()],
            mesStr
        ];

        for (const cliente of clientes) {
            if (!cliente.drive_folder_id) continue;

            // --- PARTE A: OBRIGAÇÕES MENSAIS ---
            const rotinas = getRoutinesByClientType(cliente.regime_tributario, !!cliente.cnae_principal?.startsWith('01'));
            let targetFolders = [cliente.drive_folder_id];

            // Busca pastas do mês
            for (const pattern of monthFolderPatterns) {
                const q = `'${cliente.drive_folder_id}' in parents and name contains '${pattern}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
                const folders = await drive.files.list({ q, fields: 'files(id, name)' });
                if (folders.data.files) {
                    targetFolders.push(...folders.data.files.map(f => f.id!));
                }
            }

            for (const rotina of rotinas) {
                let status = 'pendente';
                const namePatterns: any = {
                    'DAS': ['DAS', 'PGDAS', 'Apuração'],
                    'FGTS': ['FGTS', 'GFD', 'Guia_FGTS'],
                    'INSS': ['INSS', 'GPS', 'DCTFWeb', 'GuiaPagamento'],
                    'DCTFWeb': ['DCTFWeb', 'DCTF', 'GuiaPagamento'],
                    'Folha de Pagamento': ['Folha', 'Recibo', 'Holerite', 'Pagamento']
                };

                const patterns = namePatterns[rotina.name] || [rotina.name];

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

                await supabase.from('obrigacoes_acessorias').upsert({
                    cliente_id: cliente.id,
                    tipo: rotina.name,
                    status: status,
                    competencia: competenciaStr
                }, { onConflict: 'cliente_id, tipo, competencia' });
            }

            // --- PARTE B: DESCOBERTA DE CERTIFICADOS (PASTA 04) ---
            try {
                // Busca a pasta "04"
                const certQuery = `'${cliente.drive_folder_id}' in parents and name contains '04' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
                const certFolders = await drive.files.list({ q: certQuery, fields: 'files(id, name)' });

                if (certFolders.data.files && certFolders.data.files.length > 0) {
                    const certFolderId = certFolders.data.files[0].id;
                    const pfxFiles = await drive.files.list({
                        q: `'${certFolderId}' in parents and (name contains '.pfx' or name contains '.p12') and trashed = false`,
                        fields: 'files(id, name, createdTime)'
                    });

                    if (pfxFiles.data.files) {
                        for (const pfx of pfxFiles.data.files) {
                            const { data: existing } = await supabase
                                .from('cliente_certificados')
                                .select('id, arquivo_dados')
                                .eq('cliente_id', cliente.id)
                                .eq('nome_arquivo', pfx.name)
                                .maybeSingle();

                            if (!existing) {
                                // Se não existe, cria como DRIVE_ONLY
                                let vencimento = null;
                                if (pfx.createdTime) {
                                    const d = new Date(pfx.createdTime);
                                    d.setFullYear(d.getFullYear() + 1);
                                    vencimento = d.toISOString().split('T')[0];
                                }

                                await supabase.from('cliente_certificados').insert({
                                    cliente_id: cliente.id,
                                    tipo: 'A1 (Drive)',
                                    nome_arquivo: pfx.name,
                                    data_vencimento: vencimento,
                                    arquivo_dados: 'DRIVE_ONLY',
                                    arquivo_iv: 'N/A',
                                    arquivo_tag: 'N/A',
                                    senha_dados: 'PENDENTE',
                                    senha_iv: 'N/A',
                                    senha_tag: 'N/A'
                                });
                            }
                        }
                    }
                }
            } catch (certErr) {
                console.error(`Erro certificados p/ ${cliente.nome}:`, certErr);
            }

            results.push({ id: cliente.id, status: 'Success' });
        }

        return NextResponse.json({ success: true, count: results.length });

    } catch (error: any) {
        console.error('Audit Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
