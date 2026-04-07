-- =============================================================================
-- Migration: Correção de Security Definer Views
-- Projeto: brandao-os | Data: 2026-02-27
-- 
-- PROBLEMA: O Supabase Security Advisor identificou 15 views no schema public
-- com a propriedade SECURITY DEFINER, que bypassa as políticas RLS (Row Level
-- Security). Isso permite que usuários não autorizados acessem dados via views
-- sem que as políticas RLS sejam aplicadas.
--
-- SOLUÇÃO: Definir security_invoker = true em todas as views afetadas, fazendo
-- com que elas executem com as permissões do usuário que as consulta (invoker),
-- e não com as permissões do criador (definer).
-- =============================================================================

-- Views no schema PUBLIC (identificadas no Security Advisor e nas migrations)
ALTER VIEW IF EXISTS public.vw_radar_vencimentos SET (security_invoker = on);
ALTER VIEW IF EXISTS public.clientes SET (security_invoker = on);
ALTER VIEW IF EXISTS public.atendimentos SET (security_invoker = on);
ALTER VIEW IF EXISTS public.activity_stats SET (security_invoker = on);

-- Views adicionais identificadas no screenshot do Security Advisor
-- Nota: Se alguma view não existir, o IF EXISTS garante que o script não quebre

-- Views que refletem tabelas de outros schemas (core, fiscal, workflow)
DO $$
DECLARE
    v record;
BEGIN
    -- Itera por todas as views no schema public e aplica security_invoker
    FOR v IN
        SELECT schemaname, viewname
        FROM pg_views
        WHERE schemaname = 'public'
    LOOP
        BEGIN
            EXECUTE format(
                'ALTER VIEW %I.%I SET (security_invoker = on)',
                v.schemaname,
                v.viewname
            );
            RAISE NOTICE 'Corrigido: %.%', v.schemaname, v.viewname;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Não foi possível corrigir %.%: %',
                v.schemaname, v.viewname, SQLERRM;
        END;
    END LOOP;
END
$$;

-- Verificação: Lista todas as views ainda com security_definer no schema public
-- Execute após a migration para confirmar que não restam views com o problema:
-- SELECT schemaname, viewname, definition
-- FROM pg_views
-- WHERE schemaname = 'public'
--   AND definition ILIKE '%security_definer%';
