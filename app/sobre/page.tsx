import { Metadata } from 'next';
import Link from 'next/link';
import {
  Phone, Mail, MapPin, Clock, Users, Shield, Award, TrendingUp,
  CheckCircle2, Star, Building2, Tractor, ArrowUpRight, Calendar,
  Target, Heart, Handshake
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sobre a Brandão Contabilidade | 31+ Anos em Sidrolândia - MS',
  description: 'Conheça a história da Brandão Contabilidade, escritório com mais de 31 anos de experiência em contabilidade para empresas e agronegócio em Sidrolândia - MS.',
  alternates: {
    canonical: '/sobre',
  },
  openGraph: {
    title: 'Sobre a Brandão Contabilidade | 31+ Anos em Sidrolândia - MS',
    description: 'Mais de 30 anos transformando números em decisões estratégicas para empresas e produtores rurais em Sidrolândia e região.',
  },
};

const timeline = [
  {
    ano: '1993',
    titulo: 'Fundação',
    descricao: 'A Brandão Contabilidade é fundada em Sidrolândia - MS, com o compromisso de oferecer serviços contábeis de qualidade para a região.',
    icone: Building2,
    cor: 'from-emerald-500 to-teal-500',
  },
  {
    ano: '2000',
    titulo: 'Expansão de Serviços',
    descricao: 'Ampliação do portfólio para incluir departamento pessoal, planejamento tributário e consultoria empresarial.',
    icone: TrendingUp,
    cor: 'from-blue-500 to-indigo-500',
  },
  {
    ano: '2010',
    titulo: 'Foco no Agronegócio',
    descricao: 'Especialização em atendimento para produtores rurais e empresas do agronegócio, entendendo as particularidades do setor.',
    icone: Tractor,
    cor: 'from-green-500 to-lime-500',
  },
  {
    ano: '2015',
    titulo: 'Modernização Tecnológica',
    descricao: 'Implementação de sistemas digitais, automação de processos e adoção de ferramentas online para melhor atendimento.',
    icone: Target,
    cor: 'from-purple-500 to-violet-500',
  },
  {
    ano: '2020',
    titulo: 'Resiliência na Pandemia',
    descricao: 'Adaptação rápida ao trabalho remoto, mantendo o atendimento contínuo e suporte aos clientes durante o período mais desafiador.',
    icone: Shield,
    cor: 'from-amber-500 to-orange-500',
  },
  {
    ano: '2024',
    titulo: '31 Anos de Confiança',
    descricao: 'Mais de 500 clientes ativos, equipe de 15 especialistas e presença consolidada como referência em contabilidade no interior de MS.',
    icone: Award,
    cor: 'from-rose-500 to-pink-500',
  },
];

const valores = [
  {
    titulo: 'Confiança',
    descricao: 'Relações construídas com transparência, ética e compromisso com cada cliente.',
    icone: Handshake,
  },
  {
    titulo: 'Excelência',
    descricao: 'Busca contínua por qualidade técnica e atualização constante das práticas contábeis.',
    icone: Star,
  },
  {
    titulo: 'Proximidade',
    descricao: 'Atendimento humano e consultivo, entendendo a realidade de cada empresa e produtor.',
    icone: Heart,
  },
  {
    titulo: 'Inovação',
    descricao: 'Uso de tecnologia para simplificar processos e entregar mais agilidade e clareza.',
    icone: Target,
  },
];

const diferenciais = [
  '31+ anos de experiência prática em Sidrolândia e região',
  'Especialistas em agronegócio e produtor rural',
  'Atendimento consultivo e personalizado',
  'Equipe de 15 profissionais qualificados',
  'Tecnologia integrada para mais agilidade',
  'Acompanhamento completo: fiscal, trabalhista e societário',
  'Presença consolidada no mercado regional',
];

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-background text-foreground pt-24">
      {/* Hero */}
      <section className="py-16 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero pointer-events-none" />
        <div className="container-custom relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="w-12 h-[1px] bg-primary"></span>
            <span className="text-xs font-mono text-primary tracking-[0.4em] uppercase">Quem Somos</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold uppercase tracking-tighter leading-[0.85] mb-4">
            NOSSA <span className="text-primary italic font-display">HISTÓRIA</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl font-sans text-lg">
            Mais de 30 anos transformando números em decisões estratégicas para empresas e produtores rurais em Sidrolândia e região.
          </p>
        </div>
      </section>

      {/* Introdução */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-xs font-semibold text-primary">
                <Calendar className="w-3 h-3" /> Desde 1993
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
                Uma história de <span className="text-primary">compromisso</span> e crescimento
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A Brandão Contabilidade nasceu em 1993, em Sidrolândia - MS, com a missão de oferecer serviços contábeis de qualidade para a região. Ao longo de mais de três décadas, construímos uma história de confiança, crescimento e compromisso com nossos clientes.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Hoje, somos uma equipe de 15 especialistas que atende mais de 500 clientes ativos, incluindo empresas de diversos segmentos e produtores rurais do agronegócio. Nossa presença consolidada no mercado regional é resultado de um trabalho contínuo de excelência e proximidade.
              </p>
            </div>

            {/* Cards de destaque */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { valor: '31+', label: 'Anos de Mercado', icone: Calendar },
                { valor: '500+', label: 'Clientes Ativos', icone: Users },
                { valor: '15', label: 'Especialistas', icone: Users },
                { valor: '5.0', label: 'Avaliação', icone: Star },
              ].map((item, i) => (
                <div key={i} className="glass-card p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <item.icone className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-3xl font-display font-bold text-foreground">{item.valor}</p>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-muted/30">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-xs font-semibold text-primary mb-4">
              <Calendar className="w-3 h-3" /> Nossa Trajetória
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Marcos da nossa <span className="text-primary">história</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Cada etapa da nossa trajetória reflete o compromisso com a excelência e o crescimento sustentável.
            </p>
          </div>

          <div className="relative">
            {/* Linha vertical */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border hidden lg:block" />

            <div className="space-y-8">
              {timeline.map((item, i) => (
                <div key={i} className={`relative flex flex-col lg:flex-row items-center gap-6 ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  {/* Conteúdo */}
                  <div className={`flex-1 ${i % 2 === 0 ? 'lg:text-right lg:pr-12' : 'lg:text-left lg:pl-12'}`}>
                    <div className="glass-card p-6 inline-block">
                      <div className={`flex items-center gap-3 mb-3 ${i % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}>
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.cor} flex items-center justify-center`}>
                          <item.icone className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-display font-bold text-primary">{item.ano}</span>
                      </div>
                      <h3 className="text-xl font-display font-bold text-foreground mb-2">{item.titulo}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.descricao}</p>
                    </div>
                  </div>

                  {/* Ponto na linha */}
                  <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background z-10" />

                  {/* Espaço vazio para layout */}
                  <div className="flex-1 hidden lg:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-xs font-semibold text-primary mb-4">
              <Heart className="w-3 h-3" /> Nossos Valores
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Os pilares que nos <span className="text-primary">guiam</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {valores.map((valor, i) => (
              <div key={i} className="glass-card p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <valor.icone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-display font-bold text-foreground">{valor.titulo}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{valor.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-16 bg-muted/30">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-xs font-semibold text-primary">
                <Award className="w-3 h-3" /> Por que nos escolher
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
                Nossos <span className="text-primary">diferenciais</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                O que nos torna únicos é a combinação de experiência, proximidade e compromisso com cada cliente.
              </p>
            </div>

            <div className="space-y-4">
              {diferenciais.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section className="py-16">
        <div className="container-custom text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
              Pronto para <span className="text-primary">conversar</span>?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Se você quer mais organização, menos risco e atendimento próximo para tomar decisões com confiança, vamos entender o que sua operação precisa.
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
