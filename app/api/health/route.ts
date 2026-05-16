import { NextRequest, NextResponse } from 'next/server';

/**
 * Health Check API
 * Monitora status do sistema
 */

export async function GET(request: NextRequest) {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime?.() || 'N/A',
    version: process.env.npm_package_version || '0.2.0',
    region: process.env.VERCEL_REGION || 'local',
    checks: {
      api: { status: 'ok', latency: '0ms' },
      database: { status: 'unknown', latency: 'N/A' },
      email: { status: 'unknown', latency: 'N/A' },
    },
  };

  // Verificar configuração de email
  const smtpConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
  checks.checks.email = {
    status: smtpConfigured ? 'configured' : 'not_configured',
    latency: 'N/A',
  };

  // Verificar Supabase (sem expor credenciais)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  checks.checks.database = {
    status: supabaseUrl ? 'configured' : 'not_configured',
    latency: 'N/A',
  };

  return NextResponse.json(checks, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Health-Check': 'ok',
    },
  });
}

// HEAD para verificação rápida
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'X-Status': 'ok',
    },
  });
}