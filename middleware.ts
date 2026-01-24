import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    // 1. Ignorar explicitamente rotas de arquivos estáticos e de sistema do Next.js
    if (
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.includes('/api/') ||
        request.nextUrl.pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Aplicar apenas em rotas de páginas
         */
        '/admin/:path*',
        '/login',
    ],
}
