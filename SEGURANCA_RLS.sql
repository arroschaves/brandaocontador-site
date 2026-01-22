-- SECURITY HARDENING: ROW LEVEL SECURITY (RLS)
-- Execute este script no SQL Editor do seu Dashboard Supabase.

-- 1. Habilitar RLS em todas as tabelas críticas
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obrigacoes_acessorias ENABLE ROW LEVEL SECURITY;

-- 2. Limpar políticas existentes (opcional, para evitar conflitos)
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON public.clientes;
DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON public.clientes;
DROP POLICY IF EXISTS "Permitir atualização para usuários autenticados" ON public.clientes;
DROP POLICY IF EXISTS "Permitir exclusão para usuários autenticados" ON public.clientes;

-- 3. Definir Políticas para 'clientes'
CREATE POLICY "Leitura: Apenas autenticados" ON public.clientes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Escrita/Update: Apenas autenticados" ON public.clientes
    FOR ALL TO authenticated USING (true);

-- 4. Definir Políticas para 'atendimentos'
CREATE POLICY "Leitura: Apenas autenticados" ON public.atendimentos
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Escrita/Update: Apenas autenticados" ON public.atendimentos
    FOR ALL TO authenticated USING (true);

-- 5. Definir Políticas para 'obrigacoes_acessorias'
CREATE POLICY "Leitura: Apenas autenticados" ON public.obrigacoes_acessorias
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Escrita/Update: Apenas autenticados" ON public.obrigacoes_acessorias
    FOR ALL TO authenticated USING (true);

-- 6. (Opcional) Restrição Extra para Admins
-- Se você quiser que apenas quem tem role='admin' no metadata possa DELETAR:
/*
CREATE POLICY "Exclusão: Apenas Admins" ON public.clientes
    FOR DELETE TO authenticated
    USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );
*/

-- NOTA: O uso de 'USING(true)' para usuários autenticados significa que 
-- qualquer um que faça login no seu sistema pode ver e editar os dados. 
-- Como este é um CRM administrativo, isso geralmente é o desejado para a equipe.
