"use client";

import Header from './Header';
import Footer from './Footer';
import ScrollReveal from './ScrollReveal';
import WhatsAppFloat from './WhatsAppFloat';
import { usePathname } from 'next/navigation';

/**
 * Wrapper de cliente que envolve o conteúdo com Header, Footer e ScrollReveal.
 * Esconde Header/Footer em rotas admin e login.
 */
export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = pathname?.startsWith('/api/og');

  return (
    <>
      {!hideChrome && <Header />}
      <ScrollReveal />
      {children}
      {!hideChrome && <Footer />}
      {!hideChrome && <WhatsAppFloat />}
    </>
  );
}
