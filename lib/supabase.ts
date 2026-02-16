import { createClient } from './supabase/client'

// Lazy singleton: Supabase client is created on first access, not at import time.
// This prevents build failures when env vars are unavailable (CI/CD prerender).
let _instance: ReturnType<typeof createClient> | null = null

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
    get(_target, prop) {
        if (!_instance) {
            _instance = createClient()
        }
        return (_instance as any)[prop]
    }
})
