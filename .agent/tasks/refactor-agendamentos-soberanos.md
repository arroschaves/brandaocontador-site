# Tarefa: Refatoração de Agendamentos e Pendências (Protocolo Soberano)

## 📋 Visão Geral
Refatorar os componentes de agenda e pendências para sincronia total com o backend `workflow.tarefas` e aplicação da estética **Brutalista Premium** (Masterpiece).

## 🎯 Objetivos
1. Resolver 148+ erros de TypeScript (TS17004 e erros de interface).
2. Sincronizar interface `TarefaSoberana` com o schema do banco de dados.
3. Implementar design de alta fidelidade industrial (Preto/Branco/Esmeralda).
4. Garantir que o `PendenciaModal` use os endpoints corretos (`/api/clientes/[id]/agendamentos`).

## 🛠️ Plano de Ação

### Fase 1: Padronização de Tipos
- [ ] Criar/Atualizar o arquivo de tipos compartilhado ou unificar nos arquivos atuais.
- [ ] Tipo `TarefaSoberana` deve conter: `id`, `empresa_id`, `titulo`, `descricao`, `data_limite`, `status` (PENDENTE, CONCLUIDA, ATRASADA, CANCELADA), `prioridade`.

### Fase 2: Correção de Configuração (TS17004)
- [ ] Verificar por que o compilador está rejeitando o JSX nos arquivos novos.
- [ ] Garantir diretiva `'use client'` e imports corretos do React e Lucide.

### Fase 3: Refatoração dos Componentes
- [ ] **AgendaCalendar**: Layout de precisão industrial, grid de cycle analysis, estados de sincronia.
- [ ] **AgendaList**: Lista de operações soberanas, filtros dinâmicos, cards brutalistas.
- [ ] **PendenciaModal**: Dual-column layout (Protocolo | Ingestão).

### Fase 4: Integração com o Hub Maestro
- [ ] Ajustar o `app/admin/clientes/[id]/page.tsx` para passar as props corretas aos componentes refatorados.

## ✅ Critérios de Aceitação
- Zero erros de `npx tsc --noEmit`.
- Design validado contra o `frontend-specialist.md` (Design Commitment).
- CRUD de pendências funcionando via API.

## 📊 Status
- [ ] Planejamento
- [ ] Implementação
- [ ] Verificação
