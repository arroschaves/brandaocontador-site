# 📝 Changelog — Brandão Contabilidade

> Registro de mudanças do site. Formato baseado em [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased] — 2026-09-01 — Análise completa + Documentação (sem mudanças de código)

### Análise em produção (verificada ao vivo)
- **9 páginas → 200** (home, sobre, serviços, agronegócio, ferramentas, notícias, reforma, links úteis, contato).
- **APIs OK:** `/api/health`, `/api/mercado/cotacoes` (fallback Frankfurter/ECB + BrasilAPI), `/api/noticias` (mas ~10s em cache frio).
- **Bug de SEO confirmado:** título duplicado ("... | Brandão Contabilidade | Brandão Contabilidade") em 7 páginas, por concorrência entre o template do `layout.tsx` (`%s | Brandão Contabilidade`) e o título já com marca nas páginas.
- **`/ferramentas`** usa o título default da marca (sem título/description próprio).
- **`app_painel_contabil.remote.py`** órfão na raiz; **cópia duplicada** do site em `E:\PROJETOS\brandaocontador-site`.

### Documentado
- Criada memória do projeto em `.opencode/memory/MEMORY.md` + histórico de sessão em `.opencode/memory/sessions/2026-09-01-analise-e-documentacao.md`.
- Atualizado `PRD.md` (v1.1): escopo do site explicitado como **100% institucional**; CRM/leads movido para Fora de Escopo.

### Decisões
- **Site = somente institucional/marketing.** Remover material de CRM/integrações que não seja site (pendente de aplicação).
- Nenhuma alteração de código foi feita (aguardando aval). Nada commitado/pushado — documentação mantida local.

### Nota de versão
- `package.json` está em `0.2.0`, mas o `CHANGELOG.md` registra `0.3.0` (o `/api/health` retorna `0.2.0`) — sincronizar versão na próxima mudança de código.

---

## [0.3.0] — 2026-08-25 — Correção do Painel Agro + Documentação

### Corrigido
- **API de cotações (`/api/mercado/cotacoes`) — CRÍTICO:** reescrita com arquitetura resiliente:
  - Isolamento por fonte (`Promise.allSettled` em vez de `Promise.all`) — uma falha não derruba mais o painel
  - Timeout de 8s por chamada externa (AbortController)
  - **Preços reais** de milho (R$/saca 60kg) e boi gordo (R$/@) extraídos da planilha Carteira da B3 (antes: apenas índices em pontos)
  - **SELIC corrigida:** BrasilAPI (taxa anual 14%) como fonte primária; fallback BCB SGS 4189 (anualizada base 252) — antes usava série 432 (acumulada mensal exibida como anual)
  - **Variação do dólar real:** PTAX entre dias; AwesomeAPI `pctChange`; Frankfurter/ECB com variação calculada vs último valor
  - **Cadeia de dólar com 3 fontes:** PTAX (BCB) → AwesomeAPI → Frankfurter/ECB (usada em produção, pois BCB e AwesomeAPI estão instáveis em datacenter)
  - **Último valor conhecido por indicador:** fonte falhou → usa o último valor válido daquele indicador (nunca zeros)
  - **Stale/parcial:** `stale: true` + observação detalhando quais indicadores usaram valores anteriores
  - Nunca mais 500 genérico (503 apenas se todas as fontes falharem e não houver histórico)
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

### Validado em produção (2026-08-25)
- `GET /api/mercado/cotacoes` → **200 em ~2,5s** com: Dólar R$ 5,158 (ECB), SELIC 14%, IPCA 4,44%, Milho R$ 71,79/saca, Boi R$ 355,70/@
- Páginas: Home, Agronegócio, Notícias, Ferramentas, Contato → 200
- `GET /api/noticias` → 200, 23 notícias (G1 Economia, G1 Agro, CFC)

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
