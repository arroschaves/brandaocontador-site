import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    // Verificar se tem cookie de sessão do Supabase
    const token = req.cookies.get('sb-access-token')?.value ||
        req.cookies.get('sb-refresh-token')?.value

    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
    const isLoginRoute = req.nextUrl.pathname === '/login'

    // Se está tentando acessar /admin sem token, redireciona para login
    if (isAdminRoute && !token) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    // Se está logado e tenta acessar /login, redireciona para admin
    if (isLoginRoute && token) {
        return NextResponse.redirect(new URL('/admin', req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
}
