import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  <title>Brandão Contabilidade - Atualizado</title>
  description: 'Escritório de contabilidade em Sidrolândia - MS',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-brandBlack text-white font-sans">
        <header className="p-6 bg-brandBlack border-b border-brandGold flex justify-between items-center">
          <h1 className="text-brandGold font-bold text-xl">Brandão Contabilidade</h1>
          <nav className="space-x-4">
            <a href="/" className="hover:text-brandGold">Início</a>
            <a href="/servicos" className="hover:text-brandGold">Serviços</a>
            <a href="/contato" className="hover:text-brandGold">Contato</a>
            <a href="/cliente/login" className="hover:text-brandGold">Área do Cliente</a>
          </nav>
        </header>
        <main className="min-h-screen">{children}</main>
        <footer className="bg-brandBlack border-t border-brandGold p-6 text-center">
          <p className="text-sm">&copy; 2025 Brandão Contabilidade - Todos os direitos reservados</p>
        </footer>
      </body>
    </html>
  );
}