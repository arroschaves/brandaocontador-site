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
                // --- 1. LOCALIZAR PASTAS ALVO (Smart Recursive Discovery) ---
                const targetFolderIds = new Set<string>([cliente.drive_folder_id]);
                const queue = [{ id: cliente.drive_folder_id, depth: 0 }];
                const maxDepth = 6; // Profundidade suficiente para 99% dos casos
                const foldersMap = new Map<string, string>(); // ID -> Nome da pasta
                foldersMap.set(cliente.drive_folder_id, 'RAIZ');

                // Palavras que indicam que uma pasta deve ser explorada
                const interestKeywords = [
                    'PESSOAL', 'FISCAL', 'CONTÁBIL', 'CONTABIL', 'FOLHA', 'RH',
                    '2025', '2026', 'RECIBO', 'DAS', 'FGTS', 'INSS', 'PGDAS', 'IMPOSTO', 'DCTF'
                ];

                while (queue.length > 0) {
                    const current = queue.shift()!;
                    if (current.depth >= maxDepth) continue;

                    try {
                        const folders = await drive.files.list({
                            q: `'${current.id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
                            fields: 'files(id, name)',
                            pageSize: 100 // Pastas raramente passam de 100 por nível
                        });

                        if (folders.data.files) {
                            for (const f of folders.data.files) {
                                const folderName = f.name!.toUpperCase();
                                const isYear = folderName.includes('2025') || folderName.includes('2026');
                                const hasKeyword = interestKeywords.some(k => folderName.includes(k));
                                const isMonth = folderName.includes(mesStr) || folderName.includes(currentMonthName.toUpperCase());

                                // PODA INTELIGENTE: Só entramos em pastas que pareçam úteis para contabilidade
                                if (current.depth < 2 || isYear || hasKeyword || isMonth) {
                                    foldersMap.set(f.id!, f.name!);
                                    queue.push({ id: f.id!, depth: current.depth + 1 });

                                    // Só marcamos para ler arquivos se for de fato uma pasta final de interesse
                                    if (hasKeyword || isMonth || current.depth >= 3) {
                                        targetFolderIds.add(f.id!);
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        console.error(`Erro ao explorar pasta ${current.id}:`, e);
                    }
                }

                const uniqueFolders = Array.from(targetFolderIds);
                console.log(`[MAESTRO] Escaneando total de ${uniqueFolders.length} pastas alvo para ${cliente.nome}`);

                // --- 2. FETCH ALL FILES IN PARALLEL BATCHES ---
                const allFiles: any[] = [];
                const batchSize = 15; // Processamos 15 pastas por vez para velocidade máxima
                for (let i = 0; i < uniqueFolders.length; i += batchSize) {
                    const batch = uniqueFolders.slice(i, i + batchSize);
                    const batchPromises = batch.map(async (fId) => {
                        try {
                            const parentName = foldersMap.get(fId) || '';
                            const filesRes = await drive.files.list({
                                q: `'${fId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`,
                                fields: 'files(id, name, mimeType, createdTime)',
                                pageSize: 1000
                            });
                            return (filesRes.data.files || []).map(file => ({ ...file, parentName }));
                        } catch (e) {
                            console.error(`Erro ao listar arquivos da pasta ${fId}:`, e);
                            return [];
                        }
                    });
                    const results = await Promise.all(batchPromises);
                    results.forEach(files => allFiles.push(...files));
                }
                console.log(`[MAESTRO] ${allFiles.length} arquivos totais encontrados no Drive de ${cliente.nome}`);

                // --- 3. AUDITORIA DE ROTINAS ---
                const rotinas = getRoutinesByClientType(cliente.regime_tributario, !!cliente.cnae_principal?.startsWith('01'));
                const namePatterns: any = {
                    'DAS': ['DAS', 'PGDAS', 'APURACAO', 'SIMPLES'],
                    'FGTS': ['FGTS', 'GFD', 'GUIA_FGTS', 'GRRF', 'DIGITAL'],
                    'INSS': ['INSS', 'GPS', 'DCTFWEB', 'PREVIDENCIA', 'GUIA'],
                    'DCTFWeb': ['DCTFWEB', 'DCTF', 'RECIBO'],
                    'Folha de Pagamento': ['FOLHA', 'RECIBO', 'HOLERITE', 'PAGAMENTO', 'CONTRA-CHEQUE', 'CONTRA CHEQUE', 'LIQUIDACAO', 'S-1200', 'S-1210', 'RESUMO', 'SALARIO', 'CONTRACHEQUE']
                };

                // Filtro adicional: O nome do arquivo deve conter o mês ou o nome do mês para evitar pegar arquivos de anos/meses anteriores
                const mesRegex = new RegExp(`${mesStr}|${currentMonthName.toUpperCase()}`, 'i');

                const upsertPromises = rotinas.map(rotina => {
                    const patterns = (namePatterns[rotina.name] || [rotina.name]) as string[];

                    const matchesFound = allFiles.filter((file: any) => {
                        const fileName = file.name?.toUpperCase() || '';
                        const parentName = file.parentName?.toUpperCase() || '';

                        const matchesPattern = patterns.some((p: string) => fileName.includes(p.toUpperCase()));
                        // O mês pode estar no nome do arquivo OU no nome da pasta pai (contexto)
                        const matchesMonth = mesRegex.test(fileName) || mesRegex.test(parentName);

                        return matchesPattern && matchesMonth;
                    });

                    const found = matchesFound.length > 0;

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
