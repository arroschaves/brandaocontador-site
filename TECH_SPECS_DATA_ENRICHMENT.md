# Planejamento: Enriquecimento de Dados Cadastrais (CNPJ/CPF/Sintegra)

## Objetivo
Automatizar o preenchimento de dados cadastrais (Endereço, CNAE Descritivo, Inscrição Estadual) para clientes PJ e PF (Produtor Rural) no CRM Brandão Contador.

## Fontes de Dados Sugeridas pelo Usuário
1. **CNPJ.ws**: Promete trazer até a Inscrição Estadual (IE) do CNPJ.
   - URL: https://www.cnpj.ws/pt-BR
2. **ReceitaWS**: Padrão de mercado para dados básicos de CNPJ (Free limita requisições/min).
   - URL: https://receitaws.com.br/
3. **OpenCNPJ**: Alternativa comunitária/open source.
   - URL: https://opencnpj.org/
4. **ACBrLibConsultaCNPJ**: Biblioteca parruda, verificar viabilidade em ambiente Node/Vercel (geralmente é DLL/SO).
   - Link: https://www.projetoacbr.com.br/forum/files/file/492-acbrlibconsultacnpj/
5. **Infosimples**: Solução paga robusta (Sintegra/CPF), mas vale investigar issues do GitHub por alternativas.

## Funcionalidades a Implementar (Próxima Sessão)
1. **Service de Enriquecimento**:
   - Criar `lib/services/company-enrichment.ts`.
   - Função `enrichCompanyData(cnpj)`: Busca dados e atualiza Supabase.
   - Gatilho: Ao cadastrar novo cliente OU via botão "Enriquecer Dados" no perfil.

2. **Consulta de CPF (Produtor Rural)**:
   - Desafio: Encontrar API pública que retorne IEs vinculadas a um CPF. O Sintegra unificado não existe, é por estado.
   - Estratégia: Tentar APIs que agregam dados públicos ou crawlers específicos por UF (foco na UF do contador primeiro).

3. **Sincronização em Massa**:
   - Implementar fila de processamento (Queue) ou Loop Client-side controlado para rodar a inteligência do Maestro em todos os clientes sem estourar timeout da Vercel.

## Estado Atual do Projeto
- **Client Hub**: Visual ajustado (Dark Premium), Abas funcionais.
- **Maestro (IA)**: Escaneia arquivos, sugere vínculos.
- **Drive**: Conexão 100%.

## Próximos Passos
Iniciar nova sessão com foco em "Backend & Data Integration".
