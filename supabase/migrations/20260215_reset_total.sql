-- 🚨 SCRIPT DE RESET TOTAL (USE COM CUIDADO)
-- Este script apaga TODOS os schemas e dados para reiniciar o projeto.

DROP SCHEMA IF EXISTS core CASCADE;
DROP SCHEMA IF EXISTS fiscal CASCADE;
DROP SCHEMA IF EXISTS dp CASCADE;
DROP SCHEMA IF EXISTS audit CASCADE;

-- Limpar schema public também (onde o Supabase cria tabelas por padrão)
DROP TABLE IF EXISTS public.clientes CASCADE;
DROP TABLE IF EXISTS public.obrigacoes CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
-- (Adicione outras tabelas que você lembre de ter criado, ou use o comando abaixo para limpar tudo do public)
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- Confirmação
SELECT 'RESET COMPLETO REALIZADO' as status;
