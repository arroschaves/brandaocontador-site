# Professional Accounting CRM Overhaul: Brandão Contabilidade

## 1. Overview
Este plano detalha a transformação do CRM atual em uma plataforma de contabilidade digital profissional. O foco é a integração profunda entre o Google Drive e o Supabase, permitindo auditorias automáticas de obrigações contábeis e fiscais, com uma interface de alta densidade e precisão técnica.

**Tipo de Projeto:** WEB (Next.js 15 + Supabase)

## 2. Success Criteria
- [ ] Detecção automática de **Regime Tributário** via API/CNAE.
- [ ] Sincronização automática: Arquivo no Drive = Status "Concluído" no CRM.
- [ ] Dashboard com Radar de Transmissão de obrigações (FGTS, INSS, DAS, DARF).
- [ ] Suporte nativo a **Produtores Rurais (PF)** com gestão de Fazendas e ITR/CCIR.
- [ ] UI "Technical Precision": Compacta, profissional e sem clichés de "Template SaaS".

## 3. Tech Stack
- **Dashboard/UI**: Next.js 15 (App Router), Tailwind CSS (Densidade de dados), Lucide React.
- **Backend/API**: Next.js Route Handlers (Edge-ready flow), Google Drive API (v3).
- **Database**: Supabase (PostgreSQL) com tabelas de Auditoria e Obrigações.
- **Inteligência**: Integração com APIs de consulta CNPJ/IE (Sintegra/SEFAZ).

## 4. Estrutura de Pastas e Dados (Mirroring)
- `Fiscal/{Ano}/{Mês}/` -> Arquivos de Impostos (DAS, DARF, GIA).
- `RH/{Ano}/{Mês}/` -> Folha, FGTS, INSS, Holerites.
- `Contabil/{Ano}/` -> Balancetes, Livro Diário/Razão.
- `Agro/` -> ITR, CCIR, Cadastro de Fazendas, LCDPR.

## 5. Task Breakdown

### Fase 1: Inteligência e Dados (Backend Specialist + Database Architect)
- [ ] **Task 1.1**: Atualizar schema do Supabase para suportar `obrigações_acessorias` (link entre arquivo Drive e status).
- [ ] **Task 1.2**: Criar Engine de Auditoria (`/api/sync/audit`) que percorre o Drive e atualiza o Supabase.
- [ ] **Task 1.3**: Implementar consulta automática de CNPJ/CNAE para definir o Regime Tributário.
- [ ] **Task 1.4**: Desenvolver lógica de busca de Inscrição Estadual para Produtores Rurais (SEFAZ-MS).

### Fase 2: UI Professional (Frontend Specialist)
- [ ] **Task 2.1**: Redesenhar Dashboard Principal (Radar de Transmissões + Fluxo de Caixa Simulado).
- [ ] **Task 2.2**: Atualizar Sidebar de Cliente (Visualização técnica de obrigações por mês/ano).
- [ ] **Task 2.3**: Implementar Gerenciador de Arquivos integrado (Ver arquivos do Drive sem sair do CRM).
- [ ] **Task 2.4**: Criar aba "Holding/Agro" com visualização de propriedades e documentos fundiários (ITR/CCIR).

### Fase 3: Automação e Auditoria (Backend Specialist)
- [ ] **Task 3.1**: Script de movimentação automática de arquivos da pasta `AuxilioNFE` para pastas de clientes.
- [ ] **Task 3.2**: Webhook (ou polling) para detectar novos uploads no Drive e notificar o CRM.

## 6. Phase X: Verificação Final
- [ ] `npm run build` sem avisos.
- [ ] Teste de sincronização: Subir um PDF no Drive e verificar se o CRM reflete o status em < 30s.
- [ ] Auditoria de UI: Garantir que não há fontes gigantes e o layout é compacto e profissional.
