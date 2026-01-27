# 🎯 Próximos Passos - Sistema Funcionando

## ✅ Status Atual

**PARABÉNS!** O sistema está funcionando e transferindo arquivos! 🎉

Agora vamos:
1. Limpar pastas duplicadas no Google Drive
2. Configurar para outros notebooks
3. Corrigir nomes no Supabase
4. Automatizar para o futuro

---

## 1️⃣ Limpar Pastas Duplicadas no Google Drive

### Por Que Aconteceu?

Durante os testes, o workflow criou várias pastas vazias porque:
- O binário era perdido (já corrigido)
- Cada teste criava uma nova pasta
- Pastas de anos diferentes (2025, 2026)

### Como Limpar (Manual - Mais Seguro):

1. Abra: https://drive.google.com/drive/folders/1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP
2. Para cada cliente (ex: EDUARDO BASSO):
   - Entre na pasta do cliente
   - Veja as pastas de ano (2025, 2026)
   - **Delete as pastas VAZIAS**
   - **Mantenha apenas a pasta com arquivos**

### Como Limpar (Script Python - Automático):

Vou criar um script que:
- Lista todas as pastas vazias
- Mostra para você confirmar
- Deleta apenas as vazias

---

## 2️⃣ Configurar Outros Notebooks

Você tem outros notebooks e quer que eles também enviem arquivos automaticamente.

### Opção A: Copiar o Sistema (Recomendado)

**Em cada notebook:**

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/brandaocontador-site.git
   cd brandaocontador-site
   ```

2. **Configure as pastas locais:**
   
   Edite `brandao_core.py` linha ~11:
   ```python
   # NOTEBOOK 1 (Alessandro - Desktop)
   PC_SOURCES = [
       r"C:\Users\Alessandro\Documents\JUNTA COMERCIAL",
       r"C:\Users\Alessandro\Documents\SEFAZ MS",
       # ...
   ]
   
   # NOTEBOOK 2 (Outro computador)
   # PC_SOURCES = [
   #     r"D:\Documentos\JUNTA COMERCIAL",
   #     r"D:\Documentos\SEFAZ MS",
   #     # ...
   # ]
   ```

3. **Rode o scanner:**
   ```bash
   python brandao_core.py
   ```

### Opção B: Pasta Compartilhada (Mais Simples)

**Use uma pasta sincronizada (Dropbox, OneDrive, Google Drive):**

1. **Configure a pasta compartilhada:**
   ```python
   PC_SOURCES = [
       r"C:\Users\Shared\Dropbox\JUNTA COMERCIAL",
       r"C:\Users\Shared\Dropbox\SEFAZ MS",
   ]
   ```

2. **Todos os notebooks salvam na mesma pasta**
3. **Um único notebook roda o script** de sincronização

### Opção C: Webhook Direto (Avançado)

**Cada notebook envia direto para o n8n:**

Crie um script simples:
```python
import requests

def upload_file(file_path, client_id, doc_type):
    with open(file_path, 'rb') as f:
        requests.post(
            "https://webhook.brandaocontador.com.br/webhook/upload-brandao",
            files={'file': f},
            data={
                "file_name": os.path.basename(file_path),
                "doc_type": doc_type,
                "client_id": client_id,
                "drive_folder_id": "...",
                "path": "..."
            }
        )
```

---

## 3️⃣ Corrigir Nomes no Supabase

### Problema:

Os nomes mudaram de **Nome Fantasia** para **Razão Social**.

**Exemplo:**
- Antes: `MG PETS`
- Depois: `PONTCOM LTDA`

### Causa:

O script `brandao_enrich.py` está atualizando os nomes com dados dos XMLs (razão social).

### Solução:

**Opção A: Usar Nome Fantasia (Recomendado)**

Adicione uma coluna `nome_fantasia` no Supabase:

```sql
-- No Supabase SQL Editor:
ALTER TABLE clientes ADD COLUMN nome_fantasia TEXT;

-- Preencher com os nomes atuais:
UPDATE clientes SET nome_fantasia = nome;
```

Depois, modifique `brandao_enrich.py` para **não sobrescrever** o `nome`:

```python
# Linha ~XX (onde atualiza o cliente)
# ANTES:
supabase.table("clientes").update({"nome": razao_social}).eq("id", client_id).execute()

# DEPOIS:
supabase.table("clientes").update({"razao_social": razao_social}).eq("id", client_id).execute()
# Mantém o campo "nome" intacto
```

**Opção B: Restaurar Nomes Manualmente**

No Supabase Table Editor:
1. Abra a tabela `clientes`
2. Edite cada linha
3. Mude o campo `nome` de volta para o nome fantasia

---

## 4️⃣ Automatizar para o Futuro

### A. Agendamento Automático (Windows Task Scheduler)

**Rode o script todo dia às 6h da manhã:**

```powershell
schtasks /create /tn "Brandao Sync" /tr "python E:\PROJETOS\brandaocontador-site\brandao_core.py" /sc daily /st 06:00
```

### B. Monitoramento de Pastas (Watch Mode)

**Detecta arquivos novos automaticamente:**

Crie um script `watch_folders.py`:

```python
import time
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class NewFileHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory:
            print(f"Novo arquivo: {event.src_path}")
            # Envia para o n8n automaticamente
            upload_file(event.src_path)

observer = Observer()
observer.schedule(NewFileHandler(), path="C:\\Users\\Alessandro\\Documents", recursive=True)
observer.start()

print("Monitorando pastas...")
observer.join()
```

Rode em background:
```bash
python watch_folders.py
```

### C. Notificações

**Receba email quando o upload completa:**

No n8n, adicione um nó de email após "Update Client":

```
Upload File → Update Client → Send Email
```

---

## 📊 Resumo das Ações

| Ação | Prioridade | Tempo |
|------|------------|-------|
| Limpar pastas vazias no Drive | 🔴 Alta | 15 min |
| Corrigir nomes no Supabase | 🟡 Média | 10 min |
| Configurar outros notebooks | 🟢 Baixa | 30 min |
| Automatizar agendamento | 🟢 Baixa | 5 min |
| Monitoramento de pastas | 🔵 Opcional | 20 min |

---

## 🎯 Próximo Passo Imediato

**Escolha uma opção:**

### Opção 1: Limpar e Organizar (Recomendado)
1. Limpar pastas duplicadas no Drive
2. Corrigir nomes no Supabase
3. Rodar o script novamente para validar

### Opção 2: Configurar Outros Notebooks
1. Escolher método (Clone, Pasta Compartilhada, ou Webhook)
2. Configurar no primeiro notebook adicional
3. Testar

### Opção 3: Automatizar Tudo
1. Criar agendamento
2. Configurar monitoramento
3. Adicionar notificações

---

**Qual você quer fazer primeiro?** Me diga e eu crio os scripts/guias específicos! 🚀
