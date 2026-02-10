#!/usr/bin/env python3
"""
Remove COMPLETAMENTE o PendenciaModal do page.tsx
"""

import re

filepath = "app/admin/clientes/[id]/page.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Remover o bloco do PendenciaModal (linhas 1140-1151 aproximadamente)
# Procurar o padrão: {/* Modal de Pendência */} até </PendenciaModal> ou />
pattern = r'\s*\{/\*\s*Modal de Pendência\s*\*/\s*\}\s*<PendenciaModal[\s\S]*?/>'

content_fixed = re.sub(pattern, '', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content_fixed)

print("✅ PendenciaModal removido completamente do arquivo")
