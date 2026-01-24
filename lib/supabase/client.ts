import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
    if (client) return client;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
        return createBrowserClient(
            supabaseUrl ?? 'https://placeholder.supabase.co',
            supabaseKey ?? 'placeholder'
        )
    }

    client = createBrowserClient(supabaseUrl, supabaseKey)
    return client
}
