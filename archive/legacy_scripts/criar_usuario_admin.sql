-- CRIAR USUÁRIO ADMIN NO SUPABASE
-- Execute este SQL no SQL Editor do Easypanel

-- Opção 1: Criar via SQL (Recomendado)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'alessandro@brandaocontador.com.br',
  crypt('BrandaoCRM2026!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"nome":"Alessandro Brandão"}',
  false,
  '',
  ''
);

-- Opção 2: Via Interface (Mais Fácil)
-- 1. Acesse panel.brandaocontador.com.br
-- 2. Vá em "Authentication" > "Users"
-- 3. Clique em "Add User"
-- 4. Preencha:
--    Email: alessandro@brandaocontador.com.br
--    Password: BrandaoCRM2026!
--    Auto Confirm User: SIM
-- 5. Clique em "Create User"

-- CREDENCIAIS DE ACESSO:
-- Email: alessandro@brandaocontador.com.br
-- Senha: BrandaoCRM2026!
