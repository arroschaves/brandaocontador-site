Write-Host "🔎 Verificando imports em arquivos .tsx/.ts..." -ForegroundColor Cyan

$baseDir = "F:\PROJETOS\brandaocontador-next\app"
$arquivos = Get-ChildItem -Path $baseDir -Recurse -Include *.tsx, *.ts

foreach ($arq in $arquivos) {
    $linhas = Get-Content $arq.FullName | Select-String -Pattern 'import .* from'
    foreach ($linha in $linhas) {
        if ($linha -match 'from\s+[\"''](.+)[\"'']') {
            $importPath = $Matches[1]

            # Ignora imports de bibliotecas (react, next, etc.)
            if ($importPath -notmatch '^(react|next|@|/|https?:)') {
                $resolved = Join-Path $arq.DirectoryName $importPath

                # Adiciona extensão caso não tenha
                if (-not (Test-Path $resolved)) {
                    $resolvedTsx = "$resolved.tsx"
                    $resolvedTs = "$resolved.ts"
                    if (-not (Test-Path $resolvedTsx) -and -not (Test-Path $resolvedTs)) {
                        Write-Host "⚠ Import inválido:" $importPath "no arquivo:" $arq.FullName -ForegroundColor Yellow
                    }
                }
            }
        }
    }
}

Write-Host "✅ Verificação concluída!" -ForegroundColor Green
