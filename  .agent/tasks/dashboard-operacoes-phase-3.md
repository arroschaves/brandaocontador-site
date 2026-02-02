# Task: Centro de Controle Master - Fase 3 (Dashboard de Operações)

Transformação da listagem simples de clientes em um painel gerencial de alta performance com visão matricial de obrigações e inteligência de status em tempo real.

## 📌 Checklist de Implementação

- [ ] **1. Inteligência de Dados Global**
    - [ ] Atualizar consulta `fetchClientes` para incluir o status das obrigações do mês atual.
    - [ ] Criar agregador de métricas (Contadores de pendências, validades e totais).

- [ ] **2. UI Dashboard (Matriz de Operações)**
    - [ ] Implementar Header High-Density com "Cards de Crise" (Metas e Alertas).
    - [ ] Criar a "Matriz de Obrigações" na tabela (Colunas visuais para DAS, FGTS, INSS, Folha).
    - [ ] Adicionar badges de status (Auditado/Pendente) diretamente na lista principal.

- [ ] **3. Funcionalidades Maestro Master**
    - [ ] Implementar o botão "Radar Global" (Sincronizar toda a base).
    - [ ] Adicionar filtros rápidos por status de obrigação (ex: "Exibir quem não enviou FGTS").
    - [ ] Implementar Alerta de Proximidade (Certificados vencendo em < 30 dias na home).

## 🛠️ Arquivos Afetados
- `app/admin/clientes/page.tsx` (Interface e Lógica Principal)
- `app/api/sync/audit/route.ts` (Otimização para execução em lote)
- `lib/utils/accounting-intelligence.ts` (Melhoria nos padrões de busca)

## 🎯 Critérios de Aceite
1. O administrador consegue ver em menos de 5 segundos quais clientes estão com pendências no mês atual.
2. O botão "Radar Global" dispara a auditoria para toda a carteira de clientes ativos.
3. Se um certificado de qualquer cliente estiver prestes a vencer, um alerta visual aparece na tela principal.
