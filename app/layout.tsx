import { Metadata } from 'next'
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { SpeedInsights } from '@vercel/speed-insights/next'
import ClientWrapper from './components/ClientWrapper'
import ScrollReveal from './components/ScrollReveal'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: 'Brandão Contabilidade | Soluções Contábeis em Sidrolândia - MS',
  description: 'Mais de 30 anos de experiência em assessoria contábil, fiscal e pessoal. Especialistas em impulsionar seu negócio com estratégia e segurança.',
  keywords: 'contabilidade, contador, Sidrolândia, MS, fiscal, abertura de empresas, imposto de renda, Brandão Contabilidade',
  authors: [{ name: 'Brandão Contabilidade' }],
  openGraph: {
    title: 'Brandão Contabilidade | Sua Gestão em Boas Mãos',
    description: 'Soluções contábeis completas para empresas em Sidrolândia e região. Transformamos números em estratégias de crescimento.',
    url: 'https://www.brandaocontador.com.br',
    siteName: 'Brandão Contabilidade',
    images: [
      {
        url: 'https://www.brandaocontador.com.br/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Brandão Contabilidade Logo',
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
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased bg-obsidian text-neutral-200">
        <SpeedInsights />
        <ScrollReveal />
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  )
}
