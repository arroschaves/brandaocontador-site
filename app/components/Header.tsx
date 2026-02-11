"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, MessageCircle, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * Header Público — Brandão Contabilidade
 * Inclui botão condicional "Painel" para admins logados
 */
function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const role = user.user_metadata?.role || user.app_metadata?.role || 'client';
          const adminRoles = ['admin', 'staff', 'master'];
          setIsAdmin(adminRoles.includes(role));
        }
      } catch {
        // Silently fail - user is not logged in
      }
    }

    checkAdminStatus();
  }, []);

  const navItems = [
    { name: "Início", href: "/" },
    { name: "Serviços", href: "/servicos" },
    { name: "Agro", href: "/agronegocio" },
    { name: "Notícias", href: "/noticias-contabeis" },
    { name: "Reforma", href: "/reforma-tributaria" },
    { name: "Links", href: "/links-uteis" },
    { name: "Contato", href: "/contato" },
    { name: "Portal", href: "/login" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-obsidian border-b border-neutral-800">
      <div className="container-custom">
        <div className="flex justify-between items-center h-24">
          {/* Logo e Nome */}
          <div className="flex-shrink-0 flex items-center h-full">
            <Link href="/" className="flex items-center group h-full py-4 gap-6">
              <div className="relative h-full aspect-[4/3] flex items-center">
                <Image
                  src="/logo-full.jpg"
                  alt="Brandão Contabilidade Logo"
                  width={160}
                  height={120}
                  className="h-full w-auto contrast-125 brightness-110 group-hover:scale-105 transition-all duration-700 object-contain"
                />
              </div>
              <div className="hidden sm:flex flex-col border-l border-neutral-800 pl-6 h-10 justify-center">
                <span className="text-[10px] font-mono text-amber-electric tracking-[0.2em] uppercase">Evoluindo a Tradição</span>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Sidrolândia - MS // Est. 1993</span>
              </div>
            </Link>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-12">
            <nav className="flex items-center gap-8">
              {navItems.map((item) => (
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

            {/* Botão Admin Condicional */}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all text-xs font-mono uppercase tracking-widest"
                title="Acessar Painel Administrativo"
              >
                <Shield className="w-3.5 h-3.5" />
                Painel
              </Link>
            )}

            <a href="https://wa.me/5567996011356" target="_blank" rel="noopener noreferrer" className="btn-brutal !py-2 !px-6 text-sm" aria-label="Entrar em contato via WhatsApp">
              <MessageCircle className="w-4 h-4 mr-2" /> WHATSAPP
            </a>
          </div>

          <button
            className="md:hidden text-amber-electric"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-obsidian border-t border-neutral-800 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col p-8 gap-6">
            <Link href="/" className="mono-label text-xl" onClick={() => setIsMenuOpen(false)}>Início</Link>
            <Link href="/servicos" className="mono-label text-xl" onClick={() => setIsMenuOpen(false)}>Serviços</Link>
            <Link href="/agronegocio" className="mono-label text-xl" onClick={() => setIsMenuOpen(false)}>Painel Agro</Link>
            <Link href="/noticias-contabeis" className="mono-label text-xl" onClick={() => setIsMenuOpen(false)}>Notícias</Link>
            <Link href="/reforma-tributaria" className="mono-label text-xl" onClick={() => setIsMenuOpen(false)}>Reforma Tributária</Link>
            <Link href="/links-uteis" className="mono-label text-xl" onClick={() => setIsMenuOpen(false)}>Links Úteis</Link>
            <Link href="/contato" className="mono-label text-xl" onClick={() => setIsMenuOpen(false)}>Contato</Link>
            <Link href="/login" className="mono-label text-xl" onClick={() => setIsMenuOpen(false)}>Portal</Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-3 mono-label text-xl text-emerald-400"
                onClick={() => setIsMenuOpen(false)}
              >
                <Shield className="w-5 h-5" />
                Painel Admin
              </Link>
            )}

            <a href="https://wa.me/5567996011356" target="_blank" rel="noopener noreferrer" className="btn-brutal w-full mt-4">
              WHATSAPP
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
export default Header;