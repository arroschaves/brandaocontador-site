'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Phone, X, MessageCircle } from 'lucide-react';

interface WhatsAppMessage {
  path: string;
  message: string;
  label: string;
}

const contextualMessages: WhatsAppMessage[] = [
  { path: '/', message: 'Olá! Vim pelo site e gostaria de saber mais sobre os serviços da Brandão Contabilidade.', label: 'Início' },
  { path: '/sobre', message: 'Olá! Vi a história de vocês no site e gostaria de conhecer mais sobre os serviços.', label: 'Sobre' },
  { path: '/servicos', message: 'Olá! Vi os serviços no site e gostaria de um orçamento para minha empresa.', label: 'Serviços' },
  { path: '/ferramentas', message: 'Olá! Usei as calculadoras do site e gostaria de uma análise mais detalhada.', label: 'Ferramentas' },
  { path: '/agronegocio', message: 'Olá! Sou produtor rural e vi que vocês atendem agronegócio. Gostaria de saber mais.', label: 'Agronegócio' },
  { path: '/noticias-contabeis', message: 'Olá! Vi as notícias contábeis no site e gostaria de um orientação.', label: 'Notícias' },
  { path: '/reforma-tributaria', message: 'Olá! Vi sobre a Reforma Tributária no site e gostaria de saber como impacta minha empresa.', label: 'Reforma Tributária' },
  { path: '/contato', message: 'Olá! Vim pelo site e gostaria de entrar em contato com a Brandão Contabilidade.', label: 'Contato' },
];

export default function WhatsAppFloat() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<WhatsAppMessage>(contextualMessages[0]);

  useEffect(() => {
    // Encontrar mensagem contextual baseada no pathname
    const message = contextualMessages.find(m => m.path === pathname) || contextualMessages[0];
    setCurrentMessage(message);

    // Mostrar botão após scroll
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const whatsappUrl = `https://wa.me/5567996011356?text=${encodeURIComponent(currentMessage.message)}`;

  if (!isVisible) return null;

  return (
    <>
      {/* Botão principal */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          aria-label="Abrir WhatsApp"
        >
          {/* Animação de pulso */}
          <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20" />
          
          {isOpen ? (
            <X className="w-6 h-6 relative z-10" />
          ) : (
            <MessageCircle className="w-6 h-6 relative z-10" />
          )}
        </button>
      </div>

      {/* Card de mensagem */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 animate-fade-in-up">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="bg-emerald-500 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Brandão Contabilidade</p>
                  <p className="text-xs text-emerald-100">Online — Respondemos em minutos</p>
                </div>
              </div>
            </div>

            {/* Mensagem contextual */}
            <div className="p-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {currentMessage.message}
                </p>
                <p className="text-[10px] text-gray-400 mt-2 text-right">Agora</p>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Clique no botão abaixo para falar conosco pelo WhatsApp:
              </p>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl transition-colors"
              >
                <Phone className="w-4 h-4" />
                Iniciar Conversa
              </a>
            </div>

            {/* Footer */}
            <div className="px-4 pb-3">
              <p className="text-[10px] text-gray-400 text-center">
                Seg - Sex: 07:30 às 17:30 • Sidrolândia - MS
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
