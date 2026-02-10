import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Atualiza a sessão do Supabase no Middleware
 * Garante que cookies sejam propagados corretamente
 */
export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Verifica usuário e protege rotas /admin
    const { data: { user } } = await supabase.auth.getUser()
    const url = request.nextUrl.clone()

    if (url.pathname.startsWith('/admin') && !user) {
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (url.pathname === '/login' && user) {
        url.pathname = '/admin'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
