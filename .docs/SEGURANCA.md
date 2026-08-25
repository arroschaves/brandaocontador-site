# 🔒 Segurança — Brandão Contabilidade

> Postura de segurança do site, controles ativos e pendências.

---

## 1. Controles Ativos

| Controle | Onde | Status |
|---|---|---|
| **CSP** (Content-Security-Policy) | `next.config.js` | ✅ Ativa (default-src 'self', sem unsafe-inline para scripts... *ver nota*) |
| **HSTS** (Strict-Transport-Security) | `next.config.js` | ✅ Ativa (max-age 1 ano, includeSubDomains, preload) |
| **X-Frame-Options: DENY** | `next.config.js` | ✅ Ativa (anti-clickjacking) |
| **X-Content-Type-Options: nosniff** | `next.config.js` | ✅ Ativa |
| **Referrer-Policy** | `next.config.js` | ✅ Ativa (strict-origin-when-cross-origin) |
| **Permissions-Policy** | `next.config.js` | ✅ Ativa (camera/mic/geo/payment desabilitados) |
| **Rate-limit** formulário/APIs | `middleware.ts` + `lib/security.ts` | ✅ Ativo (100 req/min/IP, best-effort em memória) |
| **Validação Zod + sanitização** | `app/api/contato` | ✅ Ativa (anti-injection, anti-XSS) |
| **CORS restrito** | `next.config.js` | ✅ Apenas `https://brandaocontador.com.br` |
| **Cache-Control no-store** | `next.config.js` | ✅ Em páginas e APIs sensíveis |

> ⚠️ **Nota CSP:** a política atual inclui `'unsafe-inline' 'unsafe-eval'` em `script-src` — necessários para o Next.js/GA em alguns cenários, mas reduz a proteção. Avaliar endurecer em versão futura.

## 2. ⚠️ PENDÊNCIA CRÍTICA — Credenciais no histórico Git

**Situação:** o arquivo `.env.local` **já foi commitado** no repositório (commits `67c7bcbe`, `a5539885`) com credenciais reais (Supabase, Zoho, N8N, Evolution API, GEMINI, etc.). O arquivo atual não está mais rastreado, **mas o histórico contém os segredos**.

**Ações recomendadas (prioridade alta):**

1. **Rotacionar TODAS as credenciais** que passaram pelo repositório:
   - Supabase: gerar novas chaves (ou novo projeto)
   - Google: revogar service account + API keys
   - Zoho Mail: trocar senhas (RH, ADM, CJ)
   - N8N: trocar API key
   - Evolution API: gerar nova instância/chave
   - Banco de dados: trocar senha do postgres
2. **Limpar o histórico** (opcional, reescreve git):
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.local" \
     --prune-empty --tag-name-filter cat -- --all
   git push origin --force --all
   git reflog expire --expire=now --all && git gc --prune=now --aggressive
   ```
   > ⚠️ Atenção: reescrever histórico exige force-push e pode impactar colaboradores. A **rotação de credenciais é a prioridade** — o histórico limpo é defesa em profundidade.
3. **Prevenir recorrência:**
   - `.gitignore` já cobre `.env*` (verificado ✅)
   - Adicionar `git-secrets` ou `trufflehog` no CI para bloquear commits com secrets
   - Nunca commitar arquivos `.env*`

## 3. Checklist de Verificação

- [ ] `.env`, `.env.local`, `.env.production` fora do git (✅ verificado)
- [ ] Secrets sem prefixo `NEXT_PUBLIC_` (✅ código atual OK)
- [ ] API de contato não vaza detalhes de erro ao cliente (✅)
- [ ] Headers de segurança presentes na resposta (✅ verificado em produção)
- [ ] Credenciais rotacionadas após incidente de histórico (⏳ pendente — ação do dono)

## 4. Monitoramento

| Ferramenta | Status | Ação sugerida |
|---|---|---|
| Vercel Analytics / Speed Insights | ✅ Ativo | — |
| Google Analytics G-9DJG24BV6D | ✅ Ativo | Verificar se eventos chegam (após remoção do COEP) |
| Sentry | ❌ Não configurado | Adicionar `NEXT_PUBLIC_SENTRY_DSN` + `@sentry/nextjs` |
| Uptime monitoring | ⚠️ Parcial | Configurar UptimeRobot/Vercel Cron para `/api/health` |
| Alertas de erro | ⚠️ Nenhum | Sentry ou alertas de log no Vercel |

---

_Última atualização: 2026-08-25_
