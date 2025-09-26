# Caminho do projeto
$projectPath = "D:\PROJETOS\brandaocontador-next"
$appPath = Join-Path $projectPath "app"

Write-Host "Verificando pastas e arquivos de rotas no app/..." -ForegroundColor Cyan

# 1️⃣ Listar todas as pastas que deveriam conter page.tsx
$routeFolders = Get-ChildItem $appPath -Recurse -Directory | Where-Object {
    Test-Path (Join-Path $_.FullName "page.tsx")
}

# 2️⃣ Criar lista de rotas esperadas
$expectedRoutes = @()
foreach ($folder in $routeFolders) {
    # Converte caminho para rota web
    $relativePath = $folder.FullName.Replace($appPath, "").Replace("\","/").TrimStart("/")
    $expectedRoutes += "/" + $relativePath
}

# A rota da home (app/page.tsx)
if (Test-Path (Join-Path $appPath "page.tsx")) {
    $expectedRoutes += "/"
}

$expectedRoutes = $expectedRoutes | Sort-Object

Write-Host "`nRotas esperadas pelo Next.js:" -ForegroundColor Green
$expectedRoutes | ForEach-Object { Write-Host $_ }

# 3️⃣ Arquivos referenciados no código que são acessados como rota
$codeFiles = Get-ChildItem $projectPath -Include *.tsx, *.ts, *.js, *.jsx -Recurse | Where-Object { $_.FullName -notmatch "\\node_modules\\" }

$referencedRoutes = @()
foreach ($file in $codeFiles) {
    $content = Get-Content $file.FullName -Raw
    # Regex para rotas (começam com /)
    $matches = [regex]::Matches($content, '["''](/[^"'']+)["'']')
    foreach ($m in $matches) {
        $referencedRoutes += $m.Groups[1].Value
    }
}

$referencedRoutes = $referencedRoutes | Sort-Object -Unique

Write-Host "`nRotas referenciadas no código:" -ForegroundColor Cyan
$referencedRoutes | ForEach-Object { Write-Host $_ }

# 4️⃣ Verificar rotas referenciadas que não existem
Write-Host "`nRotas referenciadas que NÃO existem no app/:" -ForegroundColor Red
foreach ($route in $referencedRoutes) {
    if (-not ($expectedRoutes -contains $route)) {
        Write-Host $route
    }
}

Write-Host "`nVerificação de rotas concluída." -ForegroundColor Cyan
