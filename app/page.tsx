import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Mail, MapPin, Users, Shield, Award, Calculator, FileText, TrendingUp, ChevronRight, ArrowUpRight } from 'lucide-react';
import TerminalInformativo from './components/TerminalInformativo';

export const metadata: Metadata = {
  title: 'Início | Brandão Contabilidade',
  description: 'Tradição rústica e tecnologia de ponta em serviços contábeis, gestão de DP, legalização e agro.',
  openGraph: {
    title: 'Início | Brandão Contabilidade',
    description: 'Tradição rústica e tecnologia de ponta em serviços contábeis, gestão de DP, legalização e agro.',
  }
};

/**
 * HOME PAGE - BRANDÃO CONTABILIDADE
 * Design: High-End Brutalism (State of the Art)
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-obsidian selection:bg-amber-electric selection:text-obsidian">
      {/* HERO SECTION - O Impacto Inicial */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Geometria Brutalista de Fundo */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-neutral-900/40 -skew-x-12 translate-x-1/4 pointer-events-none"></div>

        <div className="container-custom relative z-10 py-20">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 space-y-12">
              <div className="inline-flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-1000">
                <span className="w-16 h-[2px] bg-amber-electric"></span>
                <span className="font-mono text-[10px] font-black tracking-[0.5em] text-amber-electric uppercase">ESTRUTURA SÓLIDA // DESDE 1993</span>
              </div>

              <h1 className="leading-[0.85] uppercase animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                EXCELÊNCIA <br />
                <span className="text-amber-electric italic font-display tracking-tightest">CONTÁBIL</span> <br />
                DE ALTA PERFORMANCE.
              </h1>

              <p className="text-2xl text-neutral-400 max-w-2xl leading-relaxed font-sans animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-400">
                Blindamos seu patrimônio com <strong className="text-neutral-100">tradição rústica</strong> e <span className="text-amber-electric">tecnologia de ponta</span>. Onde números se transformam em poder de decisão.
              </p>

              <div className="flex flex-wrap gap-8 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-600">
                <Link href="/login" className="btn-brutal px-12 py-6">
                  ACESSAR PORTAL
                </Link>
                <a href="https://wa.me/5567996011356" target="_blank" className="btn-brutal-outline px-12 py-6 group">
                  SOLICITAR AUDITORIA <ArrowUpRight className="ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 relative animate-in fade-in zoom-in-95 duration-1000 delay-500">
              <TerminalInformativo />
              {/* Marker decorativo */}
              <div className="absolute -bottom-10 -left-10 w-20 h-20 border-l-4 border-b-4 border-amber-electric opacity-20 hidden xl:block"></div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO DE NÚMEROS - Autoridade Brutalista */}
      <section className="bg-amber-electric py-12 border-y-4 border-obsidian">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "ANOS DE MERCADO", value: "31" },
              { label: "CLIENTES ATIVOS", value: "500+" },
              { label: "PRECISÃO FISCAL", value: "100%" },
              { label: "TIME ESPECIALISTA", value: "15" }
            ].map((stat, i) => (
              <div key={i} className="text-obsidian text-center md:text-left border-r last:border-none border-obsidian/10 pr-4">
                <div className="text-5xl font-black font-display leading-none">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GRID DE SERVIÇOS - A Engenharia do Negócio */}
      <section className="py-32 bg-obsidian">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
            <div className="max-w-3xl">
              <span className="mono-label mb-4 block underline decoration-amber-electric underline-offset-8">Capacidades Estratégicas</span>
              <h2 className="uppercase">SOLUÇÕES QUE <br /><span className="text-amber-electric italic">IMPULSIONAM</span> VALOR.</h2>
            </div>
            <p className="text-neutral-500 max-w-xs text-right font-sans italic opacity-70">
              Cada operação é processada com rigor técnico e visão analítica superior.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "FISCAL INTELIGENTE", icon: FileText, desc: "Planejamento tributário agressivo dentro da conformidade legal." },
              { title: "GESTÃO DE ATIVOS", icon: Calculator, desc: "Controle patrimonial rigoroso para empresas e produtores rurais." },
              { title: "DP ESTRATÉGICO", icon: Users, desc: "Gestão inteligente de capital humano e obrigações trabalhistas." },
              { title: "LEGALIZAÇÃO", icon: Shield, desc: "Estruturação societária e blindagem jurídica para novos negócios." },
              { title: "ANÁLISE DE DADOS", icon: TrendingUp, desc: "Dashboards e indicadores financeiros em tempo real." },
              { title: "AGRONEGÓCIO", icon: Award, desc: "Especialização em contabilidade rural e tributação de commodities." }
            ].map((service, i) => (
              <div key={i} className="brutalist-card group hover:border-amber-electric transition-all">
                <service.icon className="w-12 h-12 text-amber-electric mb-8 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-2xl font-black uppercase mb-4 tracking-tighter">{service.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed mb-8">
                  {service.desc}
                </p>
                <Link href="/servicos" className="text-xs font-black text-amber-electric flex items-center gap-2 group-hover:gap-4 transition-all uppercase tracking-widest">
                  Explorar Detalhes <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SEÇÃO - O Chamado para a Elite */}
      <section className="py-40 relative overflow-hidden bg-neutral-900">
        <div className="absolute inset-0 bg-noise pointer-events-none"></div>
        <div className="container-custom text-center relative z-10">
          <h2 className="text-6xl md:text-[10rem] font-black text-neutral-800/20 uppercase absolute -top-10 left-1/2 -translate-x-1/2 select-none pointer-events-none tracking-tighter">
            CONTABILIDADE
          </h2>
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-neutral-100 uppercase leading-[0.9] italic">
              Sua empresa merece <br />
              <span className="text-amber-electric not-italic tracking-tighter">SEGURANÇA DE ELITE.</span>
            </h2>
            <p className="text-xl text-neutral-500 max-w-2xl mx-auto uppercase tracking-tighter font-bold">
              Saia do amadorismo contábil e entre para o ecossistema Brandão.
            </p>
            <div className="flex justify-center gap-8 pt-8">
              <a href="https://wa.me/5567996011356" target="_blank" className="btn-brutal px-16 py-8 text-xl">
                QUERO SER CLIENTE
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}