# Maestro Vision - Inteligência Documental Absoluta (Blueprint)

> **Status**: Planejamento (Fase 2)
> **Agente**: Project Planner & Backend Architect
> **Objetivo**: Transformar o fluxo de arquivos brutos (Google Drive) em dados soberanos no Supabase através de IA e Processamento Documental Inteligente (IDP).

---

## 🏗️ Visão da Arquitetura (O Backend Soberano)

O sistema deve processar mais de 30 tipos de documentos contábeis e fiscais. A estratégia é **desacoplar a origem (Drive/Sync)** da **inteligência (Supabase/IA)**.

1.  **Captura Externa**: `MaestroSync.exe` mantém o Google Drive sincronizado.
2.  **Trigger de Inteligência**: n8n ou Webhooks do Drive detectam novos arquivos.
3.  **Processamento (Maestro Vision)**: IA (OpenAI GPT-4o Vision ou Google Document AI) analisa o arquivo.
4.  **Escrita Soberana**: Gravação no esquema `compliance.documentos_processados` com validação de regras de negócio no banco.

---

## Success Criteria (Critérios de Sucesso)

- [ ] Suporte a 30+ tipos de documentos (DAS, FGTS, Alvarás, etc).
- [ ] OCR e extração de metadados (Competência, Vencimento, Valor) para PDF, JPEG, PNG, etc.
- [ ] Linking automático entre `drive_file_id` e o registro no Supabase.
- [ ] Sistema de Alertas Automáticos (Dashboard e WhatsApp) baseados na data de vencimento extraída.
- [ ] Relatórios Semanais automáticos gerados a partir da base soberana de documentos.

---

## 🛠️ Stack Tecnológica

- **Database**: Supabase (PostgreSQL 15+)
- **Orchestration**: n8n (Rodando em webhook.brandaocontador.com.br)
- **IA/OCR**: OpenAI GPT-4o Vision (pela flexibilidade com fotos/documentos variados)
- **API**: Next.js (API Routes) para validação e sanitização dos dados extraídos.

---

## 📂 Estrutura de Tabelas (Design Soberano)

### `storage_docs.documentos` (Extensão)
Adicionar colunas para rastreamento de inteligência.

### `compliance.documentos_processados` (Nova)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `documento_id` | `uuid` | FK para `storage_docs.documentos` |
| `empresa_id` | `uuid` | FK para `core.empresas` |
| `tipo_maestro` | `text` | Enum (DAS, FGTS, ALVARA_FUNCIONAMENTO, etc) |
| `competencia` | `date` | Mês/Ano de referência |
| `vencimento` | `date` | Data extraída pela IA |
| `valor` | `numeric` | Valor extraída pela IA |
| `metadata_ia` | `jsonb` | OCR bruto e dados extras da IA |
| `status_processamento` | `text` | (sucesso, erro, humano_obrigatorio) |

---

## 🚀 Cronograma de Implementação (Peça por Peça)

### Fase 1: Fundação do Banco de Dados (P0)
- [ ] Criar esquema de tabelas soberanas em `compliance`.
- [ ] Criar ENUMs para todos os tipos de documentos listados.
- [ ] Criar triggers de auditoria (audit.logs) para cada novo documento processado.

### Fase 2: O Cérebro IA (n8n Workflow) (P1)
- [ ] Criar Workflow n8n para escuta do Google Drive.
- [ ] Implementar prompt de extração para Vision AI segmentado por tipo de documento.
- [ ] Implementar lógica de retry e fallback.

### Fase 3: API de Recepção (P1)
- [ ] Criar `app/api/maestro/process/route.ts` para receber dados do n8n.
- [ ] Validar integridade dos dados (datas futuras, valores negativos, etc).

### Fase 4: Inteligência de Alerta (P2)
- [ ] Criar Views em `analytics` para relatórios de vencimentos da semana.
- [ ] Criar script de notificação periódica (WhatsApp/Email).

---

## 🏁 Verificação Final (Phase X)

- [ ] Testar reconhecimento de um Documento de Arrecadação (DAS).
- [ ] Testar reconhecimento de uma CNH/RG.
- [ ] Validar se o `drive_file_id` permite localizar o arquivo instantaneamente.
- [ ] Verificar se o log de auditoria capturou a extração da IA.
