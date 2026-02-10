# PLAN: Pipeline de Dados — Drive → Activity Log → CRM

> **Data:** 2026-02-10
> **Prioridade:** 🔴 CRÍTICA — sem isso, Dashboard e Maestro ficam vazios
> **Autor:** Antigravity AI + project-planner agent

---

## 🏗️ Contexto

### O que temos FUNCIONANDO:
- ✅ `activity_log` — tabela no Supabase (migration rodada)
- ✅ Webhook `/api/maestro/webhook` — pronto para receber eventos
- ✅ Dashboard `/admin` — lê activity_log via Realtime
- ✅ Maestro AI `/admin/maestro` — feed em tempo real
- ✅ 69 clientes com `drive_folder_id` no Supabase
- ✅ 128+ subpastas por cliente no Google Drive

### O que está FALTANDO (O Gargalo):
```
📁 Google Drive → ❌ NADA DISPARA → Webhook → activity_log → CRM
                   ^^^^^^^^^^^^^^^^^
                   ESTE É O PROBLEMA
```

**Nenhum processo está monitorando o Google Drive e enviando eventos para o webhook.**

---

## 🧠 Análise de Opções

### Opção A: API Cron (Drive Watcher v2)
**Como:** Uma API `/api/cron/drive-watcher` roda a cada 5min via Vercel Cron ou similar.
Ela varre as pastas dos 69 clientes no Drive, detecta novos arquivos e insere no `activity_log`.

| ✅ Prós | ❌ Contras |
|---------|-----------|
| Zero dependências externas | Rate limit da API do Google (pode ser lento com 69 clientes) |
| Roda direto no Vercel/Next.js | Não é tempo real (delay de 5min) |
| Código 100% nosso | Custo de API calls do Google |
| Já temos `drive-watcher/route.ts` base | Precisa gerir "último scan" |

**Esforço:** Médio (2-3h)

### Opção B: n8n Workflow (Drive Polling)
**Como:** Workflow n8n com Schedule Trigger (a cada 2min), busca Drive, POST para webhook.

| ✅ Prós | ❌ Contras |
|---------|-----------|
| Já temos JSON template | n8n precisa estar rodando 24/7 |
| Interface visual para debug | Dependência externa |
| Schedule flexível | n8n grátis tem limitações |
| Descarrega processamento do Vercel | Configuração de credenciais |

**Esforço:** Baixo (1h se n8n está rodando)

### Opção C: Híbrido (Cron API + Logging Direto)
**Como:** Reescrever `/api/automation/drive-watcher` para além de notificar WhatsApp, TAMBÉM inserir no `activity_log`. Programar para rodar a cada 5min via Vercel Cron Jobs.

| ✅ Prós | ❌ Contras |
|---------|-----------|
| Aproveita código existente | Mesmo delay de 5min |
| Dual-purpose (WhatsApp + Log) | Rate limit Google |
| Sem dependência de n8n | |
| Já tem auth do Google configurada | |

**Esforço:** Baixo (1-2h)

---

## 💡 Recomendação

### **Opção C — Híbrido** (Melhor custo-benefício)

**Justificativa:**
1. Já temos `drive-watcher/route.ts` quase funcionando
2. Não depende de n8n (autocontido)
3. Faz as DUAS coisas: notifica WhatsApp + alimenta activity_log
4. Vercel Cron Jobs é grátis no plano hobby
5. Delay de 5min é aceitável para contabilidade (não é chat em tempo real)

---

## 📋 Tarefas de Implementação

### FASE 1: Cron Drive Watcher v2 (Urgência 🔴)

| # | Tarefa | Agent | Arquivo | Descrição |
|---|--------|-------|---------|-----------|
| 1.1 | Criar Cron Config | infra | `vercel.json` | Adicionar cron schedule para drive-watcher |
| 1.2 | Reescrever Drive Watcher | backend | `app/api/cron/drive-watcher/route.ts` | Varrer TODAS as pastas recursivamente, detectar novos arquivos (por data), inserir no activity_log, notificar WhatsApp |
| 1.3 | Tabela de Estado | database | `supabase/migrations/` | Criar tabela `drive_scan_state` para guardar `last_scan_at` por pasta/cliente |
| 1.4 | Testar Pipeline | tester | manual | Adicionar um arquivo teste no Drive, esperar 5min, verificar se aparece no Dashboard |

### FASE 2: Enriquecimento de Dados (Urgência 🟡)

| # | Tarefa | Agent | Arquivo | Descrição |
|---|--------|-------|---------|-----------|
| 2.1 | Popular Vencimentos | database | `scripts/populate_vencimentos.py` | Script para preencher campos `vencimento_*` dos 69 clientes com dados reais |
| 2.2 | Cadastro de Obrigações | backend | `scripts/seed_obrigacoes.py` | Script para criar obrigações mensais padrão (DCTFWeb, FGTS, PGDAS-D, etc.) para cada cliente |
| 2.3 | Tabela controle_validades | database | migration | Verificar se existe e popular com dados reais de alvarás |

### FASE 3: Automação Completa (Urgência 🟢)

| # | Tarefa | Agent | Arquivo | Descrição |
|---|--------|-------|---------|-----------|
| 3.1 | Dashboard Completo | frontend | `app/admin/page.tsx` | Conectar WhatsApp Radar com dados reais |
| 3.2 | Equipe CRUD | frontend | `app/admin/equipe/page.tsx` | Finalizar módulo de equipe |
| 3.3 | Manual Folder UI | frontend | `app/admin/clientes/[id]/` | Botão para criar pastas/anos específicos |
| 3.4 | n8n Backup | infra | workflow | Configurar n8n como backup/monitor do Cron |

---

## 🔧 Detalhes Técnicos — Fase 1

### 1.1 Vercel Cron Config
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/drive-watcher",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### 1.2 Drive Watcher v2 — Lógica
```
1. Buscar última execução (last_scan_at) do Supabase
2. Para cada cliente com drive_folder_id:
   a. Buscar arquivos criados/modificados DEPOIS de last_scan_at
   b. Para cada arquivo novo:
      - Detectar categoria (FGTS, INSS, etc.)
      - Detectar se é GUIA ou COMPROVANTE
      - Inserir no activity_log
      - Tentar completar obrigação pendente
      - Notificar WhatsApp (se configurado)
3. Atualizar last_scan_at
4. Retornar resumo
```

### 1.3 Drive Scan State
```sql
CREATE TABLE IF NOT EXISTS public.drive_scan_state (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    last_scan_at TIMESTAMPTZ DEFAULT NOW(),
    total_files_found INT DEFAULT 0,
    total_activities_created INT DEFAULT 0
);
-- Inserir registro inicial
INSERT INTO public.drive_scan_state (last_scan_at) VALUES (NOW());
```

---

## ✅ Checklist de Verificação

| Critério | Validação |
|----------|-----------|
| Build sem erros | `npx next build` ✅ |
| Cron configurado | `vercel.json` com schedule |
| Drive Watcher funciona | Upload arquivo teste → aguardar 5min → ver no Dashboard |
| Activity Log recebe dados | Verificar tabela no Supabase |
| WhatsApp notifica | Verificar se cliente recebeu mensagem |
| Dashboard atualiza | Feed de atividades mostra novos eventos |

---

## 📅 Estimativa de Tempo

| Fase | Tempo | Urgência |
|------|-------|----------|
| **Fase 1** (Pipeline funcional) | ~2-3h | 🔴 HOJE |
| **Fase 2** (Dados enriquecidos) | ~2h | 🟡 Esta semana |
| **Fase 3** (Automação completa) | ~4h | 🟢 Próxima semana |

---

## 🎯 Resultado Esperado

Após a **Fase 1**, o fluxo será:
```
📁 Arquivo salvo no Google Drive
        │
        ▼ (a cada 5 min)
🔄 Cron Drive Watcher
        │
        ├─── 📊 Insere no activity_log (Dashboard + Maestro AI)
        ├─── ✅ Completa obrigação pendente (se aplicável)
        └─── 📱 Notifica cliente via WhatsApp
```

**O Dashboard e o Maestro AI receberão dados reais automaticamente.**
