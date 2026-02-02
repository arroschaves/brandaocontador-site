import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return NextResponse.json({ error: 'Você precisa estar logado' })

        // Cria ou atualiza o perfil para Admin
        const { error } = await supabase.from('perfis').upsert({
            id: user.id,
            nome: user.user_metadata?.full_name || user.email?.split('@')[0],
            email: user.email,
            role: 'admin'
        })

        if (error) throw error

        return NextResponse.json({ success: true, message: `O usuário ${user.email} agora é um ADMINISTRADOR MASTER do CRM Brandão.` })
    } catch (err: any) {
        return NextResponse.json({ error: err.message })
    }
}
