import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lista de IPs bloqueados (exemplo)
const BLOCKED_IPS: Set<string> = new Set([
  // Adicionar IPs problemáticos aqui
]);

// User agents problemáticos
const BLOCKED_USER_AGENTS = [
  'curl',
  'wget',
  'python',
  'scrapy',
  'bot',
  'spider',
  'crawler',
];

// Rate limiting simples
const requestCounts = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 100; // max requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    requestCounts.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (record.count >= RATE_LIMIT) {
    return true;
  }

  record.count++;
  return false;
}

function isBlockedUserAgent(userAgent: string): boolean {
  const lowerUA = userAgent.toLowerCase();
  return BLOCKED_USER_AGENTS.some(bad => lowerUA.includes(bad));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip para APIs internas e arquivos estáticos
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/webhooks') ||
    pathname.includes('.') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // 1. Verificar IP bloqueado
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             'unknown';

  if (BLOCKED_IPS.has(ip)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 2. Rate limiting
  if (isRateLimited(ip)) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Limit': String(RATE_LIMIT),
        'X-RateLimit-Remaining': '0',
      },
    });
  }

  // 3. Verificar User Agent
  const userAgent = request.headers.get('user-agent') || '';
  if (isBlockedUserAgent(userAgent)) {
    // Allow but log for monitoring
    console.log(`Suspicious user agent: ${userAgent} from IP: ${ip}`);
  }

  // 4. Adicionar headers de segurança adicionais
  const response = NextResponse.next();
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};