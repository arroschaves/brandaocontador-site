# 📝 Changelog — Brandão Contabilidade

> Registro de mudanças do site. Formato baseado em [Keep a Changelog](https://keepachangelog.com/).

## [0.3.0] — 2026-08-25 — Correção do Painel Agro + Documentação

### Corrigido
- **API de cotações (`/api/mercado/cotacoes`) — CRÍTICO:** reescrita com arquitetura resiliente:
  - Isolamento por fonte (`Promise.allSettled` em vez de `Promise.all`) — uma falha não derruba mais o painel
  - Timeout de 8s por chamada externa (AbortController)
  - **Preços reais** de milho (R$/saca 60kg) e boi gordo (R$/@) extraídos da planilha Carteira da B3 (antes: apenas índices em pontos)
  - **SELIC corrigida:** série 4390 (Meta Copom anual) no lugar da 432 (acumulada mensal exibida como anual)
  - **Variação do dólar real** (cálculo entre dias PTAX; fallback AwesomeAPI com pctChange)
  - **Fallbacks:** BCB → BrasilAPI (SELIC/IPCA) e AwesomeAPI (dólar)
  - **Stale-while-revalidate:** se fontes falharem, serve último painel válido marcado como `stale`
  - Nunca mais 500 genérico (503 apenas se todas as fontes falharem)
- **Metadados (`app/layout.tsx`):** strings corrompidas "agronegóHighlights" → "agronegócio" (3 ocorrências); verification via env var; logo schema → arquivo real; email unificado (`adm@`); GA via env var; sameAs com redes sociais
- **Middleware:** removido `Cross-Origin-Embedder-Policy: require-corp` (bloqueava recursos de terceiros sem CORS, ex.: Google Analytics)
- **API de notícias:** timeout de 10s por fonte (evita travamento do painel com fonte lenta)

### Adicionado
- **Página Agronegócio atualizada:** exibe preços reais formatados, fonte de cada indicador, aviso de dados defasados (stale), labels corretos
- **Pasta `.docs/`** com documentação completa:
  - `README.md` — índice
  - `PRD.md` — Product Requirements Document
  - `ANALISE-SITE.md` — análise completa com evidências de teste
  - `ARQUITETURA.md` — arquitetura e fluxo de dados
  - `SEGURANCA.md` — postura de segurança
  - `ROADMAP.md` — backlog priorizado
  - `CHANGELOG.md` — este arquivo

---

## [0.2.0] — Histórico anterior (resumo do git)

- `5cf5a5d7` fix: atualizar URLs dos links úteis para portais governamentais
- `3e554e2e` fix: redesenhar card decorativo do hero
- `f104f5e0` remover: referências ao CRC
- `3cd9e861` fix: atualizar CSP para permitir Google Analytics
- `db96ccdb` feat: adicionar Google Analytics G-9DJG24BV6D
- `acd029f3` feat: WhatsApp flutuante, reforma tributária expandida, SEO e analytics
- `cf8aec5c` feat: página Sobre, calculadoras, painel de notícias
- `f7b444da` fix: atualizar dependências (vulnerabilidades)
- `a1761e1e` feat: segurança e melhorias
- `be9e30d7` fix: reveal nas páginas, estabiliza painel agro
- `ba7fcf15` refactor: site institucional, SEO, notícias, painel agro
- `ad1722b9` feat: redesign completo v4.0 (design system moderno)
