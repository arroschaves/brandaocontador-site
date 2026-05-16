# Guia de Segurança - Credenciais Expostas

## Problema Detectado

O arquivo `.env.local` foi commitado no repositório Git com as seguintes credenciais expostas:

- Supabase URL e chaves
- Chave privada do Google Service Account
- SENHAS em texto plano (Zoho, N8N, Easypanel, Evolution API)
- API Keys (GEMINI, etc)

## Ações Realizadas

### ✅ 1. Remover credenciais do código
O arquivo `.env` e `.env.local` foram atualizados com valores vazios/placeholder.

### ✅ 2. Configurar variáveis no Vercel
As variáveis de ambiente devem ser configuradas no painel do Vercel, NÃO no código.

---

## Como Configurar no Vercel

### Acesse: https://vercel.com/brandaocontador-site/settings/environment-variables

Adicione as seguintes variáveis:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ycgwmwmcyxwflkaehwds.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY_AQUI

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app

# Google (para APIs futuras - criar novas credenciais)
GEMINI_API_KEY=NOVA_CHAVE

# Evolution API (RODAR NOVA CHAVE)
EVOLUTION_API_KEY=NOVA_CHAVE

# Zoho (NOVA SENHA)
ZOHO_PASS_RH=NOVA_SENHA
ZOHO_PASS_ADM=NOVA_SENHA

# Database (NOVA SENHA)
DATABASE_URL=postgresql://postgres:NOVA_SENHA@...

# N8N (NOVA SENHA)
N8N_WEBHOOK_URL=NOVA_URL

# Easypanel (NOVAS CREDENCIAIS)
EMAIL=seu_email
SENHA=NOVA_SENHA
```

---

## Remover do Histórico Git (IMPORTANTE)

O histórico ainda contém as credenciais. Para remover completamente:

```bash
# ATENÇÃO: Isso reescreve o histórico do git

cd E:\PROJETOS\brandaocontador-site

# Remover .env.local do histórico
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Forçar push (todos os branches)
git push origin --force --all

# Limpar referências
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

**OU** se o repositório já foi para produção:
- Usar ferramenta like `git-secrets`
- Criar novo repositório limpo
- Rotacionar TODAS as credenciais (mais seguro)

---

## Credenciais que DEVEM ser ROTACIONADAS

| Serviço | Ação Necessária |
|---------|-----------------|
| **Supabase** | Criar novo projeto OU criar novas chaves |
| **Google Service Account** | Criar novo projeto e nova service account |
| **GEMINI_API_KEY** | Revogar no Google Cloud Console |
| **Evolution API** | Gerar nova API key no painel |
| **Zoho Mail** | Alterar senhas no painel Zoho |
| **N8N** | Alterar credenciais no painel |
| **Easypanel** | Alterar senha no painel |
| **Database (PostgreSQL)** | Alterar senha do usuário postgres |

---

## Verificação

Após configurar no Vercel, verificar:
1. ✅ Variáveis estão no painel do Vercel
2. ✅ Código não tem credenciais reais
3. ✅ Build funciona em produção
4. ✅ Formulário de contato funciona
5. ✅ APIs funcionam corretamente

---

## Monitoramento

Configure alertas para:
- Tentativas de acesso às APIs
- Erros de autenticação
- Uso abnormal de recursos

Recomendo ativar Sentry para error tracking:
- Criar projeto em https://sentry.io
- Adicionar `NEXT_PUBLIC_SENO_DSN` nas variáveis do Vercel

---

Data: 2026-05-15