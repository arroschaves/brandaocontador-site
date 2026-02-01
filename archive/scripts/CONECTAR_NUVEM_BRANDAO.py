import os
import sys
import subprocess
import tkinter as tk
from tkinter import messagebox, filedialog
from datetime import datetime

def clean_path(path):
    """Limpa o caminho para o formato que o Windows mklink gosta."""
    if not path: return None
    # Converte tudo para barra invertida e remove espaços/barras extras no final
    p = os.path.normpath(path).strip()
    if p.endswith(os.sep):
        p = p[:-1]
    return p

def setup_bridge():
    root = tk.Tk()
    root.withdraw()

    # Caminho local que queremos criar
    local_folder = r"C:\Brandao_Contabilidade"
    
    messagebox.showinfo("Conexão Brandão", "Iniciando Unificação de Rede...\n\nPor favor, selecione a pasta do Google Drive na próxima tela.")

    # 1. Seleção Manual (Garante que o caminho existe)
    drive_target = filedialog.askdirectory(title="Selecione a pasta 'Brandão Contabilidade CRM' no seu Google Drive")
    
    if not drive_target:
        messagebox.showerror("Cancelado", "Você precisa selecionar uma pasta para continuar.")
        return

    # Limpeza rigorosa dos caminhos
    local_folder = clean_path(local_folder)
    drive_target = clean_path(drive_target)

    # 2. Verificar se a pasta local já existe
    if os.path.exists(local_folder):
        # Tenta remover se for um link antigo/quebrado
        try:
            subprocess.run(['cmd', '/c', 'rmdir', local_folder], shell=True)
        except: pass
        
        if os.path.exists(local_folder):
            resp = messagebox.askyesno("Pasta Existente", f"A pasta {local_folder} já existe.\n\nEla precisa sumir para a ponte funcionar. Quer que eu renomeie ela agora?")
            if resp:
                try:
                    os.rename(local_folder, local_folder + "_BKP_" + datetime.now().strftime("%H%M"))
                except:
                    messagebox.showerror("Erro", "Não consegui renomear. Por favor, remova a pasta C:\Brandao_Contabilidade manualmente e tente de novo.")
                    return
            else:
                return

    # 3. Executar o comando de Ponte (MKLINK) com sintaxe ultra-limpa
    try:
        # O segredo é passar as aspas certas e o caminho sem barra final
        # mklink /j "Dino" "Source"
        comando = f'mklink /j "{local_folder}" "{drive_target}"'
        
        # Executa via cmd /c para garantir acesso ao comando interno mklink
        processo = subprocess.run(['cmd', '/c', comando], capture_output=True, text=True, shell=True)
        
        if processo.returncode == 0:
            messagebox.showinfo("✅ SUCESSO!", f"Conexão estabelecida com sucesso!\n\nAgora seu C: está plugado na Nuvem.\nPasta: {drive_target}")
        else:
            detalhe = processo.stderr if processo.stderr else "Erro de Sintaxe no Windows"
            messagebox.showerror("Erro de Sistema", f"O Windows recusou o comando.\n\nDetalhes: {detalhe}\n\nSugestão: Rode o programa como ADMINISTRADOR.")
            
    except Exception as e:
        messagebox.showerror("Erro Fatal", f"Erro inesperado: {e}")

if __name__ == "__main__":
    setup_bridge()
