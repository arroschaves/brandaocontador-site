import { Metadata, Viewport } from 'next'
import { Outfit, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { SpeedInsights } from '@vercel/speed-insights/next'
import ClientWrapper from './components/ClientWrapper'
import JsonLd from './components/JsonLd'
import { SecurityMeta } from './components/SecurityMeta'
import { Analytics, ErrorLogger } from './components/PerformanceMonitor'

// Google Analytics — configuração via env (NEXT_PUBLIC_GA_ID), com fallback
const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-9DJG24BV6D'

// Fontes modernas e premium
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFB000' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0B' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.brandaocontador.com.br'),
  title: {
    default: 'Brandão Contabilidade | Contabilidade em Sidrolândia - MS',
    template: '%s | Brandão Contabilidade',
  },
  description: 'Escritório de contabilidade em Sidrolândia - MS com atendimento para empresas, produtores rurais e rotinas fiscais, trabalhistas e societárias.',
  keywords: [
    'contabilidade em Sidrolândia',
    'contador em Sidrolândia MS',
    'escritório de contabilidade MS',
    'contabilidade para agronegócio',
    'departamento pessoal',
    'abertura de empresa',
    'Brandão Contabilidade',
    'serviços contábeis',
    'consultoria contábil',
    'fiscal',
    'trabalhista',
    'societário',
  ],
  authors: [{ name: 'Brandão Contabilidade' }],
  creator: 'Brandão Contabilidade',
  publisher: 'Brandão Contabilidade',
  formatDetection: {
    email: false,
    address: false,
    telephone: true,
  },
  alternates: {
    canonical: '/',
    languages: {
      'pt-BR': '/',
    },
  },
  openGraph: {
    title: 'Brandão Contabilidade | Contabilidade em Sidrolândia - MS',
    description: 'Atendimento contábil para empresas e agronegócio em Sidrolândia e região, com mais clareza fiscal, trabalhista e societária.',
    url: 'https://www.brandaocontador.com.br',
    siteName: 'Brandão Contabilidade',
    images: [
      {
        url: 'https://www.brandaocontador.com.br/api/og',
        width: 1200,
        height: 630,
        alt: 'Brandão Contabilidade',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brandão Contabilidade | Contabilidade em Sidrolândia - MS',
    description: 'Atendimento contábil para empresas, produtores rurais e rotinas fiscais em Sidrolândia e região.',
    images: ['https://www.brandaocontador.com.br/api/og'],
    creator: '@brandaocontador',
    site: '@brandaocontador',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'business',
  verification: {
    // Preencha no Vercel (NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION) e ajuste abaixo
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
}

// Schema.org Organization
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'AccountingService',
  name: 'Brandão Contabilidade',
  description: 'Serviços contábeis para empresas e agronegócio em Sidrolândia - MS',
  url: 'https://www.brandaocontador.com.br',
  logo: 'https://www.brandaocontador.com.br/logo-square.jpg',
  telephone: '+55-67-99601-1356',
  email: 'adm@brandaocontador.com.br',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Sidrolândia',
    addressRegion: 'MS',
    addressCountry: 'BR',
  },
  areaServed: {
    '@type': 'State',
    name: 'Mato Grosso do Sul',
  },
  sameAs: [
    'https://wa.me/5567996011356',
    'https://www.facebook.com/brandaocontador',
    'https://www.instagram.com/brandaocontador',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${dmSans.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        {/* Security Meta Tags */}
        <SecurityMeta />

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />

        {/* Script para evitar flash de tema incorreto */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch(e) {}
            })();
          `
        }} />

        {/* Preconnect para otimização */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* Google Analytics */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `
        }} />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        {/* SEO JSON-LD */}
        <JsonLd />

        {/* Performance - Speed Insights */}
        <SpeedInsights />

        {/* Analytics (client-side) */}
        <Analytics />
        <ErrorLogger />

        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  )
}