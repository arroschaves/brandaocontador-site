"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800">
      <div className="container-custom">
        <div className="flex justify-between items-center h-20">
          {/* Logo e Nome bem à esquerda */}
          <div className="flex-shrink-0 mr-12">
            <Link href="/" className="flex items-center group">
              <img src="/logocirculo.png" alt="Brandão Contabilidade Logo" className="w-12 h-12 rounded-full mr-4 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold text-neutral-50 group-hover:text-primary-400 transition-colors">
                Brandão Contabilidade
              </span>
            </Link>
          </div>

          {/* Menu com mais espaçamento */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex items-center space-x-6 mr-6">
              <Link href="/" className="text-neutral-300 hover:text-primary-400 transition-colors font-medium">Início</Link>
              <Link href="/servicos" className="text-neutral-300 hover:text-primary-400 transition-colors font-medium">Serviços</Link>
              <Link href="/contato" className="text-neutral-300 hover:text-primary-400 transition-colors font-medium">Contato</Link>
              <Link href="/cliente/login" className="text-neutral-300 hover:text-primary-400 transition-colors font-medium">Área do Cliente</Link>
            </nav>
            <a href="https://wa.me/5567996011356" target="_blank" className="btn-primary flex items-center">
              <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
            </a>
          </div>

          <button className="md:hidden text-neutral-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </div>
  );
}
export default Header;