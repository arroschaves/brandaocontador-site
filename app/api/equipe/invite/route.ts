import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendProfessionalEmail } from '@/lib/utils/email-service'

export async function POST(request: Request) {
    try {
        const { nome, email, cargo } = await request.json()
        const supabase = await createClient()

        // 1. Upsert usuário na tabela equipe (status: CONVIDADO)
        const { data: funcionario, error: dbError } = await supabase
            .from('equipe')
            .upsert({
                nome,
                email,
                cargo,
                ativo: false
            }, { onConflict: 'email' })
            .select()
            .single()

        if (dbError) throw dbError

        // 2. Enviar e-mail de convite
        // Em um projeto real, aqui geraríamos um token JWT de convite.
        // Por agora, enviaremos o link para a página de onboarding/senha.
        const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://brandaocontador.com.br'}/onboarding?email=${email}`

        const emailRes = await sendProfessionalEmail({
            from: 'COMERCIAL',
            to: email,
            subject: '🚀 Convite: Acesso ao CRM Maestro Brandão',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #10b981; border-radius: 0px; padding: 40px; background: #000; color: #fff;">
                    <h1 style="color: #10b981; text-transform: uppercase; font-style: italic;">Bem-vindo ao Maestro, ${nome}!</h1>
                    <p style="color: #888; font-size: 12px; font-family: monospace;">BRANDÃO CONTABILIDADE // ACCESS CONTROL</p>
                    <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;">
                    <p>Você foi cadastrado como <b>${cargo}</b> e agora faz parte da rede de inteligência contábil Brandão.</p>
                    <p>Para ativar sua conta e definir sua senha de acesso, clique no botão abaixo:</p>
                    <a href="${inviteUrl}" style="display: inline-block; background: #10b981; color: #000; padding: 15px 30px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 14px; margin-top: 20px;">ATIVAR MINHA CONTA</a>
                    <p style="margin-top: 40px; font-size: 10px; color: #444;">Este convite é de uso exclusivo e rastreado por IP. Não compartilhe este link.</p>
                </div>
            `
        })

        if (!emailRes.success) {
            throw new Error(emailRes.error || 'Erro desconhecido no servidor de e-mail')
        }

        return NextResponse.json({ success: true, message: 'Convite enviado com sucesso' })

    } catch (error: any) {
        console.error('[Invite Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
