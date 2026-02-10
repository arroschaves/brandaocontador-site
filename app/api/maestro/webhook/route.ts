import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { google } from 'googleapis';

const MAESTRO_SECRET = process.env.MAESTRO_SECRET || 'brandao_maestro_2026';

// Configuração do Google Drive API (Opcional, se quisermos que o servidor faça a recursividade)
// Mas vamos tentar resolver via Banco primeiro, que é mais rápido.

export async function POST(req: NextRequest) {
    const authorization = req.headers.get('Authorization');

    if (authorization !== `Bearer ${MAESTRO_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { event, file_name, folder_id, drive_url, mime_type } = body;

        console.log(`[MAESTRO WEBHOOK] Evento recebido: ${file_name} na pasta ${folder_id}`);

        if (event === 'file_created') {
            await handleFileCreated(file_name, folder_id, drive_url, mime_type);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[MAESTRO WEBHOOK] Erro:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function handleFileCreated(fileName: string, folderId: string, driveUrl: string, mimeType: string) {
    const supabase = await createClient();

    // 1. Tenta achar a Unidade Fiscal (Fazenda) DIRETAMENTE pelo folder_id
    let unidadeId = null;
    let clienteId = null;
    let nomeUnidade = 'Desconhecida';

    const { data: unidadeDireta } = await supabase
        .from('unidades_fiscais')
        .select('id, cliente_id, nome_identificador')
        .eq('drive_folder_id', folderId)
        .single();

    if (unidadeDireta) {
        unidadeId = unidadeDireta.id;
        clienteId = unidadeDireta.cliente_id;
        nomeUnidade = unidadeDireta.nome_identificador;
        console.log(`[MAESTRO] ✅ Arquivo na RAIZ da Fazenda: ${nomeUnidade}`);
    } else {
        // 2. Se não achou, pode ser uma SUBPASTA (ex: FGTS, FOLHA).
        // Precisamos descobrir quem é o PAI dessa pasta no Drive.
        // Como o servidor não tem o token do usuário fácil aqui, vamos assumir que o n8n
        // poderia enviar o parent_path ou parent_id, mas vamos simplificar:

        // Estratégia de "Busca Reversa" via Banco (se tivermos mapeado as subpastas)
        // Por enquanto, se cair numa subpasta desconhecida, vamos tentar inferir pelo NOME do arquivo + ALGUMA unidade do cliente?
        // Não é seguro.

        console.log(`[MAESTRO] ⚠️ Pasta ${folderId} não é uma Fazenda mapeada diretamente.`);
        // TODO: Implementar lógica de "Find Parent" usando Google Drive API aqui no servidor
        // (Requer credenciais de serviço)
        return;
    }

    if (!unidadeId) return;

    // 3. Classificação e Vínculo com Obrigação
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM

    let tipoObrigacao = null;
    const nameUpper = fileName.toUpperCase();

    if (nameUpper.includes('FGTS')) tipoObrigacao = 'FGTS';
    if (nameUpper.includes('GPS') || nameUpper.includes('INSS')) tipoObrigacao = 'GPS';
    if (nameUpper.includes('FOLHA') || nameUpper.includes('PAGAMENTO')) tipoObrigacao = 'Folha de Pagamento';
    if (nameUpper.includes('DCTF')) tipoObrigacao = 'DCTFWeb';

    if (tipoObrigacao) {
        // Busca obrigação PENDENTE desse tipo para essa unidade
        const { data: obrigacoes } = await supabase
            .from('obrigacoes_acessorias')
            .select('id')
            .eq('tipo', tipoObrigacao)
            .eq('unidade_fiscal_id', unidadeId)
            .eq('status', 'pendente')
            .limit(1);

        if (obrigacoes && obrigacoes.length > 0) {
            const obId = obrigacoes[0].id;

            // Atualiza obrigação
            await supabase
                .from('obrigacoes_acessorias')
                .update({
                    status: 'concluido',
                    arquivo_url: driveUrl,
                    manual_file_name: fileName,
                    maestro_log: `Arquivo recebido via Drive em ${new Date().toLocaleString()}`
                })
                .eq('id', obId);

            console.log(`[MAESTRO] 🎯 Obrigação ${tipoObrigacao} CONCLUÍDA para ${nomeUnidade}!`);

            // Registrar Log
            await supabase.from('maestro_drive_sync_log').insert({
                cliente_id: clienteId,
                unidade_fiscal_id: unidadeId,
                file_name: fileName,
                file_id: folderId, // Usando folderId temporariamente como ID do arquivo se n8n n mandar fileId
                action_type: 'MATCHED',
                details: `Obrigação ${tipoObrigacao} baixada.`
            });

        } else {
            console.log(`[MAESTRO] ℹ️ Documento ${tipoObrigacao} recebido, mas não havia pendência aberta.`);
            // Opcional: Criar obrigação "Avulsa" ou apenas logar
            await supabase.from('maestro_drive_sync_log').insert({
                cliente_id: clienteId,
                unidade_fiscal_id: unidadeId,
                file_name: fileName,
                file_id: folderId,
                action_type: 'UNMATCHED',
                details: `Arquivo ${tipoObrigacao} sem pendência correspondente.`
            });
        }
    } else {
        console.log(`[MAESTRO] ❓ Arquivo não reconhecido como obrigação: ${fileName}`);
    }
}
