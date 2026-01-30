import os
import shutil
import time
import tkinter as tk
from tkinter import messagebox, filedialog
import threading
import json
import sys
import winshell
from win32com.client import Dispatch
from pystray import Icon, Menu, MenuItem
from PIL import Image, ImageDraw

# Caminho para salvar a configuração
CONFIG_FILE = os.path.join(os.environ.get('APPDATA', os.getcwd()), 'brandao_sync_config.json')

def create_tray_icon(on_open, on_quit):
    # Cria uma imagem simples para o ícone (um círculo verde)
    width = 64
    height = 64
    image = Image.new('RGB', (width, height), color=(255, 255, 255))
    dc = ImageDraw.Draw(image)
    dc.ellipse([8, 8, 56, 56], fill=(0, 128, 0)) # Verde Brandão
    
    menu = Menu(
        MenuItem('Abrir Painel', on_open),
        MenuItem('Sair do Sincronizador', on_quit)
    )
    
    icon = Icon("Brandão Sync", image, "Sincronizador Brandão", menu)
    return icon

class BrandaoSyncPro:
    def __init__(self, root):
        self.root = root
        self.root.title("Sincronizador Brandão Pro 🚀")
        self.root.geometry("450x400")
        
        self.source = r"C:\Brandao_Contabilidade"
        self.target = ""
        self.running = False
        
        self.load_config()
        self.setup_ui()
        
        # Tray Icon Setup
        self.tray_icon = create_tray_icon(self.show_window, self.quit_app)
        threading.Thread(target=self.tray_icon.run, daemon=True).start()

        # Intercepta o fechamento da janela (X)
        self.root.protocol("WM_DELETE_WINDOW", self.hide_window)

        # Se já tiver configuração, inicia sozinho após 3 segundos
        if self.target and os.path.exists(self.target):
            self.root.after(3000, self.start_sync)

    def setup_ui(self):
        tk.Label(self.root, text="Brandão Contabilidade - Sincronizador Automático", font=("Arial", 12, "bold")).pack(pady=10)
        
        frame_src = tk.Frame(self.root)
        frame_src.pack(pady=5, fill=tk.X, padx=20)
        tk.Label(frame_src, text="📂 Pasta Local:").pack(side=tk.LEFT)
        tk.Label(frame_src, text=self.source, fg="blue", font=("Arial", 9, "italic")).pack(side=tk.LEFT, padx=5)

        tk.Label(self.root, text="☁️ Pasta Google Drive (Nuvem):").pack(pady=(10,0))
        self.lbl_target = tk.Label(self.root, text=self.target if self.target else "NÃO CONFIGURADO", 
                                   fg="green" if self.target else "red", wraplength=400)
        self.lbl_target.pack(pady=5)
        
        tk.Button(self.root, text="⚙️ Alterar Pasta da Nuvem", command=self.select_target).pack(pady=5)

        self.btn_run = tk.Button(self.root, text="🚀 INICIAR AGORA", command=self.toggle_sync, 
                                 bg="green", fg="white", font=("Arial", 10, "bold"), width=20)
        self.btn_run.pack(pady=20)

        self.var_startup = tk.IntVar(value=1)
        tk.Checkbutton(self.root, text="Iniciar automaticamente com o Windows", variable=self.var_startup, command=self.manage_startup).pack()

        tk.Label(self.root, text="\nℹ️ Ao fechar (X), o programa continuará rodando\nperto do relógio do Windows.", font=("Arial", 8, "italic"), fg="gray").pack()

        self.lbl_status = tk.Label(self.root, text="Status: Parado", font=("Arial", 8))
        self.lbl_status.pack(side=tk.BOTTOM, pady=5)

    def hide_window(self):
        self.root.withdraw()

    def show_window(self, icon=None, item=None):
        self.root.after(0, self.root.deiconify)

    def quit_app(self, icon=None, item=None):
        self.running = False
        self.tray_icon.stop()
        self.root.quit()

    def load_config(self):
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, 'r') as f:
                    data = json.load(f)
                    self.target = data.get('target', '')
            except: pass

    def save_config(self):
        with open(CONFIG_FILE, 'w') as f:
            json.dump({'target': self.target}, f)

    def select_target(self):
        path = filedialog.askdirectory(title="Selecione a pasta 'Brandão Contabilidade CRM' no Google Drive")
        if path:
            self.target = path
            self.lbl_target.config(text=path, fg="green")
            self.save_config()
            self.manage_startup()

    def start_sync(self):
        if not self.running and self.target:
            self.toggle_sync()

    def toggle_sync(self):
        if not self.target:
            messagebox.showwarning("Atenção", "Selecione a pasta do Google Drive primeiro!")
            return

        if not self.running:
            self.running = True
            self.btn_run.config(text="🛑 PARAR SINCRONIZAÇÃO", bg="red")
            self.lbl_status.config(text="✅ Sincronização Ativa - Trabalhando em segundo plano")
            threading.Thread(target=self.sync_loop, daemon=True).start()
        else:
            self.running = False
            self.btn_run.config(text="🚀 INICIAR AGORA", bg="green")
            self.lbl_status.config(text="Status: Parado")

    def manage_startup(self):
        startup_path = os.path.join(winshell.startup(), "SincronizadorBrandao.lnk")
        if self.var_startup.get() == 1:
            try:
                shell = Dispatch('WScript.Shell')
                shortcut = shell.CreateShortCut(startup_path)
                shortcut.Targetpath = sys.executable if getattr(sys, 'frozen', False) else sys.argv[0]
                shortcut.WorkingDirectory = os.path.dirname(shortcut.Targetpath)
                shortcut.IconLocation = shortcut.Targetpath
                shortcut.save()
            except: pass
        else:
            if os.path.exists(startup_path):
                os.remove(startup_path)

    def sync_loop(self):
        if not os.path.exists(self.source):
            os.makedirs(self.source, exist_ok=True)
            
        while self.running:
            try:
                self.sync_folders(self.source, self.target)
                time.sleep(10)
            except:
                time.sleep(20)

    def sync_folders(self, src, dst):
        for root, dirs, files in os.walk(src):
            relative_path = os.path.relpath(root, src)
            dest_path = os.path.join(dst, relative_path)
            
            if not os.path.exists(dest_path):
                os.makedirs(dest_path)
            
            for file in files:
                src_file = os.path.join(root, file)
                dst_file = os.path.join(dest_path, file)
                
                if not os.path.exists(dst_file) or os.path.getmtime(src_file) > os.path.getmtime(dst_file):
                    try:
                        shutil.copy2(src_file, dst_file)
                    except: pass

if __name__ == "__main__":
    root = tk.Tk()
    app = BrandaoSyncPro(root)
    root.mainloop()
