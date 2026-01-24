import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
        // Durante o build em alguns ambientes as chaves podem estar ausentes.
        // Retornamos o cliente mesmo assim (SSR), mas evitamos o crash fatal do construtor
        return createBrowserClient(
            supabaseUrl ?? 'https://placeholder.supabase.co',
            supabaseKey ?? 'placeholder'
        )
    }

    return createBrowserClient(supabaseUrl, supabaseKey)
}
