"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-obsidian border-b border-neutral-800">
      <div className="container-custom">
        <div className="flex justify-between items-center h-24">
          {/* Logo e Nome */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center group gap-4">
              <div className="relative">
                <img src="/logocirculo.png" alt="Brandão Contabilidade Logo" className="w-12 h-12 grayscale group-hover:grayscale-0 transition-all duration-500" />
                <div className="absolute inset-0 border border-amber-electric/20 group-hover:border-amber-electric transition-colors"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-display font-bold text-neutral-50 tracking-tight group-hover:text-amber-electric transition-colors">
                  BRANDÃO
                </span>
                <span className="mono-label !text-[10px]">EST. 1993 // DIGITAL ERA</span>
              </div>
            </Link>
          </div>

          {/* Menu */}
          <div className="hidden md:flex items-center gap-12">
            <nav className="flex items-center gap-8">
              {[
                { name: "Início", href: "/" },
                { name: "Serviços", href: "/servicos" },
                { name: "Contato", href: "/contato" },
                { name: "Portal", href: "/cliente/login" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="mono-label text-neutral-400 hover:text-amber-electric transition-colors relative group py-2"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-amber-electric transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </Link>
              ))}
            </nav>
            <a href="https://wa.me/5567996011356" target="_blank" className="btn-brutal !py-2 !px-6 text-sm">
              <MessageCircle className="w-4 h-4 mr-2" /> CONTATO_IMEDIATO
            </a>
          </div>

          <button className="md:hidden text-amber-electric" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-obsidian border-t border-neutral-800 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col p-8 gap-6">
            <Link href="/" className="mono-label text-xl">Início</Link>
            <Link href="/servicos" className="mono-label text-xl">Serviços</Link>
            <Link href="/contato" className="mono-label text-xl">Contato</Link>
            <Link href="/cliente/login" className="mono-label text-xl">Portal</Link>
            <a href="https://wa.me/5567996011356" target="_blank" className="btn-brutal w-full mt-4">
              WHATSAPP
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
export default Header;