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

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
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

    const { data: { user } } = await supabase.auth.getUser()
    const url = request.nextUrl.clone()

    // Rate limiting para login
    if (url.pathname === '/login' && request.method === 'POST') {
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        if (checkLoginRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Muitas tentativas de login. Tente novamente em 5 minutos.' },
                { status: 429 }
            );
        }
    }

    // Protege rotas /admin — requer autenticação + role admin/staff
    if (url.pathname.startsWith('/admin')) {
        if (!user) {
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        // Verifica role do usuário no metadata
        const userRole = user.user_metadata?.role || user.app_metadata?.role || 'client';
        const allowedRoles = ['admin', 'staff', 'master'];

        if (!allowedRoles.includes(userRole)) {
            // Usuário autenticado mas sem permissão para admin
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
    }

    // Redireciona usuário logado que acessa /login para /admin
    if (url.pathname === '/login' && user) {
        const userRole = user.user_metadata?.role || user.app_metadata?.role || 'client';
        const allowedRoles = ['admin', 'staff', 'master'];

        if (allowedRoles.includes(userRole)) {
            url.pathname = '/admin'
        } else {
            url.pathname = '/'
        }
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
