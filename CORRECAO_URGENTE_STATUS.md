# 🔧 CORREÇÃO URGENTE: Botão "Concluir" Não Funciona

## 🔴 **Problema Identificado**

A tabela `atendimentos` tem uma constraint (`chk_atendimentos_status`) que **APENAS aceita o status "ABERTO"**.

Por isso, quando você clica em "Concluir", o sistema tenta mudar para "CONCLUIDO" mas o banco rejeita.

---

## ✅ **Solução (2 minutos)**

### Passo 1: Execute o SQL de Correção

1. Acesse o Supabase SQL Editor:
   ```
   https://db.brandaocontador.com.br/project/default/editor
   ```

2. Cole TODO o conteúdo do arquivo:
   ```
   CORRIGIR_CONSTRAINT_STATUS.sql
   ```

3. Clique em "Run" (ou Ctrl+Enter)

4. Aguarde a mensagem de sucesso

---

### Passo 2: Teste Novamente

1. Recarregue a página do CRM (Ctrl+Shift+R)

2. Clique em "Concluir" em qualquer atendimento

3. Deve funcionar agora! ✅

---

## 📊 **Status Aceitos Após a Correção**

- ✅ `ABERTO` - Atendimento novo
- ✅ `EM_ATENDIMENTO` - Em andamento
- ✅ `CONCLUIDO` - Finalizado
- ✅ `pendente` - Aguardando (formato alternativo)
- ✅ `em_atendimento` - Em andamento (formato alternativo)
- ✅ `concluido` - Finalizado (formato alternativo)

---

## 🎯 **Resultado Esperado**

Após executar o SQL:
- ✅ Botão "Atender" funcionará (muda para EM_ATENDIMENTO)
- ✅ Botão "Concluir" funcionará (muda para CONCLUIDO)
- ✅ Filtros de status funcionarão corretamente

---

**Tempo Total**: 2 minutos
**Complexidade**: Baixa
**Impacto**: Alto (resolve o problema completamente)
