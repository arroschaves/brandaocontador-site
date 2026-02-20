# Adaptação do Frontend para o Novo Schema do Supabase (Master)

## Overview
O banco de dados antigo no Supabase foi deletado e um novo foi recriado na nuvem. A nova estrutura do banco de dados (Master) reorganizou as tabelas em múltiplos schemas (`core`, `fiscal`, `dp`, `workflow`, `audit`, `storage_docs`, `financeiro`, `compliance`). O objetivo deste plano é mapear e corrigir todas as chamadas à API do Supabase no frontend para refletir a nova estrutura de tabelas, garantindo que o CRM `Maestro` volte a funcionar perfeitamente sem quebrar a UI.

## Project Type
WEB (Next.js App Router, React Web).
Agente Primário Requerido: `frontend-specialist`.

## Success Criteria
- [ ] Todo o frontend (páginas `/admin/*` e rotas `/api/*`) consegue ler dados do Supabase sem erros de "Table not found".
- [ ] Inserção, Atualização e Exclusão de clientes, tarefas, certificados e obrigações funcionam utilizando a nova modelagem de dados (`core.empresas`, `workflow.tarefas`, `core.certificados_digitais`, etc.).
- [ ] A página principal de clientes (`/admin/clientes`, `/admin/clientes/[id]`) carrega sem crashar.
- [ ] Nenhuma query existente aponta para o esquema público antigo sem a devida correção.

## Tech Stack
- Frontend: Next.js 14+ (App Router), React, TailwindCSS.
- Backend: Supabase (PostgreSQL 15+) com múltiplos schemas.

## File Structure (Arquivos Afetados)
A busca identificou que os seguintes arquivos principais realizam operações (`.from()`) no Supabase e precisarão de refatoração ou revisão intensa:
- **Rotas de API (`app/api/*`)**:
  - `clientes/route.ts`, `clientes/[id]/enrich/route.ts`, `clientes/[id]/certificados-digitais/route.ts`, etc.
  - `sync/audit/route.ts`
  - `maestro/webhook/route.ts`, `maestro/process/route.ts`
  - `drive/upload/route.ts`
- **Páginas e Componentes (`app/admin/*`)**:
  - `clientes/page.tsx`, `clientes/[id]/page.tsx`
  - `clientes/components/ClientDetailSidebar.tsx`
  - `components/GestaoValidades.tsx`
  - `maestro/page.tsx`, `calendario/page.tsx`, `cronograma/page.tsx`
- **Lib (`lib/utils/*`)**:
  - `utils/security.ts`, `utils/rbac.ts`, `utils/audit.ts`

## Task Breakdown

### 1. Atualização do Mapeamento de Tabelas (Types e Lib)
- **INPUT**: Nova estrutura do banco de dados (SQL migrations de 16-18 Fev 2026).
- **OUTPUT**: Arquivos em `lib/` e `types/` (se existirem) atualizados com as referencias corretas (`core.empresas`, `core.certificados_digitais`, `fiscal.calendario`, etc.). Tipagens adequadas para evitar erros de TypeScript.
- **VERIFY**: `npx tsc --noEmit` passa sem erros nas tipagens atualizadas.

### 2. Refatoração do Módulo de Clientes (Core)
- **INPUT**: Rotas da API de clientes e componentes da página `/admin/clientes`.
- **OUTPUT**: Queries alteradas de `supabase.from('clientes')` para `supabase.from('core.empresas')`. Ajuste dos dados retornados para a UI.
- **VERIFY**: Acesso à `/admin/clientes` exibe a lista, inserção no formulário salva em `core.empresas`.

### 3. Refatoração do Módulo Maestro / Tarefas (Workflow, Fiscal e DP)
- **INPUT**: APIs e componentes do Maestro (`/admin/maestro`, `/api/maestro`).
- **OUTPUT**: Queries alteradas para buscar dados de `workflow.tarefas`, `fiscal.calendario`, `fiscal.obrigacoes_templates`, `dp.eventos`. Atualização da inserção de atividades.
- **VERIFY**: Dashboard Maestro carrega os dados reais e log de atividades.

### 4. Refatoração do Módulo de Auditoria e Certificados (Audit / Core / Compliance)
- **INPUT**: `lib/utils/audit.ts`, `/api/clientes/[id]/certificados-digitais/route.ts`, `/admin/auditoria/page.tsx`.
- **OUTPUT**: Correção dos logs sendo salvos em `audit.logs` ao invés da antiga estrutura. Certificados listados/gravados corretamente em `core.certificados_digitais`.
- **VERIFY**: Criar/alterar um cliente gera log em `audit.logs`; página Auditoria exibe as linhas gravadas.

### 5. Configuração e Sincronização de Roles (Segurança / RLS)
- **INPUT**: Migrations RLS e `lib/utils/rbac.ts`.
- **OUTPUT**: As queries respeitam a autenticação via `core.usuario_empresa` e funções da aplicação fazem fetch apenas dos dados permitidos pela constraint do RLS.
- **VERIFY**: Usuário autenticado obtém status 200 nas chamadas sem erro 403.

## Phase X: Verification
- [ ] Rodar **Lint**: `npm run lint && npx tsc --noEmit`
- [ ] Rodar **Build**: `npm run build`
- [ ] Rodar Teste Manual (Navegador): Abrir o ambiente de dev (`npm run dev`) e navegar para `/admin/clientes`, acessar um cliente específico, checar aba de certificados e obrigações.
- [ ] Checklist Socrático/UX: Validar se novos logs/indicadores na Dashboard quebram a responsividade do UI.
