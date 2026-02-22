# PLANO DE ORQUESTRAÇÃO MÚLTIPLA: Resolvendo a Sincronia Backend-Frontend & N8N 🎼🎯

**Data:** 22/02/2026
**Objetivo:** Erradicar as falhas de API (PGRST200/PGRST201), resolver os vazamentos de cache SSR (Error 503) e auditar automações no n8n.

---

## 🔍 Entendendo os Erros Relatados (Análise Preliminar)

A causa da frustração do Frontend reside na forma como o Supabase (via PostgREST) interpreta as consultas de bancos de dados relacionais e em falhas de renderização de rotas do Next.js.

### 1. Erros de Ambiguidade e Relacionamento (Backend vs Frontend)
*   **Erro `PGRST201`: "more than one relationship was found for 'atendimentos' and 'empresa_id'":**
    *   **Por quê ocorre?** O banco de dados possui **mais de uma Chave Estrangeira (FK)** apontando da tabela `atendimentos` para a tabela `empresas`. O Frontend pede para "trazer os dados da empresa", mas o Supabase não sabe "qual" conexão usar.
    *   **Solução (Frontend/DB):** Explicitar na query qual FK usar usando sintaxe `atendimentos!nome_da_constraint(...)` ou remover FKs excedentes/redundantes no backend.
*   **Erros `PGRST200`: "Could not find a relationship between X and Y in the schema cache":**
    *   Casos afetados: `tarefas -> equipe`, `eventos -> empresas`, `calendario -> empresas`.
    *   **Por quê ocorre?** As chaves estrangeiras (FKs) entre tabelas de schemas diferentes (`workflow`, `dp`, `fiscal` para o `core`) **não existem fisicamente** no Postgres OU o Schema Cache da API do Supabase está desatualizado.
    *   **Solução (DB):** Assegurar que os schemas `workflow`, `dp` e `fiscal` tenham a constraint FK correta para `core.equipe` e `core.empresas`, e notificar o schema reload do Supabase.

### 2. Erros de Prefetch / Tela Quebrada
*   **Erro `503 Service Unavailable (from prefetch cache)` no `/admin/maestro` e `/admin/clientes`:**
    *   **Por quê ocorre?** O Next.js tenta fazer pre-caching de rotas usando Server Components (RSC), mas algo trava severamente (uma query não tratada falhando de forma assíncrona que derruba a rota toda, limites de conexão ou cookies não presentes no layout de servidor).
    *   **Solução (Frontend/Debugger):** Mudar estratégias de fallback de Suspense, remover prefetch em links pesados, e gerenciar corretamente chamadas async nos Server Components principais.

### 3. Automação N8N (Excluindo Evolution)
*   **Por quê revisar?** Certificar que pastas de novos clientes do GDrive ou novos dados estão fluindo de/para o Supabase sem interromper ou gerar dados fantasma.

---

## 🤖 Agentes e Fases de Orquestração (PHASE 2)

Conforme as diretrizes da orquestração, este trabalho requer no mínimo 3 agentes especializados rodando em paralelo assim que o plano for aprovado.

| Agente Designado | Domínio e Tarefas Atribuídas |
| :--- | :--- |
| 🗄️ `database-architect` | **Auditoria de Banco**: Limpar a ambiguidade em `atendimentos`. Criar fisicamente as FKs perdidas nos schemas paralelos (`workflow`, `dp`, `fiscal`). Disparar `reload schema` no PostgREST. |
| 🎨 `frontend-specialist` | **Correção de UI e API**: Modificar todas as consultas TypeScript (selects) nas páginas afetadas `page.tsx` para garantir que as queries tenham "joins" não-ambigüos e seguros. Incluir verificação de fallback para o erro de `noise.png: 404`. |
| 🕵️‍♂️ `debugger` | **Estabilização de Rotas (Erro 503)**: Diagnosticar o pipeline Server-Side Rendering (layout, middleware) do Next.js para eliminar o Refused via Prefetch Cache e blindar os throw errors globais. |
| ⚙️ `backend-specialist` | **Auditoria de N8N**: Examinar os workflows hospedados no n8n (relevante ao CRM) para garantir que a inserção de usuários opere corretamente e de forma estabilizada (sem o módulo whatsapp). |

---

## ✅ Critérios de Sucesso
- A página Maestro e seus painéis abrem sem nenhum console vermelho (Status 200).
- Dados do CRM são renderizados e injetados com as informações da equipe e das empresas.
- Erro 503 é suprimido durante navegação cross-module no Next.js.
