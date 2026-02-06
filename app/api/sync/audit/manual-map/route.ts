
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { clientId, tipo, competencia, fileId, fileName } = body;

        if (!clientId || !tipo || !competencia || !fileId) {
            return NextResponse.json({ success: false, error: 'Parâmetros ausentes' }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Marcar como concluído manualmente
        const { error } = await supabase.from('obrigacoes_acessorias').upsert({
            cliente_id: clientId,
            tipo: tipo,
            status: 'concluido',
            competencia: competencia,
            // Guardamos metadados do mapeamento manual para aprendizado futuro
            manual_file_id: fileId,
            manual_file_name: fileName
        }, { onConflict: 'cliente_id, tipo, competencia' });

        if (error) throw error;

        // 2. Opcional: Registrar no histórico do CRM
        await supabase.from('auditoria_crm').insert({
            cliente_id: clientId,
            acao: 'SISTEMA',
            descricao: `Obrigação ${tipo} vinculada manualmente ao arquivo: ${fileName}`,
            user_id: (await supabase.auth.getUser()).data.user?.id
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[Manual Map Error]:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
