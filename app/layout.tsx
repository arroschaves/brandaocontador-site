import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Brandão Contabilidade - Atualizado',
  description: 'Escritório de contabilidade em Sidrolândia - MS',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-green-900 text-white font-sans">
        <header className="p-6 bg-green-800 border-b border-yellow-400 flex justify-between items-center">
          <h1 className="text-yellow-400 font-bold text-xl">Brandão Contabilidade</h1>
          <nav className="space-x-4">
            <a href="/" className="hover:text-yellow-300">Início</a>
            <a href="/servicos" className="hover:text-yellow-300">Serviços</a>
            <a href="/contato" className="hover:text-yellow-300">Contato</a>
            <a href="/cliente/login" className="hover:text-yellow-300">Área do Cliente</a>
          </nav>
        </header>

        <main className="min-h-screen">{children}</main>

        <footer className="bg-green-800 border-t border-yellow-400 p-6 text-center">
          <p className="text-sm">&copy; 2025 Brandão Contabilidade - Todos os direitos reservados</p>
        </footer>
      </body>
    </html>
  );
}
