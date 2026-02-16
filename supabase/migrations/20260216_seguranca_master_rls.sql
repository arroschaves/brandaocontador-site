-- ============================================================
-- 🛡️ SEGURANÇA MASTER - RLS (ROW LEVEL SECURITY)
-- Data: 2026-02-16 | Auditor: Security Agent
-- ============================================================

-- 1. Habilitar RLS em todas as tabelas críticas
ALTER TABLE core.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal.calendario ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal.obrigacoes_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.logs ENABLE ROW LEVEL SECURITY;

-- 2. Limpar políticas antigas
DROP POLICY IF EXISTS "Leitura Autenticada" ON core.empresas;
DROP POLICY IF EXISTS "Leitura Autenticada" ON fiscal.calendario;
DROP POLICY IF EXISTS "Leitura Autenticada" ON fiscal.obrigacoes_templates;
DROP POLICY IF EXISTS "Leitura Autenticada" ON audit.logs;

-- 3. Criar Políticas Rigorosas
-- APENAS usuários autenticados (Equipe Brandão) podem ver os dados pelo Frontend
CREATE POLICY "Leitura Autenticada" ON core.empresas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura Autenticada" ON fiscal.calendario FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura Autenticada" ON fiscal.obrigacoes_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura Autenticada" ON audit.logs FOR SELECT TO authenticated USING (true);

-- 4. Acesso Total para Service Role (Maestro Sync / n8n / Administração)
DROP POLICY IF EXISTS "Acesso Total Service Role" ON core.empresas;
CREATE POLICY "Acesso Total Service Role" ON core.empresas FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso Total Service Role" ON fiscal.calendario;
CREATE POLICY "Acesso Total Service Role" ON fiscal.calendario FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5. Revogação de Acesso Público (Nenhum dado é visível sem token de autenticação)
REVOKE ALL ON ALL TABLES IN SCHEMA core FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA fiscal FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA audit FROM anon;

-- Permite ao anon/authenticated apenas "ver" que o schema existe para o cache do PostgREST
GRANT USAGE ON SCHEMA core TO anon, authenticated;
GRANT USAGE ON SCHEMA fiscal TO anon, authenticated;
GRANT USAGE ON SCHEMA audit TO anon, authenticated;
