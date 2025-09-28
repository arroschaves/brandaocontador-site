import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Brandão Contabilidade | Escritório Contábil em Sidrolândia-MS',
  description: 'Escritório de contabilidade especializado em empresários, produtores rurais e pessoas físicas em Sidrolândia-MS. Mais de 15 anos de experiência.',
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
      <body className={inter.className}>
        {children}
        
        {/* Footer Global */}
        <footer className="bg-slate-950 py-8 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <img src="/logocirculo.png" alt="Logo" className="h-12 w-12" />
                  <span className="text-xl font-bold text-yellow-500">Brandão Contabilidade</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Escritório de contabilidade com mais de 15 anos de experiência, 
                  especializado em soluções para empresários, produtores rurais e pessoas físicas.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Links Rápidos</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="/" className="hover:text-yellow-500 transition-colors">Início</a></li>
                  <li><a href="/servicos" className="hover:text-yellow-500 transition-colors">Serviços</a></li>
                  <li><a href="/contato" className="hover:text-yellow-500 transition-colors">Contato</a></li>
                  <li><a href="/cliente/login" className="hover:text-yellow-500 transition-colors">Área do Cliente</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Contato</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>(67) 3272-3266</li>
                  <li>(67) 99601-1356</li>
                  <li>adm@brandaocontador.com.br</li>
                  <li>Sidrolândia - MS</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
              <span>© {new Date().getFullYear()} Brandão Contabilidade. Todos os direitos reservados.</span>
              <span className="mt-2 md:mt-0">Desenvolvido com ❤️ em Next.js + Tailwind</span>
            </div>
          </div>
        </footer>
        
        <SpeedInsights />
      </body>
    </html>
  )
}
