# PLAN: Auto-Criação de Pastas — Fase 1 "A Gasolina"

## 1. Objetivo
Quando um novo cliente é cadastrado no CRM, o sistema deve automaticamente:
1. Criar a pasta do cliente no Google Drive (com nome padronizado)
2. Criar TODAS as subpastas padrão (11 categorias + subpastas RH)
3. Salvar o `drive_folder_id` no Supabase
4. O MaestroSync nos notebooks replica automaticamente via Google Drive Desktop

## 2. Diagnóstico (Explorer Agent)

### 2.1 O que JÁ EXISTE (não precisa criar do zero):
- `app/api/clientes/route.ts` → API POST para criar clientes (JÁ chama `createClientDriveStructure`)
- `lib/utils/drive-automation.ts` → Função que cria pastas no Drive (EXISTE mas está ERRADA)
- `GOOGLE_DRIVE_ROOT_FOLDER_ID` no `.env.local` → ID da pasta raiz do Drive (1iiolcacOKwBKxM7Y0vgevT1YKwjTc1FP)
- `GOOGLE_CREDENTIALS_JSON` no `.env.local` → Service Account funcional (TESTADO E APROVADO)

### 2.2 O que está ERRADO:
- `FOLDER_STRUCTURE` em `drive-automation.ts` tem 7 pastas genéricas que NÃO correspondem à estrutura real
- Faltam subpastas de RH (FGTS, INSS, RECIBO_FOLHA, etc.)
- O `parentFolderId` estava hardcoded com ID inválido (linha 30)

### 2.3 Estrutura Real (76 clientes existentes em C:\Brandao_Contabilidade):

```
📁 NOME DO CLIENTE (CNPJ/CPF)
├── 📁 01 - CND (Certidões Negativas)
├── 📁 02 - PENDÊNCIAS FISCAIS (Federal, Estadual, Municipal)
├── 📁 03 - DOCUMENTOS PESSOAIS
├── 📁 04 - CERTIFICADO DIGITAL
├── 📁 05 - DOCUMENTOS TERRA
├── 📁 06 - IRPF
├── 📁 07 - JUNTA COMERCIAL
├── 📁 08 - FATURAMENTO
├── 📁 09 - CAEPF
├── 📁 10 - RH - ESCRITA - CONTABILIDADE
│   ├── 📁 01 - FISCAL
│   ├── 📁 02 - RH
│   └── 📁 03 - IMPOSTOS E GUIAS
├── 📁 11 - ALVARAS
│   ├── 📁 BOMBEIRO
│   ├── 📁 SANITARIO
│   ├── 📁 MEIO AMBIENTE
│   └── 📁 FUNCIONAMENTO
└── 📁 GERAL
    ├── 📁 AVISO_PREVIO
    ├── 📁 FGTS
    ├── 📁 FICHAS_EMPREGADOS
    ├── 📁 INSS
    ├── 📁 PEDIDO_REGISTRO
    ├── 📁 RECIBO_FERIAS
    ├── 📁 RECIBO_FOLHA
    └── 📁 RECIBO_RESCISAO
```

## 3. Tarefas de Implementação

### TASK 1: Atualizar `lib/utils/drive-automation.ts` (Backend Specialist)
**Arquivo:** `lib/utils/drive-automation.ts`
**Ação:** Reescrever `FOLDER_STRUCTURE` com a árvore completa real (acima)
**Detalhes:**
- Usar `GOOGLE_DRIVE_ROOT_FOLDER_ID` do `.env.local` (remover hardcode)
- Criar subpastas recursivamente (pasta 10 tem 3 filhas, pasta 11 tem 4, GERAL tem 8)
- Formato do nome da pasta raiz: `NOME (CNPJ/CPF)`
- Retornar o `clientFolderId` para salvar no Supabase

### TASK 2: Criar script de reconciliação (Backend Specialist)
**Arquivo:** `scripts/reconcile_folders.py`
**Ação:** Para os 5 clientes sem pasta + qualquer futuro desalinhamento
**Lógica:**
1. Ler todos os clientes do Supabase
2. Para cada cliente SEM `drive_folder_id`:
   - Tentar encontrar pasta existente no Drive (fuzzy match)
   - Se não encontrar: CRIAR pasta completa com subpastas
   - Salvar `drive_folder_id` no Supabase
3. Pode ser rodado como CRON (diário) ou manualmente

### TASK 3: Verificar/Corrigir o formulário de cadastro no CRM (Frontend Specialist)
**Arquivo:** `app/admin/clientes/page.tsx` (ou formulário de criação)
**Ação:** Garantir que o botão "Novo Cliente" chama `POST /api/clientes`
**Validação:**
- Nome é obrigatório
- CNPJ/CPF é obrigatório (para nomear a pasta)
- Feedback visual: "Criando cliente... Criando pastas no Drive... Pronto!"

### TASK 4: Testar o fluxo completo end-to-end (Test Engineer)
**Testes:**
1. Criar cliente via CRM → Verificar pasta no Drive → Verificar `drive_folder_id` no DB
2. Esperar MaestroSync rodar → Verificar pasta aparece em `C:\Brandao_Contabilidade`
3. Subir arquivo na pasta local → Verificar aparece no Drive → Verificar webhook recebe
4. Verificar Dashboard Maestro mostra a atividade

## 4. Agentes Envolvidos

| # | Agente | Responsabilidade |
|---|--------|------------------|
| 1 | `project-planner` | Este plano ✅ |
| 2 | `backend-specialist` | Tasks 1 e 2 |
| 3 | `frontend-specialist` | Task 3 |
| 4 | `test-engineer` | Task 4 |

## 5. Verificação Final

- [ ] `FOLDER_STRUCTURE` atualizada com estrutura real (24 pastas total)
- [ ] `GOOGLE_DRIVE_ROOT_FOLDER_ID` usado corretamente
- [ ] API `POST /api/clientes` cria pastas automaticamente
- [ ] Script de reconciliação funciona para clientes existentes
- [ ] MaestroSync replica pastas em todos os notebooks
- [ ] Dashboard mostra atividade dos novos clientes

## 6. Impacto Esperado

| Antes | Depois |
|-------|--------|
| Cadastrar cliente = só DB | Cadastrar = DB + Drive + Subpastas |
| 5 clientes sem pasta | 0 clientes sem pasta |
| Criar pastas manualmente | Automático |
| Notebooks dessincronizados | MaestroSync mantém tudo igual |
| CRM sem dados | CRM com fluxo de dados completo |
