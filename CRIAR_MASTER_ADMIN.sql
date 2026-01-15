-- CRIAR USUÁRIO ADMIN: arroschaves@gmail.com
-- Script pronto para executar no Supabase SQL Editor assim que o Banco de Dados voltar

-- 1. DELETAR USUÁRIO ANTIGO (SE EXISTIR)
DELETE FROM auth.users WHERE email = 'arroschaves@gmail.com';

-- 2. CRIAR USUÁRIO MASTER ADMIN
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
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
  'arroschaves@gmail.com',
  crypt('@Pa2684653#', gen_salt('bf')), -- Senha fornecida pelo usuário
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"nome":"Alessandro Master","role":"admin"}',
  true,
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
  'USUÁRIO MASTER CRIADO COM SUCESSO!' as status
FROM auth.users 
WHERE email = 'arroschaves@gmail.com';

-- ============================================
-- CREDENCIAIS PARA LOGIN:
-- ============================================
-- URL: https://www.brandaocontador.com.br/login
-- Email: arroschaves@gmail.com
-- Senha: @Pa2684653#
-- ============================================
