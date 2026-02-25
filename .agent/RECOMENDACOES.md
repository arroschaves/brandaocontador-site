# 🚀 RECOMENDAÇÕES — Brandão Contador CRM
> Guia de configuração otimizada do Antigravity Kit para este projeto específico.
> **Stack:** Next.js 14 • Supabase • Vercel • N8N • Google Drive • WhatsApp
> **Última atualização:** 2026-02-25

---

## 📦 SKILL RECÉM-INSTALADA

| Skill | Fonte | Status |
|-------|-------|--------|
| `gemini-api-dev` | [google-gemini/gemini-skills](https://github.com/google-gemini/gemini-skills) | ✅ Instalada |

---

## 🏆 TOP SKILLS PARA ESTE PROJETO

### Prioridade CRÍTICA (usar sempre)

| Skill | Por quê usar neste projeto |
|-------|---------------------------|
| `gemini-api-dev` ⭐ NEW | Substituir OpenAI por Gemini 3 na classificação fiscal e Maestro AI |
| `nextjs-app-router-patterns` | Projeto usa Next.js 14 App Router — boas práticas de RSC e streaming |
| `nextjs-supabase-auth` | Autenticação já usa Supabase — evitar erros de middleware e sessão |
| `supabase-postgres-best-practices` | DB com esquemas `core`, `audit`, `workflow` — otimização de queries |
| `n8n-workflow-patterns` | N8N é core do sistema — padrões para não quebrar automações |
| `n8n-code-javascript` | Sempre que escrever código nos Code nodes do N8N |
| `n8n-expression-syntax` | Evitar erros de `$json`, `$node`, `$input` nas expressões N8N |

### Prioridade ALTA (usar frequentemente)

| Skill | Por quê usar neste projeto |
|-------|---------------------------|
| `typescript-expert` | TypeScript em todo o projeto — tipos para dados contábeis complexos |
| `react-patterns` | Componentes do CRM — evitar re-renders desnecessários |
| `vercel-react-best-practices` | Deploy no Vercel — Server Components, bundle size |
| `api-patterns` | API Routes do Next.js — padronização de respostas e erros |
| `error-handling-patterns` | Sistema financeiro exige robustez — zero falhas silenciosas |
| `vulnerability-scanner` | Dados de clientes CNPJ/CPF — LGPD compliance obrigatório |
| `systematic-debugging` | CRM complexo com muitas integrações — debugging estruturado |

### Prioridade MÉDIA (usar quando relevante)

| Skill | Por quê usar neste projeto |
|-------|---------------------------|
| `frontend-design` | UI do CRM precisa ser profissional e eficiente |
| `seo-fundamentals` | Site público precisa de SEO (home, serviços, agronegócio) |
| `google-drive-automation` | Integração Drive é core do Maestro |
| `whatsapp-automation` | Evolution API já integrada — automações de atendimento |
| `performance-profiling` | Dashboard carregando dados reais do Supabase |
| `testing-patterns` | CRM financeiro — testes críticos para integridade dos dados |
| `webapp-testing` | Playwright já configurado — aproveitar melhor |

---

## 🤖 AGENTES RECOMENDADOS

### Para este projeto, os mais relevantes são:

```
PRIMÁRIOS (use com frequência):
├── orchestrator          → Para tarefas complexas multi-arquivo
├── backend-specialist    → APIs, Supabase, N8N integrations
├── frontend-specialist   → CRM UI, componentes React
├── debugger              → Para bugs do Supabase/N8N/Gemini
└── security-auditor      → Dados sensíveis de clientes (LGPD)

SECUNDÁRIOS (use quando específico):
├── database-architect    → Schema migrations Supabase
├── performance-optimizer → Dashboard e queries lentas
├── seo-specialist        → Site institucional
└── test-engineer         → Cobertura de testes
```

---

## 📋 RULES RECOMENDADAS

### Rules Existentes no Projeto
- `ANTIGRAVITY.md` ✅ — Regras globais do Antigravity
- `GEMINI.md` ✅ — Regras específicas do Gemini AI

### Rules Novas Recomendadas (criar em `.agent/rules/`)

#### 1. regra-dados-sensiveis.md (URGENTE)
```markdown
# Regra: Dados Sensíveis de Clientes
- NUNCA logar CNPJ, CPF, dados financeiros em console.log
- SEMPRE sanitizar inputs antes de enviar ao Supabase
- SEMPRE usar RLS (Row Level Security) no Supabase
- OBRIGATÓRIO: validar CNPJ/CPF antes de salvar
- LGPD: dados só podem ser acessados por usuários autorizados via RBAC
```

#### 2. regra-integracao-n8n.md
```markdown
# Regra: Integrações N8N
- NUNCA hardcodar URLs de webhook — usar variáveis de ambiente
- SEMPRE testar workflows em ambiente de staging primeiro
- OBRIGATÓRIO: error handling em todos Code nodes
- Formato padrão de resposta: { success: boolean, data: any, error?: string }
```

#### 3. regra-supabase.md
```markdown
# Regra: Padrões Supabase
- SEMPRE usar server.ts em Server Components/API Routes
- SEMPRE usar client.ts em 'use client' components
- NUNCA fazer queries diretas sem validar autenticação primeiro
- SEMPRE usar tipagem TypeScript para as respostas do Supabase
```

---

## 🔄 WORKFLOWS RECOMENDADOS

### Workflows Existentes ✅
Todos os 11 workflows estão instalados e funcionais.

### Workflows Novos Recomendados (criar em `.agent/workflows/`)

#### `/migrate` — Supabase Migration Workflow
```markdown
Fluxo: Planejar → Escrever SQL → Backup → Aplicar → Verificar → Rollback plan
```

#### `/sync-n8n` — Sincronizar workflow N8N
```markdown
Fluxo: Exportar JSON → Validar → Versionar no Git → Deploy → Testar trigger
```

#### `/audit-lgpd` — Auditoria LGPD
```markdown
Fluxo: Mapear dados sensíveis → Verificar RLS → Checar logs → Relatório
```

#### `/gemini-integrate` — Integrar Gemini AI
```markdown
Fluxo: Identificar caso de uso → Configurar SDK → Implementar → Testar
```

---

## 📜 SCRIPTS RECOMENDADOS

### Scripts Existentes ✅
- `checklist.py` — Validação de código
- `verify_all.py` — Verificação completa pré-deploy

### Scripts Novos Recomendados (criar em `.agent/scripts/`)

#### `check-supabase-rls.py` (URGENTE para LGPD)
Verifica se todas as tabelas têm RLS habilitado e políticas configuradas.

#### `check-env-vars.py`
Verifica se todas as variáveis de ambiente necessárias estão configuradas.

#### `validate-cnpj-data.py`
Valida integridade dos dados de CNPJ no banco antes de operações críticas.

---

## 🤖 INTEGRAÇÃO GEMINI AI — OPORTUNIDADES

> Baseado no `CODEBASE.md`, identificamos onde o Gemini pode substituir ou melhorar:

### 1. Substituir OpenAI por Gemini (lib/utils/ai-service.ts)
**Motivo:** Gemini 3 Flash é mais rápido, mais barato e multimodal nativo
**Benefício:** Classificação fiscal de XMLs com custo ~70% menor
```typescript
// ANTES (caro)
import OpenAI from "openai"; // $0.03/1K tokens

// DEPOIS (moderno e barato)
import { GoogleGenAI } from "@google/genai"; // grátis no tier free
```

### 2. Maestro AI com Embeddings (lib/utils/drive-automation.ts)
**Motivo:** Usar embeddings do Gemini para mapear arquivos → obrigações
**Benefício:** Maestro aprende padrões automaticamente, menos regras hardcoded

### 3. Atendimento Multimodal (lib/utils/evolution-api.ts)
**Motivo:** Clientes enviam fotos de notas fiscais pelo WhatsApp
**Benefício:** Gemini 3 Flash pode analisar imagens nativamente

### 4. Análise de SPED/XML Inteligente (scripts/importador_fiscal.js)
**Motivo:** Gemini pode interpretar XML SPED com contexto semântico
**Benefício:** Classificação NCM/CFOP com contexto, não apenas regex

---

## 🎯 PLANO DE AÇÃO RECOMENDADO

### Fase 1 — Imediato (esta semana)
- [x] ✅ Instalar skill `gemini-api-dev` no projeto
- [ ] Criar `lib/utils/gemini-service.ts` com cliente Gemini
- [ ] Adicionar `GEMINI_API_KEY` ao `.env.local` e Vercel
- [ ] Criar rules `regra-dados-sensiveis.md` e `regra-supabase.md`

### Fase 2 — Curto prazo (próximas 2 semanas)
- [ ] Migrar `ai-service.ts` de OpenAI → Gemini 3 Flash
- [ ] Implementar embeddings no Maestro para mapeamento inteligente
- [ ] Criar workflow `/migrate` para Supabase migrations seguras

### Fase 3 — Médio prazo (próximo mês)
- [ ] Análise multimodal de notas fiscais via WhatsApp
- [ ] Dashboard com insights gerados por IA (Gemini Pro)
- [ ] Auditoria LGPD completa com script `check-supabase-rls.py`

---

## 📊 RESUMO DO ESTADO ATUAL

| Categoria | Quantidade | Estado |
|-----------|-----------|--------|
| **Agents** | 19 | ✅ Completo |
| **Skills (total)** | 72 | ✅ Robusto |
| **Skills (críticas p/ projeto)** | 15 | ✅ Todas instaladas |
| **Skills (gemini-api-dev)** | 1 | ✅ Recém instalada |
| **Workflows** | 11 | ✅ Completo |
| **Rules** | 2 | ⚠️ Faltam 3 específicas |
| **Scripts** | 2 master + 18 skill | ✅ Bom |
| **Integração Gemini** | 0% | 🔴 Oportunidade |
