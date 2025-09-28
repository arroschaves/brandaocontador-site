import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Header from './components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Brandão Contabilidade | Escritório Contábil em Sidrolândia-MS',
  description: 'Escritório de contabilidade especializado em empresários, produtores rurais e pessoas físicas em Sidrolândia-MS. Tradição e confiança desde 1992.',
  keywords: 'contabilidade, sidrolandia, ms, escritorio contabil, imposto de renda, abertura empresa, contabilidade rural',
  authors: [{ name: 'Brandão Contabilidade' }],
  openGraph: {
    title: 'Brandão Contabilidade | Escritório Contábil em Sidrolândia-MS',
    description: 'Escritório de contabilidade especializado em empresários, produtores rurais e pessoas físicas em Sidrolândia-MS.',
    url: 'https://brandaocontador.com.br',
    siteName: 'Brandão Contabilidade',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased`}>
        <SpeedInsights />
        <Header />
        <main className="pt-16">
          {children}
        </main>
        <footer className="bg-neutral-950 text-neutral-100 py-16">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4 text-primary-400">Brandão Contabilidade</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Soluções contábeis completas e personalizadas para o seu negócio prosperar com segurança e eficiência.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-neutral-200">Serviços</h4>
                <ul className="space-y-2 text-neutral-400">
                  <li className="hover:text-primary-400 transition-colors cursor-pointer">Contabilidade Empresarial</li>
                  <li className="hover:text-primary-400 transition-colors cursor-pointer">Planejamento Tributário</li>
                  <li className="hover:text-primary-400 transition-colors cursor-pointer">Consultoria Fiscal</li>
                  <li className="hover:text-primary-400 transition-colors cursor-pointer">Abertura de Empresas</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-neutral-200">Contato</h4>
                <ul className="space-y-2 text-neutral-400">
                  <li>Campo Grande, MS</li>
                  <li className="hover:text-primary-400 transition-colors cursor-pointer">(67) 99601-1356</li>
                  <li className="hover:text-primary-400 transition-colors cursor-pointer">contato@brandaocontabilidade.com</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-neutral-200">Redes Sociais</h4>
                <div className="flex space-x-4">
                  <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors">
                    Facebook
                  </a>
                  <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors">
                    Instagram
                  </a>
                </div>
              </div>
            </div>
            <div className="border-t border-neutral-800 mt-12 pt-8 text-center text-neutral-400">
              <p>&copy; 2024 Brandão Contabilidade. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
