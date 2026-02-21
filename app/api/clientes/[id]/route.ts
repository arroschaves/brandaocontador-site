import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse, NextRequest } from 'next/server'

// Mapeamento dos campos atualizados permitidos (Schema `core`)
const CAMPOS_PERMITIDOS = [
    'documento',
    'razao_social',
    'nome_fantasia',
    'email',
    'telefone',
    'regime_tributario',
    'cnae_principal',
    'cnaes_secundarios',
    'logradouro',
    'numero',
    'bairro',
    'cep',
    'cidade',
    'estado',
    'inscricao_estadual',
    'inscricao_municipal',
    'status_rfb',
    'natureza_juridica',
    'porte',
    'tipo_pessoa',
    'atendimento_automatico',
    'capital_social',
    'inicio_atividade',
    'quadro_societario',
    'simples_nacional',
    'tipo_cadastro',
];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const rawData = await request.json();
        const supabase = createAdminClient();

        // Limpeza dos dados
        const cleanData: Record<string, any> = {};
        for (const [key, value] of Object.entries(rawData)) {
            if (value === '' || value === null || value === undefined) continue;
            if (CAMPOS_PERMITIDOS.includes(key)) {
                cleanData[key] = value;
            }
        }

        console.log(`[CLIENT API UPDATE] Atualizando cliente ${id}`, cleanData);

        const { data, error } = await supabase
            .schema('core')
            .from('empresas')
            .update(cleanData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[CLIENT API UPDATE] Erro no update:', error);
            throw error;
        }

        return NextResponse.json({ success: true, client: data });

    } catch (error: any) {
        console.error('[CLIENT API UPDATE] Erro inesperado:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno ao atualizar cliente' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = createAdminClient();

        console.log(`[CLIENT API DELETE] Excluindo cliente ${id}`);

        const { error } = await supabase
            .schema('core')
            .from('empresas')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('[CLIENT API DELETE] Erro no delete:', error);
            throw error;
        }

        return NextResponse.json({ success: true, message: 'Cliente excluído com sucesso.' });

    } catch (error: any) {
        console.error('[CLIENT API DELETE] Erro inesperado:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno ao excluir cliente' },
            { status: 500 }
        );
    }
}
