
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { getRoutinesByClientType } from '@/lib/utils/accounting-intelligence'

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const clientId = body.clientId;
        const isDebug = body.debug === true;
        const supabase = await createClient();

        // 1. Buscar cliente(s)
        let queryBuilder = supabase.schema('core').from('empresas').select('*');
        if (clientId) {
            queryBuilder = queryBuilder.eq('id', clientId);
        }

        const { data: clientes, error: clientError } = await queryBuilder;
        if (clientError || !clientes || clientes.length === 0) {
            return NextResponse.json({ success: true, count: 0, message: 'Nenhum cliente processado' });
        }

        // 2. Configurar Google Drive
        const gCreds = process.env.GOOGLE_DRIVE_CREDENTIALS || process.env.GOOGLE_CREDENTIALS_JSON;
        if (!gCreds) {
            throw new Error('Configuração do Google Drive ausente (GOOGLE_DRIVE_CREDENTIALS)');
        }

        const credentials = JSON.parse(gCreds);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });
        const drive = google.drive({ version: 'v3', auth });

        const syncResults: any[] = [];
        const agora = new Date();

        // Determina a competência de referência
        const refDate = new Date(agora.getFullYear(), agora.getMonth() - (agora.getDate() < 15 ? 1 : 0), 1);
        const mesStr = (refDate.getMonth() + 1).toString().padStart(2, '0');
        const competenciaStr = refDate.toISOString().split('T')[0];
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const currentMonthName = monthNames[refDate.getMonth()].toUpperCase();

        for (const cliente of clientes) {
            if (!cliente.drive_folder_id) continue;

            const maestroLogs: string[] = [];
            const clientDebug: any = { filesFound: [], scannedFolders: [] };

            try {
                // --- 1. LOCALIZAR PASTAS ALVO (Smart Contextual Discovery) ---
                const targetFolderIds = new Set<string>([cliente.drive_folder_id]);
                const queue = [{ id: cliente.drive_folder_id, depth: 0, context: 'RAIZ' }];
                const maxDepth = 7;
                const foldersMap = new Map<string, { name: string, context: string, depth: number }>();
                foldersMap.set(cliente.drive_folder_id, { name: 'RAIZ', context: 'RAIZ', depth: 0 });

                const currentYear = refDate.getFullYear().toString();
                const monthAbbr = currentMonthName.substring(0, 3).toUpperCase();

                // Safety Belt: Evitar que varra o GDrive inteiro se a pasta id for da raiz do escritório
                let isSuspiciousRoot = false;
                let childCountCounter = 0;

                while (queue.length > 0) {
                    const current = queue.shift()!;
                    if (current.depth >= maxDepth) continue;

                    try {
                        const folders = await drive.files.list({
                            q: `'${current.id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
                            fields: 'files(id, name)',
                            pageSize: 100
                        });

                        if (folders.data.files) {
                            for (const f of folders.data.files) {
                                const folderName = f.name!.toUpperCase();
                                childCountCounter++;

                                // Bloqueio de Segurança: Se for a primeira iteração (depth=0) e tiver dezenas de pastas com nomes de CNPJs/Clientes, provavelmente amarramos o ID raiz
                                if (current.depth === 0 && childCountCounter > 15) {
                                    isSuspiciousRoot = true;
                                    // Se identificamos que isso é raiz geral, exigiremos que a pasta filha tenha no nome o CNPJ ou Razão Social do cliente
                                }

                                if (isSuspiciousRoot && current.depth === 0) {
                                    const cName = (cliente.razao_social || '').toUpperCase();
                                    const cDoc = (cliente.documento || '').replace(/\D/g, '');
                                    if (!folderName.includes(cName) && !folderName.includes(cDoc)) {
                                        continue; // Ignora pasta de outros clientes
                                    }
                                }

                                // Filtro de Ano: Ignorar anos passados
                                const yearsToIgnore = ['2021', '2022', '2023', '2024', '2025'];
                                if (yearsToIgnore.some(y => folderName.includes(y)) && !folderName.includes(currentYear)) continue;

                                // Identificar Contexto (RH ou Fiscal)
                                let nextContext = current.context;
                                if (folderName.includes('RH') || folderName.includes('PESSOAL') || folderName.includes('FOLHA')) nextContext = 'RH';
                                else if (folderName.includes('FISCAL') || folderName.includes('IMPOSTO') || folderName.includes('DAS')) nextContext = 'FISCAL';

                                const isYear = folderName.includes(currentYear);
                                const isMonth = folderName.includes(mesStr) || folderName.includes(currentMonthName) || folderName.includes(monthAbbr);

                                foldersMap.set(f.id!, { name: f.name!, context: nextContext, depth: current.depth + 1 });
                                queue.push({ id: f.id!, depth: current.depth + 1, context: nextContext });

                                if (isMonth || isYear || current.depth < 2) {
                                    targetFolderIds.add(f.id!);
                                }
                            }
                        }
                    } catch (e) {
                        console.error(`Erro ao explorar pasta ${current.id}:`, e);
                    }
                }

                const uniqueFolders = Array.from(targetFolderIds);
                if (isDebug) clientDebug.scannedFolders = uniqueFolders.map(id => foldersMap.get(id)?.name);

                // --- 2. FETCH ALL FILES ---
                const allFiles: any[] = [];
                const batchSize = 15;
                for (let i = 0; i < uniqueFolders.length; i += batchSize) {
                    const batch = uniqueFolders.slice(i, i + batchSize);
                    const batchPromises = batch.map(async (fId) => {
                        try {
                            const folderInfo = foldersMap.get(fId);
                            const filesRes = await drive.files.list({
                                q: `'${fId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`,
                                fields: 'files(id, name, mimeType, createdTime, size)',
                                pageSize: 1000
                            });
                            return (filesRes.data.files || []).map(file => ({
                                ...file,
                                parentName: folderInfo?.name || '',
                                context: folderInfo?.context || 'RAIZ',
                                depth: folderInfo?.depth || 0
                            }));
                        } catch (e) {
                            return [];
                        }
                    });
                    const results = await Promise.all(batchPromises);
                    results.forEach(files => allFiles.push(...files));
                }

                if (isDebug) clientDebug.filesFound = allFiles.map(f => ({
                    id: f.id,
                    name: f.name,
                    parentName: f.parentName,
                    context: f.context,
                    createdTime: f.createdTime
                }));

                // --- 3. AUDITORIA DE ROTINAS ---
                const { data: templates } = await supabase.schema('fiscal').from('obrigacoes_templates').select('id, nome');
                const rotinas = getRoutinesByClientType(cliente.regime_tributario, !!cliente.cnae_principal?.startsWith('01'));
                const namePatterns: any = {
                    'DAS': ['DAS', 'PGDAS', 'APURACAO', 'SIMPLES', 'EXTRATO', 'DECLARACAO', 'SIMPLES_NACIONAL'],
                    'FGTS': ['FGTS', 'GFD', 'GUIA_FGTS', 'GRRF', 'DIGITAL', 'SEFIP', 'RELAÇÃO_FGTS'],
                    'INSS': ['INSS', 'GPS', 'DCTFWEB', 'PREVIDENCIA', 'GUIA', 'DARF_PREVIDENCIARIO'],
                    'DCTFWeb': ['DCTFWEB', 'DCTF', 'RECIBO', 'TRANSMISSAO', 'COMPROVANTE_DCTF'],
                    'Folha de Pagamento': ['FOLHA', 'RECIBO', 'HOLERITE', 'PAGAMENTO', 'CONTRA-CHEQUE', 'CONTRA CHEQUE', 'LIQUIDACAO', 'S-1200', 'S-1210', 'RESUMO', 'SALARIO', 'CONTRACHEQUE', 'PRO-LABORE', 'PROLABORE', 'RELAÇÃO', 'RELACAO', 'COMPROVANTE', 'EVENTO', 'FOLHA_DE_PAGAMENTO']
                };

                const monthNumShort = parseInt(mesStr).toString();
                const mesRegex = new RegExp(`(?:_|^|[^0-9])(?:0?${monthNumShort})(?:_|$|[^0-9])|${currentMonthName}|${monthAbbr}`, 'i');

                const upsertPromises = rotinas.map(rotina => {
                    const patterns = (namePatterns[rotina.name] || [rotina.name]) as string[];
                    const matchesFound = allFiles.filter((file: any) => {
                        const fileName = file.name?.toUpperCase() || '';
                        const parentName = file.parentName?.toUpperCase() || '';
                        const matchesPattern = patterns.some((p: string) => fileName.includes(p.toUpperCase()));
                        const fileDate = file.createdTime ? new Date(file.createdTime) : null;
                        const isCreatedIn2026 = fileDate && fileDate.getFullYear() === refDate.getFullYear();
                        const isRecentInWindow = isCreatedIn2026 && (fileDate.getMonth() === refDate.getMonth() || fileDate.getMonth() === (refDate.getMonth() + 1) % 12);
                        const matchesMonth = mesRegex.test(fileName) || mesRegex.test(parentName);
                        const matchesYear = fileName.includes(currentYear) || parentName.includes(currentYear) || file.depth >= 3;
                        const isRHContext = file.context === 'RH';
                        const isFiscalContext = file.context === 'FISCAL';

                        let isMatch = false;
                        if (matchesPattern) {
                            if (matchesMonth && matchesYear) isMatch = true;
                            else if (isRecentInWindow && file.depth >= 3) isMatch = true;
                        }
                        if (!isMatch && matchesMonth && matchesYear) {
                            if (rotina.name === 'Folha de Pagamento' && isRHContext) isMatch = true;
                            if (rotina.name === 'DAS' && isFiscalContext) isMatch = true;
                        }
                        return isMatch;
                    });

                    const found = matchesFound.length > 0;
                    if (!found) return Promise.resolve(null); // Não criar pendentes aqui, apenas marcar concluídos detectados

                    const template = templates?.find(t => t.nome === rotina.name);
                    if (!template) return Promise.resolve(null);

                    return supabase.schema('fiscal').from('calendario').upsert({
                        empresa_id: cliente.id,
                        template_id: template.id,
                        status: 'CONCLUIDO',
                        ano_referencia: refDate.getFullYear(),
                        mes_referencia: refDate.getMonth() + 1,
                        data_vencimento: new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0), // Último dia do mês
                    }, { onConflict: 'empresa_id, template_id, ano_referencia, mes_referencia' });
                });

                await Promise.all(upsertPromises);
                syncResults.push({ id: cliente.id, success: true, debug: isDebug ? clientDebug : undefined });

            } catch (e: any) {
                console.error(`Erro ao sincronizar cliente ${cliente.id}:`, e);
                syncResults.push({ id: cliente.id, success: false, error: e.message });
            }
        }

        return NextResponse.json({ success: true, results: syncResults });

    } catch (error: any) {
        console.error('[Sync Error]:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
