import json

def report():
    with open('scripts/migracao_report.json', 'r', encoding='utf-8') as f:
        r = json.load(f)
    
    with open('scripts/crm_structure.json', 'r', encoding='utf-8') as f:
        crm = json.load(f)
    
    migrated_keys = r['clientes'].keys()
    
    print("📋 CLIENTES COM DOCUMENTOS MIGRADOS (40):")
    for name in sorted(migrated_keys):
        print(f"✅ {name}")
        
    print("\n⚠️ CLIENTES SEM DOCUMENTOS DETECTADOS NAS PASTAS ANTIGAS (29):")
    missing = []
    for c in crm:
        fullname = f"{c['nome']} ({c['doc']})"
        if fullname not in migrated_keys:
            missing.append(fullname)
            
    for m in sorted(missing):
        print(f"❓ {m}")

if __name__ == "__main__":
    report()
