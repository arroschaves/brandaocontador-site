# 🎯 Plano de Finalização: Enriquecimento de Dados (CRM Maestro)

Este plano detalha as etapas para levar o módulo de enriquecimento de dados ao estado de "Produção Total", garantindo cobertura para Pessoas Físicas (Produtores Rurais) e uma UX de alta fidelidade para processos em massa.

## 🛠️ Escopo Técnico

### 1. Backend: Expansão do Service (`lib/services/enrichment-service.ts`)
- [ ] **Suporte a CPF (Produtor Rural)**: Investigar e implementar consulta básica para CPF no Sintegra (foco em MS primeiro).
- [ ] **Multi-Source Fallback**: Se `CNPJ.ws` falhar ou atingir limite, tentar `ReceitaWS` (versão free) como fallback automático.
- [ ] **Normalização de Dados**: Garantir que campos como `logradouro` e `bairro` sigam um padrão de capitalização.

### 2. API: Otimização de Processamento em Massa
- [ ] **Endpoint de Status**: Melhorar o `/api/clientes/enrich-all` para retornar metadados sobre o que falta em cada cliente.
- [ ] **Logging de Auditoria**: Refinar as mensagens de auditoria para incluir exatamente quais campos foram alterados.

### 3. Frontend: Experiência "Master Enrichment"
- [ ] **UI de Progresso**: Substituir os `alert()` e `confirm()` por uma Modal de Progresso em tempo real que mostre:
    - Barra de progresso.
    - Log de qual cliente está sendo processado.
    - Botão de "Pausar/Cancelar".
    - Resumo final (Sucesso, Falhas, Pulados).
- [ ] **Refresh Inteligente**: Atualizar a lista de clientes apenas nos itens modificados para evitar re-fetch total.

## 📝 Tarefas Por Agente

### 🟦 Project Planner (Eu/Orchestrator)
- [x] Criação deste plano.
- [ ] Coordenação das subtarefas.

### 🟩 Backend Specialist
- [ ] Refatoração do `enrichment-service.ts` para suportar fallback e normalização.
- [ ] Implementação de lógica de detecção de PF vs PJ mais robusta.

### 🟨 Frontend Specialist
- [ ] Criação do componente `EnrichmentProgressModal`.
- [ ] Integração do modal no `page.tsx` (Clientes).
- [ ] Melhoria visual dos badges de "Dados Incompletos".

### 🟥 Security Auditor
- [ ] Verificação de exposição de chaves de API (se adicionarmos fontes pagas).
- [ ] Revisão dos logs de auditoria (LGPD compliance).

## 📅 Cronograma Estimado
1. **Fase 1**: Refino do Service e APIs (Backend).
2. **Fase 2**: Implementação da Interface de Progresso (Frontend).
3. **Fase 3**: Testes de Stress e Auditoria final.

---
**Status:** Aguardando Aprovação do Usuário.
