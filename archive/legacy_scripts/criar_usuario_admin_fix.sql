-- DESABILITAR RLS TEMPORARIAMENTE PARA CRIAR USUÁRIO
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- CRIAR USUÁRIO ADMIN
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  recovery_sent_at,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
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
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- REABILITAR RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- VERIFICAR SE CRIOU
SELECT id, email, created_at FROM auth.users WHERE email = 'alessandro@brandaocontador.com.br';
