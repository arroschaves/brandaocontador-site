import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

/**
 * 🔄 Drive Watcher v2 — Cron Job (a cada 5 min)
 * 
 * Fluxo:
 * 1. Busca último scan (last_scan_at) do Supabase
 * 2. Varre Google Drive: arquivos criados/modificados depois do último scan
 * 3. Cada arquivo detectado → insere em activity_log + tenta completar obrigação
 * 4. Atualiza last_scan_at
 * 
 * Configuração: Vercel Cron ou chamada manual GET
 * Endpoint: /api/cron/drive-watcher
 */

// Proteção: só aceita cron do Vercel ou chamada com token
const CRON_SECRET = process.env.CRON_SECRET || process.env.MAESTRO_SECRET || 'brandao_maestro_2026';

export async function GET(req: Request) {
    // Verificar autorização (Vercel envia header especial)
    const authHeader = req.headers.get('Authorization');
    const cronHeader = req.headers.get('x-vercel-cron'); // Vercel Cron envia isso automaticamente

    if (!cronHeader && authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startTime = Date.now();

    try {
        const supabase = await createClient();

        // 1. Buscar último scan
        const { data: scanState } = await supabase
            .from('drive_scan_state')
            .select('*')
            .order('last_scan_at', { ascending: false })
            .limit(1)
            .single();

        // Se não houver state, usar 5 minutos atrás
        const lastScanAt = scanState?.last_scan_at
            ? new Date(scanState.last_scan_at)
            : new Date(Date.now() - 5 * 60 * 1000);

        console.log(`[DRIVE-WATCHER] Último scan: ${lastScanAt.toISOString()}`);

        // 2. Configurar Google Drive API
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON!);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });
        const drive = google.drive({ version: 'v3', auth });

        // 3. Buscar clientes com pasta no Drive
        const { data: clientes } = await supabase
            .from('clientes')
            .select('id, nome, drive_folder_id, cnpj_cpf, telefone_whatsapp')
            .not('drive_folder_id', 'is', null);

        if (!clientes || clientes.length === 0) {
            console.log('[DRIVE-WATCHER] Nenhum cliente com pasta no Drive.');
            return NextResponse.json({ success: true, message: 'No clients with Drive folders', filesFound: 0 });
        }

        console.log(`[DRIVE-WATCHER] Varrendo ${clientes.length} clientes...`);

        let totalFiles = 0;
        let totalActivities = 0;
        const errors: string[] = [];

        // 4. Varrer cada cliente
        for (const cliente of clientes) {
            try {
                // Buscar arquivos criados/modificados após último scan (recursivo via query)
                const q = `'${cliente.drive_folder_id}' in parents and trashed = false and modifiedTime > '${lastScanAt.toISOString()}'`;

                const filesResponse = await drive.files.list({
                    q,
                    fields: 'files(id, name, parents, mimeType, webViewLink, createdTime, modifiedTime)',
                    orderBy: 'modifiedTime desc',
                    pageSize: 50,
                });

                const files = filesResponse.data.files || [];

                if (files.length === 0) continue;

                totalFiles += files.length;
                console.log(`[DRIVE-WATCHER] ${cliente.nome}: ${files.length} arquivo(s) novo(s)`);

                for (const file of files) {
                    // Ignorar pastas (apenas arquivos)
                    if (file.mimeType === 'application/vnd.google-apps.folder') continue;

                    // Verificar se já processamos este arquivo (evitar duplicatas)
                    const { data: existing } = await supabase
                        .from('activity_log')
                        .select('id')
                        .eq('arquivo_nome', file.name)
                        .eq('cliente_id', cliente.id)
                        .gte('created_at', lastScanAt.toISOString())
                        .limit(1);

                    if (existing && existing.length > 0) continue;

                    // Detectar categoria e tipo
                    const nameUpper = (file.name || '').toUpperCase();
                    const categoria = detectCategory(nameUpper);
                    const isPayment = nameUpper.includes('COMPROVANTE') || nameUpper.includes('PAGO') || nameUpper.includes('RECIBO_PAG');
                    const obligationType = detectObligation(nameUpper);

                    // Tentar completar obrigação pendente
                    let obligationCompleted = false;
                    if (obligationType) {
                        const { data: ob } = await supabase
                            .from('obrigacoes_acessorias')
                            .select('id')
                            .eq('cliente_id', cliente.id)
                            .eq('tipo', obligationType)
                            .eq('status', 'pendente')
                            .limit(1);

                        if (ob && ob.length > 0) {
                            await supabase.from('obrigacoes_acessorias').update({
                                status: 'concluido',
                                arquivo_url: file.webViewLink,
                                manual_file_name: file.name,
                                updated_at: new Date().toISOString()
                            }).eq('id', ob[0].id);
                            obligationCompleted = true;
                        }
                    }

                    // Determinar tipo de evento
                    let tipo = 'upload';
                    let descricao = '';
                    let status = 'info';

                    if (isPayment && obligationType) {
                        tipo = 'payment_detected';
                        descricao = `Comprovante de ${obligationType} de ${cliente.nome}`;
                        status = 'success';
                    } else if (obligationCompleted && obligationType) {
                        tipo = 'obligation_completed';
                        descricao = `${obligationType} de ${cliente.nome} concluída automaticamente`;
                        status = 'success';
                    } else {
                        descricao = `Novo arquivo: ${file.name} — ${cliente.nome}`;
                    }

                    // Inserir no activity_log
                    await supabase.from('activity_log').insert({
                        cliente_id: cliente.id,
                        cliente_nome: cliente.nome,
                        tipo,
                        categoria: categoria || obligationType,
                        descricao,
                        arquivo_nome: file.name,
                        arquivo_url: file.webViewLink,
                        pasta_path: file.parents?.[0] || cliente.drive_folder_id,
                        status,
                        metadata: {
                            source: 'drive-watcher-cron',
                            mime_type: file.mimeType,
                            file_id: file.id,
                            obligation_type: obligationType,
                            obligation_completed: obligationCompleted,
                            is_payment: isPayment,
                        },
                        created_at: file.createdTime || new Date().toISOString(),
                    });

                    totalActivities++;
                    console.log(`  ✅ ${tipo}: ${file.name}`);
                }
            } catch (clientErr: any) {
                const errMsg = `Erro ao varrer ${cliente.nome}: ${clientErr.message}`;
                console.error(`[DRIVE-WATCHER] ${errMsg}`);
                errors.push(errMsg);
            }
        }

        // 5. Atualizar state do último scan
        const duration = Date.now() - startTime;
        await supabase.from('drive_scan_state').insert({
            last_scan_at: new Date().toISOString(),
            total_files_found: totalFiles,
            total_activities_created: totalActivities,
            scan_duration_ms: duration,
            error_message: errors.length > 0 ? errors.join('; ') : null,
        });

        console.log(`[DRIVE-WATCHER] ✅ Scan completo: ${totalFiles} arquivos, ${totalActivities} atividades, ${duration}ms`);

        return NextResponse.json({
            success: true,
            filesFound: totalFiles,
            activitiesCreated: totalActivities,
            clientesVarridos: clientes.length,
            durationMs: duration,
            errors: errors.length > 0 ? errors : undefined,
        });

    } catch (error: any) {
        console.error('[DRIVE-WATCHER] ❌ Erro fatal:', error.message);

        // Registrar erro no state
        try {
            const supabase = await createClient();
            await supabase.from('drive_scan_state').insert({
                last_scan_at: new Date().toISOString(),
                total_files_found: 0,
                total_activities_created: 0,
                scan_duration_ms: Date.now() - startTime,
                error_message: error.message,
            });
        } catch (_) { /* silencioso */ }

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/** Detecta a categoria do arquivo pelo nome */
function detectCategory(upper: string): string | null {
    if (upper.includes('FGTS')) return 'FGTS';
    if (upper.includes('INSS')) return 'INSS';
    if (upper.includes('FOLHA') || upper.includes('FERIAS') || upper.includes('RESCISAO')) return 'RH';
    if (upper.includes('FISCAL') || upper.includes('NFE') || upper.includes('NFSE')) return 'FISCAL';
    if (upper.includes('DAS') || upper.includes('DARF')) return 'IMPOSTOS';
    if (upper.includes('IRPF') || upper.includes('DIRF')) return 'IRPF';
    if (upper.includes('ALVARA')) return 'ALVARAS';
    if (upper.includes('CND') || upper.includes('CERTID')) return 'CERTIDOES';
    if (upper.includes('CONTRATO')) return 'CONTRATOS';
    if (upper.includes('BALANCO') || upper.includes('BALANÇO')) return 'CONTABIL';
    return null;
}

/** Detecta o tipo de obrigação pelo nome do arquivo */
function detectObligation(upper: string): string | null {
    if (upper.includes('FGTS')) return 'FGTS Digital';
    if (upper.includes('INSS')) return 'INSS';
    if (upper.includes('DAS')) return 'DAS';
    if (upper.includes('DARF')) return 'DARF';
    if (upper.includes('DCTF')) return 'DCTFWeb';
    if (upper.includes('PGDAS')) return 'PGDAS-D';
    if (upper.includes('REINF') || upper.includes('EFD')) return 'EFD-Reinf';
    if (upper.includes('IRPF')) return 'IRPF';
    if (upper.includes('FOLHA')) return 'Folha de Pagamento';
    return null;
}
