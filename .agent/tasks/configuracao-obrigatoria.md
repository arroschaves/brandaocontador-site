# 🔧 CONFIGURAÇÃO OBRIGATÓRIA — Variáveis de Ambiente
> Execute estas ações ANTES de reativar os workflows N8N

---

## ⚡ AÇÃO IMEDIATA: Adicionar ao `.env.local`

Abra o arquivo `.env.local` e adicione as seguintes linhas (se não existirem):

```env
# Pasta raiz CRM no Google Drive
GOOGLE_DRIVE_ROOT_FOLDER_ID=1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP

# Gemini AI — obter em: https://aistudio.google.com/apikey
GEMINI_API_KEY=SUA_CHAVE_AQUI
```

---

## ⚡ AÇÃO IMEDIATA: Adicionar na Vercel (Produção)

1. Acesse: https://vercel.com/dashboard
2. Projeto brandaocontador-site → Settings → Environment Variables
3. Adicionar:
   - `GOOGLE_DRIVE_ROOT_FOLDER_ID` = `1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP`
   - `GEMINI_API_KEY` = sua chave do Google AI Studio

---

## 🛑 ANTES DE REATIVAR OS WORKFLOWS N8N

### Checklist obrigatório:

- [ ] `GOOGLE_DRIVE_ROOT_FOLDER_ID` configurado no `.env.local` e Vercel
- [ ] `GEMINI_API_KEY` configurado no `.env.local` e Vercel
- [ ] **NÃO** executar `MaestroSync.exe` — o exe está desatualizado
- [ ] Usar o workflow N8N corrigido (AutoAutomacao v2) em vez do exe
- [ ] Executar o SQL de diagnóstico para ver estado atual das pastas

### Ordem de reativação dos workflows N8N:

1. **PRIMEIRO:** `Cadastro Cliente - Criação de Pastas e Notificações (Golden Path)` — para novos cadastros
2. **SEGUNDO:** `AutoAutomacao Google Drive - Brandao Contabilidade` (versão corrigida) — para reparar clientes sem pasta
3. **TERCEIRO:** `Maestro Drive Sensor v2` — para monitoramento de arquivos
4. **POR ÚLTIMO:** `Maestro Vision - Cérebro OCR e IA` — processamento de documentos

### Verificação pós-ativação:

Após ativar, aguardar 5 minutos e verificar no Supabase:
```sql
SELECT nome_fantasia, drive_folder_id FROM core.empresas WHERE drive_folder_id IS NULL;
-- Se retornar 0 linhas = tudo OK
```

---

## 📋 O QUE FOI CORRIGIDO (2026-02-25)

| # | Problema | Solução | Arquivo |
|---|---------|---------|---------|
| 1 | MaestroSync.exe criando pastas duplicadas | Parar exe + corrigir AutoAutomacao | `AutoAutomacao...json` |
| 2 | AutoAutomacao usando ID errado da pasta CRM | Corrigido para `1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP` | AutoAutomacao |
| 3 | AutoAutomacao sem verificação de pasta existente | Adicionado nó "Verificar Pasta Existente" | AutoAutomacao |
| 4 | drive-automation.ts sem anti-duplicata | Função `findExistingFolder()` adicionada | `drive-automation.ts` |
| 5 | ai-service.ts usando SDK DEPRECATED | Migrado para `@google/genai` novo | `ai-service.ts` |
| 6 | Modelo `gemini-1.5-flash` DEPRECATED | Migrado para `gemini-3-flash-preview` | `gemini-service.ts` |
| 7 | GEMINI_API_KEY não estava no .env | Documentado e adicionado ao .env.example | `.env.example` |
| 8 | GOOGLE_DRIVE_ROOT_FOLDER_ID não estava no .env | Documentado e adicionado ao .env.example | `.env.example` |
