# 📋 PLAN: Melhoria Completa — brandaocontador.com.br

> **Criado:** 2026-02-11
> **Status:** 🔄 Em Execução
> **Scorecard Anterior:** 6.9/10 → **Meta: 9.0/10**
> **Build Status:** ✅ Compilado com sucesso (51 páginas)

---

## Decisões do Cliente

| Decisão | Resposta |
|---------|----------|
| Redes Sociais | FB: `profile.php?id=61583096446223` / IG: `bcbrandaocontabilidade` |
| Admin/Segurança | Opção A: Manter `/admin` + RBAC + botão condicional |
| Formulário Contato | Email: `adm@brandaocontador.com.br` + WhatsApp `(67) 99601-1356` |
| Prioridade | Fase 1 → Fase 2 → progressivo |
| Tel Removido | `67-3272-1356` removido (não existe mais) |

---

## FASE 1 — Correções Urgentes ⚡

| # | Tarefa | Status | Arquivo |
|---|--------|--------|---------|
| 1.1 | Favicon dinâmico (B amber) | ✅ | `app/icon.tsx` + `app/apple-icon.tsx` |
| 1.2 | OG Image dinâmica | ✅ | `app/api/og/route.tsx` |
| 1.3 | Corrigir links redes sociais (FB + IG reais) | ✅ | `Footer.tsx` |
| 1.4 | Corrigir "CONTATO_IMEDIATO" → "WHATSAPP" | ✅ | `Header.tsx` |
| 1.5 | Unificar rota Portal → `/login` | ✅ | `Header.tsx` (desktop + mobile) |
| 1.6 | Mover playwright para devDependencies | ✅ | `package.json` |
| 1.7 | Formulário de contato funcional | ✅ | `contato/page.tsx` + `api/contato/route.ts` |
| 1.8 | Remover telefone fixo inexistente | ✅ | `contato/page.tsx` |

## FASE 2 — SEO & Dados Estruturados

| # | Tarefa | Status |
|---|--------|--------|
| 2.1 | JSON-LD LocalBusiness + AccountingService | ✅ | `components/JsonLd.tsx` |
| 2.2 | Meta descriptions únicas (contato) | ✅ | `contato/layout.tsx` |
| 2.3 | Adicionar `/noticias-contabeis` ao sitemap | ✅ | `sitemap.ts` |
| 2.4 | Aria-labels e acessibilidade (Header) | ✅ | `Header.tsx` |
| 2.5 | OG Image URL corrigida no layout | ✅ | `layout.tsx` |

## FASE 3 — Segurança & Admin

| # | Tarefa | Status |
|---|--------|--------|
| 3.1 | RBAC no middleware (admin/staff/master) | ✅ | `lib/supabase/middleware.ts` |
| 3.2 | Botão Admin condicional no Header | ✅ | `Header.tsx` |
| 3.3 | Rate limiting no login (10 req/5min) | ✅ | `lib/supabase/middleware.ts` |
| 3.4 | Rate limiting no formulário de contato | ✅ | `api/contato/route.ts` |

## FASE 4 — Conteúdo Dinâmico & Painel Agro

| # | Tarefa | Status |
|---|--------|--------|
| 4.1 | Painel Mercado Agro com índices reais diários | ⏳ |
| 4.2 | Notícias automáticas por setor/segmento | ⏳ |
| 4.3 | Reforma Tributária 2026 completa | ⏳ |
| 4.4 | Links úteis (SEFAZ MS, sites governamentais) | ⏳ |

## FASE 5 — Publicação Social Automatizada

| # | Tarefa | Status |
|---|--------|--------|
| 5.1 | Publicação automática Facebook/Instagram diária | ⏳ |
| 5.2 | Conteúdo gerado para YouTube | ⏳ |

---

## Resumo de Mudanças (Fases 1-3)

### Arquivos Criados
- `app/icon.tsx` — Favicon dinâmico
- `app/apple-icon.tsx` — Apple Touch Icon
- `app/api/og/route.tsx` — OG Image dinâmica
- `app/api/contato/route.ts` — API de contato (email + WhatsApp)
- `app/components/JsonLd.tsx` — Dados estruturados Schema.org
- `app/contato/layout.tsx` — SEO metadata para contato

### Arquivos Modificados
- `app/components/Footer.tsx` — Links sociais reais + remoção LinkedIn
- `app/components/Header.tsx` — WHATSAPP label + botão admin + aria-labels + rota unificada
- `app/layout.tsx` — JSON-LD + OG image URL corrigida
- `app/contato/page.tsx` — Formulário funcional + telefone fixo removido
- `app/sitemap.ts` — Adicionado /noticias-contabeis
- `lib/supabase/middleware.ts` — RBAC + rate limiting
- `package.json` — playwright→devDeps, removido duplicidade PDF
