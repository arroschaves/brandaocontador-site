const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function fixDB() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    console.log('--- RESGATE FORENSE V8: CORRIGINDO PENDÊNCIAS DE SCHEMAS ---');

    try {
        console.log('[1] Corrigindo ambiguidade (PGRST201) em core.atendimentos...');
        const fksAtend = await client.query(`
            SELECT tc.constraint_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_name = 'atendimentos'
              AND tc.table_schema = 'core'
              AND ccu.table_name = 'empresas'
              AND ccu.table_schema = 'core';
        `);
        for (const row of fksAtend.rows) {
            console.log(`Derrubando FK ambígua: ${row.constraint_name}`);
            await client.query(`ALTER TABLE core.atendimentos DROP CONSTRAINT IF EXISTS "${row.constraint_name}";`);
        }
        console.log('Criando FK mestre: atendimentos_empresa_id_fkey...');
        await client.query(`
            ALTER TABLE core.atendimentos
            ADD CONSTRAINT atendimentos_empresa_id_fkey
            FOREIGN KEY (empresa_id) REFERENCES core.empresas(id) ON DELETE CASCADE;
        `).catch(e => console.log('Aviso (atendimentos):', e.message));

        console.log('[2] Estabelecendo conexão workflow.tarefas -> core.equipe (PGRST200)...');
        const fksEq = await client.query(`
            SELECT tc.constraint_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_name = 'tarefas'
              AND tc.table_schema = 'workflow'
              AND kcu.column_name = 'responsavel_id';
        `);
        for (const row of fksEq.rows) {
            await client.query(`ALTER TABLE workflow.tarefas DROP CONSTRAINT IF EXISTS "${row.constraint_name}";`);
        }
        await client.query(`
            ALTER TABLE workflow.tarefas
            ADD CONSTRAINT tarefas_responsavel_id_fkey
            FOREIGN KEY (responsavel_id) REFERENCES core.equipe(id) ON DELETE SET NULL;
        `).catch(e => console.log('Aviso (tarefas->equipe): FK falhou. A tabela equipe pode não ter UUID ou estar ausente (usamos uuid?).', e.message));

        console.log('[3] Estabelecendo conexão workflow.tarefas -> core.empresas...');
        const fksTarefasEmp = await client.query(`
            SELECT tc.constraint_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_name = 'tarefas'
              AND tc.table_schema = 'workflow'
              AND kcu.column_name = 'empresa_id';
        `);
        for (const row of fksTarefasEmp.rows) {
            await client.query(`ALTER TABLE workflow.tarefas DROP CONSTRAINT IF EXISTS "${row.constraint_name}";`);
        }
        await client.query(`
            ALTER TABLE workflow.tarefas
            ADD CONSTRAINT tarefas_empresa_id_fkey
            FOREIGN KEY (empresa_id) REFERENCES core.empresas(id) ON DELETE CASCADE;
        `).catch(e => console.log('Aviso (tarefas->empresas):', e.message));


        console.log('[4] Estabelecendo conexão fiscal.calendario -> core.empresas (PGRST200)...');
        const fksCal = await client.query(`
            SELECT tc.constraint_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_name = 'calendario'
              AND tc.table_schema = 'fiscal'
              AND kcu.column_name = 'empresa_id';
        `);
        for (const row of fksCal.rows) {
            await client.query(`ALTER TABLE fiscal.calendario DROP CONSTRAINT IF EXISTS "${row.constraint_name}";`);
        }
        await client.query(`
            ALTER TABLE fiscal.calendario
            ADD CONSTRAINT calendario_empresa_id_fkey
            FOREIGN KEY (empresa_id) REFERENCES core.empresas(id) ON DELETE CASCADE;
        `).catch(e => console.log('Aviso (calendario->empresas):', e.message));

        console.log('[5] Estabelecendo conexão dp.eventos -> core.empresas (PGRST200)...');
        const fksEvt = await client.query(`
            SELECT tc.constraint_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_name = 'eventos'
              AND tc.table_schema = 'dp'
              AND kcu.column_name = 'empresa_id';
        `);
        for (const row of fksEvt.rows) {
            await client.query(`ALTER TABLE dp.eventos DROP CONSTRAINT IF EXISTS "${row.constraint_name}";`);
        }
        await client.query(`
            ALTER TABLE dp.eventos
            ADD CONSTRAINT eventos_empresa_id_fkey
            FOREIGN KEY (empresa_id) REFERENCES core.empresas(id) ON DELETE CASCADE;
        `).catch(e => console.log('Aviso (eventos->empresas):', e.message));

        console.log('--- RECARREGANDO POSTGREST SCHEMA CACHE ---');
        await client.query(`NOTIFY pgrst, 'reload schema';`);
        console.log('✅ Schema reload enviado!');

    } catch (err) {
        console.error('Erro geral:', err);
    } finally {
        await client.end();
    }
}

fixDB();
