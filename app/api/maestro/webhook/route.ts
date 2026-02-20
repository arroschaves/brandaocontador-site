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
        .schema('core')
        .from('unidades_fiscais')
        .select('id, empresa_id, nome_identificador, empresas:empresa_id(razao_social)')
        .eq('drive_folder_id', folderId)
        .single();

    if (unidade) {
        unidadeId = unidade.id;
        clienteId = unidade.empresa_id;
        clienteNome = unidade.empresas?.razao_social || unidade.nome_identificador;
    } else {
        // 2b. Buscar por Empresa Direta
        const { data: cliente } = await supabase
            .schema('core')
            .from('empresas')
            .select('id, razao_social')
            .eq('drive_folder_id', folderId)
            .single();

        if (cliente) {
            clienteId = cliente.id;
            clienteNome = cliente.razao_social;
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
        // Buscar template_id
        const { data: template } = await supabase
            .schema('fiscal')
            .from('obrigacoes_templates')
            .select('id')
            .eq('nome', obligationType)
            .single();

        if (template) {
            const query = supabase.schema('fiscal').from('calendario')
                .select('id')
                .eq('template_id', template.id)
                .eq('status', 'PENDENTE')
                .limit(1);

            if (unidadeId) query.eq('unidade_fiscal_id', unidadeId);
            else if (clienteId) query.eq('empresa_id', clienteId);

            const { data: ob } = await query;

            if (ob && ob.length > 0) {
                await supabase.schema('fiscal').from('calendario').update({
                    status: 'CONCLUIDO',
                    drive_file_id: folderId, // Usando folderId como fileId simplificado se não houver guid
                    drive_file_name: fileName,
                    updated_at: new Date().toISOString()
                }).eq('id', ob[0].id);

                obligationCompleted = true;
            }
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

    // 6. Gravar no Activity Log (agora usando a estrutura correta de audit.logs)
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
    const { error } = await supabase.schema('audit').from('logs').insert({
        registro_id: data.cliente_id || null, // Updated mapping for foreign_key/id
        acao: data.tipo ? data.tipo.toUpperCase() : 'SYSTEM_EVENT',
        tabela: 'maestro_drive',
        dados_novos: {
            tipo: data.tipo,
            categoria: data.categoria || null,
            descricao: data.descricao,
            cliente_nome: data.cliente_nome,
            arquivo_nome: data.arquivo_nome,
            arquivo_url: data.arquivo_url,
            pasta_path: data.pasta_path,
            status: data.status,
            ...data.metadata
        },
        created_at: new Date().toISOString(),
    });

    if (error) {
        console.error('[ACTIVITY_LOG] Erro:', error.message);
    }
}
