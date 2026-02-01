# Plano de Reestruturação: Agro Master 2026

**Task Slug:** restruct-client-drive
**Status:** Planejamento
**Tipo:** BACKEND / AUTOMATION

## 📋 Visão Geral
Reorganizar completamente o sistema de arquivos local (Notebook) e remoto (Google Drive) para os 72+ clientes do CRM. O objetivo é criar uma estrutura padronizada, limpa e resiliente, com suporte específico para Produtores Rurais (múltiplas fazendas) e gestão granular de RH e Notas Fiscais.

## 🎯 Critérios de Sucesso
1. Estrutura de pastas criada no `C:\Brandao_Contabilidade` para todos os clientes ativos.
2. Tratamento diferenciado para Produtores Rurais (Pastas por Fazenda + IE).
3. Pastas de RH seguindo a hierarquia: Categoria -> Ano -> Mês.
4. Script de replicação para espelhar a estrutura local no Google Drive (vazio).
5. Sentinela V6 atualizado para a nova rota de upload.

## 🛠️ Stack Tecnológica
- **Linguagem:** Python 3.13
- **Base de Dados:** Supabase (Fetch de clientes e unidades)
- **Cloud:** Google Drive API v3
- **Sistemas:** Windows (Local)

## 📁 Estrutura Alvo (Exemplo)
C:\Brandao_Contabilidade\
└── NOME DO CLIENTE (CPF/CNPJ)
    ├── 01 - CND (Federal, Estadual, Municipal)
    ├── 02 - DOCUMENTOS PESSOAIS (Identidade, CPF, Comprovante)
    ├── 03 - CERTIFICADO DIGITAL (Tokens, Senhas)
    ├── 04 - DOCUMENTOS TERRA (Pasta por Fazenda -> ITR, CCIR, Incra)
    ├── 05 - IRPF (Pastas por ANO)
    ├── 06 - JUNTA COMERCIAL (Contratos, Alterações)
    ├── 07 - FATURAMENTO (Pastas por ANO)
    ├── 08 - CAEPF (Pastas por Fazenda)
    ├── 09 - [NOME FAZENDA A] - IE 123
    │   ├── FISCAL
    │   │   └── 2026
    │   │       └── 01_Janeiro
    │   └── RH
    │       └── RECIBO_FOLHA
    │           └── 2026
    │               └── 01_Janeiro
    ├── 10 - [NOME FAZENDA B] - IE 456
    │   ├── FISCAL
    │   └── RH
    └── 11 - GERAL PJ (Se houver empresa no mesmo CPF)
        ├── FISCAL
        └── RH
    ├── 12 - FATURAMENTO (Diferenciado por Cliente/Ano)
    └── 13 - DOCUMENTOS PESSOAIS (Identidade, CPF, etc)

## 📝 Divisão de Tarefas

### Fase 1: Fundação & Dados
- [ ] **Task 1.1:** Criar script de extração de dados do Supabase.
  - **Input:** API Key Supabase.
  - **Output:** JSON com Clientes + Unidades Fiscais (Fazendas).
  - **Verify:** Log contendo "72 clientes carregados".
- [ ] **Task 1.2:** Validar regras de Fazendas vs Clientes PJ.
  - **Verify:** Conferência manual do JSON gerado.

### Fase 2: Implementação Local (Notebook)
- [ ] **Task 2.1:** Script `build_local_structure.py`.
  - **Input:** JSON da Task 1.1 + Root `C:\Brandao_Contabilidade`.
  - **Output:** Criação física das centenas de subpastas.
  - **Verify:** Usar `tree` no terminal para validar a hierarquia.

### Fase 3: Mirroring (Google Drive)
- [ ] **Task 3.1:** Script `sync_empty_structure.py`.
  - **Input:** Estrutura local do Notebook.
  - **Output:** Criação das mesmas pastas no Drive ID 1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP.
  - **Verify:** Visualização manual no Drive Web.

### Fase 4: Atualização da Automação
- [ ] **Task 4.1:** Refatorar `Brandao_Sync_Portatil.py` (Sentinela).
  - **Logic:** Agora o script deve ler de `C:\Brandao_Contabilidade` e saber exatamente para onde enviar baseado na pasta onde o arquivo foi salvo.
  - **Verify:** Teste de upload unitário.

## 🏁 Fase X: Verificação Final
- [ ] Segurança: Validar que `GOOGLE_CREDENTIALS_JSON` não está exposto.
- [ ] Integridade: Nenhuma pasta criada sem o ID do cliente/unidade.
- [ ] **Aprovação do Usuário:** Conferir pastas no Notebook antes de subir no Drive.

---
**Nota:** O diretório raiz será `C:\Brandao_Contabilidade` para evitar permissões restritas e manter a organização.
