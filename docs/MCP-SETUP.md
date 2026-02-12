# 🚀 Model Context Protocol (MCP) — Guia de Configuração "Pro-Max"

> **Objetivo:** Transformar seu assistente de IA (Claude, Cursor, Antigravity) em um "Super Agente" que acessa seu Banco de Dados, Arquivos e Git DIRETAMENTE.

---

## 🔍 O que é MCP?

Imagine que o **Antigravity** (ou Claude) é um cérebro brilhante preso em uma caixa. O MCP (Model Context Protocol) são "braços robóticos" que conectamos nessa caixa para que ele possa:
1.  **Ler/Escrever Arquivos** no seu PC (Filesystem).
2.  **Acessar seu Banco Supabase** (Postgres/Supabase).
3.  **Gerenciar seu Git** (Commits, logs, branches).
4.  **Controlar Automações** (N8N).

---

## 🛠️ Passo 1: Instale os Servidores MCP

Abra seu terminal e certifique-se de ter o Node.js instalado.

### Servidores Recomendados para Brandão Contabilidade:

| Servidor | O que faz | Comando de Instalação (Exemplo) |
|----------|-----------|----------------------------------|
| **Postgres (Supabase)** | Acessa seu DB diretamente | `npx -y @modelcontextprotocol/server-postgres` |
| **Filesystem** | Lê/Escreve arquivos locais | `npx -y @modelcontextprotocol/server-filesystem` |
| **Git** | Gerencia versionamento | `npx -y @modelcontextprotocol/server-git` |
| **N8N** | Gerencia workflows | (Já configurado no projeto) |

---

## ⚙️ Passo 2: Configure seu Cliente (Claude Desktop / Cursor)

O arquivo de configuração geralmente fica em:
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac/Linux:** `~/Library/Application Support/Claude/claude_desktop_config.json`

### 📋 Copie e Cole esta Configuração (JSON)

Edite o arquivo `claude_desktop_config.json` e adicione este conteúdo.
**ATENÇÃO:** Substitua `SUA_CONEXAO_SUPABASE` (`postgres://...`) pelos valores reais do `.env.local`.

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "E:\\PROJETOS\\brandaocontador-site"
      ]
    },
    "git": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-git",
        "--repository",
        "E:\\PROJETOS\\brandaocontador-site"
      ]
    },
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgres://postgres:[SUA_SENHA]@[SEU_HOST]:5432/postgres" 
      ]
    },
    "n8n": {
      "command": "npx",
      "args": [
        "-y",
        "n8n-mcp-server"
      ],
      "env": {
        "N8N_API_KEY": "SUA_API_KEY_N8N",
        "N8N_HOST": "https://seu-n8n.com"
      }
    }
  }
}
```

> **Nota:** Para o Supabase, usamos o servidor oficial do Postgres (`@modelcontextprotocol/server-postgres`), que funciona perfeitamente com Supabase (que é Postgres).

---

## 🎯 Como Usar no Chat

Depois de configurar e reiniciar o Claude Desktop/Cursor:

1.  **Conecte-se ao Supabase:**
    - "Liste as tabelas do Supabase."
    - "Crie uma migration para adicionar 'cpf' na tabela clientes."

2.  **Use o Git:**
    - "Qual foi o último commit na branch main?"
    - "Crie uma nova branch chamada 'feature/nova-pagina'."

3.  **Arquivos:**
    - "Leia o arquivo `app/page.tsx` e sugira melhorias." (Isso ele já faz nativamente no Cursor, mas via MCP é mais robusto no Claude Desktop).

---

## 🔒 Segurança

- **NUNCA** compartilhe seu `claude_desktop_config.json` com ninguém.
- Ele contém chaves de conexão com acesso total ao seu banco.
- Adicione este arquivo ao `.gitignore` global do seu PC se possível.

---

**Dúvidas?** Pergunte ao Agent Antigravity!
