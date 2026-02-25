---
trigger: always
description: Regras obrigatórias para proteção de dados sensíveis de clientes (LGPD) no projeto Brandão Contador.
---

# Regra: Proteção de Dados Sensíveis & LGPD

> Aplicável a TODOS os agentes e skills neste projeto.
> Dados contábeis/fiscais são classificados como **SENSÍVEIS** pela LGPD.

---

## 🔴 PROIBIDO (Nunca fazer)

- **NUNCA** logar CNPJ, CPF, dados bancários, receita bruta em `console.log`
- **NUNCA** expor dados de clientes em mensagens de erro para o frontend
- **NUNCA** commitar arquivos com dados reais de clientes
- **NUNCA** fazer query sem verificar autenticação do usuário primeiro
- **NUNCA** retornar todos os campos do cliente — usar SELECT explícito

## ✅ OBRIGATÓRIO (Sempre fazer)

- **SEMPRE** sanitizar/validar CNPJ e CPF antes de salvar no banco
- **SEMPRE** usar RLS (Row Level Security) — verificar em todas as tabelas
- **SEMPRE** usar `lib/utils/security.ts` para sanitização de inputs
- **SEMPRE** verificar role do usuário via `lib/utils/rbac.ts` antes de operações sensíveis
- **SEMPRE** registrar operações críticas via `lib/utils/audit.ts`
- **SEMPRE** mascarar dados sensíveis em logs: `***XXX***`

## 🛡️ Campos Protegidos

```typescript
// Estes campos NUNCA devem aparecer em logs ou respostas públicas:
const CAMPO_SENSIVEIS = [
  'cnpj', 'cpf', 'capital_social', 'faturamento',
  'senha', 'token', 'chave_api', 'conta_bancaria',
  'regime_tributario', 'divida_fiscal'
];
```

## 📋 Checklist LGPD (validar antes de qualquer feature nova)

- [ ] A feature acessa dados pessoais? → Exige autenticação
- [ ] Os dados são armazenados? → Exige RLS e auditoria
- [ ] Há compartilhamento com terceiros? → Exige consentimento explícito
- [ ] Existem logs da operação? → Verificar se não expõem dados sensíveis
