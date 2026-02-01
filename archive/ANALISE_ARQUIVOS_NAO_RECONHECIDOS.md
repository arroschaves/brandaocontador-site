# Análise de Arquivos Não Reconhecidos

## 📊 Resumo do Processamento

**Total de arquivos:** 2043
- ✅ **Reconhecidos:** ~1692 (83%)
- ⚠️ **OUTROS:** 351 (17%)
- ❌ **Não vinculados:** ~120 arquivos

---

## 🔍 Tipos de Documentos Não Reconhecidos

### 1. Documentos da Junta Comercial
```
- 2ª ALTERAÇÃO CORRÊA PARTICIPAÇÕES LTDA.docx
- REDESIM.pdf
- Registro Digital.pdf
- PROCESSO_*.pdf
- FCN.pdf (Ficha Cadastral Nacional)
- impressaoDae.pdf
```

**Solução:** Adicionar padrões de reconhecimento para:
- `ALTERACAO`, `ALTERAÇÃO` → JUNTA_COMERCIAL
- `REDESIM` → JUNTA_COMERCIAL
- `FCN` → JUNTA_COMERCIAL
- `PROCESSO_` → JUNTA_COMERCIAL

### 2. Documentos Pessoais
```
- CNH.pdf
- RG.pdf
- ACORDO.pdf
- DIVORCIO.pdf
- DADOS CADASTRAIS.pdf
```

**Solução:** Criar categoria `DOCUMENTOS_PESSOAIS`

### 3. Certidões e Comprovantes
```
- Certidao Antecendentes.pdf
- formCertidaoNegativa*.pdf
- Comprovante*.pdf
```

**Solução:** Melhorar regex para certidões

### 4. Projetos e Alvarás
```
- Projeto Bombeiro.pdf
- ART PROJETO SOM.pdf
- Alvara*.pdf
- Laudo*.pdf
```

**Solução:** Criar categoria `PROJETOS_TECNICOS`

---

## 🎯 Clientes Não Reconhecidos

### Problema: Nomes parciais ou variações

**Exemplos:**
- `CORRÊA PARTICIPAÇÕES` → Não encontrou cliente
- `AGRO TESHA` → Não encontrou cliente
- `BR DIGITAL` → Não encontrou cliente

**Solução:** Melhorar fuzzy matching:
1. Remover acentos
2. Ignorar "LTDA", "EIRELI", etc
3. Buscar por palavras-chave

---

## 📋 Plano de Correção

### Fase 1: Melhorar Classificação de Documentos ✅
- [ ] Adicionar novos padrões no `brandao_core.py`
- [ ] Criar categoria `DOCUMENTOS_PESSOAIS`
- [ ] Criar categoria `PROJETOS_TECNICOS`
- [ ] Melhorar regex de certidões

### Fase 2: Melhorar Matching de Clientes
- [ ] Implementar fuzzy matching (fuzzywuzzy)
- [ ] Normalizar nomes (remover acentos, LTDA, etc)
- [ ] Criar dicionário de apelidos/variações

### Fase 3: Reclassificar Arquivos "OUTROS"
- [ ] Rodar script de reclassificação
- [ ] Mover arquivos para pastas corretas

---

## 🚀 Próximos Passos

1. **Agora:** Corrigir `brandao_core.py` com novos padrões
2. **Depois:** Rodar novamente para reclassificar
3. **Validar:** Verificar que "OUTROS" caiu para <5%

---

## 📊 Meta de Sucesso

- ✅ **Reconhecimento:** >95% (atualmente 83%)
- ✅ **OUTROS:** <5% (atualmente 17%)
- ✅ **Vinculação:** >90% de arquivos vinculados a clientes
