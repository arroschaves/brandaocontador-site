import os
import xml.etree.ElementTree as ET
import json
import glob

# Caminhos onde costumam ficar as notas fiscais
SEARCH_PATHS = [
    r"C:\AuxilioNFe\NFE",
    r"C:\Users\Alessandro\Documents\NOTAS",
    r"C:\Users\Alessandro\Documents\FATURAMENTO"
]

def clean_doc(doc):
    return doc.replace('.','').replace('-','').replace('/','').strip()

def find_names_in_xmls(target_docs):
    found_map = {} # doc -> set(names)
    
    print(f"🔍 Iniciando busca de nomes para {len(target_docs)} documentos em XMLs locais...")
    
    for path in SEARCH_PATHS:
        if not os.path.exists(path):
            print(f"⚠️ Caminho não encontrado: {path}")
            continue
            
        print(f"📂 Vasculhando {path}...")
        # Busca recursiva por .xml
        files = glob.glob(os.path.join(path, "**/*.xml"), recursive=True)
        print(f"   Encontrados {len(files)} arquivos XML.")
        
        for f in files:
            try:
                tree = ET.parse(f)
                root = tree.getroot()
                ns = {'nfe': 'http://www.portalfiscal.inf.br/nfe'}
                
                # Procura em Emitente e Destinatário
                nodes = root.findall('.//nfe:emit', ns) + root.findall('.//nfe:dest', ns)
                for node in nodes:
                    cnpj = node.find('nfe:CNPJ', ns)
                    cpf = node.find('nfe:CPF', ns)
                    nome = node.find('nfe:xNome', ns)
                    
                    doc = cnpj.text if cnpj is not None else (cpf.text if cpf is not None else None)
                    if doc and nome is not None:
                        doc_c = clean_doc(doc)
                        if doc_c in target_docs:
                            name_val = nome.text.strip().upper()
                            if doc_c not in found_map: found_map[doc_c] = set()
                            found_map[doc_c].add(name_val)
                
                # Se já achamos todos, podemos parar (opcional, para performance)
                if len(found_map) == len(target_docs):
                    # break # Mas um doc pode ter variações de nome, melhor continuar um pouco
                    pass
            except:
                continue
                
    return found_map

def main():
    # Carrega estrutura atual
    with open("scripts/crm_structure.json", "r", encoding="utf-8") as f:
        clientes = json.load(f)
    
    dirty_docs = []
    doc_to_id = {}
    for c in clientes:
        if c['nome'].startswith('2026-'):
            dirty_docs.append(c['doc'])
            doc_to_id[c['doc']] = c['id']
    
    if not dirty_docs:
        print("✅ Nenhum cliente com nome de 'timestamp' encontrado.")
        return
        
    found_map = find_names_in_xmls(set(dirty_docs))
    
    results = []
    print("\n📊 RESULTADOS DA BUSCA:")
    print("-" * 50)
    for doc in dirty_docs:
        names = list(found_map.get(doc, []))
        best_name = names[0] if names else "??? (NÃO ENCONTRADO)"
        print(f"Doc: {doc} -> Sugestão: {best_name}")
        if names:
            results.append({
                "id": doc_to_id[doc],
                "doc": doc,
                "old_name": next(c['nome'] for c in clientes if c['doc'] == doc),
                "new_name": best_name
            })
            
    # Salva sugestões para aprovação
    with open("scripts/name_corrections.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4, ensure_ascii=False)
    
    print("-" * 50)
    print(f"✅ {len(results)} correções sugeridas em 'scripts/name_corrections.json'.")
    print("Execute o script de atualização do Supabase após revisar.")

if __name__ == "__main__":
    main()
