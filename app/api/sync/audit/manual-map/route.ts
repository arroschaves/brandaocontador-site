
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
            .select('id, dia_vencimento')
            .eq('nome', tipo)
            .single();

        if (!template) {
            return NextResponse.json({ success: false, error: 'Template de obrigação não encontrado' }, { status: 404 });
        }

        const compDate = new Date(competencia);
        const mes = compDate.getMonth() + 1;
        const ano = compDate.getFullYear();

        // Calcular data de vencimento (geralmente no dia do template no mês seguinte)
        const vencimento = new Date(ano, mes, template.dia_vencimento || 20);

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
                data_vencimento: vencimento.toISOString().split('T')[0],
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

        // 4. Mecanismo de Aprendizado AI (Brain Gain)
        // Extrair padrão significativo do nome: remove números e pega a primeira palavra longa
        const cleanName = fileName.replace(/[0-9]/g, '').split(/[\s.\-_]/).find((w: string) => w.length > 4)?.toUpperCase();
        if (cleanName) {
            await supabase.schema('fiscal').from('maestro_aprendizado').upsert({
                template_id: template.id,
                padrao_texto: cleanName,
                ultima_vez_visto: new Date().toISOString()
            }, { onConflict: 'template_id,padrao_texto' });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[Manual Map Error]:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
