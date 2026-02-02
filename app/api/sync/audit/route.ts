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
        } else {
            // Se não houver ID, por segurança no Radar Global do Backend, buscamos todos
            // Mas agora o frontend orquestra um por um.
        }

        const { data: clientes, error: clientError } = await queryBuilder;
        if (clientError || !clientes || clientes.length === 0) {
            return NextResponse.json({ success: true, count: 0, message: 'Nenhum cliente processado' });
        }

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
        const competenciaStr = refDate.toISOString().split('T')[0];
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const currentMonthName = monthNames[refDate.getMonth()];

        for (const cliente of clientes) {
            if (!cliente.drive_folder_id) continue;

            try {
                // --- 1. LOCALIZAR PASTAS ALVO (Mês Atual/Departamentos) ---
                const targetFolderIds = [cliente.drive_folder_id];

                // Busca inicial de pastas que contenham o mês
                const folderQuery = `'${cliente.drive_folder_id}' in parents and (name contains '${currentMonthName}' or name contains '${mesStr}') and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
                const monthFolders = await drive.files.list({ q: folderQuery, fields: 'files(id, name)' });

                if (monthFolders.data.files) {
                    targetFolderIds.push(...monthFolders.data.files.map(f => f.id!));
                }

                // Busca pastas de departamentos (nível 1)
                const deptQuery = `'${cliente.drive_folder_id}' in parents and (name contains 'Pessoal' or name contains 'Fiscal' or name contains 'Contábil' or name contains 'Folha') and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
                const depts = await drive.files.list({ q: deptQuery, fields: 'files(id, name)' });

                if (depts.data.files) {
                    for (const dept of depts.data.files) {
                        targetFolderIds.push(dept.id!);
                        // Busca subpastas de mês dentro dos depts
                        const subQ = `'${dept.id}' in parents and (name contains '${currentMonthName}' or name contains '${mesStr}') and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
                        const subMonthFolders = await drive.files.list({ q: subQ, fields: 'files(id, name)' });
                        if (subMonthFolders.data.files) {
                            targetFolderIds.push(...subMonthFolders.data.files.map(sf => sf.id!));
                        }
                    }
                }

                const uniqueFolders = [...new Set(targetFolderIds)];

                // --- 2. FETCH ALL FILES IN TARGET FOLDERS (OTIMIZAÇÃO CRÍTICA) ---
                const allFiles: any[] = [];
                for (const fId of uniqueFolders) {
                    const filesRes = await drive.files.list({
                        q: `'${fId}' in parents and trashed = false`,
                        fields: 'files(id, name, mimeType, createdTime)'
                    });
                    if (filesRes.data.files) {
                        allFiles.push(...filesRes.data.files);
                    }
                }

                // --- 3. AUDITORIA DE ROTINAS ---
                const rotinas = getRoutinesByClientType(cliente.regime_tributario, !!cliente.cnae_principal?.startsWith('01'));
                const namePatterns: any = {
                    'DAS': ['DAS', 'PGDAS', 'Apuração'],
                    'FGTS': ['FGTS', 'GFD', 'Guia_FGTS', 'GRRF'],
                    'INSS': ['INSS', 'GPS', 'DCTFWeb', 'GuiaPagamento'],
                    'DCTFWeb': ['DCTFWeb', 'DCTF', 'GuiaPagamento'],
                    'Folha de Pagamento': ['Folha', 'Recibo', 'Holerite', 'Pagamento', 'S-1200', 'Resumo']
                };

                const upsertPromises = rotinas.map(rotina => {
                    const patterns = (namePatterns[rotina.name] || [rotina.name]) as string[];
                    const found = allFiles.some((file: any) =>
                        patterns.some((p: string) => file.name?.toUpperCase().includes(p.toUpperCase()))
                    );

                    return supabase.from('obrigacoes_acessorias').upsert({
                        cliente_id: cliente.id,
                        tipo: rotina.name,
                        status: found ? 'concluido' : 'pendente',
                        competencia: competenciaStr
                    }, { onConflict: 'cliente_id, tipo, competencia' });
                });

                await Promise.all(upsertPromises);

                // --- 4. CERTIFICADOS (PASTA 04) ---
                // Otimização: Se já lemos a pasta 04 no allFiles (provavelmente não, pois ela não costuma ter 'Pessoal' no nome)
                // Vamos buscar especificamente a '04' se ela não estiver nos uniqueFolders
                const folder04 = allFiles.find(f => f.mimeType === 'application/vnd.google-apps.folder' && f.name.includes('04'));
                let certFiles: any[] = [];

                if (folder04) {
                    const res04 = await drive.files.list({
                        q: `'${folder04.id}' in parents and (name contains '.pfx' or name contains '.p12') and trashed = false`,
                        fields: 'files(id, name, createdTime)'
                    });
                    certFiles = res04.data.files || [];
                } else {
                    // Busca tradicional se não achou no cache inicial
                    const certSearch = await drive.files.list({
                        q: `'${cliente.drive_folder_id}' in parents and name contains '04' and trashed = false`,
                        fields: 'files(id, name)'
                    });
                    if (certSearch.data.files && certSearch.data.files.length > 0) {
                        const res04 = await drive.files.list({
                            q: `'${certSearch.data.files[0].id}' in parents and (name contains '.pfx' or name contains '.p12') and trashed = false`,
                            fields: 'files(id, name, createdTime)'
                        });
                        certFiles = res04.data.files || [];
                    }
                }

                for (const pfx of certFiles) {
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
                            arquivo_iv: 'N/A', arquivo_tag: 'N/A',
                            senha_dados: 'PENDENTE',
                            senha_iv: 'N/A', senha_tag: 'N/A'
                        });
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
