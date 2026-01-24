# PLANO DE RECONSTRUÇÃO TOTAL: Brandão Contabilidade CRM

## 1. Visão Geral (Overview)
Reboot completo da arquitetura do CRM. O objetivo é eliminar erros de build para sempre, remover lixo técnico e entregar uma interface ultra-moderna, séria e segura.

## 2. Success Criteria (O que é o Verde?)
- [ ] Build concluído em < 2 min na Vercel (Next 15.1.6).
- [ ] 0 erros de Typescript em todo o projeto.
- [ ] Interface Brutalista Premium e Funcional.
- [ ] PRD lógico detalhando toda a nova infraestrutura.

## 3. Tech Stack 2025
- **Core:** Next.js 15.1.6 (blindado contra CVE-2025-66478).
- **Dados:** Supabase SSR (Auth + Database).
- **Estilo:** Tailwind CSS Nativo (Arquitetura de Tokens).
- **Icons:** Lucide React (Versão atualizada).

## 4. Orquestração de Agentes

### Passo 1: Limpeza & Purificação (Explorer Agent)
- [ ] Identificar e listar todos os arquivos inúteis.
- [ ] Remover dependências não utilizadas no `package.json`.
- [ ] Organizar `public/` e `lib/`.

### Passo 2: Fundação Blindada (Backend Specialist)
- [ ] Reimplementar `middleware.ts` com tipagem forte.
- [ ] Reimplementar `lib/supabase/client.ts` e `server.ts` sem `any`.
- [ ] Validar fluxo de autenticação.

### Passo 3: UI Pro Max (Frontend Specialist)
- [ ] Reconstruir o `Layout.tsx` administrativo (Nível Premium).
- [ ] Reconstruir as páginas de `/admin/clientes` e `/admin/configuracoes`.
- [ ] Implementar micro-animações de carregamento (Skeleton screens).

### Passo 4: Auditoria Final (Security Auditor)
- [ ] Scan de vulnerabilidades.
- [ ] Geração do PRD Final.

## 5. Phase X: Verificação
- [ ] `npm run build` local.
- [ ] Teste de rotas protegidas.
- [ ] Auditoria de cores e contraste.
