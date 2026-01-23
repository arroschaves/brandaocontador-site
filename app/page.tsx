import Link from 'next/link';
import { Phone, Mail, MapPin, Users, Shield, Award, Calculator, FileText, TrendingUp, MessageSquare } from 'lucide-react';
import TerminalInformativo from './components/TerminalInformativo';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      {/* Hero Section - Digital Heritage Overhaul */}
      <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/2 h-full bg-amber-electric/5 border-l border-amber-electric/10 z-0"></div>
        <div className="absolute top-20 left-10 mono-label opacity-40">PROTOCOL_V4.2 // SECURITY_LAYERS</div>

        <div className="container-custom relative z-10 w-full">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-1/2">
              <div className="mono-label mb-6 flex items-center gap-4">
                <span className="w-12 h-[1px] bg-amber-electric"></span>
                CONFIANÇA DESDE 1993
              </div>
              <h1 className="mb-10 text-reveal active">
                CONTABILIDADE <br />
                <span className="text-amber-electric italic uppercase font-display">ESTRATÉGICA</span> <br />
                PARA A NOVA ERA.
              </h1>
              <p className="text-xl md:text-2xl text-neutral-400 mb-12 max-w-2xl leading-relaxed font-sans">
                Unimos a solidez de <strong className="text-neutral-100 italic">30 anos de mercado</strong> com a agilidade digital do futuro. Segurança rústica, entrega de ponta.
              </p>
              <div className="flex flex-wrap gap-6">
                <button className="btn-brutal group">
                  SOLICITAR_ACESSO <MessageSquare className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="btn-brutal-outline group">
                  FALAR_COM_ESPECIALISTA <Phone className="w-5 h-5 ml-3 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            <div className="lg:w-1/2 w-full flex flex-col justify-end items-end h-full">
              <TerminalInformativo />
            </div>
          </div>
        </div>
      </section>

      {/* Digital Command Center - Services Overhaul */}
      <section id="servicos" className="py-24 bg-obsidian relative">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <div className="mono-label mb-4">CENTRO_DE_COMANDO // SERVIÇOS</div>
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

      {/* Heritage Identity - Using Provided Banners */}
      <section className="py-24 bg-neutral-900/20 border-t border-neutral-800">
        <div className="container-custom">
          <div className="mono-label mb-8 text-center">ARQUIVO_HISTÓRICO // BRANDING_HERITAGE</div>
          <div className="brutalist-card p-0 border-amber-electric/20 overflow-hidden relative group">
            <img
              src="/card-1.jpg"
              alt="Brandão Heritage Banner"
              className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-1000 contrast-125 opacity-70 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-60"></div>
            <div className="absolute bottom-6 left-6 mono-label !text-amber-electric">DOC_REF: 1993_ORIGINAL_VALUES</div>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-12 items-start">
            <div className="max-w-prose">
              <h3 className="text-2xl font-display mb-6 uppercase italic">NOSSA_HISTÓRIA.LOG</h3>
              <p className="text-neutral-400 leading-relaxed font-sans mb-6">
                Desde 1993, a <strong className="text-neutral-100">Brandão Contabilidade</strong> tem sido o pilar de segurança para empresas em Sidrolândia e região. O que começou como um escritório tradicional evoluiu para um ecossistema digital de alta performance.
              </p>
              <p className="text-neutral-400 leading-relaxed font-sans">
                Nossa missão é unir a <span className="text-amber-electric italic">confiança do rústico</span> — aquele aperto de mão que vale um contrato — com a <span className="text-amber-electric italic">precisão do digital</span>. Transformamos a complexidade burocrática em vantagem estratégica para o seu negócio.
              </p>
            </div>
            <div className="space-y-4">
              <div className="mono-label !text-[10px] mb-2 uppercase tracking-widest text-neutral-500">VALORES_CHAVE // CORE_VALUES</div>
              {[
                { label: "INTEGRIDADE_ABSOLUTA", value: "30+ ANOS DE REPUTAÇÃO ILIBADA" },
                { label: "AGILIDADE_PROCESSUAL", value: "FLUXOS DIGITAIS OTIMIZADOS" },
                { label: "FOCO_NO_RESULTADO", value: "MAIS QUE CONTABILIDADE, ESTRATÉGIA" },
              ].map((v, i) => (
                <div key={i} className="border-l-2 border-amber-electric/30 pl-4 py-2 hover:border-amber-electric transition-colors">
                  <div className="mono-label !text-[9px] !text-amber-electric/60">{v.label}</div>
                  <div className="text-sm font-mono text-neutral-300">{v.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final - Impact Overhaul */}
      <section className="py-32 bg-amber-electric relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 mono-label text-obsidian/30 select-none">SYSTEM_READY // INITIALIZE_ONBOARDING</div>
        <div className="container-custom text-center relative z-10">
          <h2 className="text-obsidian mb-8 text-reveal active">
            PRONTO PARA O <br />
            <span className="italic">PRÓXIMO NÍVEL?</span>
          </h2>
          <p className="text-xl text-obsidian/80 mb-12 max-w-2xl mx-auto font-mono uppercase tracking-tight">
            INFRAESTRUTURA CONTÁBIL DE ALTA PERFORMANCE PARA QUEM NÃO ACEITA O BÁSICO.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a
              href="https://wa.me/5567996011356"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-obsidian text-amber-electric px-12 py-5 font-mono font-bold tracking-widest hover:scale-105 transition-all duration-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]"
            >
              FALAR_COM_ESPECIALISTA.EXE
            </a>
            <a
              href="/contato"
              className="border-2 border-obsidian text-obsidian px-12 py-5 font-mono font-bold tracking-widest hover:bg-obsidian hover:text-amber-electric transition-all duration-300"
            >
              SOLICITAR_ORÇAMENTO
            </a>
          </div>
        </div>
      </section>

      {/* Contato - Technical Layout */}
      <section id="contato" className="py-24 bg-obsidian">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <div className="mono-label mb-4">PONTOS_DE_CONTATO</div>
              <h2 className="mb-8 text-reveal active">CONECTE-SE AO <br />NOSSO <span className="text-amber-electric">NÚCLEO</span>.</h2>
              <p className="text-neutral-400 text-lg mb-12 font-sans">Sua segurança contábil começa com uma conversa direta e transparente.</p>

              <div className="space-y-8">
                <div className="flex items-start gap-6 group">
                  <div className="p-4 bg-neutral-900 border border-neutral-800 text-amber-electric group-hover:bg-amber-electric group-hover:text-obsidian transition-colors">
                    <Phone size={24} />
                  </div>
                  <div>
                    <div className="mono-label !text-[10px] mb-1">LINHA_DIRETA</div>
                    <p className="text-xl font-display font-bold text-neutral-50">(67) 99601-1356</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="p-4 bg-neutral-900 border border-neutral-800 text-amber-electric group-hover:bg-amber-electric group-hover:text-obsidian transition-colors">
                    <Mail size={24} />
                  </div>
                  <div>
                    <div className="mono-label !text-[10px] mb-1">COMUNICAÇÃO_ASSÍNCRONA</div>
                    <p className="text-xl font-display font-bold text-neutral-50">adm@brandaocontador.com.br</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="p-4 bg-neutral-900 border border-neutral-800 text-amber-electric group-hover:bg-amber-electric group-hover:text-obsidian transition-colors">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <div className="mono-label !text-[10px] mb-1">LOCALIZAÇÃO_FÍSICA</div>
                    <p className="text-xl font-display font-bold text-neutral-50">RUA SANTA CATARINA, 1010 // CENTRO // SIDROLÂNDIA - MS</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900/10 border border-neutral-800 p-1 relative h-full min-h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3731.332306917637!2d-54.96576628461081!3d-20.939174586048123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9480373e7f466983%3A0xe7a5656565656565!2zUi4gU2FudGEgQ2F0YXJpbmEsIDEwMTAsIFNpZHJvbMOibmRpYSAtIE1TLCA3OTExMC0wMDA!5e0!3m2!1spt-BR!2sbr!4v1655555555555!5m2!1spt-BR!2sbr"
                className="w-full h-full grayscale invert opacity-50 contrast-125"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
              ></iframe>
              <div className="absolute top-4 left-4 bg-obsidian border border-neutral-800 p-2 mono-label !text-[8px]">MAP_VIEW // COORDINATES_LOCKED</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}