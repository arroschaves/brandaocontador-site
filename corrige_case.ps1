Write-Host "🔧 Corrigindo automaticamente problemas de case-sensitive..." -ForegroundColor Cyan

$baseDir = "F:\PROJETOS\brandaocontador-next\app"
$arquivos = Get-ChildItem -Path $baseDir -Recurse -Include *.tsx, *.ts

foreach ($arq in $arquivos) {
    $linhas = Get-Content $arq.FullName | Select-String -Pattern 'import .* from'
    foreach ($linha in $linhas) {
        if ($linha -match 'from\s+[\"''](.+)[\"'']') {
            $importPath = $Matches[1]

            if ($importPath -notmatch '^(react|next|@|/|https?:)') {
                $resolved = Join-Path $arq.DirectoryName $importPath

                # Testa com .tsx e .ts
                $possibilidades = @("$resolved.tsx", "$resolved.ts")
                $fileFound = $possibilidades | Where-Object { Test-Path $_ }

                if ($fileFound) {
                    $fileOnDisk = Get-Item $fileFound

                    $importDir = Split-Path $fileOnDisk.FullName -Parent
                    $importFile = Split-Path $fileOnDisk.FullName -Leaf

                    # Nome que o import espera (com case)
                    $importExpected = Split-Path $resolved -Leaf
                    $importExpectedFile = "$importExpected" + [IO.Path]::GetExtension($fileOnDisk.Name)

                    if ($importFile -ne $importExpectedFile) {
                        Write-Host "⚠ Corrigindo case:" $importFile "→" $importExpectedFile -ForegroundColor Yellow
                        Push-Location $importDir
                        git mv $importFile $importExpectedFile
                        Pop-Location
                    }
                }
            }
        }
    }
}

Write-Host "✅ Correção concluída. Agora faça:" -ForegroundColor Green
Write-Host "   git add ."
Write-Host "   git commit -m 'Corrigido case-sensitive automaticamente'"
Write-Host "   git push"
