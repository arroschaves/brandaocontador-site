-- CRIAR USUÁRIO ADMIN: bcbrandaocontador@gmail.com
-- Versão Simplificada (Compatível com todas as versões do Supabase)

-- 1. DELETAR USUÁRIOS ANTIGOS
DELETE FROM auth.users WHERE email IN ('alessandro@brandaocontador.com.br', 'bcbrandaocontador@gmail.com');

-- 2. CRIAR USUÁRIO ADMIN (VERSÃO SIMPLIFICADA)
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
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'bcbrandaocontador@gmail.com',
  crypt('Admin@2026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}'
);

-- 3. VERIFICAR SE CRIOU
SELECT 
  id, 
  email, 
  email_confirmed_at, 
  created_at
FROM auth.users 
WHERE email = 'bcbrandaocontador@gmail.com';

-- ============================================
-- CREDENCIAIS:
-- Email: bcbrandaocontador@gmail.com
-- Senha: Admin@2026
-- ============================================
