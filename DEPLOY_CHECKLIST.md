# ✅ Checklist de Deploy - brandaocontador-site

## ✅ Já Concluído

- [x] Commit de todas as melhorias de segurança
- [x] Push para o GitHub
- [x] Build validado com sucesso
- [x] Dependencies atualizadas (Next.js 15.5.18, nodemailer 8.0.7)

---

## ⚠️ Ações Necessárias (PRIORIDADE ALTA)

### 1. 🔴 ROTACIONAR TODAS AS CREDENCIAIS

Como as credenciais foram expostas no Git, você **DEVE** criar novas:

| Serviço | Onde | Ação |
|---------|------|------|
| **Supabase** | supabase.com | Settings → API → Gerar novas chaves |
| **Google Service Account** | console.cloud.google.com | IAM → Service Accounts → Nova chave |
| **GEMINI API** | aistudio.google.com | API Keys → Revogar/Criar nova |
| **Evolution API** | evolution.brandaocontador.com.br | Settings → API → Nova chave |
| **Zoho Mail** | zoho.com/mail | Segurança → Alterar senha |
| **N8N** | webhook.brandaocontador.com.br | Settings → Credenciais |
| **Easypanel** | Painel | Settings → Alterar senha |

### 2. 🔴 CONFIGURAR NO VERCEL

Acesse: **https://vercel.com/brandaocontador-site/settings/environment-variables**

Adicione cada variável abaixo:

```
NEXT_PUBLIC_SUPABASE_URL=https://ycgwmwmcyxwflkaehwds.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=NOVA_CHAVE_AQUI

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=NOVA_SENHA_APP (senha de app do Google, não sua senha normal)

GEMINI_API_KEY=NOVA_CHAVE

EVOLUTION_API_URL=https://evolution.brandaocontador.com.br
EVOLUTION_API_KEY=NOVA_CHAVE
EVOLUTION_INSTANCE=escritorioatendimento
```

### 3. 🟡 REMOVER DO HISTÓRIO GIT (OPCIONAL MAS RECOMENDADO)

Se o repo já foi clonado por outras pessoas, as credenciais ainda estão no histórico. Para limpar:

```bash
# ATENÇÃO: ISSO REESCREVE O HISTÓRICO
cd E:\PROJETOS\brandaocontador-site
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env.local" --prune-empty --tag-name-filter cat -- --all
git push origin --force --all
```

---

## 📋 Após o Deploy

1. **Testar o site**: https://brandaocontador.com.br
2. **Testar formulário de contato**: Enviar mensagem de teste
3. **Verificar health check**: https://brandaocontador.com.br/api/health
4. **Monitorar erros**: Configure Sentry para monitoramento

---

## 📊 Melhorias Implementadas

| Recurso | Status |
|---------|--------|
| Content Security Policy (CSP) | ✅ |
| Rate Limiting | ✅ |
| Validação com Zod | ✅ |
| Middleware de segurança | ✅ |
| SEO completo (Schema.org) | ✅ |
| Speed Insights | ✅ |
| Error Boundary | ✅ |
| Health Check API | ✅ |
| Atualização de dependencies | ✅ |

---

## 📁 Arquivos Importantes Criados

- `SECURITY_FIX.md` - Guia de segurança completo
- `vercel-setup.ps1` - Script para configurar Vercel
- `DEPLOY_CHECKLIST.md` - Este arquivo

---

## 🔍 Observação Importante

O arquivo `xlsx` tem vulnerabilidade **ALTA** sem correção disponível. Se você usa essa biblioteca para exportar Excel, considere alternativas como:
- `exceljs`
- `xlsx-populate`
- ou usar a biblioteca apenas no backend com sanitização extra

---

Para dúvidas ou problemas, consulte `SECURITY_FIX.md`