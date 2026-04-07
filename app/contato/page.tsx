'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Página de Contato — Brandão Contabilidade
 * Formulário funcional com envio via API
 */
type FormStatus = 'idle' | 'sending' | 'success' | 'error';

export default function ContatoPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
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
      setTimeout(() => setStatus('idle'), 8000);
    } catch {
      setStatus('error');
      setErrorMessage('Erro de conexão. Verifique sua internet e tente novamente.');
    }
  }

  return (
    <main className="min-h-screen bg-background pt-24">
      {/* Header */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero pointer-events-none" />
        <div className="container-custom relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-xs font-semibold text-primary mb-6">
            <MessageCircle className="w-3 h-3" /> Atendimento
          </span>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
            Fale <span className="text-primary">conosco</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Atendimento de excelência. Escolha o canal mais conveniente ou envie uma mensagem diretamente.
          </p>
        </div>
      </section>

      {/* Contato + Formulário */}
      <section className="py-16">
        <div className="container-custom grid lg:grid-cols-2 gap-16 items-start">

          {/* Informações de Contato */}
          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Phone, title: 'WhatsApp', data: ['(67) 99601-1356'], color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { icon: Mail, title: 'E-mail', data: ['adm@brandaocontador.com.br'], color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { icon: MapPin, title: 'Endereço', data: ['R. Cmte. Salgado, 647', 'Centro — Sidrolândia/MS'], color: 'text-amber-500', bg: 'bg-amber-500/10' },
                { icon: Clock, title: 'Horário', data: ['Seg - Sex: 7h30 — 17h30', 'Sáb: 7h30 — 11h30'], color: 'text-purple-500', bg: 'bg-purple-500/10' },
              ].map((item, i) => (
                <div key={i} className="glass-card p-6 group">
                  <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-2">{item.title}</h3>
                  {item.data.map(line => <p key={line} className="text-sm text-muted-foreground">{line}</p>)}
                </div>
              ))}
            </div>

            {/* CTA WhatsApp */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white relative overflow-hidden">
              <h3 className="text-xl font-display font-bold mb-2">Atendimento via WhatsApp</h3>
              <p className="text-white/70 text-sm mb-6">Fale com um de nossos consultores agora mesmo.</p>
              <a
                href="https://wa.me/5567996011356"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-white text-emerald-700 px-6 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:brightness-110 transition-all active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5" />
                Iniciar Conversa
              </a>
            </div>
          </div>

          {/* Formulário */}
          <div className="glass-card-static p-8 md:p-10">
            <h2 className="text-2xl font-display font-bold text-foreground mb-8">Envie sua mensagem</h2>

            {/* Sucesso */}
            {status === 'success' && (
              <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-3 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Mensagem enviada!</p>
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Retornaremos em breve.</p>
                </div>
              </div>
            )}

            {/* Erro */}
            {status === 'error' && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">Erro no envio</p>
                  <p className="text-xs text-red-600/70 dark:text-red-400/70">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Seu Nome</label>
                  <input id="name" type="text" value={formData.name} onChange={handleChange} className="input-modern" placeholder="Ex: João da Silva" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">E-mail</label>
                  <input id="email" type="email" value={formData.email} onChange={handleChange} className="input-modern" placeholder="joao@empresa.com.br" required />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assunto</label>
                <select id="subject" value={formData.subject} onChange={handleChange} className="input-modern" required>
                  <option value="">Selecione um Assunto</option>
                  <option value="contabilidade">Serviços Contábeis</option>
                  <option value="fiscal">Planejamento Fiscal</option>
                  <option value="trabalhista">Departamento Pessoal</option>
                  <option value="consultoria">Consultoria Estratégica</option>
                  <option value="outros">Outros Assuntos</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mensagem</label>
                <textarea id="message" rows={5} value={formData.message} onChange={handleChange} className="input-modern resize-none" placeholder="Como podemos ajudar?" required />
              </div>

              <button type="submit" disabled={status === 'sending'} className="btn-primary w-full py-4 text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                {status === 'sending' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                ) : (
                  <><Send className="w-4 h-4" /> Enviar Mensagem</>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}