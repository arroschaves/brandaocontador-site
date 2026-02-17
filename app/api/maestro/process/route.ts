import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse, NextRequest } from 'next/server'

/**
 * Maestro Vision API - Receptor de Inteligência Documental
 * 
 * Esta API é o ponto de entrada soberano para os dados extraídos pela IA (via n8n).
 * Ela garante a integridade entre o arquivo físico (Drive) e os metadados contábeis.
 */

interface MaestroProcessPayload {
    drive_file_id: string;
    empresa_id: string;
    tipo: string;
    competencia?: string;
    vencimento?: string;
    valor?: number;
    metadata_ia?: any;
    nome_arquivo?: string;
    status_processamento?: 'sucesso' | 'erro' | 'revisao';
}

export async function POST(request: NextRequest) {
    try {
        const payload: MaestroProcessPayload = await request.json();
        const supabase = createAdminClient();

        console.log(`[Maestro Vision] Processando arquivo: ${payload.drive_file_id} (${payload.tipo})`);

        // 1. Validar campos obrigatórios
        if (!payload.drive_file_id || !payload.empresa_id || !payload.tipo) {
            return NextResponse.json({ error: 'Campos drive_file_id, empresa_id e tipo são obrigatórios.' }, { status: 400 });
        }

        // 2. Garantir que o documento existe na tabela de base (storage_docs.documentos)
        // Se não existir, criamos o registro básico
        let { data: documento, error: docError } = await supabase
            .schema('storage_docs')
            .from('documentos')
            .select('id')
            .eq('drive_file_id', payload.drive_file_id)
            .single();

        if (docError && docError.code !== 'PGRST116') { // PGRST116 = Not Found
            throw new Error(`Erro ao buscar documento base: ${docError.message}`);
        }

        let documentoId = documento?.id;

        if (!documentoId) {
            console.log(`[Maestro Vision] Documento não encontrado, criando registro base para drive_file_id: ${payload.drive_file_id}`);
            const { data: newDoc, error: createError } = await supabase
                .schema('storage_docs')
                .from('documentos')
                .insert({
                    drive_file_id: payload.drive_file_id,
                    empresa_id: payload.empresa_id,
                    nome_arquivo: payload.nome_arquivo || 'Arquivo Maestro IA',
                    tipo: payload.tipo,
                    competencia: payload.competencia || null
                })
                .select()
                .single();

            if (createError) throw new Error(`Erro ao criar documento base: ${createError.message}`);
            documentoId = newDoc.id;
        }

        // 3. Inserir na tabela de inteligência (compliance.documentos_processados)
        const { data: processed, error: procError } = await supabase
            .schema('compliance')
            .from('documentos_processados')
            .insert({
                documento_id: documentoId,
                empresa_id: payload.empresa_id,
                tipo: payload.tipo, // O Postgres validará contra o ENUM automaticamente
                competencia: payload.competencia || null,
                vencimento: payload.vencimento || null,
                valor: payload.valor || 0,
                metadata_ia: payload.metadata_ia || {},
                status_processamento: payload.status_processamento || 'sucesso'
            })
            .select()
            .single();

        if (procError) {
            console.error(`[Maestro Vision] Erro ao salvar inteligência: ${procError.message}`);
            throw new Error(`Erro ao salvar dados processados: ${procError.message}`);
        }

        // 4. Auditoria Automática (O trigger audit.log_geral já cuidará disso no banco)

        return NextResponse.json({
            success: true,
            id: processed.id,
            vencimento: processed.vencimento,
            valor: processed.valor
        });

    } catch (err: any) {
        console.error('[Maestro Vision API Error]:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
