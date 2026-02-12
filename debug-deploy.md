# 🔍 Debug: Erros de Deploy e Conexão Supabase

## 1. Sintoma
- **400 Bad Request** em chamadas para `/atendimentos`.
- **Invalid Connection** no WebSocket (Realtime).
- **Data fora de alcance:** `date field value out of range: 2026-02-31` na criação de clientes.

## 2. Diagnóstico das Credenciais
As chaves do Supabase no `.env.local` e no deploy são os valores padrão do Docker (demo), o que causa falha de autenticação na instância real.

- **URL Correta:** `https://escritoriobrandao-supabase.3ow2vi.easypanel.host`
- **Chave Correta:** [Fornecida pelo usuário]

## 3. Investigação da Data Inválida (2026-02-31)
- O erro ocorre no insert do Postgres.
- Fevereiro de 2026 tem 28 dias.
- Suspeita: Algum cálculo dinâmico de `vencimento` ou `competencia` está assumindo "dia 31" sem validar o mês.

## 4. Plano de Ação
- [ ] Atualizar `.env.local` com as chaves reais.
- [ ] Corrigir `app/components/WhatsAppRadar.tsx` para tratar erros de conexão.
- [ ] Localizar e corrigir a geração da data `2026-02-31`.
