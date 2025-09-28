'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-slate-900/95 backdrop-blur-sm text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center">
          <div className="h-14 w-14 rounded-full overflow-hidden bg-white border-2 border-gray-200">
            <img
              src="/logo-square.jpg"
              alt="Logo Brandão Contabilidade"
              className="h-14 w-14 object-cover scale-150"
            />
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex space-x-6 text-sm font-medium">
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
          <a
            href="https://wa.me/5567996011356"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-300 text-sm"
          >
            WhatsApp
          </a>
        </div>

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
            <a
              href="https://wa.me/5567996011356"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-300 text-center mt-2"
              onClick={() => setIsMenuOpen(false)}
            >
              WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}