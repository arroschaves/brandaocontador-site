import { NextRequest, NextResponse } from 'next/server';

/**
 * CSP Report Handler
 * Recebe relatórios de violações de Content Security Policy
 * Não expõe detalhes em produção
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Em desenvolvimento, logue os relatórios
    if (process.env.NODE_ENV !== 'production') {
      console.log('[CSP] Violação detectada:', JSON.stringify(body, null, 2));
    } else {
      // Em produção, você pode enviar para um serviço de monitoramento
      // como Sentry, DataDog, etc.
      console.warn('[CSP] Violação reportada:', {
        timestamp: new Date().toISOString(),
        // Não logue o body completo para evitar dados sensíveis
        hasReport: !!body['csp-report'],
      });
    }

    // Sempre retornar 204 (No Content) para o browser
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error('[CSP] Erro ao processar relatório:', error);
    return new NextResponse(null, { status: 204 });
  }
}