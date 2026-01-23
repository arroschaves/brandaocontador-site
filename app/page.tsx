import Link from 'next/link';
import { Phone, Mail, MapPin, Users, Shield, Award, Calculator, FileText, TrendingUp, MessageSquare } from 'lucide-react';
import TerminalInformativo from './components/TerminalInformativo';

export default function Home() {
  return (
    <main className="min-h-screen bg-obsidian">
      {/* Hero Section - Refined for clarity and impact */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-amber-electric opacity-[0.02] z-0"></div>

        <div className="container-custom relative z-10 w-full">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-4 mb-8">
                <span className="w-12 h-[1px] bg-amber-electric"></span>
                <span className="text-xs font-mono text-amber-electric tracking-[0.4em] uppercase">Confiança desde 1993</span>
              </div>
              <h1 className="mb-10 text-reveal active leading-[0.9] text-balance">
                CONTABILIDADE <br />
                <span className="text-amber-electric italic uppercase font-display">ESTRATÉGICA</span> <br />
                PARA A NOVA ERA.
              </h1>
              <p className="text-xl md:text-2xl text-neutral-400 mb-12 max-w-2xl leading-relaxed font-sans">
                Unimos a solidez de <strong className="text-neutral-100">30 anos de mercado</strong> com a agilidade digital do futuro. <br className="hidden md:block" />
                <span className="text-neutral-200/80">Segurança rústica, entrega de ponta.</span>
              </p>
              <div className="flex flex-wrap gap-6">
                <button className="btn-brutal group">
                  Solicitar Acesso <MessageSquare className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="btn-brutal-outline group">
                  Falar com Especialista <Phone className="w-5 h-5 ml-3 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 w-full">
              <TerminalInformativo />
            </div>
          </div>
        </div>
      </section>

      {/* Digital Command Center - Services Overhaul */}
      <section id="servicos" className="py-24 bg-obsidian relative border-t border-neutral-800">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-reveal active">
                SOLUÇÕES EM <br />
                <span className="text-amber-electric">ALTA DEFINIÇÃO</span>
              </h2>
            </div>
            <p className="text-neutral-500 font-mono text-sm max-w-xs text-right hidden md:block">
              INFRAESTRUTURA DIGITAL SEGURA PARA OPERAÇÕES CONTÁBEIS COMPLEXAS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-neutral-800 border border-neutral-800">
            {[
              {
                title: "CONTABILIDADE ESTRATÉGICA",
                desc: "Escrituração e balanços com visão de crescimento exponencial.",
                icon: Calculator,
                tags: ["BALANÇOS", "INDICADORES", "DRE"]
              },
              {
                title: "INTELIGÊNCIA FISCAL",
                desc: "Otimização tributária e conformidade total com regulação.",
                icon: FileText,
                tags: ["TRIBUTOS", "PLANEJAMENTO", "SPED"]
              },
              {
                title: "ECOSISTEMA PESSOAL",
                desc: "Gestão de folha e RH com precisão digital absoluta.",
                icon: Users,
                tags: ["FOLHA", "RH_DIGITAL", "ESOCIAL"]
              },
              {
                title: "GOVERNANÇA CORPORATIVA",
                desc: "Abertura e estruturação de novas entidades no mercado.",
                icon: Award,
                tags: ["ABERTURA", "STATUTOS", "ALVARÁS"]
              },
              {
                title: "CONSULTORIA DATA-DRIVEN",
                desc: "Decisões baseadas em dados reais para sua empresa subir de nível.",
                icon: TrendingUp,
                tags: ["ESTRATÉGIA", "FINANÇAS", "DATA"]
              },
              {
                title: "GESTÃO PATRIMONIAL",
                desc: "Proteção e declaração de ativos com sigilo e segurança.",
                icon: Shield,
                tags: ["IRPF", "IRPJ", "ATIVOS"]
              },
            ].map((item, i) => (
              <div key={i} className="brutalist-card group bg-obsidian hover:bg-neutral-900 overflow-hidden">
                <div className="flex justify-between items-start mb-12">
                  <div className="p-4 bg-amber-electric/5 border border-amber-electric/10 group-hover:bg-amber-electric group-hover:text-obsidian transition-all duration-500">
                    <item.icon size={24} />
                  </div>
                  <span className="font-mono text-[10px] text-neutral-600">MOD_0{i + 1}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-display font-bold mb-4 tracking-tight group-hover:text-amber-electric transition-colors">
                  {item.title}
                </h3>
                <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
                  {item.desc}
                </p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {item.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-neutral-800 text-neutral-500 font-mono text-[9px] tracking-widest">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Heritage Identity */}
      <section className="py-24 bg-neutral-900/20 border-t border-neutral-800">
        <div className="container-custom">
          <div className="brutalist-card p-0 border-amber-electric/20 overflow-hidden relative group">
            <img
              src="/card-1.jpg"
              alt="Brandão Heritage Banner"
              className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-1000 contrast-125 opacity-70 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-60"></div>
          </div>

          <div className="mt-16 grid md:grid-cols-2 gap-16 items-start">
            <div className="max-w-prose">
              <h3 className="text-4xl font-display mb-8 italic text-amber-electric uppercase tracking-tighter">Nossa História</h3>
              <p className="text-neutral-400 leading-relaxed font-sans mb-6 text-lg">
                Desde 1993, a <strong className="text-neutral-100">Brandão Contabilidade</strong> tem sido o pilar de segurança para empresas em Sidrolândia e região. O que começou como um escritório tradicional evoluiu para um ecossistema digital de alta performance.
              </p>
              <p className="text-neutral-400 leading-relaxed font-sans text-lg">
                Nossa missão é unir a <span className="text-amber-electric italic font-display">confiança do rústico</span> — aquele aperto de mão que vale um contrato — com a <span className="text-amber-electric italic font-display">precisão do digital</span>. Transformamos a complexidade burocrática em vantagem estratégica para o seu negócio.
              </p>
            </div>
            <div className="space-y-6">
              {[
                { label: "INTEGRIDADE ABSOLUTA", value: "30+ anos de reputação ilibada" },
                { label: "AGILIDADE PROCESSUAL", value: "Fluxos digitais otimizados" },
                { label: "FOCO NO RESULTADO", value: "Estratégia além da conformidade" },
              ].map((v, i) => (
                <div key={i} className="border-l-2 border-amber-electric/20 pl-6 py-2 hover:border-amber-electric transition-colors">
                  <div className="text-[10px] font-mono text-amber-electric/50 mb-1 tracking-widest">{v.label}</div>
                  <div className="text-lg font-display font-medium text-neutral-200">{v.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final - Impact Overhaul */}
      <section className="py-32 bg-amber-electric relative overflow-hidden h-full">
        <div className="container-custom text-center relative z-10">
          <h2 className="text-obsidian mb-8 text-reveal active">
            PRONTO PARA O <br />
            <span className="italic">PRÓXIMO NÍVEL?</span>
          </h2>
          <p className="text-xl text-obsidian/80 mb-12 max-w-2xl mx-auto font-sans font-medium uppercase tracking-tight">
            INFRAESTRUTURA CONTÁBIL DE ALTA PERFORMANCE PARA QUEM BUSCA EXCELÊNCIA.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a
              href="https://wa.me/5567996011356"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-obsidian text-amber-electric px-12 py-5 font-mono font-bold tracking-widest hover:scale-105 transition-all duration-300 border-2 border-obsidian"
            >
              FALAR COM ESPECIALISTA
            </a>
            <a
              href="/contato"
              className="border-2 border-obsidian text-obsidian px-12 py-5 font-mono font-bold tracking-widest hover:bg-obsidian hover:text-amber-electric transition-all duration-300"
            >
              SOLICITAR ORÇAMENTO
            </a>
          </div>
        </div>
      </section>

      {/* Contato - Refined Layout */}
      <section id="contato" className="py-24 bg-obsidian border-t border-neutral-800">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="mb-12 text-reveal active">CONECTE-SE AO <br />NOSSO <span className="text-amber-electric italic font-display">NÚCLEO</span>.</h2>
              <p className="text-neutral-400 text-lg mb-12 font-sans italic border-l-2 border-amber-electric/30 pl-6">
                Sua segurança contábil começa com uma conversa direta e transparente.
              </p>

              <div className="space-y-10">
                <div className="flex items-start gap-8 group">
                  <div className="p-4 bg-obsidian border border-neutral-800 text-amber-electric group-hover:bg-amber-electric group-hover:text-obsidian transition-all">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-medium text-neutral-50 mb-1">(67) 99601-1356</p>
                    <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Atendimento Direto</p>
                  </div>
                </div>

                <div className="flex items-start gap-8 group">
                  <div className="p-4 bg-obsidian border border-neutral-800 text-amber-electric group-hover:bg-amber-electric group-hover:text-obsidian transition-all">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-medium text-neutral-50 mb-1">adm@brandaocontador.com.br</p>
                    <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">E-mail Corporativo</p>
                  </div>
                </div>

                <div className="flex items-start gap-8 group">
                  <div className="p-4 bg-obsidian border border-neutral-800 text-amber-electric group-hover:bg-amber-electric group-hover:text-obsidian transition-all">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-xl font-display font-medium text-neutral-50 mb-1 leading-tight uppercase">Rua Santa Catarina, 1010 <br /> Centro - Sidrolândia/MS</p>
                    <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Localização Física</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900/10 border border-neutral-800 p-1 relative h-full min-h-[400px] overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3731.332306917637!2d-54.96576628461081!3d-20.939174586048123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9480373e7f466983%3A0xe7a5656565656565!2zUi4gU2FudGEgQ2F0YXJpbmEsIDEwMTAsIFNpZHJvbMOibmRpYSAtIE1TLCA3OTExMC0wMDA!5e0!3m2!1spt-BR!2sbr!4v1655555555555!5m2!1spt-BR!2sbr"
                className="w-full h-full grayscale invert opacity-50 contrast-125 hover:opacity-100 transition-opacity duration-700"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}