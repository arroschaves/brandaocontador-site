'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Página de Contato — Brandão Contabilidade
 * Formulário funcional com envio via API + notificação WhatsApp
 */

// Tipo para o estado do formulário
type FormStatus = 'idle' | 'sending' | 'success' | 'error';

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setErrorMessage(data.error || 'Erro ao enviar mensagem.');
        return;
      }

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Resetar status após 8 segundos
      setTimeout(() => setStatus('idle'), 8000);

    } catch {
      setStatus('error');
      setErrorMessage('Erro de conexão. Verifique sua internet e tente novamente.');
    }
  }

  return (
    <div className="bg-obsidian text-neutral-100 min-h-screen pt-24">
      {/* Header Section */}
      <section className="py-20 border-b border-neutral-800">
        <div className="container-custom">
          <div className="flex items-center gap-4 mb-6">
            <span className="w-12 h-[1px] bg-amber-electric"></span>
            <span className="text-xs font-mono text-amber-electric tracking-[0.4em] uppercase">Canais de Atendimento</span>
          </div>
          <h1 className="mb-6 text-reveal active leading-tight">
            FALE <span className="text-amber-electric italic font-display">CONOSCO</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-3xl mb-8 leading-relaxed font-sans">
            Sua empresa merece um atendimento de excelência. Conecte-se aos nossos especialistas através dos nossos canais oficiais.
          </p>
        </div>
      </section>

      {/* Contato e Formulário */}
      <section className="py-24">
        <div className="container-custom grid lg:grid-cols-2 gap-20 items-start">

          {/* Informações de Contato */}
          <div className="space-y-16">
            <div>
              <h2 className="mb-8 text-4xl font-display italic uppercase tracking-tighter">Nossos Canais</h2>
              <p className="text-neutral-400 mb-12 leading-relaxed font-sans text-lg border-l-2 border-amber-electric/20 pl-6">
                Equipe preparada para processar suas demandas com a solidez de 30 anos e a agilidade da era digital.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              {[
                { icon: Phone, title: "Telefone", data: ["(67) 99601-1356"], label: "WhatsApp" },
                { icon: Mail, title: "E-mail", data: ["adm@brandaocontador.com.br"], label: "Corporativo" },
                { icon: MapPin, title: "Endereço", data: ["Rua Santa Catarina, 1010", "Centro - Sidrolândia/MS"], label: "Localização" },
                { icon: Clock, title: "Horário", data: ["Seg a Sex: 8h às 18h", "Sáb: 8h às 12h"], label: "Atendimento" },
              ].map((item, i) => (
                <div key={i} className="group p-6 bg-neutral-900/40 border border-neutral-800 hover:border-amber-electric/30 transition-all duration-500">
                  <div className="w-12 h-12 bg-obsidian border border-neutral-800 flex items-center justify-center text-amber-electric mb-6 group-hover:bg-amber-electric group-hover:text-obsidian transition-colors">
                    <item.icon size={20} />
                  </div>
                  <div className="text-[10px] font-mono text-amber-electric/50 mb-1 uppercase tracking-widest">{item.label}</div>
                  <h3 className="font-display font-bold text-neutral-100 mb-3 uppercase text-xl leading-none">{item.title}</h3>
                  {item.data.map(line => <p key={line} className="text-neutral-400 font-sans text-sm mb-1">{line}</p>)}
                </div>
              ))}
            </div>

            {/* CTA WhatsApp */}
            <div className="p-10 bg-amber-electric relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-obsidian opacity-5 translate-x-16 -translate-y-16 rotate-45"></div>
              <h3 className="text-3xl font-display font-bold text-obsidian mb-4 uppercase leading-none">Atendimento via WhatsApp</h3>
              <p className="text-obsidian/70 mb-8 font-sans font-medium uppercase tracking-tight text-sm">
                Converse com um de nossos consultores agora mesmo para suporte imediato.
              </p>
              <a
                href="https://wa.me/5567996011356"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-obsidian text-amber-electric px-10 py-5 font-mono font-bold tracking-widest hover:scale-105 transition-all shadow-xl"
              >
                <MessageCircle size={20} />
                INICIAR CONVERSA
              </a>
            </div>
          </div>

          {/* Formulário de Contato */}
          <div className="p-12 bg-neutral-900/40 border border-neutral-800 relative">
            <h2 className="text-4xl mb-12 font-display uppercase italic text-amber-electric tracking-tighter">Terminal de Mensagem</h2>

            {/* Mensagem de sucesso */}
            {status === 'success' && (
              <div className="mb-8 bg-emerald-500/10 border border-emerald-500/30 p-6 flex items-start gap-4 animate-in fade-in duration-500">
                <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-400 font-bold uppercase text-sm tracking-wider">Mensagem Enviada!</p>
                  <p className="text-neutral-400 text-sm mt-1">Recebemos sua mensagem e retornaremos em breve.</p>
                </div>
              </div>
            )}

            {/* Mensagem de erro */}
            {status === 'error' && (
              <div className="mb-8 bg-red-500/10 border border-red-500/30 p-6 flex items-start gap-4 animate-in fade-in duration-500">
                <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-bold uppercase text-sm tracking-wider">Erro no Envio</p>
                  <p className="text-neutral-400 text-sm mt-1">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em]">Seu Nome</label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-obsidian border border-neutral-800 text-neutral-100 placeholder-neutral-700 focus:outline-none focus:border-amber-electric transition-all font-sans text-base"
                    placeholder="Ex: João da Silva"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em]">E-mail para Retorno</label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-obsidian border border-neutral-800 text-neutral-100 placeholder-neutral-700 focus:outline-none focus:border-amber-electric transition-all font-sans text-base"
                    placeholder="Ex: joao@empresa.com.br"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em]">Tipo de Solicitação</label>
                <div className="relative">
                  <select
                    id="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-obsidian border border-neutral-800 text-neutral-100 focus:outline-none focus:border-amber-electric transition-all font-sans text-base appearance-none relative z-10"
                    required
                  >
                    <option value="">Selecione um Assunto</option>
                    <option value="contabilidade">Serviços Contábeis</option>
                    <option value="fiscal">Inteligência Fiscal</option>
                    <option value="trabalhista">Recursos Humanos</option>
                    <option value="consultoria">Estratégia e Dados</option>
                    <option value="outros">Outros Assuntos</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none z-20">
                    <div className="w-2 h-2 border-r-2 border-b-2 border-neutral-600 rotate-45"></div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em]">Como podemos ajudar?</label>
                <textarea
                  id="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-obsidian border border-neutral-800 text-neutral-100 placeholder-neutral-700 focus:outline-none focus:border-amber-electric resize-none transition-all font-sans text-base"
                  placeholder="Descreva brevemente sua necessidade..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="btn-brutal w-full py-6 text-xl group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === 'sending' ? (
                  <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> ENVIANDO...</>
                ) : (
                  <><Send className="w-6 h-6 mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> ENVIAR MENSAGEM</>
                )}
              </button>
            </form>
          </div>

        </div>
      </section>
    </div>
  );
}