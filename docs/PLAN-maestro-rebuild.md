# PLANO DE RECONSTRUÇÃO: MAESTRO 2026 🚀

Este plano define a estratégia para a reconstrução do sistema Maestro CRM, migrando para uma arquitetura multi-tenant robusta no Supabase Cloud e integrando a inteligência de documentos via Google Drive.

## 📅 Status: FASE 1 - PLANEJAMENTO & FUNDAÇÃO

---

## 🏗️ Fase 1: Fundação do Banco de Dados (Brain)
**Responsável:** `database-architect`
**Objetivo:** Criar a estrutura SQL baseada no Blueprint "Cérebro do Sistema".

- [x] **Migrations Iniciais:** Criado `20260215_schema_master.sql`.
- [ ] **Aplicar SQL:** Aguardando execução no Supabase Dashboard.
- [ ] **Schemas Profissionais:** 
    - `core`: Empresas, Escritórios, Usuários e Perfis.
    - `fiscal`: Obrigações, Impostos e Calendário Tributário.
    - `dp`: Funcionários, Folha e Eventos de Pessoal.
    - `audit`: Logs de auditoria para proteção jurídica.
- [ ] **Segurança (RLS):** Implementar Row Level Security para isolamento total de dados entre empresas.
- [ ] **Triggers Inteligentes:** Automação de criação de calendário tributário ao cadastrar nova empresa.

## 📱 Fase 2: Adaptação do Frontend Next.js
**Responsável:** `frontend-specialist`
**Objetivo:** Adaptar o CRM atual para os novos Schemas e melhorar o Dashboard.

- [ ] **Re-mapeamento de API:** Atualizar Hooks e Server Actions para apontar para o novo projeto Supabase Cloud.
- [ ] **Dashboard Inteligente:** Exibir contador de obrigações pendentes em tempo real.
- [ ] **Gestão de Empresas:** Tela unificada para cadastro com seleção de Regime Tributário e Serviços.

## 🤖 Fase 3: Crawler de Documentos (Ouro do Projeto)
**Responsável:** `backend-specialist`
**Objetivo:** Transformar as pastas de PDFs do Drive em dados estruturados.

- [x] **Scanner de Drive:** Script Python criado e testado (`scripts/reconcile_drive_data.py`).
- [x] **Mapeamento 2026:** Relatório gerado com sucesso (3 clientes identificados).
- [ ] **Extrator de Metadados:** Identificar automaticamente o tipo de arquivo (DAS, FGTS, INSS) baseado no nome/conteúdo.
- [ ] **Extrator de Metadados:** Identificar automaticamente o tipo de arquivo (DAS, FGTS, INSS) baseado no nome/conteúdo.
- [ ] **Sincronização Automática:** Atualizar o status das obrigações no banco ao detectar o arquivo no Drive.

## 🔄 Fase 4: Automação & Notificação
**Responsável:** `backend-specialist`
**Objetivo:** Notificar via WhatsApp (Evolution API) e e-mail.

- [ ] **Alertas de Vencimento:** Enviar lembretes automáticos 3 dias antes do prazo.
- [ ] **Protocolo de Recebimento:** Notificar o escritório quando o cliente subir um documento.

---

## 🚀 Próximos Passos Imediatos
1. Gerar SQL Master v1.
2. Configurar variáveis do Supabase Cloud (aguardando credenciais).
3. Criar script de mapeamento de pastas do Drive para cadastro automático de clientes.

---
**Nota:** Este plano é dinâmico e será atualizado conforme o progresso.
