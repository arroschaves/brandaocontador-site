import { createClient } from '@/lib/supabase/server'

export type UserRole = 'admin' | 'operador' | 'visualizador'

export async function getUserRole(): Promise<UserRole> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return 'visualizador'

    const { data: perfil } = await supabase
        .from('perfis')
        .select('role')
        .eq('id', user.id)
        .single()

    return (perfil?.role as UserRole) || 'operador'
}

export async function isAdmin(): Promise<boolean> {
    const role = await getUserRole()
    return role === 'admin'
}

export async function canManageVault(): Promise<boolean> {
    const role = await getUserRole()
    // Apenas admin e operador podem gerenciar o vault (subir arquivos)
    // Mas talvez só Admin possa ver as senhas. Vamos restringir 'visualizador'.
    return role === 'admin' || role === 'operador'
}
