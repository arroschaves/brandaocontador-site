# Caminho do projeto
$projectPath = "D:\PROJETOS\brandaocontador-next"

# Pasta public
$publicPath = Join-Path $projectPath "public"

Write-Host "Verificando arquivos públicos no projeto..." -ForegroundColor Cyan

# 1️⃣ Lista de todos arquivos na pasta public
$publicFiles = Get-ChildItem $publicPath -Recurse | ForEach-Object {
    $_.FullName.Replace($publicPath,"").Replace("\","/").TrimStart("/")
}

Write-Host "`nArquivos encontrados na pasta public:" -ForegroundColor Green
$publicFiles | ForEach-Object { Write-Host $_ }

# 2️⃣ Procurar todos src e href no código
Write-Host "`nProcurando arquivos referenciados no código..." -ForegroundColor Cyan

$codeFiles = Get-ChildItem $projectPath -Include *.tsx, *.ts, *.js, *.jsx -Recurse | Where-Object { $_.FullName -notmatch "\\node_modules\\" }

$referencedFiles = @()

foreach ($file in $codeFiles) {
    $content = Get-Content $file.FullName -Raw
    # Regex para src, href e import
    $matches = [regex]::Matches($content, '(?<=src=|href=|import .* from )["'']([^"'']+)["'']')
    foreach ($m in $matches) {
        $referencedFiles += $m.Groups[1].Value
    }
}

$referencedFiles = $referencedFiles | Sort-Object -Unique

Write-Host "`nArquivos referenciados no código:" -ForegroundColor Green
$referencedFiles | ForEach-Object { Write-Host $_ }

# 3️⃣ Verifica arquivos referenciados que não existem no public
Write-Host "`nArquivos referenciados que NÃO existem em public:" -ForegroundColor Red

foreach ($file in $referencedFiles) {
    if ($file.StartsWith("/")) {
        $relativePath = $file.TrimStart("/")
        if (-not ($publicFiles -contains $relativePath)) {
            Write-Host $file
        }
    }
}

Write-Host "`nVerificação concluída." -ForegroundColor Cyan
