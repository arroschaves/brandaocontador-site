"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Calculator, MessageCircle } from "lucide-react";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center mr-3 group-hover:bg-primary-600 transition-colors">
                <Calculator className="w-6 h-6 text-neutral-900" />
              </div>
              <span className="text-xl font-bold text-neutral-50 group-hover:text-primary-400 transition-colors">
                Brandão Contabilidade
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-8">
              <Link href="/" className="text-neutral-300 hover:text-primary-400 transition-colors font-medium">
                Início
              </Link>
              <Link href="/servicos" className="text-neutral-300 hover:text-primary-400 transition-colors font-medium">
                Serviços
              </Link>
              <Link href="/contato" className="text-neutral-300 hover:text-primary-400 transition-colors font-medium">
                Contato
              </Link>
              <Link href="/area-cliente" className="text-neutral-300 hover:text-primary-400 transition-colors font-medium">
                Área do Cliente
              </Link>
            </nav>
            <a
              href="https://wa.me/5567996011356"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </a>
          </div>

          <button
            className="md:hidden text-neutral-300 hover:text-primary-400 focus:outline-none focus:text-primary-400 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-neutral-800">
            <div className="px-4 pt-4 pb-6 space-y-2 bg-neutral-950/98">
              <Link
                href="/"
                className="text-neutral-300 hover:text-primary-400 hover:bg-neutral-900/50 block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              <Link
                href="/servicos"
                className="text-neutral-300 hover:text-primary-400 hover:bg-neutral-900/50 block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Serviços
              </Link>
              <Link
                href="/contato"
                className="text-neutral-300 hover:text-primary-400 hover:bg-neutral-900/50 block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
              </Link>
              <Link
                href="/area-cliente"
                className="text-neutral-300 hover:text-primary-400 hover:bg-neutral-900/50 block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Área do Cliente
              </Link>
              <div className="pt-4 border-t border-neutral-800">
                <a
                  href="https://wa.me/5567996011356"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full flex items-center justify-center"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Falar no WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;