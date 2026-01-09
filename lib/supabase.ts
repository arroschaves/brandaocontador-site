import { createClient } from '@supabase/supabase-js';

// Usar o proxy local ao invés de acessar diretamente o Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Cliente Supabase configurado com headers corretos
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
    },
    global: {
        headers: {
            'apikey': supabaseAnonKey,
        },
    },
});
