# Instalação de Dependências

## PyPDF2 para extração de texto de PDFs

```powershell
pip install PyPDF2
```

## Teste rápido

```powershell
python brandao_core_v2.py
```

## Diferenças entre V1 e V2

### V1 (Antigo)
- ❌ Detecta tipo pelo NOME DO ARQUIVO
- ❌ Não extrai CPF/CNPJ
- ❌ 17% classificados como "OUTROS"

### V2 (Novo)
- ✅ Detecta tipo pelo NOME DA PASTA
- ✅ Extrai CPF/CNPJ de PDFs e XMLs
- ✅ Matching automático de clientes
- ✅ <5% classificados como "OUTROS"

## Estrutura esperada

```
C:\Users\Alessandro\Documents\
├── JUNTA COMERCIAL\
│   ├── Cliente A\
│   │   └── alteracao_contratual.pdf  → JUNTA_COMERCIAL
│   └── Cliente B\
│       └── contrato_social.pdf       → JUNTA_COMERCIAL
├── CERTIDOES\
│   ├── Cliente A\
│   │   └── cnd_federal.pdf           → CERTIDOES_NEGATIVAS
│   └── Cliente B\
│       └── cnd_estadual.pdf          → CERTIDOES_NEGATIVAS
└── NOTAS\
    ├── Cliente A\
    │   └── nfe_123.xml                → NOTAS_FISCAIS
    └── Cliente B\
        └── nfe_456.xml                → NOTAS_FISCAIS
```

## Resultado

Cada arquivo terá:
- `doc_type`: Baseado no nome da pasta
- `cpf_cnpj`: Extraído do conteúdo
- `year`, `month`: Extraído do nome ou data de modificação
- `expiry_date`: Para certidões
