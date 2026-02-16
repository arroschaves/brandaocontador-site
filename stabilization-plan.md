# Plano de Estabilização e Auditoria de Ponta - Brandão Contador Site

> **Status**: Planejamento (Fase 1)
> **Agente Responsável**: Project Planner & Orchestrator
> **Objetivo**: Corrigir as lacunas ("buracos negros") na integração Supabase -> Google Drive -> N8N -> WhatsApp e garantir soberania de dados.

---

## 🏗️ Análise da Arquitetura Atual (O Cérebro e a Espinha Dorsal)

Com base na auditoria inicial, mapeamos o fluxo de informação:

1.  **Cérebro (Supabase)**: O `core.empresas` é a fonte da verdade. Qualquer criação dispara o "Golden Path".
2.  **Sistema Nervoso (N8N Webhooks)**:
    *   `cadastro-cliente`: Recebe o payload completo da empresa para criar a estrutura no Drive.
    *   `whatsapp-message`: Atua como cérebro reativo para mensagens recebidas via Evolution API.
3.  **Membros (Google Drive)**: Executa a organização de arquivos baseada no blueprint em `lib/utils/drive-automation.ts`.

---

## 🚩 Lacunas Identificadas (Gaps & Leaks)

Conforme os testes automatizados (`checklist.py`), os seguintes pilares estão falhando:
- [ ] **Testes (Test Runner)**: A suíte de testes de integração está falhando ou incompleta.
- [ ] **UX (UX Audit)**: Inconsistências na interface que podem levar a erros operacionais.
- [ ] **SEO (SEO Check)**: Falhas na estrutura de metadados e indexação.
- [ ] **Integridade N8N**: Incerteza sobre a lógica interna dos workflows (precisamos analisar o arquivo JSON dos workflows).

---

## 📋 Lista de Tarefas (Task Breakdown)

### Fase 1: Auditoria de Comunicação e Dados
- [x] **Análise de Workflows N8N**:
    - Tarefa: Analisar o workflow "Golden Path" e "Evolution API".
    - Status: **CONCLUÍDO**. Todos os 5 fluxos foram corrigidos para usar os novos schemas (`core`, `fiscal`, `audit`).
- [x] **Sincronização de Pastas Legadas**:
    - Tarefa: Adaptar o script `seed_clients_from_drive.py` para garantir que as pastas existentes sejam mapeadas corretamente para o novo schema `core.empresas`.
    - Status: **CONCLUÍDO**. Script `fix_n8n_workflows.py` executado.
- [x] **Sincronização de Campos (CNPJ vs CNPJ_CPF)**:
    - Tarefa: Criada a migration `20260216_sync_fields_final.sql` para garantir que o banco suporte todos os campos enviados pelo N8N.
- [ ] **Auditoria da Evolution API**:
    - Tarefa: Revisar `lib/utils/evolution-api.ts` para garantir tratamento de erros robusto em casos de desconexão da instância.

### Fase 2: Correção da "Espinha Dorsal" (Supabase)
- [ ] **Constraints & Relationships**:
    - Verificar se todos os relacionamentos entre `core`, `fiscal` e `audit` possuem `ON DELETE RESTRICT` ou `CASCADE` adequados para evitar dados órfãos.
- [ ] **Triggers de Auditoria**:
    - Garantir que TODA alteração via API ou DB seja refletida em `audit.logs` sem exceções.

### Fase 3: Estabilização de UX e Performance
- [ ] **Correção do UX Audit**: Ajustar componentes do Dashboard e Maestro para evitar "dead ends" visuais.
- [ ] **Otimização de SEO**: Implementar as recomendações do `seo_checker.py`.

---

## 🛡️ Protocolo de Execução (Skills Utilizadas)

1.  **App Builder**: Orquestração da estrutura.
2.  **Architecture**: Tomada de decisão sobre os schemas.
3.  **N8N Expert**: Validação das expressões dos workflows.
4.  **Production Code Audit**: Varredura linha a linha para eliminar "vazamentos".

---

## ❓ Perguntas Críticas para o Usuário

1. **Workflows N8N**: Você consegue fornecer o export JSON dos workflows "Golden Path" e "Evolution API" para que eu possa auditá-los linha a linha?
2. **Pastas Legadas**: O script `lib/utils/drive-automation.ts` reflete exatamente como as pastas foram criadas no passado, ou houve mudanças manuais que precisamos prever?
3. **Evolution API**: A instância `escritorioatendimento` está estável ou você tem percebido quedas de conexão que afetam o recebimento?

