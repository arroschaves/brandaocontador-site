# Product Requirements Document (PRD)

## Projeto: Sistema Web + SaaS Brandão Contabilidade

### Visão Geral
Construção de um site institucional moderno e escalável, com base Next.js, que também servirá como fundação para o sistema SaaS de emissão de documentos fiscais eletrônicos (NF-e, CT-e, MDF-e).

### Objetivos
1. Ter presença digital profissional (site institucional responsivo).
2. Oferecer portal para clientes acessarem serviços online.
3. Evoluir para SaaS de emissão de documentos fiscais.

### Fases
#### Fase 1 – Site Institucional
- Criar landing page apresentando o escritório.
- Páginas: Serviços, Contato, Login do Cliente.
- Hospedagem no Vercel (free tier).
- Domínio configurado no Cloudflare.

#### Fase 2 – Portal do Cliente (Protótipo)
- Login com email/senha.
- Área reservada (placeholder).
- Preparação para APIs futuras.

#### Fase 3 – SaaS NF-e MVP
- Backend com API REST.
- Upload e emissão de NF-e (certificado A1).
- Geração de XML + PDF de DANFE.
- Armazenamento seguro.
- Relatórios básicos.

#### Fase 4 – Expansão CT-e e MDF-e
- Novos módulos conforme demanda dos clientes.

### Requisitos Funcionais
- [x] Página inicial institucional.
- [x] Lista de serviços.
- [x] Página de contato com WhatsApp/Email.
- [x] Login de cliente (protótipo).

### Requisitos Não Funcionais
- Deploy automatizado no Vercel.
- Código versionado no GitHub.
- DNS gerenciado no Cloudflare.
- Uso de tecnologias modernas (Next.js, TailwindCSS).

### Roadmap Evolutivo
1. Deploy institucional HTML → Next.js.
2. MVP NF-e (2025).
3. CT-e / MDF-e (2026).
4. Integração com outros sistemas do escritório.

---
**Responsável:** Alessandro Chaves - Brandão Contabilidade
