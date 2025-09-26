# Caminho do projeto
$projectPath = "D:\PROJETOS\brandaocontador-next"
$appPath = Join-Path $projectPath "app"

Write-Host "Verificando rotas e case-sensitive no app/..." -ForegroundColor Cyan

# 1️⃣ Rotas reais (folders com page.tsx)
$routeFolders = Get-ChildItem $appPath -Recurse -Directory | Where-Object {
    Test-Path (Join-Path $_.FullName "page.tsx")
}

$expectedRoutes = @()
foreach ($folder in $routeFolders) {
    $relativePath = $folder.FullName.Replace($appPath,"").Replace("\","/").TrimStart("/")
    $expectedRoutes += "/" + $relativePath
}

if (Test-Path (Join-Path $appPath "page.tsx")) { $expectedRoutes += "/" }
$expectedRoutes = $expectedRoutes | Sort-Object

Write-Host "`nRotas esperadas pelo Next.js:" -ForegroundColor Green
$expectedRoutes | ForEach-Object { Write-Host $_ }

# 2️⃣ Import de componentes dentro de app/
$codeFiles = Get-ChildItem $appPath -Include *.tsx, *.ts -Recurse
$componentImports = @()

foreach ($file in $codeFiles) {
    $content = Get-Content $file.FullName -Raw
    # Regex para import de componentes locais
    $matches = [regex]::Matches($content, "from ['""](\./.+?)['""]")
    foreach ($m in $matches) {
        $componentImports += $m.Groups[1].Value
    }
}

$componentImports = $componentImports | Sort-Object -Unique

Write-Host "`nComponentes importados:" -ForegroundColor Cyan
$componentImports | ForEach-Object { Write-Host $_ }

# 3️⃣ Verifica se os componentes existem (case-sensitive)
Write-Host "`nVerificando arquivos existentes e possíveis problemas de case..." -ForegroundColor Cyan

foreach ($import in $componentImports) {
    $fullPathTsx = Join-Path $appPath ($import -replace "/","\") + ".tsx"
    $fullPathIndex = Join-Path $appPath ($import -replace "/","\") + "\index.tsx"

    if (-not (Test-Path $fullPathTsx) -and -not (Test-Path $fullPathIndex)) {
        Write-Host "⚠ Arquivo não encontrado ou case errado: $import"
        Write-Host "Sugestão Git: git mv caminho_atual $import" -ForegroundColor Yellow
    }
}

Write-Host "`nVerificação completa. Corrija os arquivos indicados antes de redeploy no Vercel." -ForegroundColor Green
