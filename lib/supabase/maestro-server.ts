
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cliente Supabase Server-Side para o novo Schema 2026 (Maestro)
 * Usa as variáveis de ambiente já configuradas no .env.local
 * Compatível com Next.js 15 (cookies() retorna Promise)
 */
export async function createMaestroClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
        console.warn('[Supabase-Maestro] Missing env vars during build. Returning safe proxy.')
        const logger = () => safeProxy;
        const safeProxy: any = new Proxy(logger, {
            get: () => safeProxy,
            apply: () => safeProxy
        });
        return safeProxy;
    }

    const cookieStore = await cookies()

    return createServerClient(
        supabaseUrl!,
        supabaseKey!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Server Component não pode setar cookie, normal ignorar
                    }
                },
            },
        }
    )
}
