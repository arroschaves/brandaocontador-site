---
trigger: always
description: Regras para integrações com Supabase, N8N, Google Drive e WhatsApp Evolution API no projeto Brandão Contador.
---

# Regra: Padrões de Integração do Projeto

---

## 🗄️ Supabase

```
Server Components / API Routes → SEMPRE usar lib/supabase/server.ts
Client Components ('use client') → SEMPRE usar lib/supabase/client.ts
Middleware → SEMPRE usar lib/supabase/middleware.ts
```

- **NUNCA** importar o cliente errado (server em client ou vice-versa)
- **SEMPRE** tipar as respostas: `const { data, error } = await supabase.from<Tipo>(...)`
- **SEMPRE** verificar `error` antes de usar `data`
- **SEMPRE** usar schemas explícitos: `core.clientes`, `audit.logs`, `workflow.tarefas`
- **NUNCA** fazer `SELECT *` — sempre especificar colunas necessárias

## 🔄 N8N Workflows

- **NUNCA** hardcodar URLs de webhook — usar variáveis de ambiente `N8N_WEBHOOK_*`
- **SEMPRE** retornar JSON padronizado dos Code nodes:
  ```javascript
  // Formato padrão de retorno em Code nodes N8N
  return [{ json: { success: true, data: resultado, timestamp: new Date().toISOString() } }];
  // Em caso de erro:
  return [{ json: { success: false, error: mensagemErro, code: codigoErro } }];
  ```
- **SEMPRE** testar em staging antes de ativar em produção
- **NUNCA** usar `$json` sem verificar se o campo existe primeiro

## 📁 Google Drive

- Pasta raiz dos clientes: `1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP`
- **SEMPRE** verificar se a pasta existe antes de criar documentos
- **SEMPRE** salvar o `drive_folder_id` no Supabase após criar pasta
- **NUNCA** deletar pastas sem confirmação explícita

## 💬 WhatsApp (Evolution API)

- **SEMPRE** validar formato do número antes de enviar (DDI + DDD + número)
- **SEMPRE** usar templates aprovados para mensagens em massa
- **NUNCA** enviar dados sensíveis (CNPJ, valores) em mensagens automáticas
- **SEMPRE** registrar envios na tabela de audit

## 🤖 Gemini AI (nova integração)

- **SEMPRE** usar `lib/utils/gemini-service.ts` como wrapper centralizador
- **SEMPRE** usar `gemini-3-flash-preview` para operações em volume (XML, classificação)
- **SEMPRE** usar `gemini-3-pro-preview` apenas para análises complexas
- **NUNCA** enviar dados sigilosos de clientes para a API sem anonimização
- **SEMPRE** implementar fallback caso a API falhe
- Variável de ambiente: `GEMINI_API_KEY` (obter em aistudio.google.com/apikey)
