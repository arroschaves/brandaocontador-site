# Task: Segurança Elite - Fase 2 (Gestão de Equipe & LGPD)

Implementação de controle de acesso granular (RBAC), fluxos de conformidade LGPD para encerramento de contratos e painel de auditoria para administração.

## 📌 Checklist de Implementação

- [ ] **1. Infraestrutura de Roles (RBAC)**
    - [ ] Criar/Atualizar tabela de perfis de usuário no Supabase (`perfil_usuario`) com campo `role`.
    - [ ] Implementar Middleware de proteção de rotas API baseado em Roles.
    - [ ] Ajustar UI do Hub do Cliente para esconder ações críticas de usuários não-admin.

- [ ] **2. Fluxo de Offboarding (LGPD)**
    - [ ] Criar endpoint `POST /api/clientes/offboarding` para limpeza de dados sensíveis.
    - [ ] Implementar trigger de log de "Encerramento de Contrato".
    - [ ] Criar UI de confirmação de offboarding com checkbox de conformidade.

- [ ] **3. Painel Master de Auditoria**
    - [ ] Criar página `/admin/auditoria` com filtros por data, usuário e cliente.
    - [ ] Implementar visualização detalhada de "Acessos Críticos" (Vault).
    - [ ] Adicionar exportação básica de logs (CSV) para fins de compliance.

## 🛠️ Arquivos Afetados
- `next.config.js` (Configuração de segurança)
- `middleware.ts` (Proteção de rotas)
- `app/admin/auditoria/page.tsx` (Nova página)
- `app/api/clientes/offboarding/route.ts` (Nova API)
- `lib/utils/audit.ts` (Expansão de logs)

## 🎯 Critérios de Aceite
1. Um usuário com role 'visualizador' não consegue ver senhas nem excluir arquivos.
2. Ao encerrar um contrato, o certificado digital é removido permanentemente do Vault.
3. Todas as ações de visualização de senha são registradas e visíveis no novo Painel de Auditoria.
