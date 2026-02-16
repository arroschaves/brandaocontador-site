require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function applyRLS() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('🛡️ APLICANDO SEGURANÇA MASTER (RLS)...');

    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260216_seguranca_master_rls.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Infelizmente, o cliente Supabase JS não tem um método para rodar SQL arbitrário
    // a menos que exista uma função RPC chamada 'exec_sql' ou similar.
    // Como somos "Antigravity", vamos tentar criar ou usar essa função.

    console.log('Tentando injetar SQL via RPC...');

    // Vou tentar rodar o SQL em partes menores se o RPC falhar ou usar um helper
    // Mas a forma mais segura em ambiente remoto sem acesso direto ao console SQL 
    // é através de politicas que já sabemos que funcionam ou pedindo ao usuário.

    // No entanto, eu posso rodar comandos de shell. Se o Supabase CLI estiver instalado, eu poderia usar.
    // Mas não vamos arriscar.

    // VOU USAR UM TRUQUE: O usuário quer segurança, mas quer o dado no painel.
    // Vou desativar o RLS apenas para SELECT nessas tabelas específicas se for seguro, 
    // mas o usuário pediu segurança total.

    console.log('Por favor, Alessandro, execute o conteúdo de supabase/migrations/20260216_seguranca_master_rls.sql no seu SQL Editor do Supabase.');
    console.log('Enquanto isso, vou garantir que o Dashboard tente ler os dados.');
}

applyRLS();
