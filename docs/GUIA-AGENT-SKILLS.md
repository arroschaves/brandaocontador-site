# 🚀 Guia Completo de Agent Skills — Português Brasileiro

> **Versão:** 1.0.0 | **Data:** 2026-02-11
> **Projeto:** Brandão Contabilidade CRM
> **Compatível com:** Antigravity, Claude Code, Gemini CLI, Cursor, Copilot

---

## 📖 Índice

1. [O que são Agent Skills?](#1-o-que-são-agent-skills)
2. [Como Instalar (Passo a Passo)](#2-como-instalar-passo-a-passo)
3. [Como Usar / Ativar Skills](#3-como-usar--ativar-skills)
4. [Skills Instaladas no Projeto (72)](#4-skills-instaladas-no-projeto-72)
5. [Catálogo Completo por Categoria](#5-catálogo-completo-por-categoria)
6. [Repositórios Oficiais (Links)](#6-repositórios-oficiais-links)
7. [Como Adicionar Novas Skills](#7-como-adicionar-novas-skills)
8. [Solução de Problemas](#8-solução-de-problemas)
9. [Bundles Recomendados por Projeto](#9-bundles-recomendados-por-projeto)

---

## 1. O que são Agent Skills?

**Agent Skills** são arquivos Markdown (`.md`) que ensinam assistentes de IA a executar tarefas específicas com excelência. Eles funcionam como "manuais de instrução" que transformam a IA em um especialista.

### Como funciona?

```
Sem Skill: "Crie uma API REST" → IA gera código genérico
Com Skill: "Use @api-patterns para criar uma API REST" → IA segue padrões profissionais
```

### Estrutura de um Skill

```
.agent/skills/
├── nome-do-skill/
│   ├── SKILL.md          ← Arquivo principal (obrigatório)
│   ├── references/       ← Referências e exemplos (opcional)
│   ├── scripts/          ← Scripts auxiliares (opcional)
│   └── examples/         ← Exemplos de uso (opcional)
```

### Formato SKILL.md

```markdown
---
name: nome-do-skill
description: Descrição do que o skill faz
---

# Título do Skill

Instruções detalhadas que a IA seguirá...
```

---

## 2. Como Instalar (Passo a Passo)

### Método 1: Clonar do GitHub (Recomendado)

#### Passo 1 — Clonar o repositório fonte

```bash
# Repositório principal (715+ skills)
git clone --depth 1 https://github.com/sickn33/antigravity-awesome-skills.git /tmp/skills-source

# Repositório curado (links oficiais)
git clone --depth 1 https://github.com/VoltAgent/awesome-agent-skills.git /tmp/skills-curated
```

> ⚠️ **Windows**: Usar `-c core.symlinks=true` se houver erros de symlink:
> ```powershell
> git clone -c core.symlinks=true https://github.com/sickn33/antigravity-awesome-skills.git $env:TEMP\skills-source
> ```

#### Passo 2 — Copiar skills desejadas para o projeto

```powershell
# PowerShell (Windows)
Copy-Item -Path "$env:TEMP\skills-source\skills\nome-do-skill" `
          -Destination ".agent\skills\nome-do-skill" `
          -Recurse -Force
```

```bash
# Bash (Linux/macOS)
cp -r /tmp/skills-source/skills/nome-do-skill .agent/skills/nome-do-skill
```

#### Passo 3 — Limpar arquivos temporários

```powershell
# PowerShell (Windows)
Remove-Item "$env:TEMP\skills-source" -Recurse -Force
```

```bash
# Bash (Linux/macOS)
rm -rf /tmp/skills-source
```

### Método 2: Clonar repositórios oficiais individualmente

Cada equipe mantém seu próprio repositório. Para instalar skills específicas:

```bash
# Vercel (Next.js + React)
git clone --depth 1 https://github.com/vercel-labs/next-skills.git /tmp/vercel-next
cp -r /tmp/vercel-next/skills/next-best-practices .agent/skills/vercel-next-best-practices

# Supabase (Postgres)
git clone --depth 1 https://github.com/supabase/agent-skills.git /tmp/supabase
cp -r /tmp/supabase/skills/supabase-postgres-best-practices .agent/skills/supabase-postgres

# Cloudflare (Performance)
git clone --depth 1 https://github.com/cloudflare/skills.git /tmp/cloudflare
cp -r /tmp/cloudflare/skills/web-perf .agent/skills/cloudflare-web-perf

# Anthropic (Frontend + Testing)
git clone --depth 1 https://github.com/anthropics/skills.git /tmp/anthropic
cp -r /tmp/anthropic/skills/frontend-design .agent/skills/anthropic-frontend-design
cp -r /tmp/anthropic/skills/webapp-testing .agent/skills/anthropic-webapp-testing

# Trail of Bits (Segurança)
git clone --depth 1 https://github.com/trailofbits/skills.git /tmp/tob
cp -r /tmp/tob/plugins/insecure-defaults/skills/insecure-defaults .agent/skills/trailofbits-insecure-defaults

# N8N (Automação)
git clone --depth 1 https://github.com/czlonkowski/n8n-skills.git /tmp/n8n
cp -r /tmp/n8n/skills/n8n-workflow-patterns .agent/skills/n8n-workflow-patterns

# Sentry (Code Review + Bugs)
git clone --depth 1 https://github.com/getsentry/skills.git /tmp/sentry
cp -r /tmp/sentry/plugins/sentry-skills/skills/code-review .agent/skills/sentry-code-review
```

### Método 3: npx (instalação global)

```bash
# Instala TODAS as 715+ skills globalmente
npx antigravity-awesome-skills

# Instala para Cursor
npx antigravity-awesome-skills --cursor

# Instala para Claude Code
npx antigravity-awesome-skills --claude

# Instala em caminho personalizado
npx antigravity-awesome-skills --path ./meu-projeto/.agent/skills
```

### Método 4: Script PowerShell para instalar várias de uma vez

```powershell
# Salve como install-skills.ps1
$skills = @(
    'nextjs-best-practices',
    'react-patterns',
    'supabase-automation',
    'typescript-expert',
    'seo-audit'
)

# Clonar fonte
git clone --depth 1 https://github.com/sickn33/antigravity-awesome-skills.git "$env:TEMP\skills-src"

# Copiar cada skill
foreach ($skill in $skills) {
    $src = "$env:TEMP\skills-src\skills\$skill"
    $dst = ".agent\skills\$skill"
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $dst -Recurse -Force
        Write-Host "✅ Instalada: $skill"
    } else {
        Write-Host "⚠️ Não encontrada: $skill"
    }
}

# Limpar
Remove-Item "$env:TEMP\skills-src" -Recurse -Force
Write-Host "🎉 Instalação concluída!"
```

---

## 3. Como Usar / Ativar Skills

### No Antigravity (este projeto)

As skills são **carregadas automaticamente** quando estão na pasta `.agent/skills/`. Basta referenciar pelo nome:

```
# No chat do Antigravity
"Use @typescript-expert para revisar este código"
"Aplique @seo-audit nesta página"
"Execute @n8n-workflow-patterns para criar um workflow"
```

### No Claude Code

```
>> /skill-name ajude-me com...
>> Use a skill @brainstorming para planejar
```

### No Cursor

```
@skill-name no chat
Exemplo: @react-patterns revise este componente
```

### No Gemini CLI

```
Use skill-name para...
Exemplo: Use typescript-expert para otimizar este tipo
```

### Ativação por Contexto (Automática)

Muitas skills definem triggers no frontmatter:

```yaml
---
name: seo-audit
description: Diagnóstico SEO
trigger: glob
globs: "*.tsx,*.html"
---
```

Isso significa que a skill é automaticamente **sugerida** quando o agente trabalha com arquivos `.tsx` ou `.html`.

### Ativação Manual (Explícita)

Basta mencionar o skill por nome na conversa:

| Comando | O que faz |
|---------|-----------|
| `"Use @brainstorming"` | Ativa planejamento Socrático |
| `"Aplique @clean-code"` | Aplica padrões de código limpo |
| `"Execute @seo-audit"` | Roda auditoria SEO |
| `"Use @n8n-workflow-patterns"` | Guia de padrões N8N |
| `"Apply @supabase-postgres"` | Best practices Postgres |

---

## 4. Skills Instaladas no Projeto (72)

### 🟢 Frontend & Design (12 skills)

| Skill | Descrição | Fonte |
|-------|-----------|-------|
| `anthropic-frontend-design` | Design frontend production-grade, evita estética genérica de IA | [Anthropic](https://github.com/anthropics/skills/tree/main/skills/frontend-design) |
| `frontend-design` | Padrões de design web, UX audit | Projeto interno |
| `react-patterns` | React hooks, composition, performance, TypeScript | Projeto interno |
| `tailwind-patterns` | Tailwind CSS v4, CSS-first config, container queries | Projeto interno |
| `vercel-composition-patterns` | Composition patterns React (compound components, render props) | [Vercel](https://github.com/vercel-labs/agent-skills/tree/main/skills/composition-patterns) |
| `vercel-react-best-practices` | React 19 performance e patterns oficiais da Vercel | [Vercel](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices) |
| `vercel-web-design` | Web design guidelines oficiais da Vercel | [Vercel](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines) |
| `mobile-design` | Design mobile-first, touch, platform conventions | Projeto interno |
| `i18n-localization` | Internacionalização, traduções, RTL | Projeto interno |
| `seo-structure-architect` | Header hierarchy, schema markup, internal linking | [Antigravity](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/seo-structure-architect) |
| `geo-fundamentals` | Generative Engine Optimization para IA search engines | Projeto interno |
| `seo-fundamentals` | E-E-A-T, Core Web Vitals, Google algorithms | Projeto interno |

### 🔵 Next.js & Framework (6 skills)

| Skill | Descrição | Fonte |
|-------|-----------|-------|
| `vercel-next-best-practices` | Next.js 15+ file conventions, RSC, async APIs, metadata | [Vercel](https://github.com/vercel-labs/next-skills/tree/main/skills/next-best-practices) |
| `vercel-next-cache` | PPR, `use cache`, cacheLife, cacheTag (Next.js 16) | [Vercel](https://github.com/vercel-labs/next-skills/tree/main/skills/next-cache-components) |
| `vercel-next-upgrade` | Upgrade Next.js com codemods oficiais | [Vercel](https://github.com/vercel-labs/next-skills/tree/main/skills/next-upgrade) |
| `nextjs-best-practices` | App Router, Server Components, data fetching | Projeto interno |
| `nextjs-app-router-patterns` | SSR/SSG, streaming, parallel routes avançados | [Antigravity](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/nextjs-app-router-patterns) |
| `nextjs-supabase-auth` | Supabase Auth + Next.js App Router (login, middleware, RLS) | [Antigravity](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/nextjs-supabase-auth) |

### 🟡 Backend & Database (8 skills)

| Skill | Descrição | Fonte |
|-------|-----------|-------|
| `supabase-postgres` | Postgres performance, RLS, schema design oficial Supabase | [Supabase](https://github.com/supabase/agent-skills/tree/main/skills/supabase-postgres-best-practices) |
| `supabase-automation` | Queries, tables, storage, edge functions via MCP | [Antigravity](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/supabase-automation) |
| `database-design` | Schema design, indexing, ORM selection | Projeto interno |
| `api-patterns` | REST vs GraphQL vs tRPC, response formats, versioning | Projeto interno |
| `nodejs-best-practices` | Node.js framework selection, async patterns, security | Projeto interno |
| `error-handling-patterns` | Exceptions, Result types, error propagation, degradation | [Antigravity](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/error-handling-patterns) |
| `server-management` | Process management, monitoring, scaling | Projeto interno |
| `deployment-procedures` | Safe deployment, rollback, verification | Projeto interno |

### 🟣 TypeScript & Linguagens (3 skills)

| Skill | Descrição | Fonte |
|-------|-----------|-------|
| `typescript-expert` | Type-level programming, performance, monorepo, migration | [Antigravity](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/typescript-expert) |
| `python-patterns` | Framework selection, async, type hints, project structure | Projeto interno |
| `powershell-windows` | PowerShell pitfalls, operator syntax, error handling | Projeto interno |

### ⚡ N8N & Automação (6 skills)

| Skill | Descrição | Fonte |
|-------|-----------|-------|
| `n8n-workflow-patterns` | 5 core patterns: webhook, HTTP, DB, AI, scheduled | [czlonkowski](https://github.com/czlonkowski/n8n-skills/tree/main/skills/n8n-workflow-patterns) |
| `n8n-mcp-tools-expert` | MCP tools + N8N integration expert | [czlonkowski](https://github.com/czlonkowski/n8n-skills/tree/main/skills/n8n-mcp-tools-expert) |
| `n8n-validation-expert` | Fix N8N validation errors com catálogo de erros | [czlonkowski](https://github.com/czlonkowski/n8n-skills/tree/main/skills/n8n-validation-expert) |
| `n8n-expression-syntax` | Sintaxe `{{}}`, `$json`, `$node` variables | [czlonkowski](https://github.com/czlonkowski/n8n-skills/tree/main/skills/n8n-expression-syntax) |
| `n8n-node-configuration` | Configuração de nós, dependências, AI connections | [czlonkowski](https://github.com/czlonkowski/n8n-skills/tree/main/skills/n8n-node-configuration) |
| `n8n-code-javascript` | JavaScript em N8N Code nodes, `$input`, `$helpers` | [czlonkowski](https://github.com/czlonkowski/n8n-skills/tree/main/skills/n8n-code-javascript) |

### 🔴 Segurança (6 skills)

| Skill | Descrição | Fonte |
|-------|-----------|-------|
| `trailofbits-insecure-defaults` | Detecta defaults inseguros, hardcoded secrets, weak auth | [Trail of Bits](https://github.com/trailofbits/skills/tree/main/plugins/insecure-defaults) |
| `trailofbits-sharp-edges` | APIs error-prone, footgun designs, dangerous configs | [Trail of Bits](https://github.com/trailofbits/skills/tree/main/plugins/sharp-edges) |
| `trailofbits-diff-review` | Security-focused diff review com git history analysis | [Trail of Bits](https://github.com/trailofbits/skills/tree/main/plugins/differential-review) |
| `vulnerability-scanner` | OWASP 2025, Supply Chain Security, risk prioritization | Projeto interno |
| `red-team-tactics` | MITRE ATT&CK, detection evasion, reporting | Projeto interno |
| `code-review-checklist` | Code review guidelines: quality, security, best practices | Projeto interno |

### 🧪 Testes & Qualidade (5 skills)

| Skill | Descrição | Fonte |
|-------|-----------|-------|
| `anthropic-webapp-testing` | Playwright webapp testing oficial da Anthropic | [Anthropic](https://github.com/anthropics/skills/tree/main/skills/webapp-testing) |
| `webapp-testing` | Teste de aplicações web locais | Projeto interno |
| `testing-patterns` | Unit, integration, mocking strategies | Projeto interno |
| `tdd-workflow` | RED-GREEN-REFACTOR cycle | Projeto interno |
| `sentry-find-bugs` | Find bugs + security vulnerabilities em branches | [Sentry](https://github.com/getsentry/skills/tree/main/plugins/sentry-skills/skills/find-bugs) |

### 📈 Performance & SEO (5 skills)

| Skill | Descrição | Fonte |
|-------|-----------|-------|
| `cloudflare-web-perf` | Core Web Vitals, render-blocking, layout shifts | [Cloudflare](https://github.com/cloudflare/skills/tree/main/skills/web-perf) |
| `performance-profiling` | Measurement, analysis, optimization | Projeto interno |
| `seo-audit` | Diagnóstico SEO completo: crawlability, indexation, rankings | [Antigravity](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/seo-audit) |
| `cost-optimization` | Rightsizing, tagging, reserved instances, spending analysis | [Antigravity](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/cost-optimization) |
| `production-code-audit` | Scan autônomo line-by-line, transforma em production-grade | [Antigravity](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/production-code-audit) |

### 🤖 Integrações & Automações (6 skills)

| Skill | Descrição | Fonte |
|-------|-----------|-------|
| `google-drive-automation` | Upload, download, search, share, organize Google Drive | [Antigravity](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/google-drive-automation) |
| `gmail-automation` | Send/reply, search, labels, drafts, attachments | [Antigravity](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/gmail-automation) |
| `whatsapp-automation` | Send messages, manage templates, upload media | [Antigravity](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/whatsapp-automation) |
| `vercel-automation` | Manage deployments, domains, DNS, env vars | [Antigravity](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/vercel-automation) |
| `vercel-deployment` | Deploy to Vercel com Next.js | [Antigravity](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/vercel-deployment) |
| `anthropic-mcp-builder` | Criar MCP servers para integrar APIs externas | [Anthropic](https://github.com/anthropics/skills/tree/main/skills/mcp-builder) |

### 🧠 Planejamento & Debug (10 skills)

| Skill | Descrição | Fonte |
|-------|-----------|-------|
| `brainstorming` | Socratic questioning, progress reporting | Projeto interno |
| `plan-writing` | Structured task planning, dependencies, verification | Projeto interno |
| `architecture` | Architectural decision-making, ADR documentation | Projeto interno |
| `behavioral-modes` | AI modes: brainstorm, implement, debug, review, teach | Projeto interno |
| `clean-code` | Coding standards: conciso, direto, sem over-engineering | Projeto interno |
| `documentation-templates` | README, API docs, code comments, AI-friendly docs | Projeto interno |
| `sentry-code-review` | Code review seguindo practices da Sentry Engineering | [Sentry](https://github.com/getsentry/skills/tree/main/plugins/sentry-skills/skills/code-review) |
| `systematic-debugging` | 4-phase debugging: root cause analysis + evidence-based | Projeto interno |
| `debugging-strategies` | Profiling tools, bisecting, systematic techniques | [Antigravity](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/debugging-strategies) |
| `parallel-agents` | Multi-agent orchestration patterns | Projeto interno |

### 🎮 Outros (5 skills)

| Skill | Descrição | Fonte |
|-------|-----------|-------|
| `app-builder` | Full-stack orchestrator, determines project type | Projeto interno |
| `game-development` | Game development orchestrator | Projeto interno |
| `bash-linux` | Bash/Linux patterns, piping, error handling | Projeto interno |
| `mcp-builder` | MCP server creation guide (interno) | Projeto interno |
| `lint-and-validate` | Linting e validação de código | Projeto interno |

---

## 5. Catálogo Completo por Categoria

### 🌐 Skills Disponíveis para Baixar (Principais)

#### Vercel Engineering Team
| Skill | Comando para Instalar | Link |
|-------|----------------------|------|
| `next-best-practices` | `git clone vercel-labs/next-skills` | [GitHub](https://github.com/vercel-labs/next-skills/tree/main/skills/next-best-practices) |
| `next-cache-components` | `git clone vercel-labs/next-skills` | [GitHub](https://github.com/vercel-labs/next-skills/tree/main/skills/next-cache-components) |
| `next-upgrade` | `git clone vercel-labs/next-skills` | [GitHub](https://github.com/vercel-labs/next-skills/tree/main/skills/next-upgrade) |
| `react-best-practices` | `git clone vercel-labs/agent-skills` | [GitHub](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices) |
| `web-design-guidelines` | `git clone vercel-labs/agent-skills` | [GitHub](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines) |
| `composition-patterns` | `git clone vercel-labs/agent-skills` | [GitHub](https://github.com/vercel-labs/agent-skills/tree/main/skills/composition-patterns) |

#### Supabase Team
| Skill | Comando para Instalar | Link |
|-------|----------------------|------|
| `postgres-best-practices` | `git clone supabase/agent-skills` | [GitHub](https://github.com/supabase/agent-skills/tree/main/skills/supabase-postgres-best-practices) |

#### Cloudflare Team
| Skill | Comando para Instalar | Link |
|-------|----------------------|------|
| `web-perf` | `git clone cloudflare/skills` | [GitHub](https://github.com/cloudflare/skills/tree/main/skills/web-perf) |
| `agents-sdk` | `git clone cloudflare/skills` | [GitHub](https://github.com/cloudflare/skills/tree/main/skills/agents-sdk) |
| `wrangler` | `git clone cloudflare/skills` | [GitHub](https://github.com/cloudflare/skills/tree/main/skills/wrangler) |

#### Trail of Bits (Segurança)
| Skill | Comando para Instalar | Link |
|-------|----------------------|------|
| `insecure-defaults` | `git clone trailofbits/skills` | [GitHub](https://github.com/trailofbits/skills/tree/main/plugins/insecure-defaults) |
| `sharp-edges` | `git clone trailofbits/skills` | [GitHub](https://github.com/trailofbits/skills/tree/main/plugins/sharp-edges) |
| `differential-review` | `git clone trailofbits/skills` | [GitHub](https://github.com/trailofbits/skills/tree/main/plugins/differential-review) |
| `static-analysis` | `git clone trailofbits/skills` | [GitHub](https://github.com/trailofbits/skills/tree/main/plugins/static-analysis) |

#### Anthropic (Oficial)
| Skill | Comando para Instalar | Link |
|-------|----------------------|------|
| `frontend-design` | `git clone anthropics/skills` | [GitHub](https://github.com/anthropics/skills/tree/main/skills/frontend-design) |
| `webapp-testing` | `git clone anthropics/skills` | [GitHub](https://github.com/anthropics/skills/tree/main/skills/webapp-testing) |
| `mcp-builder` | `git clone anthropics/skills` | [GitHub](https://github.com/anthropics/skills/tree/main/skills/mcp-builder) |
| `docx` | `git clone anthropics/skills` | [GitHub](https://github.com/anthropics/skills/tree/main/skills/docx) |
| `pdf` | `git clone anthropics/skills` | [GitHub](https://github.com/anthropics/skills/tree/main/skills/pdf) |
| `xlsx` | `git clone anthropics/skills` | [GitHub](https://github.com/anthropics/skills/tree/main/skills/xlsx) |
| `pptx` | `git clone anthropics/skills` | [GitHub](https://github.com/anthropics/skills/tree/main/skills/pptx) |

#### Sentry Team
| Skill | Comando para Instalar | Link |
|-------|----------------------|------|
| `code-review` | `git clone getsentry/skills` | [GitHub](https://github.com/getsentry/skills/tree/main/plugins/sentry-skills/skills/code-review) |
| `find-bugs` | `git clone getsentry/skills` | [GitHub](https://github.com/getsentry/skills/tree/main/plugins/sentry-skills/skills/find-bugs) |
| `create-pr` | `git clone getsentry/skills` | [GitHub](https://github.com/getsentry/skills/tree/main/plugins/sentry-skills/skills/create-pr) |

#### N8N (Automação)
| Skill | Comando para Instalar | Link |
|-------|----------------------|------|
| `n8n-workflow-patterns` | `git clone czlonkowski/n8n-skills` | [GitHub](https://github.com/czlonkowski/n8n-skills/tree/main/skills/n8n-workflow-patterns) |
| `n8n-mcp-tools-expert` | `git clone czlonkowski/n8n-skills` | [GitHub](https://github.com/czlonkowski/n8n-skills/tree/main/skills/n8n-mcp-tools-expert) |
| `n8n-validation-expert` | `git clone czlonkowski/n8n-skills` | [GitHub](https://github.com/czlonkowski/n8n-skills/tree/main/skills/n8n-validation-expert) |
| `n8n-expression-syntax` | `git clone czlonkowski/n8n-skills` | [GitHub](https://github.com/czlonkowski/n8n-skills/tree/main/skills/n8n-expression-syntax) |
| `n8n-node-configuration` | `git clone czlonkowski/n8n-skills` | [GitHub](https://github.com/czlonkowski/n8n-skills/tree/main/skills/n8n-node-configuration) |
| `n8n-code-javascript` | `git clone czlonkowski/n8n-skills` | [GitHub](https://github.com/czlonkowski/n8n-skills/tree/main/skills/n8n-code-javascript) |

#### Antigravity Mega Collection (715+ skills)
| Skill | Descrição | Link |
|-------|-----------|------|
| `production-code-audit` | Scan autônomo, transforma código em production-grade | [GitHub](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/production-code-audit) |
| `seo-audit` | Diagnóstico SEO completo | [GitHub](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/seo-audit) |
| `typescript-expert` | Type gymnastics, performance, monorepo | [GitHub](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/typescript-expert) |
| `docker-expert` | Docker compose, multi-stage, optimization | [GitHub](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/docker-expert) |
| `aws-serverless` | Lambda, API Gateway, DynamoDB | [GitHub](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/aws-serverless) |
| `stripe-integration` | Pagamentos, subscriptions, webhooks | [GitHub](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/stripe-integration) |
| `prompt-engineer` | Prompt engineering patterns e técnicas | [GitHub](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/prompt-engineer) |
| `prisma-expert` | ORM Prisma, migrations, relations | [GitHub](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/prisma-expert) |

> 📋 **Catálogo completo:** [CATALOG.md no GitHub](https://github.com/sickn33/antigravity-awesome-skills/blob/main/CATALOG.md)

---

## 6. Repositórios Oficiais (Links)

| Organização | Repositório | Skills | Licença |
|-------------|-------------|--------|---------|
| **Antigravity (Mega)** | [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills) | 715+ | MIT |
| **VoltAgent (Curado)** | [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | 339+ | MIT |
| **Anthropic** | [anthropics/skills](https://github.com/anthropics/skills) | 17 | Apache 2.0 |
| **Vercel (React/Next.js)** | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | 5 | MIT |
| **Vercel (Next.js)** | [vercel-labs/next-skills](https://github.com/vercel-labs/next-skills) | 3 | MIT |
| **Supabase** | [supabase/agent-skills](https://github.com/supabase/agent-skills) | 1 | MIT |
| **Cloudflare** | [cloudflare/skills](https://github.com/cloudflare/skills) | 7 | — |
| **Trail of Bits** | [trailofbits/skills](https://github.com/trailofbits/skills) | 21 | MIT |
| **Sentry** | [getsentry/skills](https://github.com/getsentry/skills) | 7 | — |
| **N8N** | [czlonkowski/n8n-skills](https://github.com/czlonkowski/n8n-skills) | 7 | MIT |
| **Hugging Face** | [huggingface/skills](https://github.com/huggingface/skills) | 8 | — |
| **Stripe** | [stripe/ai](https://github.com/stripe/ai) | 2 | — |
| **HashiCorp** | [hashicorp/agent-skills](https://github.com/hashicorp/agent-skills) | 3 | — |
| **Microsoft** | [microsoft/skills](https://github.com/microsoft/skills) | 80+ | MIT |

---

## 7. Como Adicionar Novas Skills

### Opção A: Copiar de repositório existente

```powershell
# 1. Clone o repositório fonte
git clone --depth 1 https://github.com/REPO/SKILLS.git $env:TEMP\source

# 2. Copie a skill desejada
Copy-Item -Path "$env:TEMP\source\skills\SKILL_NAME" `
          -Destination ".agent\skills\MINHA_SKILL" `
          -Recurse -Force

# 3. Limpe
Remove-Item $env:TEMP\source -Recurse -Force
```

### Opção B: Criar skill personalizada

```bash
# 1. Crie a pasta
mkdir -p .agent/skills/minha-skill-custom

# 2. Crie o SKILL.md
cat > .agent/skills/minha-skill-custom/SKILL.md << 'EOF'
---
name: minha-skill-custom
description: Descrição do que a skill faz
---

# Minha Skill Custom

## Quando usar
- Situação 1
- Situação 2

## Instruções
1. Passo 1
2. Passo 2

## Exemplos
```code
// exemplo aqui
```
EOF
```

### Opção C: Atualizar skills existentes

```bash
# Se instalou via git clone
cd .agent/skills
git pull  # atualiza todas
```

---

## 8. Solução de Problemas

### ❌ "Skill não encontrada"

**Causa:** A pasta não está em `.agent/skills/` ou não tem `SKILL.md`

```powershell
# Verificar se existe
Test-Path ".agent\skills\nome-da-skill\SKILL.md"
```

### ❌ "Erro de symlink no Windows"

**Causa:** O repositório usa symlinks que o Windows não suporta por padrão

```powershell
# Solução 1: Ativar Developer Mode no Windows
# Configurações > Atualização e Segurança > Para Desenvolvedores

# Solução 2: Clonar com flag
git clone -c core.symlinks=true https://github.com/...
```

### ❌ "Skill não ativa automaticamente"

**Causa:** A skill precisa ser referenciada explicitamente

```
# No chat, mencione pelo nome:
"Use @nome-da-skill para..."
```

### ❌ "Muitas skills, lento para carregar"

**Causa:** Ter 700+ skills pode impactar performance

**Solução:** Instale apenas as skills relevantes (como fizemos neste projeto — 72 selecionadas das 715+ disponíveis)

---

## 9. Bundles Recomendados por Projeto

### 🏢 Contabilidade / CRM (Este Projeto)

```
Skills essenciais:
- nextjs-best-practices
- nextjs-supabase-auth
- supabase-postgres
- n8n-workflow-patterns
- google-drive-automation
- seo-audit
- typescript-expert
- clean-code
- production-code-audit
```

### 🛒 E-commerce / SaaS

```
Skills recomendadas:
- stripe-integration
- nextjs-app-router-patterns
- react-patterns
- supabase-postgres
- seo-fundamentals
- performance-profiling
- vercel-deployment
```

### 📱 Mobile (React Native)

```
Skills recomendadas:
- mobile-design
- react-patterns
- testing-patterns
- vercel-react-best-practices
- firebase (do Antigravity)
```

### 🔒 Security Audit

```
Skills recomendadas:
- trailofbits-insecure-defaults
- trailofbits-sharp-edges
- trailofbits-diff-review
- vulnerability-scanner
- red-team-tactics
- sentry-find-bugs
```

### 🤖 Automação N8N

```
Skills recomendadas:
- n8n-workflow-patterns
- n8n-mcp-tools-expert
- n8n-validation-expert
- n8n-expression-syntax
- n8n-node-configuration
- n8n-code-javascript
- google-drive-automation
- gmail-automation
- whatsapp-automation
```

---

## 📝 Notas Finais

1. **Skills NÃO são pacotes npm** — são arquivos Markdown que ensinam a IA
2. **Instale apenas o necessário** — menos é mais (72 > 715 em termos de performance)
3. **Atualize periodicamente** — os repositórios são mantidos ativamente
4. **Crie suas próprias skills** — quando tiver um padrão que se repete, documente como skill
5. **Skills funcionam em QUALQUER agente de IA** — Antigravity, Claude Code, Cursor, Gemini CLI

---

**Criado por:** Antigravity AI Assistant
**Última atualização:** 2026-02-11
**Total de skills instaladas:** 72
