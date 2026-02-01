import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendProfessionalEmail } from '@/lib/utils/email-service'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Buscar estatísticas de Atendimentos de hoje
        const { data: atendimentos } = await supabase
            .from('atendimentos')
            .select('*')
            .gte('created_at', today.toISOString());

        const concluidos = atendimentos?.filter(a => a.status === 'concluido').length || 0;
        const pendentes = atendimentos?.filter(a => a.status === 'pendente' || a.status === 'em_atendimento').length || 0;
        const urgentes = atendimentos?.filter(a => a.prioridade === 'CRITICA' || a.prioridade === 'ALTA').length || 0;

        // 2. Buscar novas Obrigações/Arquivos de hoje
        const { data: arquivos } = await supabase
            .from('obrigacoes_acessorias')
            .select('tipo, clientes(nome)')
            .gte('updated_at', today.toISOString());

        // 3. Montar o corpo do E-mail (HTML Premium)
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                <div style="background: #059669; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 20px;">Relatório de Atividade Diária</h1>
                    <p style="margin: 5px 0 0 0; opacity: 0.8; font-size: 14px;">Brandão Contabilidade // ${today.toLocaleDateString('pt-BR')}</p>
                </div>
                
                <div style="padding: 20px;">
                    <h2 style="font-size: 16px; color: #111; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">📊 Resumo do Suporte</h2>
                    <table style="width: 100%; text-align: left; margin-top: 10px;">
                        <tr>
                            <td style="padding: 5px 0; color: #666;">Novos Atendimentos:</td>
                            <td style="text-align: right; font-weight: bold;">${atendimentos?.length || 0}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #059669;">Concluídos:</td>
                            <td style="text-align: right; font-weight: bold; color: #059669;">${concluidos}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #666;">Pendentes:</td>
                            <td style="text-align: right; font-weight: bold;">${pendentes}</td>
                        </tr>
                        <tr style="color: #dc2626;">
                            <td style="padding: 10px 0; font-weight: bold;">Prioridade Alta:</td>
                            <td style="text-align: right; font-weight: bold;">${urgentes}</td>
                        </tr>
                    </table>

                    <h2 style="font-size: 16px; color: #111; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px; margin-top: 30px;">📂 Movimentação de Arquivos</h2>
                    ${arquivos && arquivos.length > 0 ? `
                        <ul style="padding-left: 20px; color: #444;">
                            ${arquivos.map(arq => {
            const cliente = Array.isArray(arq.clientes) ? arq.clientes[0] : arq.clientes;
            const nome = (cliente as any)?.nome || 'Desconhecido';
            return `<li><b>${arq.tipo}</b> - ${nome}</li>`;
        }).join('')}
                        </ul>
                    ` : '<p style="color: #999; font-style: italic;">Nenhuma guia processada hoje.</p>'}
                </div>

                <div style="background: #f9fafb; padding: 15px; text-align: center; color: #999; font-size: 12px;">
                    Este é um relatório automático gerado pelo CRM Brandão Contabilidade.
                </div>
            </div>
        `;

        // 4. Enviar o e-mail
        await sendProfessionalEmail({
            from: 'ADM',
            to: 'bcbrandaocontador@gmail.com',
            subject: `📊 Relatório Diário - ${today.toLocaleDateString('pt-BR')}`,
            html: html
        });

        return NextResponse.json({ success: true, message: 'Relatório enviado com sucesso' });

    } catch (error: any) {
        console.error('[Daily Report Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
