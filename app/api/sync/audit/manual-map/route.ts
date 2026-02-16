
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

        // 1. Buscar o ID do Template pelo nome (tipo)
        const { data: template } = await supabase
            .schema('fiscal')
            .from('obrigacoes_templates')
            .select('id')
            .eq('nome', tipo)
            .single();

        if (!template) {
            return NextResponse.json({ success: false, error: 'Template de obrigação não encontrado' }, { status: 404 });
        }

        const compDate = new Date(competencia);
        const mes = compDate.getMonth() + 1;
        const ano = compDate.getFullYear();

        // 2. Upsert no Calendário Fiscal
        const { error: upsertErr } = await supabase
            .schema('fiscal')
            .from('calendario')
            .upsert({
                empresa_id: clientId,
                template_id: template.id,
                mes_referencia: mes,
                ano_referencia: ano,
                status: 'CONCLUIDO',
                drive_file_id: fileId,
                drive_file_name: fileName,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'empresa_id,template_id,mes_referencia,ano_referencia'
            });

        if (upsertErr) throw upsertErr;

        // 3. Registrar no histórico do CRM (Audit Schema)
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.schema('audit').from('logs').insert({
            empresa_id: clientId,
            user_id: user?.id,
            acao: 'SISTEMA',
            descricao: `Obrigação ${tipo} vinculada manualmente ao arquivo: ${fileName}`,
            created_at: new Date().toISOString()
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[Manual Map Error]:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
