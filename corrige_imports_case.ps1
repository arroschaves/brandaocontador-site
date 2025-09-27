# Script: corrige_imports_case.ps1
# Corrige automaticamente imports com case errado para ./sections/AreaCliente, ./sections/Contato e ./sections/QuemSomos

Write-Host "🔎 Corrigindo imports com case-sensitive..."

$arquivos = Get-ChildItem -Recurse -Include *.tsx,*.ts,*.jsx,*.js

foreach ($arq in $arquivos) {
    (Get-Content $arq.PSPath) |
        ForEach-Object {
            $_ -replace "./sections/areacliente", "./sections/AreaCliente" `
               -replace "./sections/Areacliente", "./sections/AreaCliente" `
               -replace "./sections/contato", "./sections/Contato" `
               -replace "./sections/Contato", "./sections/Contato" `
               -replace "./sections/quemsomos", "./sections/QuemSomos" `
               -replace "./sections/Quemsomos", "./sections/QuemSomos"
        } | Set-Content $arq.PSPath
}

Write-Host "✅ Imports corrigidos!"
Write-Host "Agora execute: git add . ; git commit -m 'Corrige imports case-sensitive' ; git push origin main"
