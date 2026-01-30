import os
import xml.etree.ElementTree as ET
import glob

# CPFs que sobraram
TARGETS = [
    "13950835172", "00493588809", "98289497172", "378723111", 
    "25783890120", "23741937134", "36778877120"
]

def clean_doc(doc):
    if not doc: return ""
    return doc.replace('.','').replace('-','').replace('/','').strip()

def scan():
    found = {}
    path = r"C:\AuxilioNFe\NFE"
    print(f"🔍 Escaneando exaustivamente {path}...")
    
    files = glob.glob(os.path.join(path, "**/*.xml"), recursive=True)
    
    for f in files:
        try:
            tree = ET.parse(f)
            root = tree.getroot()
            # Tenta encontrar qualquer menção aos documentos alvo
            for elem in root.iter():
                text = (elem.text or "").strip()
                if text in TARGETS:
                    # Achou o doc! Agora tenta achar o nome próximo (pai ou vizinho)
                    # Normalmente está em <emit> ou <dest>
                    parent = None
                    # Sobe até achar emit ou dest
                    # Simplificando: busca xNome no arquivo todo e associa se estiver no mesmo bloco
                    pass
            
            # Abordagem 2: Busca estruturada em todo o XML
            ns = {'nfe': 'http://www.portalfiscal.inf.br/nfe'}
            for block in root.findall('.//nfe:emit', ns) + root.findall('.//nfe:dest', ns):
                cnpj = block.find('nfe:CNPJ', ns)
                cpf = block.find('nfe:CPF', ns)
                nome = block.find('nfe:xNome', ns)
                
                doc = clean_doc(cnpj.text if cnpj is not None else (cpf.text if cpf is not None else None))
                if doc in TARGETS and nome is not None:
                    found[doc] = nome.text.strip().upper()
        except:
            continue
            
    print("\n✅ RESULTADOS:")
    for doc, name in found.items():
        print(f"Doc: {doc} -> {name}")

if __name__ == "__main__":
    scan()
