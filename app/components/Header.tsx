"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, ChevronRight, Sun, Moon } from 'lucide-react';

/**
 * Header moderno — transparente que fica sólido no scroll.
 * Inclui toggle de dark mode e menu mobile com animação.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();

  // Detecta scroll para mudar estilo da navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Inicializa dark mode a partir do localStorage / sistema
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  // Alterna dark mode
  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  // Links do menu
  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Serviços', path: '/servicos' },
    { name: 'Agronegócio', path: '/agronegocio' },
    { name: 'Notícias', path: '/noticias-contabeis' },
    { name: 'Contato', path: '/contato' },
  ];

  // Verifica se está numa rota do admin — se sim, não renderiza o header público
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) return null;

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled
        ? 'bg-background/95 backdrop-blur-xl border-b border-border/60 shadow-sm'
        : 'bg-transparent'
      }`}>
        <div className="container-custom">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-primary/20 shadow-sm group-hover:shadow-glow-sm transition-all ">
                <Image
                  src="/logo-icon.jpg"
                  alt="Brandão Contabilidade"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-display font-bold text-foreground leading-none">Brandão</p>
                <p className="text-[10px] font-semibold text-primary tracking-wider uppercase">Contabilidade</p>
              </div>
            </Link>

            {/* Nav desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Ações */}
            <div className="flex items-center gap-3">
              {/* Toggle dark mode */}
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                aria-label="Alternar tema"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/5567996011356"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex btn-primary text-xs py-2.5 px-5"
              >
                <Phone className="w-3.5 h-3.5" />
                Fale Conosco
              </a>

              {/* Portal */}
              <Link href="/login" className="hidden md:inline-flex btn-secondary text-xs py-2.5 px-5">
                Portal
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>

              {/* Menu mobile */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-20 left-0 right-0 bg-background border-b border-border shadow-glass-lg animate-fade-in-down mx-4 rounded-2xl p-4">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <a href="https://wa.me/5567996011356" target="_blank" rel="noopener noreferrer" className="btn-primary text-xs py-2.5 px-4 flex-1 justify-center">
                <Phone className="w-3.5 h-3.5" /> WhatsApp
              </a>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-xs py-2.5 px-4 flex-1 justify-center">
                Portal <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}