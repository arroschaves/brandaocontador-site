#!/usr/bin/env python3
"""
BRANDÃO SYNC SENTINELA - PORTÁTIL (V4 - CLOUD SYNC)
===============================================
Monitoramento automático com configuração buscada no Supabase.
"""

import os
import requests
import json
import time
import hashlib
import socket
import sys
from pathlib import Path
from datetime import datetime

# ==========================================
# ⚙️ CONFIGURAÇÃO INICIAL (Baseada no .env.local do projeto)
# ==========================================
# No notebook real, você deve preencher essas variáveis ou usar um arquivo .env
SUPABASE_URL = "https://escritoriobrandao-supabase.3ow2vi.easypanel.host"
SUPABASE_KEY = "" # Precisa ser preenchida no notebook (Annon Key)

WEBHOOK_URL = "https://webhook.brandaocontador.com.br/webhook/upload-brandao"
API_KEY = "BRANDAO_SYNC_2026_SECURE_KEY"
NOTEBOOK_NAME = socket.gethostname()
INTERVALO_CHECK_SEGUNDOS = 30 
INTERVALO_SYNC_CONFIG = 300 # Sincroniza configuração com a nuvem a cada 5 min

def get_file_hash(file_path):
    hasher = hashlib.md5()
    try:
        with open(file_path, 'rb') as f:
            buf = f.read(65536)
            while len(buf) > 0:
                hasher.update(buf)
                buf = f.read(65536)
        return hasher.hexdigest()
    except:
        return None

def log_event(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_file = Path(__file__).parent / "sync_sentinela_log.txt"
    with open(log_file, "a", encoding="utf-8") as log:
        log.write(f"[{timestamp}] {message}\n")
    print(f"[{timestamp}] {message}")

def get_cloud_config():
    """Busca as pastas para monitorar no Supabase."""
    log_event(f"☁️ Sincronizando configuração para o notebook: {NOTEBOOK_NAME}")
    try:
        # Tenta buscar a config no admin_settings
        key = f"notebook_config_{NOTEBOOK_NAME}"
        # Usando requests direto para evitar dependência do supabase-py em todos os notebooks
        url = f"{SUPABASE_URL}/rest/v1/admin_settings?key=eq.{key}&select=value"
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}"
        }
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data and "value" in data[0]:
                return data[0]["value"]
    except Exception as e:
        log_event(f"⚠️ Erro ao buscar config na nuvem: {e}")
    
    return ["PARA_ENVIAR"] # Fallback

def update_online_status():
    """Informa ao CRM que o notebook está online."""
    try:
        key = f"notebook_status_{NOTEBOOK_NAME}"
        url = f"{SUPABASE_URL}/rest/v1/admin_settings"
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
        }
        payload = {
            "key": key,
            "value": {
                "last_seen": datetime.now().isoformat(),
                "status": "online"
            },
            "updated_at": datetime.now().isoformat()
        }
        requests.post(url, headers=headers, json=payload)
    except:
        pass

def process_folder(folder_path, history):
    folder = Path(folder_path)
    if not folder.exists():
        return

    files = [f for f in folder.glob('*') if f.is_file() and f.name not in ["sync_sentinela_log.txt", "sync_history.json"]]
    
    for file_path in files:
        if file_path.suffix.lower() in ['.tmp', '.crdownload', '.part']: continue
        file_hash = get_file_hash(file_path)
        if not file_hash: continue
        if file_hash in history:
            move_to_sent(file_path, folder)
            continue
            
        log_event(f"🚀 [AÇÃO AUTOMÁTICA] Processando {file_path.name}")
        
        try:
            with open(file_path, 'rb') as f:
                response = requests.post(
                    WEBHOOK_URL,
                    files={'file': (file_path.name, f)},
                    headers={'X-API-Key': API_KEY},
                    data={
                        'notebook': NOTEBOOK_NAME,
                        'original_filename': file_path.name,
                        'file_hash': file_hash,
                        'origin_folder': str(folder.absolute())
                    },
                    timeout=120
                )
            
            if response.status_code == 200:
                log_event(f"✅ OK: {file_path.name}")
                history[file_hash] = {"name": file_path.name, "date": datetime.now().isoformat()}
                save_history(history)
                move_to_sent(file_path, folder)
            else:
                log_event(f"⚠️ Erro n8n: {response.status_code}")
        except Exception as e:
            if "Permission denied" not in str(e):
                log_event(f"❌ Erro: {e}")

def save_history(history):
    history_file = Path(__file__).parent / "sync_history.json"
    with open(history_file, "w") as hf:
        json.dump(history, hf)

def move_to_sent(file_path, base_folder):
    sent_dir = base_folder / "Enviados"
    sent_dir.mkdir(exist_ok=True)
    try:
        dest = sent_dir / file_path.name
        if dest.exists():
            dest = sent_dir / f"{int(time.time())}_{file_path.name}"
        file_path.rename(dest)
    except: pass

if __name__ == "__main__":
    if not SUPABASE_KEY:
        print("❌ ERRO: SUPABASE_KEY não configurada no script.")
        print("Por favor, pegue a chave 'anon' no painel Supabase e cole na variável SUPABASE_KEY.")
        sys.exit(1)

    log_event(f"🛡️ Sentinela Brandão CLOUD iniciado em: {NOTEBOOK_NAME}")
    
    history_file = Path(__file__).parent / "sync_history.json"
    history = {}
    if history_file.exists():
        with open(history_file, "r") as hf:
            try: history = json.load(hf)
            except: history = {}

    pastas_ativas = get_cloud_config()
    last_config_sync = time.time()

    try:
        while True:
            # Sincroniza config periodicamente
            if time.time() - last_config_sync > INTERVALO_SYNC_CONFIG:
                pastas_ativas = get_cloud_config()
                update_online_status()
                last_config_sync = time.time()

            for pasta in pastas_ativas:
                process_folder(pasta, history)
                
            time.sleep(INTERVALO_CHECK_SEGUNDOS)
    except KeyboardInterrupt:
        log_event("🛑 Parado.")
