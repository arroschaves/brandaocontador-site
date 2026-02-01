# 📁 Consolidador do Google Drive

Script para organizar automaticamente arquivos no Google Drive na estrutura padrão:
```
Cliente/Ano/Mês/Tipo/arquivo.pdf
```

## 🎯 Funcionalidades

- ✅ Escaneia todas as pastas de clientes
- ✅ Identifica arquivos fora da estrutura padrão
- ✅ Detecta pastas duplicadas
- ✅ Modo dry-run (simulação) e modo execução
- ✅ Relatório detalhado de mudanças

## 🔧 Configuração

### 1. Credenciais do Google Drive

Você precisa configurar as credenciais da Service Account do Google Drive. Há duas opções:

#### Opção A: Variável de Ambiente (Recomendado)

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto ou selecione um existente
3. Ative a **Google Drive API**
4. Vá em **Credenciais** > **Criar credenciais** > **Conta de serviço**
5. Baixe o arquivo JSON
6. Abra o arquivo `.env.local` e adicione:

```bash
GOOGLE_CREDENTIALS_JSON='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

**Importante:** Cole o JSON completo em uma única linha, entre aspas simples.

7. Compartilhe a pasta do Google Drive com o email da service account:
   - Email estará no formato: `nome@projeto.iam.gserviceaccount.com`
   - Dê permissão de **Editor** ou **Proprietário**

#### Opção B: Arquivo JSON

1. Siga os passos 1-5 acima
2. Salve o arquivo como `credentials.json` na raiz do projeto
3. Compartilhe a pasta do Drive (passo 7 acima)

### 2. Instalação de Dependências

```bash
pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib python-dotenv
```

## 🚀 Uso

### Modo Dry-Run (Simulação)

Executa uma simulação **sem fazer mudanças** no Drive:

```bash
python scripts/consolidate_drive.py
```

Saída esperada:
```
🔍 MODO DRY-RUN - Nenhuma mudança será feita
============================================================

📊 Encontradas 45 pastas de clientes

📁 Escaneando: CLIENTE EXEMPLO LTDA
  ✅ 12 arquivo(s) em: 2025/01_Janeiro/NOTAS_FISCAIS
  ⚠️ 3 arquivo(s) solto(s) em: 2025/02_Fevereiro
  ⚠️ 1 pasta(s) duplicada(s) encontrada(s)

============================================================
📊 RESUMO DA CONSOLIDAÇÃO
============================================================
  Arquivos a mover: 15
  Pastas a deletar: 2
  Pastas a criar: 5

💡 Execute com --execute para aplicar as mudanças
```

### Modo Execução

**⚠️ ATENÇÃO:** Este modo fará mudanças reais no Google Drive!

```bash
python scripts/consolidate_drive.py --execute
```

## 📋 Estrutura Esperada

O script valida se os arquivos estão na estrutura:

```
BRANDAO CONTABILIDADE/
├── CLIENTE A/
│   ├── 2025/
│   │   ├── 01_Janeiro/
│   │   │   ├── NOTAS_FISCAIS/
│   │   │   │   └── nfe_001.xml
│   │   │   └── CERTIDOES/
│   │   │       └── certidao.pdf
│   │   ├── 02_Fevereiro/
│   │   │   └── FOLHA_PAGAMENTO/
│   │   │       └── folha_fev.pdf
│   │   └── 00_DOCUMENTOS_PERMANENTES/
│   │       └── CONTRATO_SOCIAL/
│   │           └── contrato.pdf
│   └── 2026/
│       └── ...
└── CLIENTE B/
    └── ...
```

## 🔍 O Que o Script Detecta

### ✅ Estrutura Válida
- `Cliente/2025/01_Janeiro/NOTAS_FISCAIS/arquivo.pdf`
- `Cliente/2025/00_DOCUMENTOS_PERMANENTES/CONTRATO_SOCIAL/contrato.pdf`

### ⚠️ Problemas Detectados
- Arquivos soltos em pastas de mês (sem pasta de tipo)
- Pastas com nomes inválidos (não são anos de 4 dígitos)
- Pastas de mês sem formato `01_Janeiro` ou `00_DOCUMENTOS_PERMANENTES`
- Pastas duplicadas (mesmo nome)

## 🛡️ Segurança

- ✅ Modo dry-run por padrão (não faz mudanças sem confirmação)
- ✅ Credenciais via variável de ambiente (não commitadas no Git)
- ✅ Relatório detalhado antes de executar
- ✅ Validação de estrutura antes de mover arquivos

## 📊 Logs e Relatórios

O script gera logs detalhados durante a execução:

```
🔑 Usando credenciais da variável de ambiente GOOGLE_CREDENTIALS_JSON
📊 Encontradas 45 pastas de clientes
📁 Escaneando: CLIENTE EXEMPLO LTDA
  ✅ 12 arquivo(s) em: 2025/01_Janeiro/NOTAS_FISCAIS
  ⚠️ 3 arquivo(s) solto(s) em: 2025/02_Fevereiro
```

## 🔧 Troubleshooting

### Erro: "Credenciais não encontradas"

**Solução:** Configure a variável `GOOGLE_CREDENTIALS_JSON` no `.env.local` ou crie o arquivo `credentials.json`.

### Erro: "403 Forbidden"

**Solução:** Compartilhe a pasta do Google Drive com o email da service account.

### Erro: "Invalid JSON"

**Solução:** Verifique se o JSON está em uma única linha e entre aspas simples no `.env.local`.

## 🔗 Integração com Outros Scripts

Este script complementa o fluxo de automação:

1. **Scanner V2** (`brandao_core_v2.py`) - Escaneia arquivos locais
2. **Enrichment** (`brandao_enrich.py`) - Enriquece metadados
3. **Sync** (`brandao_sync.py`) - Faz upload para o Drive
4. **Consolidate** (`consolidate_drive.py`) - **Organiza arquivos antigos no Drive**

## 📝 Notas

- O script **não deleta arquivos**, apenas move e reorganiza
- Pastas vazias podem ser marcadas para deleção
- Execute sempre em dry-run primeiro para validar as mudanças
- Mantenha backup dos arquivos importantes antes de executar

## 🆘 Suporte

Para problemas ou dúvidas, consulte:
- Logs do script
- Documentação do Google Drive API
- `.env.example` para configuração de credenciais
