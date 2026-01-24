# 🎯 INÍCIO RÁPIDO - 5 Passos para Ativar o Sistema

## ⏱️ Tempo Total: ~30 minutos

---

## 📍 PASSO 1: Migração do Banco (5 min)

### O que fazer:
1. Abra o Supabase SQL Editor
2. Cole o SQL da migração
3. Execute

### Como fazer:
```bash
# 1. Acesse:
https://db.brandaocontador.com.br/project/default/editor

# 2. Copie TODO o conteúdo do arquivo:
MIGRACAO_ATENDIMENTO_COMPLETO.sql

# 3. Cole no editor SQL

# 4. Clique em "Run" (ou Ctrl+Enter)

# 5. Aguarde a mensagem de sucesso
```

### ✅ Como saber se deu certo:
- Nenhum erro vermelho aparece
- Mensagem "Success" ou "Completed"

---

## 📍 PASSO 2: Configurar API do Gemini (3 min)

### O que fazer:
1. Obter chave da API Gemini
2. Adicionar no .env.local

### Como fazer:
```bash
# 1. Acesse:
https://makersuite.google.com/app/apikey

# 2. Clique em "Create API Key"

# 3. Copie a chave (começa com "AIza...")

# 4. Abra o arquivo .env.local

# 5. Adicione no final:
GEMINI_API_KEY=AIzaSy...sua_chave_aqui
```

### ✅ Como saber se deu certo:
- Arquivo .env.local tem a linha GEMINI_API_KEY=...

---

## 📍 PASSO 3: Classificar Atendimentos Antigos (10 min)

### O que fazer:
1. Executar script de classificação
2. Aguardar processar todos

### Como fazer:
```bash
# No terminal (PowerShell):
cd e:\PROJETOS\brandaocontador-site
node classificar_atendimentos_lote.js
```

### ✅ Como saber se deu certo:
- Script mostra "✅ Sucesso: X" no final
- Nenhum erro "❌"

### ⚠️ Se der erro:
- Verificar se GEMINI_API_KEY está no .env.local
- Verificar se a chave é válida
- Tentar novamente

---

## 📍 PASSO 4: Importar Workflow no n8n (10 min)

### O que fazer:
1. Acessar n8n
2. Importar workflow JSON
3. Configurar variáveis

### Como fazer:
```bash
# 1. Acesse:
https://n8n.brandaocontador.com.br

# 2. Clique em "+" (novo workflow)

# 3. Clique nos 3 pontinhos (...) > "Import from File"

# 4. Selecione o arquivo:
workflow_n8n_atendimento.json

# 5. Clique em "Settings" (engrenagem) > "Variables"

# 6. Adicione estas variáveis:
GEMINI_API_KEY=sua_chave_gemini
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_INSTANCE=sua_instancia
EVOLUTION_API_KEY=sua_api_key
NUMERO_EQUIPE=5511999999999

# 7. Clique em "Save"

# 8. Ative o workflow (botão "Active" no topo)
```

### ✅ Como saber se deu certo:
- Workflow aparece na lista
- Status é "Active" (verde)
- Webhook URL é gerado

---

## 📍 PASSO 5: Deploy e Teste (2 min)

### O que fazer:
1. Fazer commit e push
2. Aguardar deploy
3. Testar

### Como fazer:
```bash
# No terminal:
cd e:\PROJETOS\brandaocontador-site
git add .
git commit -m "feat: Sistema de atendimento inteligente com IA"
git push origin main
```

### Aguardar deploy (2-3 min):
- Acesse: https://vercel.com
- Veja o deploy em andamento
- Aguarde ficar "Ready"

### Testar:
```bash
# 1. Acesse:
https://www.brandaocontador.com.br/admin/atendimento

# 2. Verifique se os atendimentos têm:
   - Badge de categoria
   - Badge de prioridade
   - Botão "Classificar"

# 3. Envie uma mensagem de teste no WhatsApp:
   "Oi, preciso de uma certidão negativa"

# 4. Aguarde 5 segundos

# 5. Recarregue a página do CRM

# 6. Verifique se a mensagem apareceu classificada
```

### ✅ Como saber se deu certo:
- Atendimentos antigos têm badges coloridos
- Nova mensagem aparece no CRM
- Nova mensagem está classificada
- Resposta automática foi enviada (se aplicável)

---

## 🎉 PRONTO!

Se todos os 5 passos mostraram ✅, o sistema está funcionando!

---

## 🐛 Problemas Comuns

### "Erro ao classificar com IA"
**Solução**: Verificar se GEMINI_API_KEY está correta no .env.local

### "Workflow não dispara"
**Solução**: Verificar se webhook está ativo e URL está configurada no Evolution API

### "Badges não aparecem no CRM"
**Solução**: 
1. Limpar cache do navegador (Ctrl+Shift+R)
2. Verificar se a migração SQL foi executada
3. Verificar se o script de classificação rodou

### "Resposta automática não é enviada"
**Solução**: Verificar variáveis de ambiente no n8n (EVOLUTION_API_KEY, etc.)

---

## 📊 Próximos Passos

Após tudo funcionar:

1. **Monitorar por 1 semana**
   - Quantos atendimentos foram automáticos?
   - Quantos precisaram de humano?
   - A classificação está correta?

2. **Ajustar conforme necessário**
   - Melhorar prompts da IA
   - Adicionar novas categorias
   - Personalizar respostas automáticas

3. **Expandir funcionalidades**
   - Transcrição de áudio
   - OCR em documentos
   - Dashboard de analytics

---

## 📞 Precisa de Ajuda?

Consulte os arquivos:
- `GUIA_IMPLEMENTACAO_ATENDIMENTO.md` - Guia completo
- `WORKFLOW_N8N_ATENDIMENTO.md` - Detalhes do workflow
- `RESUMO_ATENDIMENTO_INTELIGENTE.md` - Visão geral

---

**Boa sorte! 🚀**
