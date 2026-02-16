import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // No CI/Build as vezes as variáveis não estão disponíveis no prerender.
    if (!supabaseUrl || !supabaseKey) {
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
    }

    return createBrowserClient(
        supabaseUrl!,
        supabaseKey!
    )
}
