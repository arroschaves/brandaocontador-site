# PLANO DE RESGATE FINAL V4: Operação Zero Erros 🚑

## 🎯 Objetivo
Habilitar todos os menus administrativos eliminando erros 404, 406 e PGRST106 em definitivo.

## 🔍 Causas Raiz
1.  **Módulo Equipe (404)**: Tabela `equipe` inexistente no banco. O frontend espera `equipe`, mas o backend possui `core.usuarios_escritorio`.
2.  **Módulo Vencimentos (406/PGRST106)**: View `vw_vencimentos_semanais` está no schema `compliance`, que não está exposto na API do Supabase.
3.  **Módulo Atendimento (406)**: Conflito de RLS ou `Accept-Profile` na tabela `core.atendimentos`.
4.  **Módulo Maestro (PGRST106)**: Acesso direto ao schema `workflow` por `Accept-Profile` bloqueado.

---

## 🛠️ Soluções Propostas

### 1. Camada de Proxy (Database-Architect)
Criaremos views de compatibilidade no schema `core` (já exposto) para unificar o acesso:
- **[NEW VIEW] `core.equipe`**: Proxy apontando para `core.usuarios_escritorio` (com mapeamento de colunas: cargo -> perfil, email -> email se existir ou mock).
- **[NEW VIEW] `core.vw_vencimentos_semanais`**: Proxy apontando para `compliance.vw_vencimentos_semanais`.
- **[NEW VIEW] `core.tarefas`**: Reforçar a view proxy para `workflow.tarefas`.

### 2. Normalização de Segurança (Security-Auditor)
- **RLS Full-Access**: Garantir política `FOR ALL TO authenticated USING (true)` em todas as novas views e tabelas base.
- **Search Path**: Fixar `ALTER ROLE authenticated SET search_path TO core, fiscal, audit, public`.

### 3. Validação de Sistema (Debugger)
- **Teste de Vitalidade**: Script para verificar Status 200 em:
    - `/rest/v1/equipe`
    - `/rest/v1/vw_vencimentos_semanais`
    - `/rest/v1/atendimentos`

---

## 🎼 Protocolo de Orquestração

| Fase | Agente | Ação |
|---|---|---|
| **P1** | `project-planner` | Criação deste Plano V4. |
| **P2** | `database-architect` | Execução dos scripts SQL de Views e Grants. |
| **P2** | `security-auditor` | Auditoria de RLS pós-implementação. |
| **P2** | `debugger` | Verificação final de "Zero Erros". |

---

Onaylıyor musunuz? (Y/N)
