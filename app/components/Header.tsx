'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-slate-900/95 backdrop-blur-sm text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center space-x-3">
          <img
            src="/logocirculo.png"
            alt="Logo Brandão Contabilidade"
            className="h-12 w-12"
          />
          <h1 className="text-xl font-bold text-yellow-500">Brandão Contabilidade</h1>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 text-sm font-medium">
          <Link href="/" className="hover:text-yellow-500 transition-colors">
            Início
          </Link>
          <Link href="/servicos" className="hover:text-yellow-500 transition-colors">
            Serviços
          </Link>
          <Link href="/contato" className="hover:text-yellow-500 transition-colors">
            Contato
          </Link>
          <Link href="/cliente/login" className="hover:text-yellow-500 transition-colors">
            Área do Cliente
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <nav className="flex flex-col space-y-2 p-4">
            <Link 
              href="/" 
              className="hover:text-yellow-500 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Início
            </Link>
            <Link 
              href="/servicos" 
              className="hover:text-yellow-500 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Serviços
            </Link>
            <Link 
              href="/contato" 
              className="hover:text-yellow-500 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contato
            </Link>
            <Link 
              href="/cliente/login" 
              className="hover:text-yellow-500 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Área do Cliente
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}