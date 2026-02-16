 # Maestro 2026: Plano de Reconstrução Radical 🚀

Este documento define as diretrizes para a reconstrução total do sistema Maestro CRM, visando estabilidade, automação contábil profunda e sincronização perfeita entre notebooks e nuvem.

## 📅 Status do Projeto: RESET TOTAL (Em Andamento)

---

## 🛠️ Fase 1: Limpeza e Fundação (HOJE)
- [ ] Deletar serviço Supabase no Easypanel e limpar volumes.
- [ ] Reinstalar Supabase com as **Senhas Mestre 2026** (Padronizadas).
- [ ] Limpar migrations antigas e criar o `schema_2026_v1.sql`.

## 🏗️ Fase 2: O Novo Banco de Dados (Schema)
### Tabela `clientes` (Completa)
- Identidentification (CNPJ/CPF)
- Dados Fiscais (Regime, IE, CNAEPrincipal, Email, Telefone)
- Drive (ID da Pasta Mãe, Status de Sincronia)

### Tabela `obrigacoes` (O Coração do Escritório)
- `cliente_id`
- `nome_obrigacao` (DAS, DCTF, FGTS...)
- `competencia` (MM/AAAA)
- `vencimento` (Data Real)
- `status` (PENDENTE, ENTREGUE, ATRASADO)
- `arquivo_url` (Link direto para o PDF no Drive)

### Tabela `alvaras` (Gestão de Documentos Fiscais)
- Tipos: Sanitário, Funcionamento, Bombeiro, Meio Ambiente.

### Tabela `certificados_digitais` (A1 e A3)
- Controle de vencimento com aviso prévio de 7 dias.
- A1: Cálculo automático de +12 meses a partir da criação.

### Tabela `atendimentos` (Logs do Evolution API)
- Registro de solicitações (Certidões, Holerites, Guias).
- Fluxo de resposta automática: "Recebido, analisando...".

## 🤖 Fase 3: Automação n8n (Cérebro)
- **Fluxo Inicial:** Recebe CNPJ -> Consulta Regime -> Gera 12 meses de obrigações no banco.
- **Fluxo SST:** Criação de subpastas estruturadas por ano.
- **Sensor de Drive:** Monitora arquivos novos e dá "Baixa" automática no CRM mudando o status para VERDE.

## 💻 Fase 4: MaestroSync.exe (Notebooks)
- Configuração para rodar como **Serviço do Windows (Invisible Mode)**.
- Garantir que a sincronização seja bidirecional (Notebook <-> Drive <-> CRM).

## 🎨 Fase 5: Dashboard Pro-Max (Interface)
- Menu lateral focado em:
  - Painel de Controle (Visão Geral de Pendências).
  - Meus Clientes (Fichas completas).
  - Calendário Fiscal (Obrigações do Mês).
  - Gestor de Arquivos (Acesso rápido ao Drive).

---

## ✅ Próximos Passos Imediatos:
1. Confirmar deleção do Supabase no Easypanel.
2. Executar o novo Script SQL de fundação.
3. Reconfigurar variáveis de ambiente na Vercel.
