-- CRIAR USUÁRIO ADMIN: bcbrandaocontador@gmail.com
-- Script pronto para executar no Supabase SQL Editor

-- 1. DELETAR USUÁRIOS ANTIGOS (LIMPEZA)
DELETE FROM auth.users WHERE email IN ('alessandro@brandaocontador.com.br', 'bcbrandaocontador@gmail.com');

-- 2. CRIAR USUÁRIO ADMIN
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
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
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"nome":"Alessandro Brandão"}',
  false,
  '',
  '',
  '',
  ''
);

-- 3. VERIFICAR SE CRIOU COM SUCESSO
SELECT 
  id, 
  email, 
  email_confirmed_at, 
  created_at,
  'USUÁRIO CRIADO COM SUCESSO!' as status
FROM auth.users 
WHERE email = 'bcbrandaocontador@gmail.com';

-- ============================================
-- CREDENCIAIS PARA LOGIN:
-- ============================================
-- URL: https://brandaocontador.com.br/login
-- Email: bcbrandaocontador@gmail.com
-- Senha: Admin@2026
-- ============================================
