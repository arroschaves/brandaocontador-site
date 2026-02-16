const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    console.log('🚀 Iniciando migração corretiva via Postgres Direto...');

    try {
        await client.connect();

        const sql = `
            -- 1. Adicionar campos base que a API espera
            ALTER TABLE core.empresas 
                ADD COLUMN IF NOT EXISTS nome TEXT,
                ADD COLUMN IF NOT EXISTS cnpj_cpf TEXT,
                ADD COLUMN IF NOT EXISTS telefone_whatsapp TEXT,
                ADD COLUMN IF NOT EXISTS logradouro TEXT,
                ADD COLUMN IF NOT EXISTS numero TEXT,
                ADD COLUMN IF NOT EXISTS bairro TEXT,
                ADD COLUMN IF NOT EXISTS cep TEXT,
                ADD COLUMN IF NOT EXISTS cidade TEXT,
                ADD COLUMN IF NOT EXISTS estado TEXT,
                ADD COLUMN IF NOT EXISTS inscricao_estadual TEXT,
                ADD COLUMN IF NOT EXISTS inscricao_municipal TEXT,
                ADD COLUMN IF NOT EXISTS status_rfb TEXT,
                ADD COLUMN IF NOT EXISTS cnaes_secundarios TEXT,
                ADD COLUMN IF NOT EXISTS capital_social DECIMAL(15,2),
                ADD COLUMN IF NOT EXISTS data_abertura DATE,
                ADD COLUMN IF NOT EXISTS natureza_juridica TEXT,
                ADD COLUMN IF NOT EXISTS porte TEXT;

            -- 2. Garantir campos de Alvarás e Certidões que o Dashboard requer
            ALTER TABLE core.empresas 
                ADD COLUMN IF NOT EXISTS vencimento_alvara_funcionamento DATE,
                ADD COLUMN IF NOT EXISTS vencimento_alvara_sanitario DATE,
                ADD COLUMN IF NOT EXISTS vencimento_alvara_bombeiros DATE,
                ADD COLUMN IF NOT EXISTS vencimento_alvara_ambiental DATE,
                ADD COLUMN IF NOT EXISTS vencimento_certidao_negativa_federal DATE,
                ADD COLUMN IF NOT EXISTS vencimento_certidao_negativa_estadual DATE,
                ADD COLUMN IF NOT EXISTS vencimento_certidao_negativa_municipal DATE,
                ADD COLUMN IF NOT EXISTS vencimento_certidao_fgts DATE,
                ADD COLUMN IF NOT EXISTS atendimento_automatico BOOLEAN DEFAULT FALSE;

            -- 3. Garantir que as tabelas existem no schema public como VIEWs (Compatibilidade)
            DROP VIEW IF EXISTS public.clientes CASCADE;
            CREATE VIEW public.clientes AS SELECT * FROM core.empresas;

            DROP VIEW IF EXISTS public.empresas CASCADE;
            CREATE VIEW public.empresas AS SELECT * FROM core.empresas;

            -- 4. Sincronizar dados das colunas legadas para as novas
            -- 'documento' era usado como CNPJ/CPF
            -- 'nome_fantasia' era usado como nome
            UPDATE core.empresas SET cnpj_cpf = documento WHERE cnpj_cpf IS NULL AND documento IS NOT NULL;
            UPDATE core.empresas SET nome = nome_fantasia WHERE nome IS NULL AND nome_fantasia IS NOT NULL;
        `;

        await client.query(sql);
        console.log('✅ Migração corretiva concluída com sucesso via Postgres!');
    } catch (err) {
        console.error('❌ Erro na migração:', err);
    } finally {
        await client.end();
    }
}

runMigration();
