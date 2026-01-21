# 🚀 Guia de Implementação: Sistema de Atendimento Inteligente

## 📋 Checklist de Implementação

### ✅ Fase 1: Preparação do Banco de Dados (15 min)

1. **Executar Migração SQL**
   ```bash
   # Acesse o SQL Editor do Supabase
   https://db.brandaocontador.com.br/project/default/editor
   
   # Cole e execute o conteúdo de:
   MIGRACAO_ATENDIMENTO_COMPLETO.sql
   ```

2. **Verificar Colunas Criadas**
   ```bash
   node executar_migracao.js
   ```

### ✅ Fase 2: Configurar Chave da API Gemini (5 min)

1. **Obter Chave da API**
   - Acesse: https://makersuite.google.com/app/apikey
   - Crie uma nova API Key
   - Copie a chave

2. **Adicionar ao .env.local**
   ```bash
   # Abra o arquivo .env.local e adicione:
   GEMINI_API_KEY=sua_chave_aqui
   ```

### ✅ Fase 3: Classificar Atendimentos Existentes (30 min)

1. **Executar Script de Classificação em Lote**
   ```bash
   node classificar_atendimentos_lote.js
   ```
   
   **Observação**: Este script processará todos os atendimentos sem classificação.
   - Tempo estimado: ~1 segundo por atendimento
   - Para 20 atendimentos: ~20 segundos
   - A IA classificará automaticamente categoria, prioridade e tipo de atendimento

2. **Verificar Resultados**
   - Acesse: https://www.brandaocontador.com.br/admin/atendimento
   - Verifique se as categorias e prioridades aparecem nos cards

### ✅ Fase 4: Atualizar Frontend (Já Feito! ✅)

O arquivo `app/admin/atendimento/page.tsx` já foi atualizado com:
- ✅ Exibição de categoria e prioridade
- ✅ Badges de tipo de mídia (áudio, imagem, documento, vídeo)
- ✅ Indicador de atendimento automático
- ✅ Exibição de resposta automática
- ✅ Motivo de atendimento humano
- ✅ Confiança da classificação
- ✅ Interface de classificação manual
- ✅ Transcrição de áudio (quando disponível)

### ✅ Fase 5: Configurar Workflow n8n (45 min)

1. **Acessar n8n**
   ```
   URL: https://n8n.brandaocontador.com.br
   ```

2. **Criar Novo Workflow**
   - Nome: "Atendimento WhatsApp Inteligente"
   - Seguir a documentação em: `WORKFLOW_N8N_ATENDIMENTO.md`

3. **Configurar Variáveis de Ambiente no n8n**
   - Settings > Variables
   - Adicionar:
     ```
     GEMINI_API_KEY=sua_chave_gemini
     EVOLUTION_API_URL=https://sua-evolution-api.com
     EVOLUTION_INSTANCE=sua_instancia
     EVOLUTION_API_KEY=sua_api_key
     NUMERO_EQUIPE=5511999999999
     ```

4. **Testar Workflow**
   - Enviar mensagem de teste via WhatsApp
   - Verificar se aparece no CRM
   - Verificar se foi classificado corretamente

### ✅ Fase 6: Deploy do Frontend (10 min)

1. **Commit e Push**
   ```bash
   git add .
   git commit -m "feat: Sistema de atendimento inteligente com IA"
   git push origin main
   ```

2. **Aguardar Deploy Automático no Vercel**
   - O Vercel detectará automaticamente
   - Deploy levará ~2-3 minutos

3. **Verificar em Produção**
   ```
   https://www.brandaocontador.com.br/admin/atendimento
   ```

## 🎯 Testes Recomendados

### Teste 1: Classificação Manual
1. Acesse a página de Atendimentos
2. Passe o mouse sobre um card
3. Clique em "Classificar"
4. Selecione categoria, prioridade e tipo
5. Clique em "Salvar"
6. Verifique se os badges aparecem

### Teste 2: Atendimento Automático (n8n)
1. Envie uma mensagem simples via WhatsApp
   - Exemplo: "Oi, preciso de uma certidão negativa"
2. Verifique se:
   - ✅ Aparece no CRM
   - ✅ Foi classificado como "CERTIDAO"
   - ✅ Tem badge "Automático"
   - ✅ Tem resposta automática gerada
   - ✅ Status é "concluido"

### Teste 3: Atendimento Humano (n8n)
1. Envie uma mensagem complexa via WhatsApp
   - Exemplo: "Preciso fazer alteração contratual e incluir novo sócio"
2. Verifique se:
   - ✅ Aparece no CRM
   - ✅ Foi classificado como "SOCIETARIO"
   - ✅ Prioridade é 2 (Alta)
   - ✅ NÃO tem badge "Automático"
   - ✅ Tem "Motivo de Atendimento Humano"
   - ✅ Status é "pendente"
   - ✅ Equipe recebeu notificação no WhatsApp

### Teste 4: Mídia (Áudio, Imagem, PDF)
1. Envie um áudio via WhatsApp
2. Verifique se:
   - ✅ Aparece badge "audio"
   - ✅ Tem transcrição (se configurado)
   - ✅ Foi classificado corretamente

## 📊 Métricas para Monitorar

Após 1 semana de uso, verifique:

1. **Taxa de Atendimento Automático**
   - Quantos % foram resolvidos automaticamente?
   - Meta: >30%

2. **Precisão da Classificação**
   - Quantos % foram classificados corretamente?
   - Meta: >80%

3. **Tempo Médio de Resposta**
   - Quanto tempo entre receber e responder?
   - Meta: <5 minutos (automático), <2 horas (humano)

4. **Satisfação do Cliente**
   - Feedback sobre respostas automáticas
   - Meta: >70% positivo

## 🐛 Troubleshooting

### Problema: Classificação não aparece no CRM
**Solução**:
1. Verificar se a migração SQL foi executada
2. Verificar se o script de classificação rodou sem erros
3. Limpar cache do navegador (Ctrl+Shift+R)

### Problema: Script de classificação falha
**Solução**:
1. Verificar se GEMINI_API_KEY está no .env.local
2. Verificar se a chave da API é válida
3. Verificar limite de requisições da API

### Problema: Workflow n8n não dispara
**Solução**:
1. Verificar se o webhook está ativo
2. Verificar se a URL do webhook está correta no Evolution API
3. Verificar logs do n8n para erros

### Problema: Resposta automática não é enviada
**Solução**:
1. Verificar variáveis de ambiente no n8n
2. Verificar se EVOLUTION_API_KEY é válida
3. Verificar se a instância está ativa

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs do n8n
2. Verificar console do navegador (F12)
3. Verificar logs do Supabase
4. Verificar este guia de troubleshooting

## 🎉 Próximas Melhorias

Após implementação básica funcionar:

1. **Transcrição de Áudio**
   - Integrar Whisper API
   - Transcrever áudios automaticamente

2. **OCR em Documentos**
   - Extrair texto de PDFs/imagens
   - Classificar baseado no conteúdo

3. **Dashboard de Analytics**
   - Gráficos de atendimentos por categoria
   - Tempo médio de resposta
   - Taxa de resolução automática

4. **Feedback Loop**
   - Botão para marcar classificação como incorreta
   - Retreinar modelo com feedback

5. **Respostas Personalizadas**
   - Templates de resposta por categoria
   - Variáveis dinâmicas (nome do cliente, etc.)

---

**Tempo Total Estimado**: ~2 horas
**Complexidade**: Média
**Impacto**: Alto (automação de 30-50% dos atendimentos)
