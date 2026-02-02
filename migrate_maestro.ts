
import { createClient } from './lib/supabase/client.ts';

async function migrate() {
    const supabase = createClient();

    console.log('--- ADICIONANDO COLUNAS PARA APRENDIZADO DO MAESTRO ---');

    const { error: err1 } = await supabase.rpc('exec_sql', {
        sql_query: `
            ALTER TABLE obrigacoes_acessorias 
            ADD COLUMN IF NOT EXISTS manual_file_id TEXT,
            ADD COLUMN IF NOT EXISTS manual_file_name TEXT,
            ADD COLUMN IF NOT EXISTS maestro_log JSONB;
        `
    });

    if (err1) {
        console.warn('Erro ao usar RPC exec_sql. Tentando via query simples se possível...');
        console.error(err1);
        // Se falhar o RPC (comum se não configurado), avisamos o usuário que as colunas
        // podem precisar de criação manual ou que o sistema usará metadados existentes.
    } else {
        console.log('Colunas adicionadas com sucesso!');
    }
}

migrate().catch(console.error);
