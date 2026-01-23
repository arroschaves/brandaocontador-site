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
          <div className="flex-shrink-0 flex items-center h-full">
            <Link href="/" className="flex items-center group h-full py-4 gap-6">
              <div className="relative h-full aspect-[4/3] flex items-center">
                <img
                  src="/logo-full.jpg"
                  alt="Brandão Contabilidade Logo"
                  className="h-full w-auto grayscale contrast-125 brightness-110 group-hover:grayscale-0 transition-all duration-700 object-contain"
                />
              </div>
              <div className="hidden sm:flex flex-col border-l border-neutral-800 pl-6 h-10 justify-center">
                <span className="mono-label !text-[10px] !text-amber-electric animate-pulse">TERMINAL // ONLINE</span>
                <span className="mono-label !text-[10px] !text-neutral-600">SIDROLÂNDIA_MS // EST. 1993</span>
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