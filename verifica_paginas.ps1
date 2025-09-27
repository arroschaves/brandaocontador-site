Write-Host "🔎 Verificando estrutura de rotas no app/...`n"

# Caminho base
$base = "app"

# Listar todos os arquivos page.tsx
$pages = Get-ChildItem -Path $base -Recurse -Filter "page.tsx"

Write-Host "📂 Páginas encontradas no projeto:"
foreach ($p in $pages) {
    $relative = $p.FullName.Substring((Get-Location).Path.Length + 1)
    Write-Host " - $relative"
}

# Rotas esperadas
$rotasEsperadas = @(
    "/",
    "/contato",
    "/servicos",
    "/cliente/login"
)

Write-Host "`n✅ Rotas esperadas:"
$rotasEsperadas | ForEach-Object { Write-Host " - $_" }

# Construir rotas encontradas a partir dos page.tsx
$rotasEncontradas = @()
foreach ($p in $pages) {
    $relativePath = $p.FullName.Substring((Get-Location).Path.Length + 1)
    $rota = $relativePath -replace "^app", "" -replace "page.tsx$", "" -replace "\\", "/"
    if ($rota -eq "/") {
        $rotasEncontradas += "/"
    } else {
        $rotasEncontradas += $rota.TrimEnd("/")
    }
}

Write-Host "`n📌 Rotas encontradas no código:"
$rotasEncontradas | ForEach-Object { Write-Host " - $_" }

# Verificar rotas faltantes
$faltando = $rotasEsperadas | Where-Object { $_ -notin $rotasEncontradas }
if ($faltando.Count -gt 0) {
    Write-Host "`n⚠️ Rotas faltando:"
    $faltando | ForEach-Object { Write-Host " - $_" }
} else {
    Write-Host "`n🎉 Todas as rotas esperadas foram encontradas!"
}
