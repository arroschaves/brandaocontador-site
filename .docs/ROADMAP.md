# 🗺️ Roadmap — Melhorias Futuras

> Backlog priorizado. Prioridades: **P0** (urgente) → **P1** (importante) → **P2** (diferencial).

---

## P0 — Urgente (fazer em breve)

| # | Melhoria | Esforço | Impacto |
|---|---|---|---|
| 1 | **Rotacionar credenciais** expostas no histórico git (Supabase, Zoho, N8N, Evolution, GEMINI) | Médio | Segurança |
| 2 | Configurar `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` e `NEXT_PUBLIC_GA_ID` no Vercel | Baixo | SEO/Analytics |
| 3 | Adicionar **git-secrets/trufflehog** no CI (GitHub Actions) | Baixo | Segurança |
| 4 | Verificar se o **Google Search Console** está indexando corretamente | Baixo | SEO |

## P1 — Importante

| # | Melhoria | Esforço | Impacto |
|---|---|---|---|
| 5 | **Widget de cotações na Home** (bloco compacto: dólar + milho + boi) | Baixo | Engajamento |
| 6 | **Gráfico de histórico** (30 dias) de soja/milho/boi no Painel Agro | Médio | Diferenciação agro |
| 7 | Adicionar **soja** ao painel (preço R$/saca 60kg) — fonte oficial: buscar contrato futuro ou índice B3 equivalente | Médio | Relevância MS |
| 8 | **Cache global** com Upstash Redis/Vercel KV para cotações (cache compartilhado entre instâncias) | Médio | Performance |
| 9 | **Sentry** para error tracking (DSN no Vercel + `@sentry/nextjs`) | Baixo | Observabilidade |
| 10 | Habilitar **lint no build** (`eslint.ignoreDuringBuilds: false`) + GitHub Actions (type-check + lint) | Baixo | Qualidade |
| 11 | **Cache-Control granular:** páginas estáticas com `s-maxage` maior (hoje tudo é `no-store`) | Baixo | Performance |

## P2 — Diferencial

| # | Melhoria | Esforço | Impacto |
|---|---|---|---|
| 12 | **Chatbot/FAQ com IA** (GEMINI_API_KEY já prevista) para dúvidas frequentes | Médio | Conversão |
| 13 | **Área do cliente** (portal com obrigações fiscais, calendário, documentos) | Alto | Retenção |
| 14 | **Integração CRM/leads**: formulário → N8N → WhatsApp/email automático | Médio | Operação |
| 15 | **Blog próprio** com artigos contábeis (SEO longo prazo) | Médio | SEO |
| 16 | **Página de vagas** (o escritório contrata) | Baixo | Recrutamento |
| 17 | **Depoimentos de clientes** com fotos (prova social real) | Baixo | Conversão |
| 18 | **i18n** (versão em espanhol para fronteira) | Alto | Alcance |

## P3 — Técnica / Manutenção

| # | Melhoria | Esforço | Impacto |
|---|---|---|---|
| 19 | Atualizar `eslint-config-next` (15.1.11 → 15.5.x) para casar com Next 15.5 | Baixo | Qualidade |
| 20 | Remover `types/index.ts` legados não utilizados (limpeza) | Baixo | Manutenibilidade |
| 21 | Testes automatizados (Vitest + Testing Library) para calculadoras e API de cotações | Médio | Confiabilidade |
| 22 | Adicionar `@vercel/analytics` (Web Analytics) além do Speed Insights | Baixo | Métricas |

---

## Prioridade de Execução Recomendada

1. ✅ P0-1 a P0-4 (segurança + SEO) — **imediato**
2. P1-5 e P1-7 (widget home + soja) — **próxima sprint**
3. P1-6 e P1-8 (gráfico + cache global) — **após validação do painel**
4. P2 conforme demanda de negócio

---

_Última atualização: 2026-08-25_
