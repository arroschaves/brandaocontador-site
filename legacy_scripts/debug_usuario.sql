-- DEBUG: VERIFICAR CONFIGURAÇÃO DO USUÁRIO
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  encrypted_password IS NOT NULL as tem_senha,
  raw_app_meta_data,
  raw_user_meta_data,
  banned_until,
  deleted_at
FROM auth.users 
WHERE email = 'alessandro@brandaocontador.com.br';

-- SE O USUÁRIO ESTIVER BANIDO OU DELETADO, LIMPAR:
UPDATE auth.users 
SET 
  banned_until = NULL,
  deleted_at = NULL
WHERE email = 'alessandro@brandaocontador.com.br';
