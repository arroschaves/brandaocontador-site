# 🔍 Análise Completa do Site — Brandão Contabilidade

> O que temos, o que está quebrado, por que está quebrado e como corrigimos.
> Data da análise: **2026-08-25** (com testes reais em produção).

---

## 1. Resumo Executivo

O site é um **Next.js 15 (App Router)** bem estruturado, com design moderno, dark mode, SEO básico e várias seções de conteúdo. **O problema crítico** é o **Painel Agro (cotações)**, que **retorna erro 500 em produção sempre** e não exibe preços reais. Além disso, encontramos **strings corrompidas em metadados** ("agronegóHighlights"), uma **série SELIC incorreta**, e **falta de resiliência** nas APIs (uma fonte externa lenta/falha derruba tudo).

**Diagnóstico raiz:** o Banco Central (api.bcb.gov.br / olinda.bcb.gov.br) está **bloqueando/timeout de redes de datacenter** (verificado: Vercel e proxies retornam erro), e o código usava `Promise.all` — uma única falha do BCB derrubava o painel inteiro, sem fallback e sem cache de contingência.

---

## 2. Inventário — O Que Temos

### 2.1 Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15.5.18 (App Router) |
| UI | React 19, Tailwind CSS 3.4, lucide-react |
| Linguagem | TypeScript 5.7 |
| Validação | Zod 3.24 |
| Email | Nodemailer (SMTP) |
| Planilhas | xlsx (parse de XLSX da B3) |
| Analytics | @vercel/speed-insights + Google Analytics G-9DJG24BV6D |
| Deploy | Vercel (projeto `brandaocontador-site`) |
| Domínio | brandaocontador.com.br → www (Cloudflare) |
| Repositório | github.com/arroschaves/brandaocontador-site |

### 2.2 Páginas

| Rota | Arquivo | Estado |
|---|---|---|
| `/` | app/page.tsx | ✅ OK (design bom) |
| `/sobre` | app/sobre/page.tsx | ✅ OK |
| `/servicos` | app/servicos/page.tsx | ✅ OK |
| `/ferramentas` | app/ferramentas/page.tsx | ✅ OK (3 calculadoras) |
| `/agronegocio` | app/agronegocio/page.tsx | ⚠️ **Painel agro quebrado (cotações)** |
| `/noticias-contabeis` | app/noticias-contabeis/page.tsx | ⚠️ Frágil (fontes sem timeout) |
| `/links-uteis` | app/links-uteis/page.tsx | ✅ OK |
| `/reforma-tributaria` | app/reforma-tributaria/page.tsx | ✅ OK |
| `/contato` | app/contato/page.tsx | ✅ OK |

### 2.3 APIs (rotas Next.js)

| Rota | Função | Estado |
|---|---|---|
| `/api/mercado/cotacoes` | Painel agro (dólar, SELIC, IPCA, milho, boi) | ❌ **500 em produção** |
| `/api/noticias` | Agregação de notícias (RSS + scrapers) | ⚠️ Funciona mas frágil (sem timeouts) |
| `/api/contato` | Formulário de contato (SMTP + WhatsApp fallback) | ✅ OK |
| `/api/health` | Health check | ✅ OK |
| `/api/og` | Imagem Open Graph | ✅ OK |
| `/api/csp-report` | Relatório de violações de CSP | ✅ OK |

### 2.4 Infraestrutura de apoio

- `middleware.ts` — rate-limit simples, headers de segurança, bloqueio de IPs (lista vazia)
- `next.config.js` — CSP completa, HSTS, Permissions-Policy, rewrites para Supabase
- `lib/security.ts` — validação CPF/CNPJ/email/telefone, sanitização, rate limiter
- `lib/validation.ts` — schemas Zod
- `lib/logger.ts` — logging estruturado
- `app/components/` — Header, Footer, WhatsAppFloat, ErrorBoundary, ScrollReveal, SEOMeta, SecurityMeta, JsonLd, PerformanceMonitor, Loading, ClientWrapper

---

## 3. Problemas Encontrados (com evidências)

### 🔴 P1 — Painel Agro (cotações) QUEBRADO — CRÍTICO

**Sintoma relatado pelo cliente:** "cotações ta muito travado, não traz as cotações reais".

**Evidência (teste real em produção):**

```
GET https://www.brandaocontador.com.br/api/mercado/cotacoes
→ HTTP 500  {"error":"Erro ao buscar cotações oficiais"}   (3 tentativas, ~1s cada)
```

**Causa raiz:** o endpoint buscava **5 fontes em paralelo com `Promise.all`** (PTAX, SELIC, IPCA, Milho B3, Boi B3). Qualquer falha de UMA derrubava tudo. E o **Banco Central está inacessível de redes de datacenter** (Vercel inclui) — verificado via proxy: `api.bcb.gov.br` → 522 timeout; `olinda.bcb.gov.br` → 408 timeout. A B3 funciona (testado, 200 OK).

**Problemas secundários no mesmo endpoint:**

| # | Problema | Impacto |
|---|---|---|
| 1 | `Promise.all` sem isolamento | 1 fonte falha → painel inteiro 500 |
| 2 | `fetch` sem timeout (AbortController) | Fonte pendurada → travamento longo |
| 3 | Série SELIC **432** ("acumulada no mês") exibida como "Taxa anual" | **Valor semanticamente errado** |
| 4 | Variação do dólar **hardcoded = 0** | Sempre mostra 0,00% |
| 5 | Exibe **índices B3 em "pontos"** (abstrato) | Não traz **preços reais** (R$/saca, R$/@) — o que o usuário quer |
| 6 | Labels "CEPEA/ESALQ" na página mas dados são B3 | UI enganosa |
| 7 | Cache só em memória por instância | Cold start no Vercel → refaz tudo |
| 8 | Sem stale-while-revalidate | Fonte caiu → usuário vê erro, não o último dado |

### 🟠 P2 — Strings corrompidas em metadados (SEO)

Em `app/layout.tsx` encontramos **3 ocorrências** da string corrompida **"agronegóHighlights"** (resultado de edição truncada):

- keyword: `'contabilidade para agronegóHighlights'`
- Open Graph description: `'...empresas e agronegóHighlights em Sidrolândia...'`
- JSON-LD description: `'Serviços contábeis para empresas e agronegóHighlights'`

**Impacto:** metadados quebrados aparecem no Google/WhatsApp — passa imagem amadora e prejudica SEO. ❌ **Corrigido nesta análise.**

### 🟠 P3 — Middleware com COEP `require-corp`

`middleware.ts` envia `Cross-Origin-Embedder-Policy: require-corp` em **todas as respostas**. Isso **bloqueia recursos de terceiros sem CORS** (ex.: Google Analytics, fontes externas) no navegador — pode quebrar analytics e outros carregamentos. ❌ **Removido nesta análise** (sem benefício real para site de conteúdo).

### 🟠 P4 — API de notícias sem timeouts

Os scrapers (eSocial gov.br com regex frágil, SEFAZ MS por HTML) e os RSS usam `fetch` **sem timeout**. Teste: uma chamada levou **60s+** (timeout do cliente). Uma fonte lenta segura o painel inteiro. ✅ **Corrigido (timeout de 10s por fonte).**

### 🟡 P5 — Segurança: histórico com credenciais

`SECURITY_FIX.md` documenta que `.env.local` **já foi commitado** com credenciais reais (Supabase, Zoho, N8N, Evolution API, GEMINI). O arquivo atual não está mais rastreado (verificado), **mas o histórico git ainda contém**. Recomendação: rotacionar TODAS as credenciais que já passaram pelo repositório.

### 🟡 P6 — Placeholders e inconsistências de SEO/contato

| Item | Problema |
|---|---|
| `metadata.verification.google` | Valor placeholder `'google-site-verification-code'` |
| Schema logo | `logo.png` não existe (arquivos reais: logo-square.jpg etc.) |
| Email no schema | `contato@` vs `adm@` no Footer — inconsistente |
| `twitter.creator` | `@brandaocontador` provavelmente não existe |
| GA ID | Hardcoded em vez de env var |

### 🟡 P7 — Outros ajustes

- `eslint.ignoreDuringBuilds: true` → lint desativado no build (risco silencioso)
- `Cache-Control: no-store` aplicado a **todas** as páginas (desperdício de performance em páginas estáticas)
- `types/index.ts` com tipos legados não utilizados (User, Noticia com slug...)
- Links Úteis: apenas 2 links externos detectados na página (`href="http...`) — conferir se a página está completa

---

## 4. Como Corrigimos (implementado nesta rodada)

### ✅ Correção 1 — API de cotações reescrita (resiliente + preços reais)

**Arquivo:** `app/api/mercado/cotacoes/route.ts`

| Antes | Depois |
|---|---|
| `Promise.all` — 1 falha derruba tudo | `Promise.allSettled` — cada fonte isolada |
| Sem timeout | `AbortController` com timeout de **8s** |
| SELIC série 432 (mensal, errada) | Série **4390 = Meta Copom anual** + fallback BrasilAPI |
| Dólar variação = 0 | Variação calculada entre dias PTAX; fallback AwesomeAPI com `pctChange` |
| Índices B3 em pontos | **Preços reais** da planilha Carteira: milho **R$/saca 60kg**, boi **R$/@** |
| Sem contingência | **Stale-while-revalidate**: se fonte falhar, serve último dado válido com aviso `stale: true` |
| Erro 500 genérico | 503 apenas se TODAS as fontes falharem, com detalhe |
| Labels CEPEA/ESALQ | Labels corretos: B3 — contrato futuro (preço real) |

**Novo fluxo de dados:**
```
Dólar:   PTAX (BCB) ──falhou──▶ AwesomeAPI
SELIC:   BCB SGS 4390 ──falhou──▶ BrasilAPI
IPCA:    BCB SGS 13522 ──falhou──▶ BrasilAPI
Milho:   B3 XLSX (Carteira → R$/saca 60kg + Índice Completo → variação)
Boi:     B3 XLSX (Carteira → R$/@ + Índice Completo → variação)
```

**Fontes validadas nesta análise (testes reais):**
- B3 IFMILHO/IFBOI XLSX → ✅ 200 OK, parsing OK, preço real extraído
- AwesomeAPI USD-BRL → ✅ 200 OK em 0.27s
- BrasilAPI taxas → ✅ 200 OK em 0.25s (SELIC + IPCA)
- BCB PTAX/SGS → ❌ bloqueado de datacenter (por isso o fallback)

### ✅ Correção 2 — Página Agronegócio atualizada

**Arquivo:** `app/agronegocio/page.tsx`
- Exibe preços reais formatados (R$ 71,79/saca, R$ 355,70/@)
- Mostra a **fonte** de cada indicador (PTAX, AwesomeAPI, BCB, BrasilAPI, B3)
- Aviso visual quando dados estão defasados (stale)
- Labels corrigidos (sem "CEPEA/ESALQ" enganoso)
- Melhor tratamento de erro

### ✅ Correção 3 — Metadados corrigidos

**Arquivo:** `app/layout.tsx`
- "agronegóHighlights" → "agronegócio" (3 ocorrências)
- Verification via env var (sem placeholder)
- Logo schema → `logo-square.jpg` (arquivo real)
- Email unificado → `adm@brandaocontador.com.br`
- GA ID via `NEXT_PUBLIC_GA_ID` com fallback
- `sameAs` com Facebook/Instagram

### ✅ Correção 4 — Middleware

**Arquivo:** `middleware.ts`
- Removido `Cross-Origin-Embedder-Policy: require-corp`
- `/api/health` excluído do rate-limit

### ✅ Correção 5 — API de notícias

**Arquivo:** `app/api/noticias/route.ts`
- Timeout de 10s por fonte (3 scrapers/RSS)

---

## 5. Como Vai Ficar (resultado esperado)

1. **Painel Agro funcionando** — com preços reais do dia (R$/saca soja/milho, R$/@ boi), dólar com variação, SELIC/IPCA corretos, fonte e data de cada dado visíveis
2. **Resiliente** — BCB caiu? Usa AwesomeAPI/BrasilAPI. Tudo caiu? Mostra último painel válido com aviso. Nunca mais "travado" ou erro 500
3. **SEO limpo** — metadados corretos, sem strings corrompidas
4. **Notícias rápidas** — fonte lenta não segura o painel
5. **Analytics funcionando** — sem COEP bloqueando terceiros

---

## 6. Decisões Técnicas (ADR resumido)

| Decisão | Alternativa rejeitada | Motivo |
|---|---|---|
| Preços reais da B3 (Carteira) como fonte agro | CEPEA/ESALQ scraping | CEPEA está atrás de Cloudflare challenge (403) — scraping inviável do servidor |
| AwesomeAPI para dólar fallback | Scraping de sites | API gratuita, sem chave, JSON limpo, inclui variação |
| BrasilAPI para SELIC/IPCA fallback | IBGE SIDRA | BrasilAPI retorna SELIC+IPCA num único GET simples |
| Stale-while-revalidate em memória | Upstash/Redis KV | Vercel Hobby não tem KV; cache em memória + stale é suficiente para dados diários |

---

## 7. Próximos Passos (sugeridos)

1. **Deploy** desta correção (push → Vercel) e validação em produção
2. **Rotacionar credenciais** que já passaram pelo git (Supabase, Zoho, N8N, Evolution, GEMINI)
3. Configurar `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` e `NEXT_PUBLIC_GA_ID` no Vercel
4. Conferir páginas de conteúdo (links úteis, reforma tributária) e atualizar informações
5. Ver ROADMAP.md para melhorias futuras (gráficos de histórico, widget na home, etc.)

---

_Última atualização: 2026-08-25_
