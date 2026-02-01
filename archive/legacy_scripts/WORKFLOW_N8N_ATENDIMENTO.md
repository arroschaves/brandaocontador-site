# Workflow n8n: Processamento Inteligente de Atendimentos WhatsApp

## 📋 Visão Geral

Este workflow processa mensagens recebidas via WhatsApp, classifica automaticamente usando IA do Google Gemini, e decide se o atendimento será automático ou humano.

## 🔧 Nodes Necessários

### 1. **Webhook** (Receber mensagens)
- **URL**: `https://webhook.brandaocontador.com.br/webhook/atendimento-whatsapp`
- **Método**: POST
- **Autenticação**: Nenhuma (ou API Key se preferir)

### 2. **Set - Extrair Dados**
Extrair informações da mensagem recebida:

```javascript
// Dados básicos
const remoteJid = $json.body.data.key.remoteJid;
const pushName = $json.body.data.pushName;
const fromMe = $json.body.data.key.fromMe;
const messageTimestamp = $json.body.data.messageTimestamp;

// Tipo de mensagem e conteúdo
let tipoMidia = 'texto';
let mensagem = '';
let urlMidia = null;

if ($json.body.data.message.conversation) {
  tipoMidia = 'texto';
  mensagem = $json.body.data.message.conversation;
} else if ($json.body.data.message.audioMessage) {
  tipoMidia = 'audio';
  urlMidia = $json.body.data.message.audioMessage.url;
  mensagem = '[Áudio recebido]';
} else if ($json.body.data.message.imageMessage) {
  tipoMidia = 'imagem';
  urlMidia = $json.body.data.message.imageMessage.url;
  mensagem = $json.body.data.message.imageMessage.caption || '[Imagem recebida]';
} else if ($json.body.data.message.documentMessage) {
  tipoMidia = 'documento';
  urlMidia = $json.body.data.message.documentMessage.url;
  mensagem = $json.body.data.message.documentMessage.fileName || '[Documento recebido]';
} else if ($json.body.data.message.videoMessage) {
  tipoMidia = 'video';
  urlMidia = $json.body.data.message.videoMessage.url;
  mensagem = $json.body.data.message.videoMessage.caption || '[Vídeo recebido]';
}

return {
  remoteJid,
  pushName,
  fromMe,
  messageTimestamp,
  tipoMidia,
  mensagem,
  urlMidia,
  numeroWhatsapp: remoteJid.replace('@s.whatsapp.net', '')
};
```

### 3. **IF - Filtrar Mensagens Próprias**
- **Condição**: `{{ $json.fromMe }}` equals `false`
- **Ação**: Se true (mensagem própria), parar workflow
- **Ação**: Se false (mensagem de cliente), continuar

### 4. **Supabase - Buscar Cliente**
- **Operação**: Select rows
- **Tabela**: `clientes`
- **Filtro**: `telefone` equals `{{ $json.numeroWhatsapp }}`
- **Retornar**: Primeira linha

### 5. **IF - Cliente Existe?**
- **Condição**: `{{ $json.id }}` is not empty
- **True**: Cliente encontrado, pegar ID
- **False**: Cliente não encontrado, usar NULL

### 6. **Set - Preparar para IA**
```javascript
return {
  mensagem: $json.mensagem,
  tipoMidia: $json.tipoMidia,
  clienteId: $json.id || null,
  numeroWhatsapp: $json.numeroWhatsapp,
  pushName: $json.pushName,
  urlMidia: $json.urlMidia
};
```

### 7. **HTTP Request - Classificar com Gemini AI**
- **Método**: POST
- **URL**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={{ $env.GEMINI_API_KEY }}`
- **Headers**: 
  - `Content-Type`: `application/json`
- **Body**:
```json
{
  "contents": [{
    "parts": [{
      "text": "Você é um assistente de classificação de atendimentos contábeis. Analise a mensagem abaixo e retorne APENAS um JSON com:\n\n1. **categoria**: Uma das opções:\n   - CERTIDAO\n   - ALVARA\n   - CARTAO_CNPJ_IE\n   - FOLHA_PAGAMENTO\n   - GUIAS_IMPOSTOS\n   - DOCUMENTOS_FISCAIS\n   - IR_DECLARACOES\n   - SOCIETARIO\n   - OUTROS\n\n2. **prioridade**: 1 (urgente), 2 (alta) ou 3 (normal)\n\n3. **atendimento_automatico**: true (pode responder automaticamente) ou false (precisa humano)\n\n4. **motivo_humano**: Se false, explique por quê\n\n5. **resposta_automatica**: Se true, gere uma resposta educada e profissional\n\n6. **confianca**: 0.00 a 1.00\n\nMensagem (tipo: {{ $json.tipoMidia }}):\n\"{{ $json.mensagem }}\"\n\nRetorne APENAS o JSON."
    }]
  }]
}
```

### 8. **Code - Extrair JSON da Resposta**
```javascript
const resposta = $input.item.json.candidates[0].content.parts[0].text;
const jsonMatch = resposta.match(/\{[\s\S]*\}/);

if (jsonMatch) {
  const classificacao = JSON.parse(jsonMatch[0]);
  return {
    ...items[0].json,
    ...classificacao
  };
}

throw new Error('Resposta da IA não contém JSON válido');
```

### 9. **Supabase - Inserir Atendimento**
- **Operação**: Insert
- **Tabela**: `atendimentos`
- **Campos**:
  - `cliente_id`: `{{ $json.clienteId }}`
  - `numero_whatsapp`: `{{ $json.numeroWhatsapp }}`
  - `pushName`: `{{ $json.pushName }}`
  - `mensagem`: `{{ $json.mensagem }}`
  - `tipo_midia`: `{{ $json.tipoMidia }}`
  - `url_midia`: `{{ $json.urlMidia }}`
  - `categoria_solicitacao`: `{{ $json.categoria }}`
  - `prioridade`: `{{ $json.prioridade }}`
  - `atendimento_automatico`: `{{ $json.atendimento_automatico }}`
  - `resposta_automatica`: `{{ $json.resposta_automatica }}`
  - `motivo_humano`: `{{ $json.motivo_humano }}`
  - `confianca_classificacao`: `{{ $json.confianca }}`
  - `status`: `pendente`

### 10. **IF - Enviar Resposta Automática?**
- **Condição**: `{{ $json.atendimento_automatico }}` equals `true`
- **True**: Enviar resposta automática
- **False**: Notificar equipe

### 11. **HTTP Request - Enviar Resposta WhatsApp** (se automático)
- **Método**: POST
- **URL**: `{{ $env.EVOLUTION_API_URL }}/message/sendText/{{ $env.EVOLUTION_INSTANCE }}`
- **Headers**:
  - `apikey`: `{{ $env.EVOLUTION_API_KEY }}`
  - `Content-Type`: `application/json`
- **Body**:
```json
{
  "number": "{{ $json.numeroWhatsapp }}",
  "text": "{{ $json.resposta_automatica }}\n\n_Mensagem automática. Se precisar de mais ajuda, nossa equipe responderá em breve._"
}
```

### 12. **Supabase - Atualizar Status** (se automático)
- **Operação**: Update
- **Tabela**: `atendimentos`
- **Filtro**: `id` equals `{{ $json.id }}`
- **Campos**:
  - `status`: `concluido`

### 13. **HTTP Request - Notificar Equipe** (se humano)
- **Método**: POST
- **URL**: `{{ $env.EVOLUTION_API_URL }}/message/sendText/{{ $env.EVOLUTION_INSTANCE }}`
- **Headers**:
  - `apikey`: `{{ $env.EVOLUTION_API_KEY }}`
  - `Content-Type`: `application/json`
- **Body**:
```json
{
  "number": "{{ $env.NUMERO_EQUIPE }}",
  "text": "🔔 *Novo Atendimento Requer Atenção*\n\n*Cliente:* {{ $json.pushName }}\n*Telefone:* {{ $json.numeroWhatsapp }}\n*Categoria:* {{ $json.categoria }}\n*Prioridade:* {{ $json.prioridade === 1 ? '🔴 URGENTE' : $json.prioridade === 2 ? '🟠 ALTA' : '🟢 NORMAL' }}\n*Motivo:* {{ $json.motivo_humano }}\n\n*Mensagem:*\n{{ $json.mensagem }}"
}
```

## 🔐 Variáveis de Ambiente Necessárias

Adicione estas variáveis no n8n (Settings > Variables):

```
GEMINI_API_KEY=sua_chave_gemini_aqui
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_INSTANCE=sua_instancia
EVOLUTION_API_KEY=sua_api_key
NUMERO_EQUIPE=5511999999999
```

## 🎯 Fluxo Completo

```
Webhook → Extrair Dados → Filtrar Próprias → Buscar Cliente → Verificar Cliente
    ↓
Preparar IA → Classificar Gemini → Extrair JSON → Inserir Supabase
    ↓
Atendimento Automático?
    ├─ SIM → Enviar Resposta → Marcar Concluído
    └─ NÃO → Notificar Equipe
```

## 📊 Métricas e Monitoramento

O workflow automaticamente registra:
- ✅ Categoria da solicitação
- ✅ Prioridade (1-3)
- ✅ Tipo de mídia recebida
- ✅ Confiança da classificação
- ✅ Se foi atendido automaticamente
- ✅ Tempo de resposta

## 🚀 Próximos Passos

1. **Transcrição de Áudio**: Adicionar node para transcrever áudios usando Whisper API
2. **OCR em Imagens**: Extrair texto de documentos enviados como imagem
3. **Análise de Sentimento**: Detectar urgência/frustração no tom da mensagem
4. **Aprendizado Contínuo**: Feedback loop para melhorar classificações

## 📝 Notas Importantes

- O workflow processa TODAS as mensagens recebidas
- Mensagens próprias (fromMe=true) são ignoradas
- Áudios precisam de transcrição para classificação precisa
- Documentos/imagens podem precisar de OCR
- A IA decide automaticamente se pode responder ou precisa de humano
