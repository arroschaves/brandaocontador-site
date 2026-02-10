# PLAN: MaestroSync Local Bidirectional Sync

## 1. Contexto
O cliente precisa de uma solução robusta para sincronizar pastas entre Notebooks locais e o Google Drive (mapeado como G:).
A solução anterior baseada em API (OAuth) enfrentou problemas de bloqueio de segurança "redirect_uri_mismatch" do Google Cloud e complexidade de setup (credentials.json).

## 2. Nova Arquitetura: File System Sync
Substituir a lógica de API por uma lógica de **File System**.
O Google Drive Desktop já mapeia a nuvem como um Drive Local (`G:`).
O nosso script deve apenas garantir que a pasta `C:\Brandao` esteja espelhada na pasta `G:\Meu Drive\Brandao`.

## 3. Componentes

### 3.1 GUI (Interface Gráfica)
- Biblioteca: `tkinter` (Nativo do Python).
- Seletor de Pasta Local ("Origem").
- Seletor de Pasta Remota ("Nuvem").
- Persistência: Salvar caminhos em `config.json` para não precisar selecionar toda vez.
- Botão "Iniciar Sincronização Bidirecional".
- Checkbox "Iniciar com Windows".

### 3.2 Engine de Sincronização (Backend)
- **Bidirecional Real (Two-Way Sync):**
    - **Varredura:** `os.walk` em ambas as pastas.
    - **Comparação:** Baseada em Caminho Relativo + Timestamp (`mtime`).
    - **Regra de Conflito:** "Last Modified Wins" (O arquivo mais recente sobrescreve o antigo).
    - **Novos Arquivos:**
        - Se existe em A e não em B -> Copia para B.
        - Se existe em B e não em A -> Copia para A.
    - **Prevenção de Loop:** Verificar timestamp antes de copiar para evitar cópia infinita de arquivos iguais.

### 3.3 Deploy
- Ferramenta: `PyInstaller`.
- Saída: `.exe` único.
- Instalação: Copiar e Colar.

## 4. Plano de Execução
1. Criar `scripts/maestro_sync_gui.py` com a nova lógica `os`/`shutil`.
2. Remover dependências do Google API.
3. Gerar novo executável.
