-- RESETAR SENHA DO USUÁRIO EXISTENTE
UPDATE auth.users 
SET 
  encrypted_password = crypt('BrandaoCRM2026!', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'alessandro@brandaocontador.com.br';

-- VERIFICAR SE ATUALIZOU
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'alessandro@brandaocontador.com.br';

-- CREDENCIAIS ATUALIZADAS:
-- Email: alessandro@brandaocontador.com.br
-- Senha: BrandaoCRM2026!
