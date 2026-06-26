import { Metadata } from 'next';
import Link from 'next/link';
import {
  Phone, Mail, MapPin, Users, Shield, Award, Calculator,
  FileText, TrendingUp, ChevronRight, ArrowUpRight, Leaf,
  CheckCircle2, Star, Clock, Building2, Tractor
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contabilidade em Sidrolândia - MS | Brandão Contabilidade',
  description: 'Contabilidade para empresas e agronegócio em Sidrolândia - MS, com apoio fiscal, trabalhista, societário e atendimento consultivo.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Contabilidade em Sidrolândia - MS | Brandão Contabilidade',
    description: 'Mais clareza, menos risco e atendimento contábil próximo para empresas e produtores rurais em Sidrolândia e região.',
  }
};

/**
 * HOME PAGE — BRANDÃO CONTABILIDADE
 * Design: Moderno, acolhedor, profissional
 * Paleta: Verde Esmeralda + Dourado
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-background">

      {/* ═══════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center pt-20 overflow-hidden">
        {/* Gradiente de fundo decorativo */}
        <div className="absolute inset-0 gradient-hero pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-72 editorial-grid opacity-40 pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container-custom relative z-10 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Texto */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold text-primary tracking-wide">Desde 1993 • Sidrolândia - MS</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold text-foreground leading-[1.02] text-balance">
                Mais clareza, menos risco e uma contabilidade que{' '}
                <span className="text-primary">faz sua empresa avançar</span>.
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed text-balance">
                Há mais de <strong className="text-foreground">30 anos</strong>, ajudamos empresas e produtores rurais a organizar rotinas fiscais, trabalhistas e societárias com segurança, agilidade e visão estratégica.
              </p>

              <div className="flex flex-wrap gap-3 text-xs font-semibold text-muted-foreground">
                {[
                  'Atendimento próximo e consultivo',
                  'Especialistas em agronegócio',
                  'Suporte para empresas em crescimento',
                ].map((item) => (
                  <span key={item} className="rounded-full border border-border/70 bg-card/70 px-3 py-2">
                    {item}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href="https://wa.me/5567996011356"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary px-8 py-4 text-sm"
                >
                  <Phone className="w-4 h-4" />
                  Solicitar atendimento
                </a>
                <Link href="/servicos" className="btn-secondary px-8 py-4 text-sm">
                  Ver soluções
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Confiança */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border-2 border-background flex items-center justify-center">
                      <Users className="w-3.5 h-3.5 text-primary" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <strong className="text-foreground">500+</strong> clientes confiam em nós
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-xl pt-4">
                {[
                  { value: '31+', label: 'anos de história' },
                  { value: '500+', label: 'clientes ativos' },
                  { value: 'MS', label: 'foco regional' },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.5rem] border border-border/70 bg-card/70 px-4 py-4 backdrop-blur">
                    <p className="text-2xl font-display font-bold text-foreground">{item.value}</p>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Card visual decorativo */}
            <div className="hidden lg:block animate-fade-in delay-300">
              <div className="relative">
                {/* Card principal */}
                <div className="glass-card p-8 space-y-6 shine-effect">
                  <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Consultoria de alta confiança</p>
                      <h3 className="font-display font-bold text-foreground text-lg mt-2">Rotina contábil organizada para você decidir melhor</h3>
                    </div>
                    <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                      Desde 1993
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-foreground text-lg">Ecossistema Completo</h3>
                      <p className="text-sm text-muted-foreground">Fiscal, pessoal, societário e agro no mesmo atendimento</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { icon: FileText, text: 'Calendário fiscal sob controle e menos risco de atraso', status: 'ok' },
                      { icon: Users, text: 'Folha, admissões e rotinas trabalhistas com mais previsibilidade', status: 'ok' },
                      { icon: Tractor, text: 'Acompanhamento especializado para empresas e produtores rurais', status: 'ok' },
                      { icon: Building2, text: 'Abertura, ajuste e regularização societária com orientação prática', status: 'ok' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-primary/5 transition-colors">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm text-foreground font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card flutuante esquerda */}
                <div className="absolute -bottom-4 -left-4 glass-card p-4 animate-float delay-500 shadow-glow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">31 anos</p>
                      <p className="text-[10px] text-muted-foreground">de mercado</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          NÚMEROS — BARRA DE AUTORIDADE
          ═══════════════════════════════════════════ */}
      <section className="py-12 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-90" />
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '31+', label: 'Anos de Mercado' },
              { value: '500+', label: 'Clientes Ativos' },
              { value: '100%', label: 'Precisão Fiscal' },
              { value: '15', label: 'Especialistas' },
            ].map((stat, i) => (
              <div key={i} className="space-y-1 reveal">
                <p className="text-4xl md:text-5xl font-display font-bold">{stat.value}</p>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SERVIÇOS — GRID INTERATIVO
          ═══════════════════════════════════════════ */}
      <section className="py-24 bg-background section-shell">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16 reveal">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-xs font-semibold text-primary mb-4">
              <Leaf className="w-3 h-3" /> O que fazemos de melhor
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Soluções completas para o seu <span className="text-primary">crescimento</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Do campo à cidade, entregamos apoio contábil para reduzir retrabalho, manter conformidade e dar mais tranquilidade à gestão.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Contabilidade Empresarial', icon: Calculator, desc: 'Mais organização financeira, demonstrativos confiáveis e apoio para sua empresa crescer com segurança.', color: 'from-emerald-500 to-teal-500' },
              { title: 'Departamento Pessoal', icon: Users, desc: 'Folha, eSocial e rotinas trabalhistas conduzidas com atenção técnica e menos risco operacional.', color: 'from-blue-500 to-indigo-500' },
              { title: 'Legalização de Empresas', icon: Shield, desc: 'Abertura, alteração e regularização com orientação clara para você avançar sem burocracia desnecessária.', color: 'from-purple-500 to-violet-500' },
              { title: 'Agronegócio', icon: Tractor, desc: 'Atendimento contábil pensado para a realidade do produtor rural e das empresas do agro.', color: 'from-green-500 to-lime-500' },
              { title: 'Planejamento Tributário', icon: TrendingUp, desc: 'Leitura tributária estratégica para enquadrar melhor sua operação e proteger margem.', color: 'from-amber-500 to-orange-500' },
              { title: 'Certificado Digital', icon: FileText, desc: 'Emissão e renovação com suporte direto para não travar obrigações e assinaturas importantes.', color: 'from-rose-500 to-pink-500' },
            ].map((service, i) => (
              <Link
                key={i}
                href="/servicos"
                className="glass-card p-7 group cursor-pointer reveal"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {service.desc}
                </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  Quero entender melhor <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          POR QUE NOS ESCOLHER
          ═══════════════════════════════════════════ */}
      <section className="py-24 bg-muted/30 section-shell">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 reveal">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Award className="w-3 h-3" /> Confiança comprovada
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
                Por que mais de 500 empresas <span className="text-primary">confiam</span> na Brandão?
              </h2>
              <div className="space-y-5">
                {[
                  { title: '31 anos de experiência prática', desc: 'Acompanhamos empresas e produtores em diferentes fases de crescimento, mudança e regularização.' },
                  { title: 'Especialização em agro e empresa', desc: 'Entendemos as rotinas do campo e da cidade, sem tratamento genérico.' },
                  { title: 'Processo mais claro e ágil', desc: 'Tecnologia entra para reduzir ruído, organizar entregas e melhorar sua resposta.' },
                  { title: 'Contato humano de verdade', desc: 'Você fala com quem acompanha sua operação e entende o impacto de cada decisão.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid de cards informativos */}
            <div className="grid grid-cols-2 gap-4 reveal">
              {[
                { icon: Clock, label: 'Horário', value: '7h30 — 17h30', color: 'text-purple-500', bg: 'bg-purple-500/10' },
                { icon: MapPin, label: 'Localização', value: 'Centro, Sidrolândia', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { icon: Phone, label: 'Contato', value: '(67) 3341-1356', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { icon: Star, label: 'Avaliação', value: '5.0 estrelas', color: 'text-amber-500', bg: 'bg-amber-500/10' },
              ].map((card, i) => (
                <div key={i} className="glass-card p-6 text-center space-y-3">
                  <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center mx-auto`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{card.label}</p>
                  <p className="text-sm font-bold text-foreground">{card.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA FINAL
          ═══════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-64 editorial-grid opacity-35 pointer-events-none" />
        <div className="container-custom text-center relative z-10 reveal">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
              Pronto para trocar improviso por uma contabilidade que <span className="text-primary">acompanha seu ritmo</span>?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Se você quer mais organização, menos risco e atendimento próximo para tomar decisões com confiança, vamos conversar e entender o que sua operação precisa hoje.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://wa.me/5567996011356"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-10 py-4 text-base shadow-glow-sm"
              >
                <Phone className="w-5 h-5" />
                Falar com um especialista
              </a>
              <Link href="/contato" className="btn-ghost px-10 py-4 text-base">
                <Mail className="w-5 h-5" />
                Pedir proposta
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
