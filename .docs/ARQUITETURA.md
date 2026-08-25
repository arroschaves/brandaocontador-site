# 🏗️ Arquitetura Técnica — Brandão Contabilidade

> Como o site funciona por dentro: fluxo de dados, APIs, variáveis de ambiente e deploy.

---

## 1. Visão Geral

```
Navegador (React)
   │  páginas SSR/CSR (Next.js App Router)
   ▼
Next.js 15 (Vercel)
   ├── Páginas estáticas (home, sobre, serviços...)
   ├── Páginas client-side (agronegocio, noticias, ferramentas)
   ├── API Routes (serverless functions)
   │     ├── /api/mercado/cotacoes  → BCB, BrasilAPI, AwesomeAPI, B3
   │     ├── /api/noticias          → RSS + scrapers oficiais
   │     ├── /api/contato           → SMTP / WhatsApp
   │     └── /api/health, /api/og, /api/csp-report
   └── Middleware (edge) → rate-limit + headers de segurança
```

## 2. Fluxo do Painel Agro (cotações)

```
GET /api/mercado/cotacoes
        │
        ├─ Cache em memória válido (< 30 min)? ──▶ responde cache
        │
        ├─ Promise.allSettled (5 fontes paralelas, timeout 8s cada):
        │     ├─ Dólar:  PTAX/BCB ─falhou─▶ AwesomeAPI ─falhou─▶ Frankfurter/ECB
        │     ├─ SELIC:  BrasilAPI /taxas/v1 ─falhou─▶ BCB SGS 4189 (Selic anualizada)
        │     ├─ IPCA:   BrasilAPI /taxas/v1 ─falhou─▶ BCB SGS 13522
        │     └─ Milho/Boi: B3 XLSX
        │            ├─ aba "Carteira"  → preço real (AdjstdQt) R$/saca e R$/@
        │            └─ aba "Índice Completo" → variação % entre dias
        │
        ├─ Alguma falhou? ──▶ usa "último valor conhecido" daquele indicador
        ├─ Todas falharam + sem histórico? ──▶ 503 com detalhe
        └─ Monta resposta com fonte de cada indicador
```

## 3. Fontes de Dados Externas

| Fonte | Uso | URL | Estado (2026-08) |
|---|---|---|---|
| BCB PTAX | Dólar oficial | `olinda.bcb.gov.br/.../CotacaoDolarDia` | ⚠️ Bloqueado de datacenter |
| BCB SGS | SELIC/IPCA fallback | `api.bcb.gov.br/dados/serie/bcdata.sgs.{code}` | ⚠️ Bloqueado de datacenter |
| AwesomeAPI | Dólar fallback 2 | `economia.awesomeapi.com.br/json/last/USD-BRL` | ⚠️ Instável de datacenter |
| Frankfurter/ECB | Dólar fallback 3 (usado em prod) | `api.frankfurter.dev/v1/latest?base=USD&symbols=BRL` | ✅ OK |
| BrasilAPI | SELIC/IPCA primário | `brasilapi.com.br/api/taxas/v1` | ✅ OK |
| B3 | Milho/Boi preços | `sistemaswebb3-listados.b3.com.br/.../IFMILHO.xlsx` e `IFBOI.xlsx` | ✅ OK |
| G1/CFC/Receita/eSocial/SEFAZ | Notícias | RSS + HTML | ✅ OK (com timeout) |

## 4. Variáveis de Ambiente

> Configurar no **painel do Vercel** (Settings → Environment Variables). NUNCA commitar valores reais.

| Variável | Obrigatória | Uso |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Obrigatória (se usar Supabase) | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Obrigatória (se usar Supabase) | Chave anônima Supabase |
| `SMTP_HOST` / `SMTP_PORT` | Para email | SMTP (ex.: smtp.gmail.com:587) |
| `SMTP_USER` / `SMTP_PASS` | Para email | Credenciais SMTP (app password) |
| `NEXT_PUBLIC_GA_ID` | Recomendada | Google Analytics (fallback: G-9DJG24BV6D) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Recomendada | Verificação Google Search Console |
| `GEMINI_API_KEY` | Opcional (futuro) | IA para análises |
| `DATABASE_URL` | Opcional | PostgreSQL (Supabase) |
| `N8N_WEBHOOK_URL` / `N8N_API_KEY` | Opcional | Automações (leads) |
| `EVOLUTION_API_KEY` / `EVOLUTION_INSTANCE` | Opcional | WhatsApp API |

> ⚠️ **IMPORTANTE:** `NEXT_PUBLIC_*` é visível no navegador. Secrets reais (SMTP_PASS, service role, DATABASE_URL) NUNCA devem usar prefixo `NEXT_PUBLIC_`.

## 5. Deploy (Vercel)

1. Push para `main` no GitHub → Vercel detecta e builda automaticamente
2. Domínio: `brandaocontador.com.br` → Cloudflare (307) → `www.brandaocontador.com.br`
3. Verificações pós-deploy:
   - `GET /api/health` → 200 `{"status":"healthy"}`
   - `GET /api/mercado/cotacoes` → 200 com `dolar`, `macro`, `agroIndices`
   - Home + páginas principais → 200 sem erros no console

## 6. Estrutura de Pastas

```
app/
├── api/
│   ├── contato/       → formulário (SMTP/WhatsApp)
│   ├── csp-report/    → relatório CSP
│   ├── health/        → health check
│   ├── mercado/cotacoes/ → painel agro
│   ├── noticias/      → agregação de notícias
│   └── og/            → imagem Open Graph
├── components/        → Header, Footer, WhatsAppFloat, SEO...
├── agronegocio/  sobre/  servicos/  ferramentas/  noticias-contabeis/
├── links-uteis/  reforma-tributaria/  contato/
├── layout.tsx    page.tsx   globals.css
lib/               → security, validation, logger, utils, constants
types/             → tipos TS
.docs/             → documentação (esta pasta)
```

## 7. Decisões e Trade-offs

- **Cache em memória (serverless):** cada instância Vercel tem seu próprio cache (30 min). Suficiente para dados diários. Para cache global, migrar para Upstash Redis/Verce KV no futuro.
- **Stale-while-revalidate:** garante que o painel nunca fique vazio mesmo com fontes externas fora do ar.
- **Preços B3 vs CEPEA:** CEPEA está protegido por Cloudflare (403 para servidores). B3 publica planilhas públicas — usamos o preço do contrato futuro (referência diária oficial).

---

_Última atualização: 2026-08-25_
