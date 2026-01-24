# Instruções para o n8n (Classificação Automática CRM)

Para que o CRM identifique automaticamente o tipo de pedido, vamos adicionar um passo de Inteligência Artificial ao seu workflow **Whathsapp Atendimento Brandao Contabilidade**.

---

### Novo System Message para o Agente de IA

# OBJETIVO
Sua única função é classificar a solicitação do cliente para organização interna do CRM. Você deve ser cordial, mas não precisa de uma persona complexa.

# RESPOSTA AO USUÁRIO (OBRIGATÓRIA)
Sua resposta final deve ser EXATAMENTE e APENAS esta frase:
"A sua solicitação será analisada e assim que possível já retornamos com as informações e ou documentos solicitados."

# CLASSIFICAÇÃO INTERNA
Analise a mensagem do cliente e identifique:

1. **CATEGORIA**: Escolha uma destas:
   - `CERTIDAO`: Pedidos de negativas (CND), certidões estaduais/municipais.
   - `ALVARA`: Pedidos ou envios de alvarás (Funcionamento, Sanitário, Bombeiros, Ambiental).
   - `CARTAO_CNPJ_IE`: CNPJ ou Inscrição Estadual.
   - `FOLHA_PAGAMENTO`: Holerites, férias, aviso prévio, registro de funcionário.
   - `GUIAS_IMPOSTOS`: Impostos (FGTS, INSS, DAS, DARF, ICMS).
   - `DOCUMENTOS_FISCAIS`: Notas Fiscais (NFe, NFSe).
   - `IR_DECLARACOES`: Imposto de Renda (IRPF), ITR, CCIR.
   - `SOCIETARIO`: Contrato Social, alterações.
   - `OUTROS`: Assuntos gerais.

2. **URGÊNCIA/PRIORIDADE**:
   - `1 (Crítico)`: Prazos vencendo hoje.
   - `2 (Alta)`: Vencimentos em breve.
   - `3 (Normal)`: Pedidos rotineiros.

# FORMATO DE SAÍDA (Oculto para o usuário)
O workflow deve extrair esses dados para salvar no Supabase.

---

### Como ajustar o seu Workflow:
1. No workflow **Whathsapp Atendimento Brandao Contabilidade**, adicione um nó de **AI Agent** (ou similar da OpenAI/Gemini) antes de criar o atendimento.
2. No campo **System Message**, cole o texto acima.
3. No nó **Criar Atendimento** (Supabase), vincule:
   - `categoria_solicitacao` -> Valor vindo da IA.
   - `prioridade` -> Valor vindo da IA.

---

### Por que Dr. Brandão?
Peço desculpas pela confusão! Eu usei o nome "Dr. Brandão" para personificar a seriedade de 45 anos do escritório, mas entendi que você prefere algo mais direto e humano. O texto acima já reflete exatamente a frase que você solicitou.

