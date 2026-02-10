import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext, filedialog
import threading
import time
import os
import sys
import shutil
import json
import winreg

# --- CONFIGURAÇÃO PADRÃO ---
APPDATA = os.getenv('APPDATA')
CONFIG_DIR = os.path.join(APPDATA, "MaestroSync")
if not os.path.exists(CONFIG_DIR):
    try:
        os.makedirs(CONFIG_DIR)
    except:
        pass
        
CONFIG_FILE = os.path.join(CONFIG_DIR, "maestro_sync_config.json")

DEFAULT_LOCAL = r'C:\Brandao_Contabilidade'
DEFAULT_CLOUD = r'G:\Meu Drive\Brandão Contabilidade CRM'

class MaestroSyncApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Maestro Sincronizador v3.0 (Local Direto)")
        self.root.geometry("700x600")
        try:
            self.root.iconbitmap("favicon.ico")
        except:
            pass
        
        self.is_running = False
        self.sync_thread = None
        self.config = self.load_config()

        self.create_widgets()
        self.check_autostart()
        
        # Se configurado, auto-start
        if self.config.get("autostart_sync", False):
            self.root.after(2000, self.start_sync)

    def load_config(self):
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, 'r') as f:
                    return json.load(f)
            except: pass
        return {"local_path": DEFAULT_LOCAL, "cloud_path": DEFAULT_CLOUD, "autostart_sync": False}

    def save_config(self):
        self.config["local_path"] = self.txt_local.get()
        self.config["cloud_path"] = self.txt_cloud.get()
        self.config["autostart_sync"] = self.var_autostart.get()
        try:
            with open(CONFIG_FILE, 'w') as f:
                json.dump(self.config, f)
            self.log("💾 Configurações salvas!")
        except Exception as e:
            self.log(f"❌ Erro ao salvar config: {e}")

    def create_widgets(self):
        # Header
        header = tk.Label(self.root, text="Maestro Sincronizador v3.0 (Arquivo Local)", font=("Arial", 16, "bold"), fg="#2c3e50")
        header.pack(pady=15)

        # Frame Caminhos
        frame_paths = tk.LabelFrame(self.root, text="Diretórios de Sincronização", font=("Arial", 10, "bold"), padx=10, pady=10)
        frame_paths.pack(padx=20, pady=5, fill="x")

        # Local Path
        tk.Label(frame_paths, text="📂 Pasta Local (Notebook):", font=("Arial", 9)).grid(row=0, column=0, sticky="w")
        self.txt_local = tk.Entry(frame_paths, width=60)
        self.txt_local.grid(row=1, column=0, padx=5, pady=5)
        self.txt_local.insert(0, self.config.get("local_path", ""))
        tk.Button(frame_paths, text="Selecionar...", command=lambda: self.browse_folder(self.txt_local)).grid(row=1, column=1, padx=5)

        # Cloud Path
        tk.Label(frame_paths, text="☁️ Pasta Remota (Google Drive G:):", font=("Arial", 9)).grid(row=2, column=0, sticky="w", pady=(10,0))
        self.txt_cloud = tk.Entry(frame_paths, width=60)
        self.txt_cloud.grid(row=3, column=0, padx=5, pady=5)
        self.txt_cloud.insert(0, self.config.get("cloud_path", ""))
        tk.Button(frame_paths, text="Selecionar...", command=lambda: self.browse_folder(self.txt_cloud)).grid(row=3, column=1, padx=5)

        # Buttons
        frame_btns = tk.Frame(self.root)
        frame_btns.pack(pady=15)
        
        self.btn_start = tk.Button(frame_btns, text="▶ INICIAR SINCRONIZAÇÃO", bg="green", fg="white", font=("Arial", 11, "bold"), padx=10, pady=5, command=self.start_sync)
        self.btn_start.pack(side="left", padx=10)
        
        self.btn_stop = tk.Button(frame_btns, text="⏹ PARAR", bg="red", fg="white", font=("Arial", 11, "bold"), padx=10, pady=5, command=self.stop_sync, state="disabled")
        self.btn_stop.pack(side="left", padx=10)

        # Options
        frame_opts = tk.Frame(self.root)
        frame_opts.pack(pady=5)
        
        self.var_autostart = tk.BooleanVar(value=self.config.get("autostart_sync", False))
        self.chk_autostart = tk.Checkbutton(frame_opts, text="Iniciar Automaticamente com o Windows", variable=self.var_autostart, command=self.toggle_autostart_reg)
        self.chk_autostart.pack()

        # Status
        self.lbl_status = tk.Label(self.root, text="Status: Aguardando...", fg="gray", font=("Arial", 10))
        self.lbl_status.pack(pady=5)

        # Log Area
        self.log_area = scrolledtext.ScrolledText(self.root, height=15, font=("Consolas", 9))
        self.log_area.pack(padx=20, pady=10, fill="both", expand=True)

    def browse_folder(self, entry_widget):
        folder = filedialog.askdirectory()
        if folder:
            entry_widget.delete(0, tk.END)
            entry_widget.insert(0, folder)
            self.save_config()

    def log(self, message):
        timestamp = time.strftime("%H:%M:%S")
        self.log_area.insert(tk.END, f"[{timestamp}] {message}\n")
        self.log_area.see(tk.END)

    def start_sync(self):
        if self.is_running: return
        
        local = self.txt_local.get()
        cloud = self.txt_cloud.get()

        if not os.path.exists(local):
            try:
                os.makedirs(local)
                self.log(f"� Pasta local criada: {local}")
            except Exception as e:
                self.log(f"❌ Erro ao criar pasta local: {e}")
                return

        if not os.path.exists(cloud):
            self.log(f"⚠️ A pasta nuvem '{cloud}' não existe ou não está acessível!")
            self.log("Certifique-se que o Google Drive Desktop está rodando (G:).")
            # Não para, pois o G: pode montar depois
        
        self.save_config()
        self.is_running = True
        self.btn_start.config(state="disabled")
        self.btn_stop.config(state="normal")
        self.lbl_status.config(text="Status: SINCRONIZANDO 🔄", fg="blue")
        
        self.sync_thread = threading.Thread(target=self.run_sync_loop, daemon=True)
        self.sync_thread.start()

    def stop_sync(self):
        self.is_running = False
        self.btn_start.config(state="normal")
        self.btn_stop.config(state="disabled")
        self.lbl_status.config(text="Status: PARADO ⏹", fg="red")
        self.log("🛑 Solicitado parada...")

    def run_sync_loop(self):
        while self.is_running:
            try:
                self.bidirectional_sync()
                self.log("✅ Ciclo concluído. Aguardando 60s...")
                for _ in range(60):
                    if not self.is_running: break
                    time.sleep(1)
            except Exception as e:
                self.log(f"❌ Erro no ciclo: {str(e)}")
                time.sleep(10)

    def bidirectional_sync(self):
        local_root = self.txt_local.get()
        cloud_root = self.txt_cloud.get()

        if not os.path.exists(cloud_root):
            self.log("⚠️ Drive G: não detectado. Tentando novamente...")
            return

        # 1. Local -> Nuvem (Upload)
        self.sync_direction(local_root, cloud_root, "⬆️ Upload")

        # 2. Nuvem -> Local (Download)
        self.sync_direction(cloud_root, local_root, "⬇️ Download")

    def sync_direction(self, source_root, dest_root, direction_label):
        ignored = ['thinking.md', 'desktop.ini', 'Thumbs.db', '.DS_Store', '$RECYCLE.BIN', 'System Volume Information']
        
        for root, dirs, files in os.walk(source_root):
            if not self.is_running: break
            
            # Filtra diretórios ignorados
            dirs[:] = [d for d in dirs if d not in ignored]
            
            # Caminho relativo para espelhar
            rel_path = os.path.relpath(root, source_root)
            dest_dir = os.path.join(dest_root, rel_path)

            # Garante que pasta destino existe
            if not os.path.exists(dest_dir):
                try:
                    os.makedirs(dest_dir)
                    self.log(f"{direction_label} Pasta: {rel_path} (Criada)")
                except Exception as e:
                    self.log(f"❌ Erro ao criar pasta {dest_dir}: {e}")
                    continue

            for file in files:
                if file in ignored: continue
                
                src_file = os.path.join(root, file)
                dst_file = os.path.join(dest_dir, file)

                should_copy = False
                
                # Se não existe no destino
                if not os.path.exists(dst_file):
                    should_copy = True
                else:
                    # Se existe, compara modificação (com tolerância de 2s)
                    try:
                        src_mtime = os.path.getmtime(src_file)
                        dst_mtime = os.path.getmtime(dst_file)
                        
                        # Se origem é mais novo (> 2 segundos de diferença)
                        if src_mtime > dst_mtime + 2:
                            should_copy = True
                    except:
                        pass # Erro de acesso, ignora

                if should_copy:
                    try:
                        shutil.copy2(src_file, dst_file)
                        self.log(f"{direction_label}: {file}")
                    except Exception as e:
                        # Erro comum: Arquivo aberto ou bloqueado
                        # self.log(f"⚠️ Erro ao copiar {file}: {e}")
                        pass 

    def toggle_autostart_reg(self):
        key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
        app_name = "MaestroSyncV3"
        exe_path = sys.executable if getattr(sys, 'frozen', False) else os.path.abspath(__file__)
        
        try:
            key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, key_path, 0, winreg.KEY_ALL_ACCESS)
            if self.var_autostart.get():
                winreg.SetValueEx(key, app_name, 0, winreg.REG_SZ, f'"{exe_path}"')
                self.log("✅ Adicionado ao Iniciar do Windows")
            else:
                try:
                    winreg.DeleteValue(key, app_name)
                    self.log("✅ Removido do Iniciar do Windows")
                except FileNotFoundError: pass
            winreg.CloseKey(key)
            self.save_config()
        except Exception as e:
            self.log(f"❌ Erro registro: {e}")
            self.var_autostart.set(not self.var_autostart.get())

    def check_autostart(self):
        key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
        app_name = "MaestroSyncV3"
        try:
            key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, key_path, 0, winreg.KEY_READ)
            winreg.QueryValueEx(key, app_name)
            self.var_autostart.set(True)
            winreg.CloseKey(key)
        except FileNotFoundError:
            self.var_autostart.set(False)

if __name__ == "__main__":
    try:
        root = tk.Tk()
        app = MaestroSyncApp(root)
        root.mainloop()
    except Exception as e:
        with open("error.log", "w") as f:
            f.write(str(e))
