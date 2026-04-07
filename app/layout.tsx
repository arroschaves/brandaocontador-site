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
  title: 'Brandão Contabilidade | Soluções Contábeis em Sidrolândia - MS',
  description: 'Mais de 30 anos de experiência em assessoria contábil, fiscal e pessoal. Especialistas em impulsionar seu negócio com estratégia e segurança.',
  keywords: 'contabilidade, contador, Sidrolândia, MS, fiscal, abertura de empresas, imposto de renda, Brandão Contabilidade, agronegócio',
  authors: [{ name: 'Brandão Contabilidade' }],
  openGraph: {
    title: 'Brandão Contabilidade | Sua Gestão em Boas Mãos',
    description: 'Soluções contábeis completas para empresas em Sidrolândia e região. Transformamos números em estratégias de crescimento.',
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
  robots: {
    index: true,
    follow: true,
  },
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
