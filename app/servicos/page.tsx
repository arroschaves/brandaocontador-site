import { Metadata } from 'next';
import { Calculator, Building, Users, FileText, TrendingUp, Leaf, Award, Shield, MessageSquare, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Serviços | Brandão Contabilidade',
  description: 'Soluções contábeis de alta performance para empresas e produtores rurais. Tradição, segurança e precisão digital.',
}

export default function ServicosPage() {
  const servicos = [
    {
      title: "CONTABILIDADE ESTRATÉGICA",
      description: "Escrituração completa e balanços com visão de crescimento exponencial.",
      icon: <Calculator className="w-8 h-8" />,
      tag: "CORE_BUSINESS",
      detalhes: [
        "Apuração de impostos (ICMS, IPI, PIS, COFINS)",
        "Escrituração Fiscal Digital (EFD)",
        "SPED Fiscal e Contribuições",
        "Declarações acessórias",
        "Acompanhamento de obrigações fiscais"
      ]
    },
    {
      title: "SOLUÇÕES SOCIETÁRIAS",
      description: "Processo completo de abertura, estruturação e legalização de empresas.",
      icon: <Building className="w-8 h-8" />,
      tag: "GOVERNANCE",
      detalhes: [
        "Consulta de viabilidade e registro",
        "Inscrições municipais e estaduais",
        "Alterações contratuais complexas",
        "Baixa e regularização",
        "Holding e proteção patrimonial"
      ]
    },
    {
      title: "ECOSISTEMA TRABALHISTA",
      description: "Gestão completa de RH, eSocial e conformidade trabalhista digital.",
      icon: <Users className="w-8 h-8" />,
      tag: "HUMAN_RESOURCES",
      detalhes: [
        "Folha de pagamento robusta",
        "eSocial e DCTFWeb",
        "Gestão de admissões e férias",
        "Consultoria preventiva",
        "Relatórios de custos previdenciários"
      ]
    },
    {
      title: "INTELIGÊNCIA FISCAL & IRPF",
      description: "Declarações e planejamento tributário para alta renda e ativos complexos.",
      icon: <FileText className="w-8 h-8" />,
      tag: "TAX_ADVISORY",
      detalhes: [
        "IRPF para investidores",
        "Planejamento tributário anual",
        "Restituições e malha fina",
        "Declarações de Capitais no Exterior",
        "Ganho de Capital em ativos digitais"
      ]
    },
    {
      title: "CONSULTORIA DATA-DRIVEN",
      description: "Decisões baseadas em dados reais para sua empresa subir de nível.",
      icon: <TrendingUp className="w-8 h-8" />,
      tag: "STRATEGY",
      detalhes: [
        "Análise de viabilidade econômica",
        "Fluxo de caixa projetado",
        "Controle de custos industriais",
        "Relatórios gerenciais (BI)",
        "Valuation de empresas"
      ]
    },
    {
      title: "AGRONEGÓCIO DE PRECISÃO",
      description: "Especialização em ITR, LCDPR e contabilidade rural de alta performance.",
      icon: <Leaf className="w-8 h-8" />,
      tag: "AGRO_SPECIALIST",
      detalhes: [
        "LCDPR - Livro Caixa Digital",
        "ITR e ADA",
        "Contabilidade de safras e custos",
        "Benefícios previdenciários rurais",
        "Gestão de contratos de parceria"
      ]
    }
  ];

  return (
    <div className="bg-obsidian text-neutral-100 min-h-screen pt-24">
      {/* Header Section */}
      <section className="py-20 border-b border-neutral-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-electric/10 blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="container-custom relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <span className="w-12 h-[1px] bg-amber-electric"></span>
            <span className="text-xs font-mono text-amber-electric tracking-[0.4em] uppercase">Nosso Portfólio</span>
          </div>
          <h1 className="mb-6 text-reveal active leading-tight">
            INFRAESTRUTURA DE <br />
            <span className="text-amber-electric italic font-display">SERVIÇOS</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-3xl mb-8 leading-relaxed font-sans">
            Unimos a tradição de Sidrolândia com tecnologias de ponta para oferecer a solução contábil definitiva para o seu negócio.
          </p>
        </div>
      </section>

      {/* Grid de Serviços */}
      <section className="py-24">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-neutral-800 border border-neutral-800 shadow-2xl">
            {servicos.map((s, idx) => (
              <div
                key={idx}
                className="bg-neutral-900/40 p-12 group hover:bg-neutral-900 transition-all duration-700 relative overflow-hidden flex flex-col h-full"
              >
                <div className="absolute top-0 left-0 w-1 h-0 bg-amber-electric group-hover:h-full transition-all duration-700"></div>
                <div className="text-amber-electric mb-8 group-hover:scale-110 transition-transform duration-500">
                  {s.icon}
                </div>
                <div className="text-[10px] font-mono text-amber-electric/50 mb-2 tracking-widest uppercase">{s.tag}</div>
                <h3 className="text-xl font-display font-bold text-neutral-50 mb-6 group-hover:text-amber-electric transition-colors leading-none uppercase">
                  {s.title}
                </h3>
                <p className="text-neutral-500 font-sans text-sm mb-10 leading-relaxed flex-grow">
                  {s.description}
                </p>
                <div className="mt-auto pt-8 border-t border-neutral-800/50">
                  <h4 className="text-[10px] font-mono text-neutral-600 mb-6 uppercase tracking-[0.2em]">O que processamos:</h4>
                  <ul className="space-y-3">
                    {s.detalhes.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-amber-electric text-[10px] mt-1 opacity-50">•</span>
                        <span className="text-xs text-neutral-400 font-sans uppercase font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 bg-neutral-900/20 border-t border-neutral-800">
        <div className="container-custom">
          <div className="brutalist-card bg-amber-electric p-12 lg:p-20 text-center relative overflow-hidden border-none group">
            <div className="absolute top-0 left-0 w-full h-full bg-obsidian opacity-0 group-hover:opacity-[0.02] transition-opacity"></div>
            <h2 className="text-obsidian mb-8 text-4xl lg:text-6xl font-display uppercase italic leading-[0.85] tracking-tighter">
              A melhor defesa <br />é uma contabilidade <br />bem <span className="underline decoration-4 underline-offset-8">estruturada</span>.
            </h2>
            <p className="text-obsidian/70 text-lg mb-12 max-w-xl mx-auto font-sans font-medium uppercase tracking-tight">
              30 anos de Sidrolândia. 100% Digital. Solidez inegociável.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="https://wa.me/5567996011356"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-obsidian text-amber-electric px-12 py-5 font-mono font-bold tracking-widest hover:scale-105 transition-all shadow-2xl"
              >
                <Phone size={20} />
                FALAR COM UM VETOR
              </a>
              <a
                href="/contato"
                className="inline-flex items-center gap-3 border-2 border-obsidian text-obsidian px-12 py-5 font-mono font-bold tracking-widest hover:bg-obsidian hover:text-amber-electric transition-all"
              >
                <MessageSquare size={20} />
                SOLICITAR PLANO
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
