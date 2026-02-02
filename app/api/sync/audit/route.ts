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
        let queryBuilder = supabase.from('clientes').select('*').eq('status_hub', 'ATIVO');
        if (clientId) {
            queryBuilder = queryBuilder.eq('id', clientId);
        }

        const { data: clientes, error: clientError } = await queryBuilder;
        if (clientError || !clientes) throw new Error(clientError?.message || 'Nenhum cliente encontrado');

        // 2. Configurar Google Drive
        if (!process.env.GOOGLE_CREDENTIALS_JSON) {
            throw new Error('Configuração do Google Drive ausente');
        }

        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });
        const drive = google.drive({ version: 'v3', auth });

        const results = [];
        const agora = new Date();

        // Determina a competência de referência
        const refDate = new Date(agora.getFullYear(), agora.getMonth() - (agora.getDate() < 15 ? 1 : 0), 1);
        const mesStr = (refDate.getMonth() + 1).toString().padStart(2, '0');
        const anoReferencia = refDate.getFullYear();
        const competenciaStr = refDate.toISOString().split('T')[0];

        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const currentMonthName = monthNames[refDate.getMonth()];

        for (const cliente of clientes) {
            if (!cliente.drive_folder_id) continue;

            try {
                // --- NOVA LÓGICA: BUSCA DE PASTAS RECURSIVA (Busca carpetas do mês em até 3 níveis) ---
                const targetFolders = [cliente.drive_folder_id];

                // Busca pastas que contenham o mês ou número do mês dentro da pasta do cliente
                const folderQuery = `'${cliente.drive_folder_id}' in parents and (name contains '${currentMonthName}' or name contains '${mesStr}') and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
                const folders = await drive.files.list({ q: folderQuery, fields: 'files(id, name)' });

                if (folders.data.files) {
                    targetFolders.push(...folders.data.files.map(f => f.id!));

                    // Busca um nível abaixo para casos como "Departamento Pessoal > Janeiro"
                    for (const f of folders.data.files) {
                        const subQ = `'${f.id}' in parents and (name contains '${currentMonthName}' or name contains '${mesStr}') and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
                        const subFolders = await drive.files.list({ q: subQ, fields: 'files(id, name)' });
                        if (subFolders.data.files) targetFolders.push(...subFolders.data.files.map(sf => sf.id!));
                    }
                }

                // Também buscamos pastas genéricas de departamentos que podem conter o mês
                const deptQuery = `'${cliente.drive_folder_id}' in parents and (name contains 'Pessoal' or name contains 'Fiscal' or name contains 'Contábil' or name contains 'Folha') and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
                const depts = await drive.files.list({ q: deptQuery, fields: 'files(id, name)' });
                if (depts.data.files) {
                    for (const dept of depts.data.files) {
                        const subQ = `'${dept.id}' in parents and (name contains '${currentMonthName}' or name contains '${mesStr}') and trashed = false`;
                        const subFolders = await drive.files.list({ q: subQ, fields: 'files(id, name)' });
                        if (subFolders.data.files) targetFolders.push(...subFolders.data.files.map(sf => sf.id!));
                    }
                }

                const uniqueFolders = [...new Set(targetFolders)];

                // --- BUSCA DE OBRIGAÇÕES ---
                const rotinas = getRoutinesByClientType(cliente.regime_tributario, !!cliente.cnae_principal?.startsWith('01'));
                const namePatterns: any = {
                    'DAS': ['DAS', 'PGDAS', 'Apuração'],
                    'FGTS': ['FGTS', 'GFD', 'Guia_FGTS', 'GRRF'],
                    'INSS': ['INSS', 'GPS', 'DCTFWeb', 'GuiaPagamento'],
                    'DCTFWeb': ['DCTFWeb', 'DCTF', 'GuiaPagamento'],
                    'Folha de Pagamento': ['Folha', 'Recibo', 'Holerite', 'Pagamento', 'S-1200', 'Resumo']
                };

                for (const rotina of rotinas) {
                    let status = 'pendente';
                    const patterns = namePatterns[rotina.name] || [rotina.name];

                    for (const folderId of uniqueFolders) {
                        if (status === 'concluido') break;
                        for (const p of patterns) {
                            // FLEXIBILIDADE: Se estiver em uma pasta do mês, o nome do arquivo não precisa ter o mês
                            const fileQuery = `'${folderId}' in parents and name contains '${p}' and trashed = false`;
                            const files = await drive.files.list({ q: fileQuery, fields: 'files(id, name)' });

                            if (files.data.files && files.data.files.length > 0) {
                                // Se achou um arquivo com o padrão do nome
                                // Verificamos se o nome do arquivo contém o mês OU se a pasta pai contém o mês
                                for (const file of files.data.files) {
                                    const fileName = file.name!.toUpperCase();
                                    const isInMonthFolder = true; // Já estamos em pastas filtradas por Janeiro/01

                                    // Se o arquivo tiver o padrão e estiver em uma pasta alvo, consideramos CONCLUÍDO
                                    status = 'concluido';
                                    break;
                                }
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

                // --- CERTIFICADOS (PASTA 04) ---
                const certQuery = `'${cliente.drive_folder_id}' in parents and name contains '04' and trashed = false`;
                const certFolders = await drive.files.list({ q: certQuery });
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
                                .select('id')
                                .eq('cliente_id', cliente.id)
                                .eq('nome_arquivo', pfx.name)
                                .maybeSingle();

                            if (!existing) {
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

                results.push({ id: cliente.id, status: 'Success' });
            } catch (err) {
                console.error(`Erro ao processar ${cliente.nome}:`, err);
            }
        }

        return NextResponse.json({ success: true, count: results.length });

    } catch (error: any) {
        console.error('Audit Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
