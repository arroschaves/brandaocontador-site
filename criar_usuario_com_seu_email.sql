-- DELETAR USUÁRIO ANTIGO E CRIAR NOVO (COM SEU EMAIL)
-- SUBSTITUA 'SEU_EMAIL_AQUI@gmail.com' pelo seu email real

-- 1. DELETAR USUÁRIO ANTIGO
DELETE FROM auth.users WHERE email = 'alessandro@brandaocontador.com.br';

-- 2. CRIAR NOVO USUÁRIO COM SEU EMAIL
-- IMPORTANTE: Troque 'SEU_EMAIL_AQUI@gmail.com' pelo seu email verdadeiro
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
  'SEU_EMAIL_AQUI@gmail.com',  -- <<<< TROQUE AQUI
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

-- 3. VERIFICAR SE CRIOU
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'SEU_EMAIL_AQUI@gmail.com';  -- <<<< TROQUE AQUI TAMBÉM

-- CREDENCIAIS PARA LOGIN:
-- Email: SEU_EMAIL_AQUI@gmail.com (o que você colocou acima)
-- Senha: Admin@2026
