# 🚀 PLANO DE VOO: FASE 2 - A IGNIÇÃO (MAESTRO 2026)

> **Status:** PLANEJAMENTO E ANÁLISE RIGOROSA  
> **Objetivo:** Transformar o Supabase no Cérebro Ativo (Ponta a Ponta).

---

## 1. 📂 A GRANDE TRAVESSIA (MIGRAÇÃO DE DADOS)

### O Desafio
Mover 74 clientes de `public.clientes` para `core.empresas` sem perder o vínculo com as pastas já existentes no Google Drive.

### Estratégia de Execução
1. **Script de Mapeamento Geográfico:** 
   - O script não apenas copiará nomes; ele validará o `CNPJ/CPF` (limpeza de caracteres).
   - **Vínculo de DNA:** Preservaremos o `drive_folder_id` atual. Se o cliente já tem pasta, o sistema *não* criará uma nova, ele *assumirá* a existente.
2. **Auto-Cadastro Inteligente (CRM):**
   - No Dashboard, a entrada de novos clientes será via Busca em API (CNPJ). 
   - Ao digitar o CNPJ, o Supabase preenche: Razão Social, CNAE, Início de Atividade.
   - O Trigger dispara: O sistema verifica no Drive se existe pasta com aquele CNPJ. Se não, cria.

---

## 2. ⚡ O BIG BANG DAS OBRIGAÇÕES (MOTOR FISCAL)

### Inteligência Embarcada
O Supabase aplicará as regras da **Legislação Tributária Brasileira (2026)**:
- **Simples Nacional:** DAS (Dia 20 - Posterga se FDS).
- **DCTF/EFD:** (Dia 15/25 - Antecipa se FDS).
- **FGTS Digital:** (Dia 20 - Antecipa se FDS).

### Visibilidade no Painel
- **Views Reais:** O Dashboard não lerá mais "estatísticas de teste". Ele lerá a View `fiscal.vw_dashboard_obrigacoes`.
- **Alertas de Cor:** 
  - 🔴 **Vencido** (Background vermelho no Dashboard).
  - 🟡 **Vencendo em 48h** (Pulsando no Painel).
  - 🟢 **Concluído** (Confirmado pelo MaestroSync).

---

## 3. 🤖 ATIVAÇÃO REAL-TIME & MAESTRO SYNC (BACKGROUND)

### Melhoria do MaestroSync.exe
- **Problema:** App fecha ao invés de minimizar.
- **Solução:** Implementar `System Tray` (Ícone ao lado do relógio). Ao "Fechar", ele apenas esconde a janela e continua processando em segundo plano.
- **Auto-Start:** Garantir que o registro no Windows (Run) esteja apontando para o binário correto.

### Sincronização de Pastas Existentes
- **Auditório Inicial:** Antes da ignição, o n8n fará uma varredura nas pastas atuais.
- **Indexação:** O ID de cada pasta será salvo no Supabase. O "Cérebro" passará a saber exatamente onde cada PDF deve ser guardado.

---

## ⚖️ BASE LEGAL E RIGOR
- Todo cálculo de vencimento segue a **Agenda Tributária da Receita Federal**.
- Uso de `audit.logs` para registrar quem, quando e por que uma obrigação foi marcada como entregue (Proteção Jurídica do Escritório).

---

## 🛠️ CHECKLIST PRÉ-IGNIÇÃO (PRÓXIMA SESSÃO)
1. [ ] Executar script de migração `public` -> `core`.
2. [ ] Testar trigger de criação de obrigações em 1 cliente piloto.
3. [ ] Atualizar código do MaestroSync para rodar em Segundo Plano (Tray).
4. [ ] Ligar Webhooks de notificação n8n.
