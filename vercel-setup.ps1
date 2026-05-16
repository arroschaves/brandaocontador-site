# ============================================
# Script de Configuração - Vercel
# ============================================
# Execute este script para configurar as variáveis de ambiente no Vercel
# Requer: Vercel CLI installed (npm i -g vercel)
# ============================================

Write-Host "`n=== CONFIGURANDO VARIÁVEIS NO VERCEL ===" -ForegroundColor Yellow

# Verificar se está logado na Vercel
Write-Host "`n1. Verificando autenticação..." -ForegroundColor Cyan
vercel link --yes 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Precisa fazer login na Vercel primeiro:" -ForegroundColor Red
    Write-Host "   vercel login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Conectado ao projeto Vercel" -ForegroundColor Green

# Variáveis para configurar
$envVars = @(
    @{Name="NEXT_PUBLIC_SUPABASE_URL"; Value="https://ycgwmwmcyxwflkaehwds.supabase.co"; Description="URL do Supabase"},
    @{Name="NEXT_PUBLIC_SUPABASE_ANON_KEY"; Value="SUA_CHAVE_AQUI"; Description="Chave pública do Supabase"},
    @{Name="SMTP_HOST"; Value="smtp.gmail.com"; Description="Servidor SMTP"},
    @{Name="SMTP_PORT"; Value="587"; Description="Porta SMTP"},
    @{Name="SMTP_USER"; Value="SEU_EMAIL@gmail.com"; Description="Usuário SMTP"},
    @{Name="SMTP_PASS"; Value="SUA_SENHA_APP"; Description="Senha SMTP (app password)"},
    @{Name="GEMINI_API_KEY"; Value=""; Description="API Key do Google Gemini (se usada)"},
    @{Name="EVOLUTION_API_URL"; Value="https://evolution.brandaocontador.com.br"; Description="URL da Evolution API"},
    @{Name="EVOLUTION_API_KEY"; Value="SUA_CHAVE"; Description="API Key da Evolution"},
    @{Name="EVOLUTION_INSTANCE"; Value="escritorioatendimento"; Description="Instância Evolution"},
    @{Name="NEXT_PUBLIC_SENTRY_DSN"; Value=""; Description="DSN do Sentry (opcional)"},
    @{Name="NEXT_PUBLIC_GA_ID"; Value=""; Description="Google Analytics ID (opcional)"}
)

Write-Host "`n2. Variáveis para configurar no painel Vercel:" -ForegroundColor Cyan
Write-Host "   Acesse: https://vercel.com/brandaocontador-site/settings/environment-variables`n" -ForegroundColor Yellow

foreach ($var in $envVars) {
    Write-Host "   - $($var.Name): $($var.Description)" -ForegroundColor White
}

Write-Host "`n3. Para configurar via CLI:" -ForegroundColor Cyan
Write-Host "   vercel env add [NOME] production`n" -ForegroundColor Yellow

Write-Host "`n4. Após configurar, faça o deploy:" -ForegroundColor Cyan
Write-Host "   vercel --prod`n" -ForegroundColor Yellow

Write-Host "=== CONFIGURAÇÃO DO VERCEL CONCLUÍDA ===" -ForegroundColor Green