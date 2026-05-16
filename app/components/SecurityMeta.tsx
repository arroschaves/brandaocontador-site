/**
 * Componente de Meta Tags de Segurança
 * Adiciona meta tags de segurança ao head
 */

interface SecurityMetaProps {
  noIndex?: boolean;
}

export function SecurityMeta({ noIndex = false }: SecurityMetaProps) {
  return (
    <>
      {/* Basic Security Meta Tags */}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="format-detection" content="email=no" />

      {/* Robots - SEO Control */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
      )}

      {/* Open Graph - Social Media */}
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content="Brandão Contador" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />

      {/* Security Meta Tags */}
      <meta
        name="google-site-verification"
        content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || ''}
      />

      {/* CSP Report */}
      {process.env.NODE_ENV === 'production' && (
        <meta
          httpEquiv="Content-Security-Policy-Report-Only"
          content="default-src 'self'; report-uri /api/csp-report"
        />
      )}
    </>
  );
}

/**
 * Componente de Script de Segurança
 * Carrega scripts de forma segura
 */
export function SecurityScripts() {
  if (process.env.NODE_ENV !== 'production') return null;

  return (
    <>
      {/* Preconnect to trusted domains */}
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://analytics.google.com" />

      {/* Sentry Error Tracking (if configured) */}
      {process.env.NEXT_PUBLIC_SENTRY_DSN && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.SENTRY_DSN = "${process.env.NEXT_PUBLIC_SENTRY_DSN}";
              // Sentry initialization would go here
            `,
          }}
        />
      )}
    </>
  );
}

/**
 * Componente de Headers de Segurança para API
 */
export function ApiSecurityHeaders() {
  const headers = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };

  return null;
}