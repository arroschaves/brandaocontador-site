import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Cria um cliente Supabase com a Service Role Key.
 * Use APENAS no lado do servidor (API Routes) para operações administrativas.
 * Ignora RLS.
 */
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('As variáveis de ambiente do Supabase Service Role não foram encontradas.')
    }

    return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
