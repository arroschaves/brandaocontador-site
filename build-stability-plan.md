# Plano: Estabilização do Build e Deploy (Supabase CI/CD)

## Visão Geral
O projeto está enfrentando falhas no GitHub Actions durante o passo `npm run build`. O erro principal é causado pelo Next.js tentando pré-renderizar páginas que dependem do Supabase em um ambiente (CI) onde as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` não estão disponíveis ou estão vazias, resultando em crashes no build.

## Objetivo
Garantir que o build passe no GitHub Actions mesmo sem as variáveis de ambiente completas, protegendo as chamadas ao Supabase durante o prerender e forçando rotas dinâmicas onde necessário.

## Agentes Envolvidos
- `orchestrator`: Coordenação global.
- `project-planner`: Manutenção deste plano.
- `debugger`: Investigação da causa raiz dos crashes no build.
- `frontend-specialist`: Ajuste de componentes e páginas para compatibilidade com build-time.
- `devops-engineer`: Verificação do workflow do GitHub Actions.

## Pilha Técnica
- Next.js 15 (App Router)
- Supabase SSR
- GitHub Actions

## Tarefas

### Fase 1: Análise e Diagnóstico
- [x] Identificar falha no job `Next.js Build Check`.
- [ ] Mapear todas as páginas que utilizam Supabase e não estão marcadas como `force-dynamic`.
- [ ] Verificar se há componentes compartilhados fazendo chamadas ao Supabase no nível do módulo.

### Fase 2: Implementação de Proteções (Hotfixes)
- [x] Implementar Safe Proxy no `lib/supabase/client.ts`.
- [x] Implementar proteção no `lib/supabase/maestro-server.ts`.
- [x] Marcar `/admin/maestro` e `/admin/clientes` como `force-dynamic`.
- [ ] Aplicar `force-dynamic` em TODAS as páginas administrativas remanescentes.
- [ ] Corrigir qualquer componente que ainda instancie o cliente fora do ciclo de vida do componente ou de um `useEffect`/`useCallback`.

### Fase 3: Verificação e Validação
- [ ] Adicionar logs detalhados no processo de build para identificar qual página exatamente está falhando.
- [ ] Simular build local sem environment variables para reproduzir o erro.
- [ ] Puchar as correções para o GitHub e monitorar o pipeline.

## Fase X: Checkpoint de Saúde
- [ ] `npm run build` passa localmente sem `.env.local`.
- [ ] GitHub Actions retorna sucesso.
- [ ] Vercel deploy completa com sucesso.
