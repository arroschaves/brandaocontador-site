# 🎼 MASTER PLAN: CRM MAESTRO BRANDÃO (v3.0)

Este é o documento oficial de diretrizes para o projeto. Todas as ações devem seguir rigorosamente esta ordem.

---

## 🧹 FASE 0: LIMPEZA & CONSOLIDAÇÃO (HOUSEKEEPING)
**Objetivo:** Eliminar o "lixo" técnico (80% dos scripts de migração antigos) e focar na estrutura Next.js + Supabase.

- [ ] Criar pasta `archive/` e mover scripts legados de 2024/2025.
- [ ] Remover logs gigantes (`brandao_operation.log`) e arquivos `.spec` soltos na raiz.
- [ ] Centralizar toda a lógica de banco no Supabase, removendo scripts Python de checagem manual.

## 🛡️ FASE 1: SEGURANÇA ELITE (COFRE DIGITAL)
**Objetivo:** Garantir que NADA vaze, especialmente Certificados A1 e dados sensíveis.

- [ ] **Módulo Vault**: Implementar criptografia AES-256 GCM para Certificados A1.
- [ ] **Auditoria Zero-Trust**: Registro de Visualização (quem viu o dado) e Ação (quem alterou).
- [ ] **Testes de Stress**: Executar `security_scan.py` e simulações de invasão.
- [ ] **LGPD Compliance**: Termos de uso internos e log de consentimento.

## 👥 FASE 2: GESTÃO DE EQUIPE & ACESSO
**Objetivo:** Controle total sobre quem faz o quê no escritório.

- [ ] **Onboarding Equipe**: Fluxo de convite por e-mail -> Criação de senha segura.
- [ ] **Dashboard de Performance**: Painel Master (Alessandro) para ver métricas de produtividade da equipe.
- [ ] **Vínculo de Executor**: Toda mensagem de WhatsApp ou upload leva o selo de quem realizou a tarefa.

## 🧠 FASE 3: INTELIGÊNCIA MULTIMÍDIA (IA)
**Objetivo:** Reduzir o trabalho manual entendendo áudios, vídeos e fotos.

- [ ] **Transcrição Whisper**: Transcrever áudios de clientes automaticamente no CRM.
- [ ] **IA Vision**: Reconhecer automaticamente contratos e certidões via foto/PDF.
- [ ] **Alertas Proativos**: O sistema avisa: "Guia nova no Drive. Enviar para o cliente?".

## 📂 FASE 4: CLIENT HUB BRUTALISTA
**Objetivo:** Interface de altíssimo nível que impressiona e organiza.

- [ ] **Página de Foco `/admin/clientes/[id]`**: Design "Sharp" (bordas 0px, cores Acid Green/Orange).
- [ ] **Wiki do Cliente**: Espaço para anotações estratégicas e procedimentos.
- [ ] **Timeline Maestro**: Histórico vivo de tudo que passa pelo Google Drive e WhatsApp.

## ⚡ FASE 5: AUTOMAÇÃO N8N & SUPABASE REALTIME
**Objetivo:** Velocidade total e sincronia perfeita entre as ferramentas.

- [ ] **Sincronia N8N**: Padronização de nomes de colunas e tabelas para evitar erros de integração.
- [ ] **Realtime Toasts**: Notificações instantâneas no CRM quando o N8n termina um processo.

---

## 🔒 PROMESSA DE SEGURANÇA
- O Supabase é a Fonte da Verdade.
- O Alessandro é o Único Usuário Master.
- Dados Master são mascarados para a equipe.
- Nenhuma senha ou certificado trafega em texto aberto.
