# 🔧 Atualização do Workflow n8n Existente

## ✅ O que você JÁ TEM funcionando:
- Webhook recebendo mensagens
- Extração de dados básicos
- Classificação com IA (OpenAI)
- Busca de cliente no Supabase
- Criação de atendimento
- Envio de resposta automática

## 🆕 O que precisa ADICIONAR:

### 1. **Node "Extrair Dados" - ATUALIZAR**

Adicione mais campos para capturar mídia:

```javascript
// No node "Extrair Dados", adicione estes campos:

{
  "name": "tipoMidia",
  "value": "={{ $json.body.data.message.conversation ? 'texto' : $json.body.data.message.audioMessage ? 'audio' : $json.body.data.message.imageMessage ? 'imagem' : $json.body.data.message.documentMessage ? 'documento' : $json.body.data.message.videoMessage ? 'video' : 'texto' }}"
},
{
  "name": "urlMidia",
  "value": "={{ $json.body.data.message.audioMessage?.url || $json.body.data.message.imageMessage?.url || $json.body.data.message.documentMessage?.url || $json.body.data.message.videoMessage?.url || null }}"
}
```

### 2. **Node "AI Agent" - ATUALIZAR PROMPT**

Atualize o System Message para retornar mais informações:

```
# OBJETIVO
Você é um classificador profissional de atendimentos contábeis.
Analise a mensagem e retorne UM JSON com:

1. **categoria_solicitacao**: Uma das opções:
   - CERTIDAO_NEGATIVA
   - CERTIDAO_JUCEMS
   - ALVARA
   - DOCUMENTOS_FISCAIS
   - IR_DECLARACOES
   - FOLHA_PAGAMENTO
   - HOLERITE
   - GUIAS_IMPOSTOS
   - SIMPLES_NACIONAL_DAS
   - DARF
   - FGTS
   - INSS
   - SOCIETARIO
   - CARTAO_CNPJ
   - CARTAO_IE
   - OUTROS_SERVICOS_CONTABEIS
   - CONVERSA (para saudações/conversas sem pedido)

2. **prioridade**: CRITICA, ALTA ou NORMAL
   - CRITICA: Prazo hoje, multa, bloqueio, urgência
   - ALTA: Prazo próximo, impacto relevante
   - NORMAL: Rotina contábil

3. **enviar_resposta**: true ou false
   - true: Pode responder automaticamente
   - false: Precisa de atendimento humano

4. **texto_resposta**: Se enviar_resposta = true, gere uma resposta educada
   - Use EXATAMENTE: "A sua solicitação será analisada e assim que possível já retornamos com as informações e ou documentos solicitados."

5. **motivo_humano**: Se enviar_resposta = false, explique por quê

6. **confianca**: 0.00 a 1.00 (confiança na classificação)

IMPORTANTE: Se for áudio, imagem, documento ou vídeo, sempre marque enviar_resposta = false e motivo_humano = "Mídia recebida, requer análise humana"

Retorne APENAS o JSON, sem markdown.
```

### 3. **Node "Criar Atendimento" - ADICIONAR CAMPOS**

Adicione estes campos no node "Criar Atendimento":

```javascript
{
  "fieldId": "tipo_midia",
  "fieldValue": "={{ $('Extrair Dados').item.json.tipoMidia }}"
},
{
  "fieldId": "url_midia",
  "fieldValue": "={{ $('Extrair Dados').item.json.urlMidia }}"
},
{
  "fieldId": "atendimento_automatico",
  "fieldValue": "={{ $('Code in JavaScript').item.json.enviar_resposta }}"
},
{
  "fieldId": "resposta_automatica",
  "fieldValue": "={{ $('Code in JavaScript').item.json.texto_resposta }}"
},
{
  "fieldId": "motivo_humano",
  "fieldValue": "={{ $('Code in JavaScript').item.json.motivo_humano }}"
},
{
  "fieldId": "confianca_classificacao",
  "fieldValue": "={{ $('Code in JavaScript').item.json.confianca }}"
}
```

### 4. **NOVO Node: "Transcrever Áudio" (OPCIONAL - Futuro)**

Se quiser transcrever áudios automaticamente:

```javascript
// Node HTTP Request para Whisper API
{
  "method": "POST",
  "url": "https://api.openai.com/v1/audio/transcriptions",
  "authentication": "predefinedCredentialType",
  "nodeCredentialType": "openAiApi",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      {
        "name": "Content-Type",
        "value": "multipart/form-data"
      }
    ]
  },
  "sendBody": true,
  "bodyParameters": {
    "parameters": [
      {
        "name": "file",
        "value": "={{ $('Extrair Dados').item.json.urlMidia }}"
      },
      {
        "name": "model",
        "value": "whisper-1"
      }
    ]
  }
}
```

## 📋 **Passo a Passo para Atualizar**

### Passo 1: Execute a Migração SQL Corrigida
```sql
-- Cole no Supabase SQL Editor:
-- Arquivo: MIGRACAO_ATENDIMENTO_CORRIGIDA.sql
```

### Passo 2: Atualize o Node "Extrair Dados"
1. Abra o workflow no n8n
2. Clique no node "Extrair Dados"
3. Adicione os 2 novos campos (tipoMidia, urlMidia)
4. Salve

### Passo 3: Atualize o Node "AI Agent"
1. Clique no node "AI Agent"
2. Vá em "Options" > "System Message"
3. Cole o novo prompt acima
4. Salve

### Passo 4: Atualize o Node "Criar Atendimento"
1. Clique no node "Criar Atendimento"
2. Adicione os 6 novos campos
3. Salve

### Passo 5: Teste
1. Envie uma mensagem de texto: "Preciso de uma certidão negativa"
2. Envie um áudio qualquer
3. Verifique no CRM se aparece:
   - Badge de tipo de mídia
   - Categoria
   - Prioridade
   - Resposta automática (se aplicável)

## 🎯 **Resultado Esperado**

Após as atualizações:
- ✅ Mensagens de texto: Classificadas e respondidas automaticamente
- ✅ Áudios: Armazenados, marcados como "requer humano"
- ✅ Imagens/PDFs: Armazenados, marcados como "requer humano"
- ✅ Vídeos: Armazenados, marcados como "requer humano"
- ✅ Todas as informações visíveis no CRM

## ⚠️ **Importante**

O seu workflow atual usa:
- **OpenAI** para classificação (não Gemini)
- **Prioridade como TEXT** (CRITICA, ALTA, NORMAL)
- **Categoria como TEXT** (não ENUM)

A migração corrigida está 100% compatível com isso!
