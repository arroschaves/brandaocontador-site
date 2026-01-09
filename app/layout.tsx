"use client";

import { Inter } from 'next/font/google'
import './globals.css'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Header from './components/Header'
import { usePathname } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Esconde o header do site principal se estiver no admin
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased`}>
        <SpeedInsights />
        {!isAdmin && <Header />}
        <main className={!isAdmin ? "pt-16" : ""}>
          {children}
        </main>
      </body>
    </html>
  )
}