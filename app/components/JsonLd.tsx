/**
 * Componente JSON-LD para dados estruturados (Schema.org)
 * Melhora SEO com rich results no Google
 */
export default function JsonLd() {
    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'AccountingService',
                '@id': 'https://www.brandaocontador.com.br/#organization',
                name: 'Brandão Contabilidade',
                alternateName: 'Brandão Contador',
                url: 'https://www.brandaocontador.com.br',
                logo: 'https://www.brandaocontador.com.br/logo-wide.jpg',
                image: 'https://www.brandaocontador.com.br/api/og',
                description: 'Mais de 30 anos de experiência em assessoria contábil, fiscal e pessoal em Sidrolândia - MS. Especialistas em contabilidade rural e agronegócio.',
                foundingDate: '1993',
                telephone: '+55-67-99601-1356',
                email: 'adm@brandaocontador.com.br',
                address: {
                    '@type': 'PostalAddress',
                    streetAddress: 'Rua Santa Catarina, 1010',
                    addressLocality: 'Sidrolândia',
                    addressRegion: 'MS',
                    postalCode: '79170-000',
                    addressCountry: 'BR',
                },
                geo: {
                    '@type': 'GeoCoordinates',
                    latitude: -20.9391,
                    longitude: -54.9658,
                },
                openingHoursSpecification: [
                    {
                        '@type': 'OpeningHoursSpecification',
                        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                        opens: '07:30',
                        closes: '17:00',
                    },
                ],
                sameAs: [
                    'https://www.instagram.com/bcbrandaocontabilidade/',
                    'https://www.facebook.com/profile.php?id=61583096446223',
                ],
                areaServed: [
                    {
                        '@type': 'City',
                        name: 'Sidrolândia',
                        containedInPlace: {
                            '@type': 'State',
                            name: 'Mato Grosso do Sul',
                        },
                    },
                ],
                priceRange: '$$',
                hasOfferCatalog: {
                    '@type': 'OfferCatalog',
                    name: 'Serviços Contábeis',
                    itemListElement: [
                        {
                            '@type': 'Offer',
                            itemOffered: {
                                '@type': 'Service',
                                name: 'Planejamento Tributário',
                                description: 'Planejamento tributário estratégico dentro da conformidade legal.',
                            },
                        },
                        {
                            '@type': 'Offer',
                            itemOffered: {
                                '@type': 'Service',
                                name: 'Gestão de Departamento Pessoal',
                                description: 'Gestão inteligente de capital humano e obrigações trabalhistas.',
                            },
                        },
                        {
                            '@type': 'Offer',
                            itemOffered: {
                                '@type': 'Service',
                                name: 'Contabilidade Rural e Agronegócio',
                                description: 'Especialização em contabilidade rural e tributação de commodities.',
                            },
                        },
                        {
                            '@type': 'Offer',
                            itemOffered: {
                                '@type': 'Service',
                                name: 'Legalização de Empresas',
                                description: 'Abertura, alteração e encerramento de empresas. Estruturação societária.',
                            },
                        },
                    ],
                },
            },
            {
                '@type': 'WebSite',
                '@id': 'https://www.brandaocontador.com.br/#website',
                url: 'https://www.brandaocontador.com.br',
                name: 'Brandão Contabilidade',
                publisher: {
                    '@id': 'https://www.brandaocontador.com.br/#organization',
                },
                inLanguage: 'pt-BR',
            },
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
