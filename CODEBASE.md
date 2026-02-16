# CODEBASE.md — Mapa de Dependências do Projeto

> **Última atualização:** 2026-02-16
> **Propósito:** Documento de referência para entender as dependências entre arquivos.
> Consulte ANTES de modificar qualquer arquivo.

---

## 📂 Módulos Principais

### 1. Supabase (Core Database Layer)

```
lib/supabase.ts                      ← Cliente Supabase principal
lib/supabase/client.ts               ← Cliente para uso no browser (use client)
lib/supabase/server.ts               ← Cliente para Server Components / API Routes
lib/supabase/middleware.ts            ← Cliente para Middleware (auth)
middleware.ts                         ← Middleware Next.js (usa lib/supabase/middleware.ts)
```

**Dependência crítica:** Qualquer mudança em `lib/supabase.ts` afeta TODO o projeto.

| Arquivo alterado | Verificar também |
|-----------------|-----------------|
| `lib/supabase.ts` | Todos os `page.tsx` e `route.ts` que importam supabase |
| `lib/supabase/server.ts` | API routes, Server Components |
| `lib/supabase/client.ts` | Componentes `use client` |
| `middleware.ts` | Rotas protegidas, auth flow |

---

### 2. Layouts (Hierarquia)

```
app/layout.tsx                       ← Root layout (HTML, body, providers)
  ├── app/admin/layout.tsx           ← Admin layout (sidebar, header, auth guard)
  ├── app/agronegocio/layout.tsx     ← Agronegócio layout
  ├── app/contato/layout.tsx         ← Contato layout
  └── app/noticias-contabeis/layout.tsx ← Notícias layout
```

**Regra:** Mudanças no `app/layout.tsx` afetam TODAS as páginas.

---

### 3. Páginas Admin (CRM)

```
app/admin/page.tsx                   ← Dashboard principal
app/admin/clientes/page.tsx          ← Lista de clientes
app/admin/clientes/[id]/page.tsx     ← Hub do cliente (detalhes)
app/admin/maestro/page.tsx           ← Maestro Sync
app/admin/automacao/page.tsx         ← Automações N8N
app/admin/auditoria/page.tsx         ← Auditoria fiscal
app/admin/calendario/page.tsx        ← Calendário
app/admin/cronograma/page.tsx        ← Cronograma
app/admin/configuracoes/page.tsx     ← Configurações
app/admin/equipe/page.tsx            ← Equipe
app/admin/vencimentos/page.tsx       ← Vencimentos
app/admin/master/page.tsx            ← Painel master
app/admin/pedidos/page.tsx           ← Pedidos
app/admin/atendimento/page.tsx       ← Atendimento
```

**Todas dependem de:** `app/admin/layout.tsx`, `lib/supabase/server.ts`, `middleware.ts`

---

### 4. Páginas Públicas (Site Institucional)

```
app/page.tsx                         ← Home page
app/servicos/page.tsx                ← Serviços
app/contato/page.tsx                 ← Contato
app/agronegocio/page.tsx             ← Agronegócio
app/reforma-tributaria/page.tsx      ← Reforma Tributária 2026
app/noticias-contabeis/page.tsx      ← Blog de notícias
app/links-uteis/page.tsx             ← Links úteis
app/onboarding/page.tsx              ← Onboarding novos clientes
```

---

### 5. Utilitários (lib/)

| Arquivo | Função | Usado por |
|---------|--------|-----------|
| `lib/utils/format.ts` | Formatação de CNPJ, CPF, datas, moeda | Quase todas as páginas |
| `lib/utils/rbac.ts` | Role-Based Access Control | Admin pages, middleware |
| `lib/utils/security.ts` | Sanitização, validação | API Routes |
| `lib/utils/audit.ts` | Activity logging | Ações no CRM |
| `lib/utils/drive-automation.ts` | Google Drive | Maestro, clientes |
| `lib/utils/evolution-api.ts` | WhatsApp API | Automações, atendimento |
| `lib/utils/email-service.ts` | Email | Notificações |
| `lib/utils/ai-service.ts` | IA/OpenAI | Classificação fiscal |
| `lib/utils/accounting-intelligence.ts` | Inteligência contábil | Auditoria |
| `lib/vault.ts` | Gerenciamento de segredos | Configurações |
| `lib/services/enrichment-service.ts` | Enriquecimento de dados | Cadastro de clientes |

---

### 6. Scripts de Automação (scripts/)

```
scripts/importador_fiscal.js         ← Importação de XMLs/SPEDs
scripts/                             ← Outros scripts auxiliares
```

---

### 7. Configuração

| Arquivo | Afeta |
|---------|-------|
| `tailwind.config.js` | Todas as estilizações |
| `tsconfig.json` | Compilação TypeScript |
| `postcss.config.js` | Processamento CSS |
| `vercel.json` | Deploy e redirects |
| `.env.local` | Variáveis de ambiente (NÃO commitar!) |
| `package.json` | Dependências do projeto |
| `vitest.config.ts` | Configuração de testes |

---

## 🔄 Integrações Externas

| Serviço | Arquivos envolvidos |
|---------|-------------------|
| **Supabase** | `lib/supabase/*`, `.env.local` |
| **N8N** | `app/admin/automacao/`, `lib/utils/drive-automation.ts` |
| **Google Drive** | `credentials.json`, `lib/utils/drive-automation.ts` |
| **Vercel** | `vercel.json`, `.vercel/` |
| **WhatsApp (Evolution)** | `lib/utils/evolution-api.ts` |
| **OpenAI** | `lib/utils/ai-service.ts` |

---

## ⚠️ Dependências Críticas (Alto Impacto)

Estes arquivos, se modificados, podem quebrar múltiplas funcionalidades:

1. **`lib/supabase.ts`** → 80%+ das páginas
2. **`middleware.ts`** → Todas as rotas protegidas
3. **`app/layout.tsx`** → Todo o site
4. **`app/admin/layout.tsx`** → Todo o CRM
5. **`tailwind.config.js`** → Todos os estilos
6. **`.env.local`** → Todas as integrações externas
