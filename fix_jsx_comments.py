#!/usr/bin/env python3
"""
Script para corrigir comentários JSX com espaços extras.
Corrige: {/* ... */ } → {/* ... */}
"""

import re
import sys

def fix_jsx_comments(filepath):
    """Corrige comentários JSX com espaços extras antes do }"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Padrão: {/* qualquer coisa */ } (com espaço antes do })
    # Substituir por: {/* qualquer coisa */}
    pattern = r'\{\s*/\*(.+?)\*/\s+\}'
    fixed_content = re.sub(pattern, r'{/*\1*/}', content)
    
    # Contar quantas correções foram feitas
    original_matches = re.findall(pattern, content)
    num_fixes = len(original_matches)
    
    if num_fixes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        print(f"✅ Corrigidos {num_fixes} comentários JSX em {filepath}")
        for match in original_matches:
            print(f"   - {match.strip()}")
    else:
        print(f"✅ Nenhum comentário JSX com erro encontrado em {filepath}")
    
    return num_fixes

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python fix_jsx_comments.py <arquivo.tsx>")
        sys.exit(1)
    
    filepath = sys.argv[1]
    fix_jsx_comments(filepath)
