/**
 * Componente de SEO Avançado
 * Meta tags otimizadas para SEO
 */

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  noIndex?: boolean;
  keywords?: string[];
}

export function SEOHead({
  title,
  description,
  canonical,
  image = '/og-image.png',
  type = 'website',
  publishedTime,
  author,
  noIndex = false,
  keywords = [],
}: SEOProps) {
  const siteName = 'Brandão Contador';
  const fullTitle = `${title} | ${siteName}`;
  const url = canonical || 'https://brandaocontador.com.br';
  const fullImage = image.startsWith('http') ? image : `https://brandaocontador.com.br${image}`;

  const defaultKeywords = [
    'contador',
    'contabilidade',
    'serviços contábeis',
    'consultoria contábil',
    'escritório contábil',
    'Mato Grosso do Sul',
    'Campo Grande',
  ];

  const allKeywords = [...defaultKeywords, ...keywords].join(', ');

  return (
    <>
      {/* Title */}
      <title>{fullTitle}</title>

      {/* Basic Meta Tags */}
      <meta name="description" content={description.slice(0, 160)} />
      <meta name="keywords" content={allKeywords} />
      <meta name="author" content={author || siteName} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="language" content="Portuguese" />
      <meta name="revisit-after" content="7 days" />
      <meta name="geo.region" content="BR-MS" />
      <meta name="geo.placename" content="Campo Grande" />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description.slice(0, 200)} />
      <meta property="og:image" content={fullImage } />
      <meta property="og:site_name" content={siteName } />
      <meta property="og:locale" content="pt_BR" />

      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description.slice(0, 200)} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:creator" content="@brandaocontador" />

      {/* Additional SEO */}
      <meta name="theme-color" content="#FFB000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': type === 'article' ? 'Article' : 'Organization',
            name: siteName,
            url: 'https://brandaocontador.com.br',
            logo: 'https://brandaocontador.com.br/logo.png',
            description: description,
            sameAs: [
              'https://wa.me/5567996011356',
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+55-67-99601-1356',
              contactType: 'customer service',
              availableLanguage: 'Portuguese',
            },
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Campo Grande',
              addressRegion: 'MS',
              addressCountry: 'BR',
            },
            ...(type === 'article' && {
              headline: title,
              image: fullImage,
              datePublished: publishedTime,
              author: {
                '@type': 'Person',
                name: author || siteName,
              },
            }),
          }),
        }}
      />
    </>
  );
}

/**
 * Breadcrumb Schema
 */
export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
          })),
        }),
      }}
    />
  );
}

/**
 * FAQ Schema para SEO
 */
export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }),
      }}
    />
  );
}