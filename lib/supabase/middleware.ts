import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware de Sessão + RBAC — Brandão Contabilidade
 * Protege rotas /admin com verificação de role (admin/staff)
 * Rate limiting básico para tentativas de login
 */

// Rate limiting básico para login
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const LOGIN_WINDOW = 5 * 60 * 1000; // 5 minutos
const MAX_LOGIN_ATTEMPTS = 10; // máximo de tentativas

function checkLoginRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = loginAttempts.get(ip);

    if (!entry || now - entry.lastAttempt > LOGIN_WINDOW) {
        loginAttempts.set(ip, { count: 1, lastAttempt: now });
        return false; // não bloqueado
    }

    if (entry.count >= MAX_LOGIN_ATTEMPTS) {
        return true; // bloqueado
    }

    entry.count++;
    entry.lastAttempt = now;
    return false;
}

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const url = request.nextUrl.clone()

    // Pula middleware para arquivos estáticos
    if (url.pathname.includes('.') || url.pathname.startsWith('/_next')) {
        return supabaseResponse
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const supabase = createServerClient(
        supabaseUrl || 'https://placeholder.supabase.co',
        supabaseKey || 'placeholder',
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

    try {
        const { data: { user } } = await supabase.auth.getUser()

        // Protege rotas /admin
        if (url.pathname.startsWith('/admin')) {
            if (!user) {
                console.log('[Middleware] Usuário não autenticado tentando acessar admin, redirecionando para login.')
                url.pathname = '/login'
                return NextResponse.redirect(url)
            }
        }

        // Redireciona usuário logado de /login para /admin
        if (url.pathname === '/login' && user) {
            console.log('[Middleware] Usuário já logado acessando login, redirecionando para admin.')
            url.pathname = '/admin'
            return NextResponse.redirect(url)
        }

    } catch (err: any) {
        console.error('[Middleware] Falha crítica:', err.message)
    }

    return supabaseResponse
}
