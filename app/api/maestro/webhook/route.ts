import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAESTRO_SECRET = process.env.MAESTRO_SECRET || 'brandao_maestro_2026';

/**
 * Maestro Webhook - Recebe eventos de arquivos e popula activity_log + maestro_drive_sync_log
 * Eventos: file_created, file_updated, folder_created, payment_detected
 */
export async function POST(req: NextRequest) {
    // 1. Auth
    const authorization = req.headers.get('Authorization');
    if (authorization !== `Bearer ${MAESTRO_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { event, file_name, folder_id, drive_url, mime_type } = body;

        console.log(`[MAESTRO] Evento: ${event} | Arquivo: ${file_name} | Pasta: ${folder_id}`);

        const supabase = await createClient();

        if (event === 'file_created' || event === 'file_updated') {
            await handleFile(supabase, event, file_name, folder_id, drive_url);
        } else if (event === 'folder_created') {
            await logActivity(supabase, {
                tipo: 'folder_created',
                descricao: `Pasta criada: ${file_name}`,
                pasta_path: file_name,
                status: 'success',
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[MAESTRO] Erro Fatal:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function handleFile(
    supabase: any,
    event: string,
    fileName: string,
    folderId: string,
    driveUrl: string
) {
    // 2. Identificar dono do arquivo
    let clienteId: string | null = null;
    let clienteNome = 'Desconhecido';
    let unidadeId: string | null = null;
    let categoria = detectCategory(fileName);

    // 2a. Buscar por Unidade Fiscal (Fazenda)
    const { data: unidade } = await supabase
        .from('unidades_fiscais')
        .select('id, cliente_id, nome_identificador, clientes(nome)')
        .eq('drive_folder_id', folderId)
        .single();

    if (unidade) {
        unidadeId = unidade.id;
        clienteId = unidade.cliente_id;
        clienteNome = unidade.clientes?.nome || unidade.nome_identificador;
    } else {
        // 2b. Buscar por Cliente Direto
        const { data: cliente } = await supabase
            .from('clientes')
            .select('id, nome')
            .eq('drive_folder_id', folderId)
            .single();

        if (cliente) {
            clienteId = cliente.id;
            clienteNome = cliente.nome;
        }
    }

    // 3. Detectar tipo de documento e tentar completar obrigação
    const nameUpper = fileName.toUpperCase();
    let obligationCompleted = false;
    let obligationType: string | null = null;

    // Detecta se é COMPROVANTE de pagamento
    const isPaymentProof = nameUpper.includes('COMPROVANTE') ||
        nameUpper.includes('PAGO') ||
        nameUpper.includes('RECIBO_PAG');

    // Detecta tipo de obrigação
    if (nameUpper.includes('FGTS')) obligationType = 'FGTS';
    else if (nameUpper.includes('INSS')) obligationType = 'INSS';
    else if (nameUpper.includes('DAS')) obligationType = 'DAS';
    else if (nameUpper.includes('DARF')) obligationType = 'DARF';
    else if (nameUpper.includes('FOLHA')) obligationType = 'Folha de Pagamento';
    else if (nameUpper.includes('IRPF')) obligationType = 'IRPF';
    else if (nameUpper.includes('ALVARA')) obligationType = 'Alvará';

    // 4. Tentar completar obrigação pendente
    if (obligationType && (unidadeId || clienteId)) {
        const query = supabase.from('obrigacoes_acessorias')
            .select('id')
            .eq('tipo', obligationType)
            .eq('status', 'pendente')
            .limit(1);

        if (unidadeId) query.eq('unidade_fiscal_id', unidadeId);
        else if (clienteId) query.eq('cliente_id', clienteId);

        const { data: ob } = await query;

        if (ob && ob.length > 0) {
            await supabase.from('obrigacoes_acessorias').update({
                status: 'concluido',
                arquivo_url: driveUrl,
                manual_file_name: fileName,
                updated_at: new Date().toISOString()
            }).eq('id', ob[0].id);

            obligationCompleted = true;
        }
    }

    // 5. Determinar tipo de evento e descrição
    let tipo = 'upload';
    let descricao = '';
    let status = 'info';

    if (isPaymentProof && obligationType) {
        tipo = 'payment_detected';
        descricao = `Comprovante de ${obligationType} recebido de ${clienteNome}`;
        status = 'success';
    } else if (obligationCompleted && obligationType) {
        tipo = 'obligation_completed';
        descricao = `${obligationType} de ${clienteNome} concluída automaticamente`;
        status = 'success';
    } else if (clienteId) {
        tipo = event === 'file_updated' ? 'sync' : 'upload';
        descricao = `Arquivo ${fileName} recebido de ${clienteNome}`;
        status = 'info';
    } else {
        tipo = 'upload';
        descricao = `Arquivo ${fileName} recebido (cliente não identificado)`;
        status = 'warning';
    }

    // 6. Gravar no Activity Log (fonte principal para o CRM)
    await logActivity(supabase, {
        cliente_id: clienteId,
        cliente_nome: clienteNome,
        tipo,
        categoria: categoria || obligationType,
        descricao,
        arquivo_nome: fileName,
        arquivo_url: driveUrl,
        pasta_path: folderId,
        status,
        metadata: {
            event,
            unidade_fiscal_id: unidadeId,
            obligation_type: obligationType,
            obligation_completed: obligationCompleted,
            is_payment_proof: isPaymentProof,
        }
    });

    // 7. Gravar no maestro_drive_sync_log (compatibilidade com sistema antigo)
    await supabase.from('maestro_drive_sync_log').insert({
        cliente_id: clienteId,
        unidade_fiscal_id: unidadeId,
        file_name: fileName,
        file_id: folderId,
        action_type: obligationCompleted ? 'COMPLETED_OBLIGATION' : clienteId ? 'MATCHED_ENTITY' : 'UNMATCHED',
        details: descricao,
        created_at: new Date().toISOString()
    }).then(({ error }: any) => {
        if (error) console.error('[MAESTRO] Erro sync_log:', error.message);
    });

    console.log(`[MAESTRO] ✅ ${tipo}: ${descricao}`);
}

/**
 * Detecta a categoria do arquivo pelo nome
 */
function detectCategory(fileName: string): string | null {
    const upper = fileName.toUpperCase();
    if (upper.includes('FGTS')) return 'FGTS';
    if (upper.includes('INSS')) return 'INSS';
    if (upper.includes('FOLHA')) return 'RH';
    if (upper.includes('FERIAS')) return 'RH';
    if (upper.includes('RESCISAO')) return 'RH';
    if (upper.includes('FISCAL')) return 'FISCAL';
    if (upper.includes('DAS') || upper.includes('DARF')) return 'IMPOSTOS';
    if (upper.includes('IRPF')) return 'IRPF';
    if (upper.includes('ALVARA')) return 'ALVARAS';
    if (upper.includes('CND') || upper.includes('CERTID')) return 'CERTIDOES';
    return null;
}

/**
 * Grava um evento no activity_log
 */
async function logActivity(supabase: any, data: {
    cliente_id?: string | null;
    cliente_nome?: string;
    tipo: string;
    categoria?: string | null;
    descricao: string;
    arquivo_nome?: string;
    arquivo_url?: string;
    pasta_path?: string;
    status?: string;
    metadata?: Record<string, any>;
}) {
    const { error } = await supabase.from('activity_log').insert({
        cliente_id: data.cliente_id || null,
        cliente_nome: data.cliente_nome || null,
        tipo: data.tipo,
        categoria: data.categoria || null,
        descricao: data.descricao,
        arquivo_nome: data.arquivo_nome || null,
        arquivo_url: data.arquivo_url || null,
        pasta_path: data.pasta_path || null,
        status: data.status || 'info',
        metadata: data.metadata || {},
        created_at: new Date().toISOString(),
    });

    if (error) {
        console.error('[ACTIVITY_LOG] Erro:', error.message);
    }
}
