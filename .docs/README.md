# 📚 Documentação — Brandão Contabilidade (brandaocontador-site)

> Central de documentação do site institucional. Todo documento novo deve ser salvo nesta pasta a partir de agora.

## Índice de Documentos

| Documento | Descrição |
|---|---|
| [PRD.md](./PRD.md) | **Product Requirements Document** — visão de produto, público, funcionalidades, requisitos e critérios de aceite |
| [ANALISE-SITE.md](./ANALISE-SITE.md) | Análise completa do site: o que temos, o que está quebrado, causas e como corrigir |
| [ARQUITETURA.md](./ARQUITETURA.md) | Arquitetura técnica: stack, fluxo de dados, APIs, variáveis de ambiente, deploy |
| [CHANGELOG.md](./CHANGELOG.md) | Registro de todas as mudanças (histórico de versões) |
| [SEGURANCA.md](./SEGURANCA.md) | Postura de segurança, headers, credenciais, rotação de secrets |
| [ROADMAP.md](./ROADMAP.md) | Backlog de melhorias futuras priorizado |

> 🧠 **Memória do projeto:** o histórico/contexto entre sessões fica em `.opencode/memory/MEMORY.md` (snapshot vivo) e `.opencode/memory/sessions/` (histórico por sessão). É a fonte de verdade do que está sendo feito.

## Stack Atual (resumo)

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
- **Estilo:** Tailwind CSS 3.4 (design system próprio, dark mode via classe)
- **Deploy:** Vercel (Projeto: `brandaocontador-site`)
- **Repositório:** [github.com/arroschaves/brandaocontador-site](https://github.com/arroschaves/brandaocontador-site)
- **Domínio:** brandaocontador.com.br → www.brandaocontador.com.br (Cloudflare)
- **APIs externas:** Banco Central (PTAX + SGS), BrasilAPI, AwesomeAPI, B3 (planilhas públicas), RSS de notícias (G1, CFC, Receita Federal, eSocial, SEFAZ MS)

## Como rodar localmente

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # build de produção
npm run type-check   # validação TypeScript
```

## Como deployar

1. Commit + push para `main` no GitHub
2. Vercel detecta e faz o deploy automático
3. Verificar em https://www.brandaocontador.com.br

---

_Última atualização: 2026-09-01_
