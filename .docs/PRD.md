# 📋 PRD — Product Requirements Document
## Brandão Contabilidade — Site Institucional

| Campo | Valor |
|---|---|
| **Produto** | Site institucional do escritório Brandão Contabilidade |
| **Domínio** | brandaocontador.com.br |
| **Versão do documento** | 1.1 |
| **Data** | 2026-09-01 |
| **Responsável** | Equipe Brandão Contabilidade |

---

## 1. Visão do Produto

Site institucional que posiciona a Brandão Contabilidade como o escritório de contabilidade de referência em **Sidrolândia/MS e região**, com foco em **empresas e agronegócio**. O site gera **autoridade, confiança e conversão**: quem visita deve sentir que está falando com especialistas que entendem a realidade do campo e da cidade, e deve conseguir **entrar em contato com um clique** (WhatsApp, telefone ou formulário).

**Propósito central:** transformar visitantes em leads qualificados (prospecção de clientes) e reforçar a marca de 31 anos de história.

---

## 2. Público-Alvo

| Segmento | Necessidade principal |
|---|---|
| **Produtor rural / agroindústria (MS)** | Apoio contábil rural, indicadores de mercado (soja, milho, boi), planejamento tributário agro |
| **Pequenas e médias empresas** | Regularização, departamento pessoal, planejamento tributário, rotinas fiscais |
| **Empreendedores iniciantes** | Abertura de empresa, enquadramento tributário, certificado digital |
| **Profissionais da região** | Conteúdo informativo (notícias contábeis, reforma tributária, links úteis) |

---

## 3. Funcionalidades (por prioridade)

### P0 — Essencial (crítico, deve funcionar SEMPRE)

| # | Funcionalidade | Critério de aceite |
|---|---|---|
| 1 | **Página inicial** | Carregar rápido, CTA WhatsApp visível, design responsivo |
| 2 | **Formulário de contato** | Enviar mensagem por email (SMTP) e/ou redirecionar para WhatsApp; validação e rate-limit |
| 3 | **Painel Agro / Cotações** | Exibir **preços reais** (R$/saca, R$/@) e indicadores macro; **nunca travar**; carregar em < 5s; se uma fonte falhar, mostrar as demais |
| 4 | **Páginas institucionais** | Sobre, Serviços, Contato — conteúdo correto e consistente (sem erros de digitação/strings corrompidas) |

### P1 — Importante

| # | Funcionalidade | Critério de aceite |
|---|---|---|
| 5 | **Notícias contábeis** | Agregar notícias de fontes oficiais (RSS + portais), com filtros e análise prática |
| 6 | **Ferramentas/Calculadoras** | CLT×PJ, Enquadramento Tributário, Férias & 13º — cálculos corretos e com disclaimer |
| 7 | **Reforma Tributária** | Conteúdo informativo atualizado |
| 8 | **Links Úteis** | Diretório de portais oficiais (Receita, eSocial, SEFAZ MS etc.) |
| 9 | **SEO técnico** | Metadados, Open Graph, JSON-LD, sitemap, robots, canonical correto |
| 10 | **Performance** | Lighthouse ≥ 90 em mobile (LCP < 2.5s) |

### P2 — Diferencial

| # | Funcionalidade | Critério de aceite |
|---|---|---|
| 11 | Painel com **histórico de preços** (gráfico soja/milho/boi) | Gráfico simples com últimos 30 dias |
| 12 | **Widget de cotações** na home | Bloco compacto com dólar + preços do dia |
| 13 | Chat/FAQ inteligente | Responder dúvidas frequentes automaticamente |
| 14 | Área do cliente | Portal com documentos e obrigações fiscais |
| 15 | Integração com CRM (ex.: N8N + WhatsApp) | Leads do formulário entram no funil automaticamente |

---

## 4. Requisitos Funcionais Detalhados

### RF-01 — Painel Agro (Cotações)

- **Fontes:** Banco Central (PTAX, SGS), BrasilAPI, AwesomeAPI, B3 (planilhas oficiais)
- **Indicadores exibidos:**
  - Dólar comercial (compra/venda + variação do dia)
  - SELIC meta anual (Copom) + IPCA acumulado 12 meses
  - **Milho:** preço real R$/saca 60kg (contrato futuro B3)
  - **Boi gordo:** preço real R$/@ (contrato futuro B3)
- **Resiliência obrigatória:**
  - Cada fonte isolada (falha de uma não derruba o painel)
  - Timeout de 8s por chamada externa
  - Cache de 30 min + **stale-while-revalidate** (se fonte falhar, mostra último dado válido com aviso)
  - Nunca exibir spinner infinito; sempre mostrar estado (atualizado/defasado/erro)
- **Transparência:** exibir a fonte e a data de referência de cada indicador
- **Frequência:** dados diários são suficientes (não exige tempo real)

### RF-02 — Notícias Contábeis

- Fontes: G1 Economia, G1 Agro, CFC, Receita Federal, eSocial, SEFAZ MS
- Filtros por categoria + busca textual
- Timeout de 10s por fonte; fontes lentas não atrasam o painel
- Fallback: se nenhuma fonte responder, exibir conteúdo institucional

### RF-03 — Contato

- Formulário com validação (Zod), sanitização e rate-limit (100 req/min/IP)
- Envio via SMTP com fallback para link WhatsApp
- Nunca vazar detalhes de erro ao cliente

### RF-04 — SEO

- Metadados únicos por página (title, description, canonical)
- Open Graph/Twitter cards (imagem via `/api/og`)
- JSON-LD: AccountingService + páginas
- `sitemap.xml` e `robots.txt` funcionais

---

## 5. Requisitos Não Funcionais

| Categoria | Requisito |
|---|---|
| **Performance** | LCP < 2.5s; API de cotações < 5s (p95); assets estáticos com cache imutável |
| **Disponibilidade** | 99.9% (Vercel); painel agro nunca deve ficar fora por falha de fonte externa |
| **Segurança** | Headers de segurança (CSP, HSTS, X-Frame-Options); sem credenciais no código; rate-limit nas APIs |
| **Acessibilidade** | Contraste adequado, `aria-label` em botões de ícone, HTML semântico |
| **SEO** | Site 100% indexável; sem strings corrompidas em metadados |
| **Manutenibilidade** | Documentação em `.docs/`; tipagem TypeScript; lint no CI |

---

## 5.1 Foco do Produto (Site 100% Institucional)

> Decisão de escopo (2026-09-01): o site é **exclusivamente institucional/marketing**. NÃO inclui área do cliente, CRM, backend próprio além das rotas Next.js, nem integrações de leads para CRM nesta versão. Tudo que não seja site (ex.: Supabase/CRM, scripts órfãos) deve ser removido ou mantido fora do escopo do site.

---

## 6. Critérios de Aceite (Checklist de Qualidade)

- [ ] `/api/mercado/cotacoes` responde 200 com dados reais em < 5s (com fontes disponíveis)
- [ ] Se BCB cair, o painel ainda mostra dólar (AwesomeAPI) e macro (BrasilAPI)
- [ ] Se B3 cair, milho/boi mostram aviso mas dólar/SELIC/IPCA continuam
- [ ] Nenhuma string corrompida (ex.: "agronegóHighlights") no código
- [ ] `npm run type-check` passa sem erros
- [ ] Formulário de contato envia email ou redireciona ao WhatsApp
- [ ] Página de notícias carrega em < 10s mesmo com fontes lentas
- [ ] Dark mode funciona em todas as páginas
- [ ] Lighthouse mobile ≥ 85

---

## 7. Métricas de Sucesso

| Métrica | Meta |
|---|---|
| Cliques no WhatsApp | +30% em 90 dias |
| Formulários enviados | ≥ 20/mês |
| Tempo na página "Agronegócio" | ≥ 90s |
| Posição Google "contabilidade Sidrolândia" | Top 3 |
| Taxa de rejeição home | < 55% |

---

## 8. Fora de Escopo (v1)

- Área logada / portal do cliente (v2)
- Pagamentos online
- Chatbot com IA (v2 — depende de GEMINI_API_KEY)
- Backend próprio além das rotas Next.js
- **Integração com CRM / leads** (ex.: N8N + Evolution + Supabase) — removido do escopo; o site é apenas a vitrine institucional e o contato cai direto no WhatsApp/e-mail

---

## 9. Histórico do Documento

| Data | Versão | Mudança |
|---|---|---|
| 2026-08-25 | 1.0 | Criação inicial (análise + PRD) |
| 2026-09-01 | 1.1 | Revisão: estado atual verificado em produção (9 páginas + APIs 200); foco do site explicitado como **100% institucional**; integração com CRM/leads movida para Fora de Escopo |
