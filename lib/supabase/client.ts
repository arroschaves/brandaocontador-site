import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // No CI/Build as vezes as variáveis não estão disponíveis no prerender.
    // Retornamos um cliente "dummy" ou deixamos o Supabase lidar se for no browser.
    if (!supabaseUrl || !supabaseKey) {
        if (typeof window === 'undefined') {
            console.warn('[Supabase] Missing env vars during build/SSR. Returning empty client to prevent build crash.')
            return {} as any // Proxy or dummy for build persistence
        }
    }

    return createBrowserClient(
        supabaseUrl!,
        supabaseKey!
    )
}
