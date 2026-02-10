# PLANO MAESTRO: SISTEMA INTEGRADO DE INTELIGÊNCIA CONTÁBIL

## 🎯 Objetivo
Transformar o CRM Maestro na espinha dorsal do escritório, integrando Google Drive, Supabase, n8n e Evolution API para automação total de obrigações, documentos e comunicações.

---

## 🏗️ Fase 1: Arquitetura & Base de Dados (Sentinela Backend)
**Responsável: `backend-specialist`**

### 1.1 Modelagem de Múltiplas Fazendas (Rural)
- Atualizar a tabela `unidades_fiscais` para incluir `drive_folder_id` específico por fazenda.
- Garantir que a relação `Cliente (CPF) -> N Fazendas` esteja refletida na API de documentos.

### 1.2 Ponte Drive-Supabase
- Criar Webhook no n8n que detecta criação de pastas manuais no Drive e vincula o ID ao Supabase automaticamente.
- Implementar lógica de "Auto-Folder": Se uma obrigação é detectada para uma fazenda sem pasta, o sistema cria a estrutura automaticamente.

---

## 🎨 Fase 2: Painel Sentinela (Interface Lúcida)
**Responsável: `frontend-specialist`**

### 2.1 Calendário de Obrigações Real-time
- Interface visual onde cada célula representa uma obrigação (FGTS, GPS, DCTF).
- Cores: 🟥 Atrasado | 🟧 Vencendo | 🟦 Aguardando Documento | 🟩 Concluído.

### 2.2 Hub de Fazendas (Produtor Rural)
- Visualização específica para CPFs que permite alternar entre Fazendas e ver o status de cada uma individualmente.

---

## 🤖 Fase 3: Automação & Sincronização (O "Relógio")
**Responsável: `orchestrator` + Scripts**

### 3.1 Script de Sincronização Portátil (Notebooks)
- Refinar o `SINCRONIZADOR_BRANDAO.py` para:
  - Detectar novos arquivos locais.
  - Upload para o Drive.
  - Notificar a API do CRM: "Arquivo X foi salvo para a Fazenda Y".

### 3.2 Notificações Maestro (WhatsApp)
- Fluxo n8n + Evolution API:
  - **Alerta de Upload**: "A Guia de FGTS da Fazenda Itaoca já está disponível no portal."
  - **Relatório Semanal**: Envio automático de PDF com pendências para os funcionários na sexta-feira.

---

## ✅ Critérios de Verificação
- [ ] Upload em um notebook reflete o status "Concluído" no Admin em < 30 segundos.
- [ ] Criação de nova Fazenda gera pastas automaticamente no Drive.
- [ ] Dashboard Sentinela carrega dados de 100+ clientes sem lentidão.
- [ ] Alertas de WhatsApp disparados corretamente via n8n.

---

**[OK] Plano criado: docs/PLAN-maestro-total-system.md**
