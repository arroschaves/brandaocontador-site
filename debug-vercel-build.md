# Task: Resolver Erro de Build na Vercel e Estabilizar Dependências

## 1. Análise (Discovery)
- **Sintoma:** Erro de build na Vercel "Module not found: Can't resolve '@/components/ui/card'".
- **Conflito:** Conflito de dependências entre React 18 e React 19 reportado pelo npm no build.
- **Observação:** O usuário enviou logs de um commit antigo (`1bb1408`), mas afirma que o erro persiste. É necessário validar o estado atual do repositório remoto e local.

## 2. Planejamento (Task Breakdown)
- [ ] Validar se ainda existem imports de `@/components/ui/` no projeto.
- [ ] Ajustar o `package.json` para resolver conflitos de `peerDependencies` (usar `--force` ou sincronizar versões).
- [ ] Executar build local (`npm run build`) para garantir que o erro de compilação foi resolvido antes do push.
- [ ] Verificar se o `tsconfig.json` possui os aliases corretos.
- [ ] Criar teste de regressão simples para as rotas críticas.

## 3. Solução (Architecture/Design)
- **Roteamento:** Manter Next.js 15.1.5 (versão estável compatível).
- **Design:** Manter o sistema de design brutalista nativo do Brandão Contabilidade, evitando dependências externas como Shadcn UI que não estão configuradas.
- **Dependências:** Fixar as versões no `package.json` para evitar que o `npm install` na Vercel tente baixar pacotes incompatíveis.

## 4. Implementação (Execution)
- Passo 1: Busca exaustiva por imports quebrados.
- Passo 2: Ajuste no `package.json` (Next 15 + React 19 + Lucide atualizada).
- Passo 3: Build local.
- Passo 4: Push final.

## 5. Verificação (Verification)
- Sucesso no comando `npm run build` local.
- Verificação do commit ID na Vercel.
