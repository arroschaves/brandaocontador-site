import { Metadata } from 'next'
import { Outfit, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { SpeedInsights } from '@vercel/speed-insights/next'
import ClientWrapper from './components/ClientWrapper'
import JsonLd from './components/JsonLd'

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

export const metadata: Metadata = {
  metadataBase: new URL('https://www.brandaocontador.com.br'),
  title: 'Brandão Contabilidade | Contabilidade em Sidrolândia - MS',
  description: 'Escritório de contabilidade em Sidrolândia - MS com atendimento para empresas, produtores rurais e rotinas fiscais, trabalhistas e societárias.',
  keywords: 'contabilidade em Sidrolândia, contador em Sidrolândia MS, escritório de contabilidade MS, contabilidade para agronegócio, departamento pessoal, abertura de empresa, Brandão Contabilidade',
  authors: [{ name: 'Brandão Contabilidade' }],
  alternates: {
    canonical: '/',
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
    locale: 'pt-BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brandão Contabilidade | Contabilidade em Sidrolândia - MS',
    description: 'Atendimento contábil para empresas, produtores rurais e rotinas fiscais em Sidrolândia e região.',
    images: ['https://www.brandaocontador.com.br/api/og'],
  },
  robots: {
    index: true,
    follow: true,
  },
  category: 'business',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${dmSans.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
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
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <JsonLd />
        <SpeedInsights />
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  )
}
