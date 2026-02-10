import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAESTRO_SECRET = process.env.MAESTRO_SECRET || 'brandao_maestro_2026';

export async function POST(req: NextRequest) {
    // 1. Auth
    const authorization = req.headers.get('Authorization');
    if (authorization !== `Bearer ${MAESTRO_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { event, file_name, folder_id, drive_url, mime_type } = body;

        console.log(`[MAESTRO] Recebido: ${file_name} (${folder_id})`);

        if (event === 'file_created') {
            await handleFile(file_name, folder_id, drive_url);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[MAESTRO] Erro Fatal:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function handleFile(fileName: string, folderId: string, driveUrl: string) {
    const supabase = await createClient();

    // 2. Busca Unidade Fiscal (Fazenda)
    let unidadeId = null;
    let clienteId = null;
    let entityName = 'Desconhecido';

    const { data: unidade } = await supabase
        .from('unidades_fiscais')
        .select('id, cliente_id, nome_identificador')
        .eq('drive_folder_id', folderId)
        .single();

    if (unidade) {
        unidadeId = unidade.id;
        clienteId = unidade.cliente_id;
        entityName = `Fazenda: ${unidade.nome_identificador}`;
    } else {
        // 3. Se não achou Unidade, busca Cliente Direto
        const { data: cliente } = await supabase
            .from('clientes')
            .select('id, nome')
            .eq('drive_folder_id', folderId)
            .single();
        
        if (cliente) {
            clienteId = cliente.id;
            entityName = `Cliente: ${cliente.nome}`;
        }
    }

    // 4. Tenta achar Obrigação Pendente (Logica simples por nome)
    // Ex: "FGTS 01-2026.pdf"
    let status = 'UNMATCHED';
    let details = `Arquivo recebido. Pasta: ${folderId}`;

    if (unidadeId || clienteId) {
        status = 'MATCHED_ENTITY';
        details = `Vinculado a ${entityName}`;

        const nameUpper = fileName.toUpperCase();
        let tipo = null;
        if (nameUpper.includes('FGTS')) tipo = 'FGTS';
        if (nameUpper.includes('FOLHA')) tipo = 'Folha de Pagamento';
        if (nameUpper.includes('DAS')) tipo = 'DAS';

        if (tipo && unidadeId) {
            // Tenta baixar obrigação automaticamente
            const { data: ob } = await supabase.from('obrigacoes_acessorias')
                .select('id')
                .eq('tipo', tipo)
                .eq('unidade_fiscal_id', unidadeId)
                .eq('status', 'pendente')
                .limit(1);
            
            if (ob && ob.length > 0) {
                await supabase.from('obrigacoes_acessorias').update({
                    status: 'concluido',
                    arquivo_url: driveUrl,
                    manual_file_name: fileName,
                    updated_at: new Date().toISOString()
                }).eq('id', ob[0].id);
                
                status = 'COMPLETED_OBLIGATION';
                details = `Obrigação ${tipo} baixada automaticamente.`;
            }
        }
    }

    // 5. SEMPRE insere Log (Para o Dashboard mostrar atividade)
    const { error } = await supabase.from('maestro_drive_sync_log').insert({
        cliente_id: clienteId,
        unidade_fiscal_id: unidadeId,
        file_name: fileName,
        file_id: folderId, // Storing folder_id as ref
        action_type: status, // MATCHED, UNMATCHED, COMPLETED
        details: details,
        created_at: new Date().toISOString()
    });

    if (error) console.error('[MAESTRO] Erro ao salvar log:', error);
    else console.log(`[MAESTRO] Log salvo: ${status} - ${fileName}`);
}
