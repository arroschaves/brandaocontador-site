import { createClient } from './supabase/client'

// Export a singleton instance for client-side use
export const supabase = createClient()

