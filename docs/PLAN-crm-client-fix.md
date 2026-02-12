# PLAN: Correção do Fluxo de Cadastro de Clientes CRM

> **Data:** 2026-02-11
> **Prioridade:** CRÍTICA
> **Status:** 🔴 Planejamento

---

## 1. CONTEXTO

O fluxo de cadastro de clientes no CRM apresenta 3 falhas interconectadas:

1. **Erro ao Salvar** — O formulário envia campos inexistentes no Supabase ou valores inválidos
2. **CNPJ Incompleto** — A consulta CNPJ retorna dados mas o frontend não mapeia todos os campos para o form
3. **N8N Desalinhado** — O workflow N8N tem erros de conexão lógica e conflito com o script local `drive-automation.ts`

### Fluxo Esperado (Correto)

```
[Usuário] → Preenche CNPJ → [Consulta API CNPJ] → Preenche campos automaticamente
         → Clica "Salvar" → [POST /api/clientes] → Insere no Supabase
         → [Webhook N8N] → Busca clientes sem drive_folder_id
         → Cria pasta no Google Drive → Atualiza drive_folder_id no Supabase
```

### Fluxo Atual (Quebrado)

```
[Usuário] → Preenche CNPJ → Dados parciais preenchidos (faltam campos)
         → Clica "Salvar" → ERRO: colunas inexistentes ou valores inválidos
         → Webhook N8N pode não encontrar o cliente (drive_folder_id = '' vs NULL)
```

---

## 2. DIAGNÓSTICO DETALHADO

### 2.1 Backend — API /api/clientes (route.ts)

| Problema | Detalhe | Impacto |
|----------|---------|---------|
| Campos fantasmas | `tipo_pessoa`, `atividade_principal`, `natureza_juridica`, `porte` estão na whitelist CAMPOS_TEXT mas podem não existir na tabela | INSERT falha com "column X does not exist" |
| `inscricao_municipal` no form | Enviada pelo formulário mas possivelmente ausente no DB | INSERT falha |
| `drive_folder_id` = '' | Frontend envia string vazia ao invés de não enviar ou enviar null | N8N não encontra o cliente (filtra por IS NULL, não por = '') |
| Campos DATE | `data_abertura`, `data_situacao_cadastral` podem vir em formato errado | Erro de tipo no Postgres |

### 2.2 Frontend — Formulário de Cadastro (page.tsx)

| Problema | Detalhe | Impacto |
|----------|---------|---------|
| Campos CNPJ não mapeados | `natureza_juridica`, `porte`, `capital_social`, `data_abertura` retornados pela consulta mas NÃO setados no formData | Dados perdidos |
| Campos ausentes no form | Não há inputs para `natureza_juridica`, `porte`, `data_abertura`, `capital_social`, `complemento` | Dados do CNPJ são ignorados |
| drive_folder_id como '' | formData inicializa com `drive_folder_id: ''` — isso é enviado ao backend como string vazia | Conflito com filtro NULL do N8N |
| Campos de endereço | `logradouro`, `numero`, `bairro`, `cidade`, `estado` — existem no form CNPJ mas NÃO têm inputs visíveis para edição manual | UX incompleta |

### 2.3 N8N Workflow — AutoAutomacao Google Drive

| Problema | Detalhe | Impacto |
|----------|---------|---------|
| Conexão Loop incorreta | Output 1 do SplitInBatches conecta simultaneamente a `Create folder`, `Loop Over Items` e `Update a row` | Loop infinito ou execução duplicada |
| Filtro is null vs = '' | Query `drive_folder_id IS NULL` não pega `drive_folder_id = ''` | Clientes novos nunca são processados |
| Pasta simples vs árvore completa | N8N cria apenas a pasta raiz ("NOME (CNPJ)") mas o projeto tem `drive-automation.ts` que cria árvore completa com ~100 subpastas | Duas lógicas conflitantes |
| Pasta pai divergente | N8N usa `1qYZ1pLbgsb7SI-AOKYjAUP_oxY32ATj9` (BRANDAO CONTABILIDADE CRM), .env usa `1iiolcacOKwBKxM7Y0vgevT1YKwjTc1FP` | Pastas criadas em locais diferentes |

---

## 3. PLANO DE CORREÇÃO

### Fase 1: Backend Specialist — Corrigir API POST /api/clientes

**Arquivo:** `app/api/clientes/route.ts`

- [ ] **T1.1** Verificar schema real da tabela `clientes` no Supabase (todas as colunas)
- [ ] **T1.2** Alinhar CAMPOS_TEXT, CAMPOS_DATE, CAMPOS_NUMBER com as colunas reais do banco
- [ ] **T1.3** Garantir que `drive_folder_id` NUNCA seja enviado como string vazia — remover do insert ou converter '' para null
- [ ] **T1.4** Melhorar fallback de "campos mínimos" com log detalhado de quais campos foram rejeitados
- [ ] **T1.5** Adicionar endpoint `GET /api/clientes/schema` (ou similar) que retorna os campos válidos para debug

### Fase 2: Backend Specialist — Corrigir API Consulta CNPJ

**Arquivo:** `app/api/clientes/cnpj/route.ts`

- [ ] **T2.1** Mapear TODOS os campos retornados pelas APIs de CNPJ que existam na tabela `clientes`
- [ ] **T2.2** Garantir que o campo `telefone` retornado seja formatado corretamente
- [ ] **T2.3** Adicionar campos que faltam: `natureza_juridica`, `porte`, `capital_social`, `data_abertura`, `data_situacao_cadastral`, `complemento`
- [ ] **T2.4** Detectar e retornar `tipo_pessoa` (PJ/PF) com base no tamanho do CNPJ/CPF

### Fase 3: Frontend Specialist — Corrigir Formulário de Cadastro

**Arquivo:** `app/admin/clientes/page.tsx`

- [ ] **T3.1** Adicionar ao formData os campos que faltam: `natureza_juridica`, `porte`, `capital_social`, `data_abertura`, `complemento`, `tipo_pessoa`
- [ ] **T3.2** Remover `drive_folder_id` do formData inicial (nunca deve ser enviado no POST de novo cliente)
- [ ] **T3.3** Mapear TODOS os campos da resposta CNPJ no setFormData de `handleConsultarCNPJ`
- [ ] **T3.4** Adicionar inputs (opcionais/readonly) para `natureza_juridica`, `porte`, `capital_social`, `data_abertura` no formulário
- [ ] **T3.5** Adicionar seção de endereço expandida com: `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `cep`
- [ ] **T3.6** Melhorar feedback de erro ao salvar (mostrar qual campo falhou)
- [ ] **T3.7** Adicionar toast/notificação ao invés de alert() para melhor UX

### Fase 4: N8N + Integração — Corrigir Workflow de Automação

- [ ] **T4.1** DECISÃO: Usar N8N OU `drive-automation.ts` (não ambos) — **Recomendação: Usar a API local `drive-automation.ts`** pois ela cria a árvore completa de subpastas
- [ ] **T4.2** Se usar API local: Criar endpoint `POST /api/automation/create-folders` que:
    1. Recebe `clientId`
    2. Busca dados do cliente no Supabase
    3. Chama `createClientDriveStructure()` do `drive-automation.ts`
    4. Salva `drive_folder_id` no Supabase
    5. Loga na tabela `activity_log`
- [ ] **T4.3** Atualizar `POST /api/clientes` para chamar o novo endpoint de criação de pastas (ao invés do webhook N8N)
- [ ] **T4.4** Manter N8N como **fallback/varredura** para clientes que ficaram sem pasta (cron job)
- [ ] **T4.5** Corrigir o filtro N8N: filtrar por `drive_folder_id IS NULL OR drive_folder_id = ''`

### Fase 5: Testes & Validação

- [ ] **T5.1** Criar teste `tests/api/clientes-crud.test.ts` com mocks do Supabase
- [ ] **T5.2** Testar o fluxo completo: Consulta CNPJ → Preenchimento → Salvar → Drive
- [ ] **T5.3** Testar cenários de erro: CNPJ inválido, campos faltando, Supabase offline

---

## 4. ARQUITETURA PROPOSTA

```
┌──────────────────┐     ┌─────────────────────┐     ┌───────────────────┐
│   Frontend       │     │  Backend (API)       │     │  Supabase         │
│                  │     │                      │     │                   │
│ Formulário ──────┼────►│ POST /api/clientes   │────►│ INSERT clientes   │
│                  │     │  ├─ sanitizeFormData  │     │                   │
│ Consulta CNPJ ───┼────►│  ├─ insert + select  │     │                   │
│                  │     │  └─ createFolders()   │     │ UPDATE drive_id   │
│ handleSubmit()   │     │                      │     │                   │
└──────────────────┘     │ POST /api/automation/ │     └───────────────────┘
                         │   create-folders      │
                         │  ├─ getDriveClient()  │     ┌───────────────────┐
                         │  ├─ createFolder()    │────►│ Google Drive      │
                         │  └─ createSubFolders()│     │ BRANDAO CRM/      │
                         └─────────────────────┘     │  └─ EMPRESA (CNPJ) │
                                                       │     ├─ 01-CND    │
                         ┌─────────────────────┐     │     ├─ 02-RH     │
                         │  N8N (Backup Cron)   │     │     ├─ 03-FISCAL │
                         │  Varredura clientes  │────►│     └─ ...       │
                         │  sem drive_folder_id │     └───────────────────┘
                         └─────────────────────┘
```

---

## 5. AGENTES RESPONSÁVEIS

| Agente | Tarefas | Fase |
|--------|---------|------|
| **backend-specialist** | T1.1-T1.5, T2.1-T2.4, T4.2-T4.5 | 1, 2, 4 |
| **frontend-specialist** | T3.1-T3.7 | 3 |
| **test-engineer** | T5.1-T5.3 | 5 |

---

## 6. PRIORIDADE DE EXECUÇÃO

1. 🔴 **CRÍTICO** — Fase 1 (fix API POST — sem isso nada funciona)
2. 🟠 **ALTO** — Fase 3 (fix form — mapear todos os campos)
3. 🟡 **MÉDIO** — Fase 2 (CNPJ completo — enriquecer dados)
4. 🟢 **NORMAL** — Fase 4 (N8N + Drive automation — integração)
5. 🔵 **MELHORIA** — Fase 5 (testes + validação)

---

## 7. VERIFICAÇÃO FINAL

- [ ] Criar um cliente de teste com CNPJ real
- [ ] Verificar se dados são salvos corretamente no Supabase
- [ ] Verificar se pasta é criada no Google Drive com subpastas
- [ ] Verificar se `drive_folder_id` é atualizado no Supabase
- [ ] Verificar se N8N backup scan funciona (varredura de clientes sem pasta)
