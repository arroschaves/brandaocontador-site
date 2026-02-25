# 🚨 REVISÃO GERAL — Brandão Contador CRM
> Data: 2026-02-25 | Status: EM EXECUÇÃO

---

## 🔴 BUGS CRÍTICOS IDENTIFICADOS

### BUG #1 — MaestroSync.exe criando pastas duplicadas no Drive
**Causa raiz:** O `AutoAutomacao Google Drive` usa pasta ID `1qYZ1pLbgsb7SI-AOKYjAUP_oxY32ATj9` (ID ANTIGO/ERRADO)
O ID correto é `1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP`.
Além disso, o workflow **NÃO verifica se a pasta já existe** antes de criar.
O `MaestroSync.exe` era executado repetidamente criando pastas duplicadas.
**Solução:** Parar MaestroSync.exe + corrigir ID + adicionar verificação de duplicata no N8N.

### BUG #2 — ai-service.ts usa SDK DEPRECATED
**Causa raiz:** `@google/generative-ai` e `gemini-1.5-flash` são versões legadas e descontinuadas.
**Solução:** Migrar para `@google/genai` + `gemini-3-flash-preview`.

### BUG #3 — AutoAutomacao usa ID de pasta errada
O node "Create folder" aponta para `1qYZ1pLbgsb7SI-AOKYjAUP_oxY32ATj9` (ERRADO).
Deve ser `1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP`.

---

## ✅ PLANO DE EXECUÇÃO

### FASE 1 — STOP (Imediato) ✅ DONE
- [x] Todos os workflows N8N despublicados pelo usuário
- [x] MaestroSync.exe PARADO (não rodar mais)

### FASE 2 — CORREÇÕES DE CÓDIGO
- [ ] 1. Migrar ai-service.ts → SDK novo Gemini (@google/genai)
- [ ] 2. Criar gemini-service.ts centralizado
- [ ] 3. Criar script de diagnóstico de pastas duplicadas no Drive
- [ ] 4. Corrigir drive-automation.ts (verificação dupla de pasta existente)

### FASE 3 — CORREÇÕES N8N (JSONs)
- [ ] 5. Corrigir AutoAutomacao ID pasta + adicionar verificação existência
- [ ] 6. Verificar Golden Path (drive_folder_id está OK - já foi corrigido)
- [ ] 7. Atualizar Maestro Drive Sensor (filtros corretos)

### FASE 4 — INSTALAÇÃO RECOMENDAÇÕES
- [ ] 8. Instalar @google/genai no projeto
- [ ] 9. Configurar variável GEMINI_API_KEY

### FASE 5 — LIMPEZA E VERIFICAÇÃO FINAL
- [ ] 10. Script SQL para identificar clientes com drive_folder_id duplicado
- [ ] 11. Revisar vercel.json (cron)
- [ ] 12. Teste final integrado
