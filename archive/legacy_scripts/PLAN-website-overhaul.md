# PLANO DE RECONSTRUÇÃO: Brandão Contabilidade CRM

## 1. Visão Geral (Overview)
Reconstrução estrutural do CRM para garantir estabilidade absoluta, segurança nível bancário e uma interface Premium que transmita autoridade e seriedade. O projeto será consolidado no **Next.js 15.1.5** (versão estável) e **React 19**.

##  success-criteria (Critérios de Sucesso)
- [ ] **Build Verde na Vercel:** 0 erros de compilação ou Typescript.
- [ ] **Segurança Blindada:** Auditoria de RLS (Row Level Security) no Supabase aplicada.
- [ ] **Performance Ultra:** Pontuação > 90 no Lighthouse (Mobile/Desktop).
- [ ] **UI Premium:** Design Brutalista Elevado (Sério, Dinâmico, Funcional) sem dependências fantasmas.
- [ ] **Next.js 15 Patterns:** Params e SearchParams tratados estritamente como Promises.

## 3. Tech Stack (Arquitetura)
- **Framework:** Next.js 15.1.5 (App Router).
- **Linguagem:** TypeScript (Strict Mode).
- **Backend/Auth:** Supabase SSR (padrão 2025).
- **UI/Styles:** Tailwind CSS (Custom Design System + Lucide Icons).
- **Verificação:** Playwright + Python Security Scripts.

## 4. Divisão de Tarefas por Agentes

### Fase A: Fundação & Segurança (P0)
**Agente:** `backend-specialist` + `security-auditor`
1. **Fix Supabase SSR:** Corrigir `lib/supabase/server.ts` e `middleware.ts` com tipagem 100% correta.
2. **Auth Flow:** Revisar fluxo de login/logout para evitar loops e garantir persistência.
3. **Database Security:** Revisar RLS nas tabelas `clientes` e `status_obrigacoes`.

### Fase B: UI/UX & Dynamic Experience (P1)
**Agente:** `frontend-specialist`
1. **Clean Code UI:** Remover qualquer resquício de bibliotecas não instaladas.
2. **Overhaul Visual:** Implementar a estética "Séria e Funcional" (Paleta: Obsidian, Amber Electric, Slate).
3. **Componentização:** Criar base de botões e cards brutais nativamente em Tailwind.
4. **Páginas Dinâmicas:** Reconstruir `admin/clientes/[id]` e `admin/configuracoes`.

### Fase C: Verificação & Polish (P2)
**Agente:** `test-engineer` + `performance-optimizer`
1. **Build Test:** Executar `npm run build` local.
2. **UX Audit:** Rodar script de auditoria de interface.
3. **Lighthouse:** Garantir Core Web Vitals no pico.

## 5. Phase X: Checklist de Entrega Final
- [ ] Lint & Type Check: ✅
- [ ] Security Scan: ✅
- [ ] Vercel Build Success: ✅
- [ ] Mobile Responsiveness: ✅
