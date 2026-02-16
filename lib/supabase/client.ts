import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // No CI/Build as vezes as variáveis não estão disponíveis no prerender.
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
        if (typeof window === 'undefined') {
            console.warn('[Supabase] Missing env vars during build/SSR. Returning safe proxy to prevent build crash.')
            // Recursive proxy that returns itself for any property access or function call
            const logger = () => safeProxy;
            const safeProxy: any = new Proxy(logger, {
                get: () => safeProxy,
                apply: () => safeProxy
            });
            return safeProxy;
        }

        // No cliente, se faltarem as env vars, retornamos um objeto que não quebra a destruturação
        return {
            auth: {
                getUser: async () => ({ data: { user: null }, error: null }),
                signInWithPassword: async () => ({ error: { message: 'Configuração do Supabase ausente.' } }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            }
        } as any
    }

    return createBrowserClient(supabaseUrl, supabaseKey)
}
