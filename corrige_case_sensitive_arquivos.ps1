# Caminho do projeto
$projectPath = "D:\PROJETOS\brandaocontador-next"
$appPath = Join-Path $projectPath "app"

Write-Host "Corrigindo case-sensitive de arquivos individuais no app/sections..." -ForegroundColor Cyan

# 1️⃣ Lista todos os arquivos .tsx e .ts no app/
$allFiles = Get-ChildItem $appPath -Recurse -Include *.tsx, *.ts

# 2️⃣ Procura todos os imports locais de componentes
$codeFiles = $allFiles
$componentImports = @()

foreach ($file in $codeFiles) {
    $content = Get-Content $file.FullName -Raw
    $matches = [regex]::Matches($content, "from ['""](\./sections/.+?)['""]")
    foreach ($m in $matches) {
        $componentImports += [PSCustomObject]@{
            ImportPath = $m.Groups[1].Value
            FilePath = $file.FullName
        }
    }
}

$componentImports = $componentImports | Sort-Object ImportPath -Unique

# 3️⃣ Verifica e corrige case-sensitive
foreach ($import in $componentImports) {
    $importRelative = $import.ImportPath -replace "./sections/",""
    $expectedFile = Join-Path $appPath "sections\$importRelative.tsx"

    # Procurar arquivo existente ignorando case
    $foundFile = Get-ChildItem (Join-Path $appPath "sections") | Where-Object { $_.Name.ToLower() -eq ($importRelative.ToLower() + ".tsx") }

    if ($foundFile) {
        if ($foundFile.FullName -ne $expectedFile) {
            Write-Host "⚠ Corrigindo case: $($foundFile.Name) → $($expectedFile)" -ForegroundColor Yellow
            git mv $foundFile.FullName $expectedFile
        }
    } else {
        Write-Host "❌ Arquivo não encontrado: $expectedFile" -ForegroundColor Red
    }
}

Write-Host "`nCorreção de case-sensitive concluída. Faça commit e push antes do redeploy no Vercel." -ForegroundColor Green
