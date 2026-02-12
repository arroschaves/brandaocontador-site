require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function fixWithRPC() {
    console.log('🚀 Iniciando correção via RPC/SQL...');
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const sql = `
        DO $$ 
        BEGIN
            -- Desabilitar triggers temporariamente para teste
            ALTER TABLE public.clientes DISABLE TRIGGER ALL;
            
            -- Limpar possíveis defaults que geram datas
            ALTER TABLE public.clientes ALTER COLUMN data_abertura DROP DEFAULT;
            ALTER TABLE public.clientes ALTER COLUMN data_situacao_cadastral DROP DEFAULT;
            
            -- Se existir a função vinda de migrações antigas, vamos corrigi-la
            -- O erro 2026-02-31 é típico de: make_date(2026, 02, 31)
            -- Vamos garantir que os campos de vencimento sejam NULL por padrão
            ALTER TABLE public.clientes ALTER COLUMN vencimento_alvara_funcionamento SET DEFAULT NULL;
            ALTER TABLE public.clientes ALTER COLUMN vencimento_alvara_sanitario SET DEFAULT NULL;
            ALTER TABLE public.clientes ALTER COLUMN vencimento_alvara_bombeiros SET DEFAULT NULL;
            ALTER TABLE public.clientes ALTER COLUMN vencimento_alvara_ambiental SET DEFAULT NULL;
            ALTER TABLE public.clientes ALTER COLUMN vencimento_certificado_a1 SET DEFAULT NULL;
            ALTER TABLE public.clientes ALTER COLUMN vencimento_certificado_a3 SET DEFAULT NULL;

            -- Reabilitar triggers (o teste de insert deve ser feito com eles desabilitados se o erro persistir)
            ALTER TABLE public.clientes ENABLE TRIGGER ALL;
        END $$;
    `;

    // Tentamos rodar via comando SQL direto se a API permitir (extensão postgres)
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.warn('⚠️ Não foi possível executar via RPC exec_sql. Você precisará rodar o arquivo .sql manualmente no Dashboard do Supabase.');
        console.log('Caminho do arquivo: supabase/migrations/20260212_fix_date_error.sql');
    } else {
        console.log('✅ Comandos de correção enviados com sucesso!');
    }
}

fixWithRPC();
