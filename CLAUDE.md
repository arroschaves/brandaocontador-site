# CLAUDE.md — Instruções para Claude Code / Antigravity

> **OBRIGATÓRIO:** Este arquivo é lido automaticamente pelo Claude Code e Antigravity no início de cada sessão.
> Todas as regras aqui têm prioridade máxima (P0).

---

## 🌐 Idioma

- **SEMPRE** responda em Português Brasileiro (pt-BR)
- Comentários de código em inglês
- Variáveis e nomes de funções em inglês
- Mensagens de erro para o usuário em pt-BR

---

## 📂 Estrutura do Projeto

```
brandaocontador-site/
├── .agent/                    # Antigravity Kit
│   ├── ARCHITECTURE.md        # Mapa de agentes, skills e workflows
│   ├── agents/                # 19 Agentes especialistas
│   ├── skills/                # 72+ Skills de domínio
│   ├── workflows/             # 11 Slash commands (/deploy, /test, etc.)
│   ├── rules/                 # Regras globais
│   └── scripts/               # Scripts de validação master
├── app/                       # Next.js App Router (páginas e API routes)
├── lib/                       # Utilitários, Supabase client, helpers
├── scripts/                   # Scripts de automação (importador fiscal, etc.)
├── public/                    # Assets estáticos
├── supabase/                  # Migrations e configs Supabase
├── tests/                     # Testes (Vitest)
└── docs/                      # Documentação do projeto
```

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Framework** | Next.js 14+ (App Router) |
| **Linguagem** | TypeScript |
| **Estilização** | Tailwind CSS v4 |
| **Banco de Dados** | Supabase (PostgreSQL + Auth + RLS) |
| **Automação** | N8N (self-hosted) |
| **Integrações** | Google Drive API, WhatsApp Business |
| **Deploy** | Vercel |
| **Testes** | Vitest + Playwright |

---

## 🧠 Protocolo de Trabalho

### ANTES de qualquer implementação:

1. **Leia** `.agent/ARCHITECTURE.md` para entender o sistema
2. **Verifique** `CODEBASE.md` para dependências entre arquivos
3. **Consulte** o Agent apropriado em `.agent/agents/` (ex: `frontend-specialist.md` para UI)
4. **Carregue** os Skills relevantes de `.agent/skills/`

### Classificação de requests:

| Tipo | Ação |
|------|------|
| Pergunta simples | Responda diretamente |
| Bug fix (1 arquivo) | Corrija diretamente |
| Feature nova | Pergunte 3 questões estratégicas ANTES de codar |
| Refactoring | Crie um `{task-slug}.md` com plano ANTES |
| Design/UI | Siga `.agent/agents/frontend-specialist.md` |

---

## 🔒 Regras de Segurança

- **NUNCA** commite `.env.local`, `credentials.json`, ou chaves API
- **SEMPRE** use variáveis de ambiente para segredos
- **SEMPRE** verifique RLS (Row Level Security) no Supabase
- **NUNCA** hardcode tokens, passwords, ou API keys no código

---

## 📋 Convenções de Código

- **Clean Code**: Sem over-engineering, sem comentários óbvios
- **TypeScript Strict**: Sem `any`, use tipos explícitos
- **Server Components** por padrão, `'use client'` só quando necessário
- **Imports**: Organize com paths absolutos (`@/lib/...`, `@/app/...`)
- **Commits**: Conventional Commits em pt-BR (`feat:`, `fix:`, `docs:`)

---

## ⚡ MCP Servers Disponíveis

| MCP Server | Função |
|-----------|--------|
| `n8n-mcp` | Gerenciar workflows N8N (buscar, executar, criar) |

---

## 🏢 Contexto de Negócio

Este é o sistema **Brandão Contabilidade** — um CRM/ERP contábil que inclui:

- **Gestão de Clientes** (CNPJ/CPF, obrigações fiscais)
- **Importação Fiscal** (XML de NFe/NFSe, SPED)
- **Maestro Sync** (sincronização de arquivos com Google Drive)
- **QR Code Generator** (PIX, URLs, contatos)
- **Dashboard Administrativo** (métricas e atividades)

### Legislação

- Segue a **Legislação Tributária Brasileira** vigente
- Considera a **Reforma Tributária 2026**
- Terminologia da **Receita Federal**

---

## 🚀 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor local

# Testes
npx vitest               # Roda testes unitários
npx playwright test      # Roda testes E2E

# Validação
python .agent/scripts/checklist.py .    # Auditoria rápida
python .agent/scripts/verify_all.py .   # Verificação completa

# Deploy
vercel                   # Deploy para Vercel
```

---

## 📎 Referências Rápidas

- **Guia de Skills**: `docs/GUIA-AGENT-SKILLS.md`
- **Arquitetura**: `.agent/ARCHITECTURE.md`
- **Dependências**: `CODEBASE.md`
- **Variáveis de Ambiente**: `.env.example`
