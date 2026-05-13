import { Metadata } from 'next';
import Link from 'next/link';
import {
  Calculator, Building2, Users, FileText, TrendingUp, Leaf,
  Phone, MessageSquare, CheckCircle2, ChevronRight, ArrowUpRight
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Serviços Contábeis em Sidrolândia - MS | Brandão Contabilidade',
  description: 'Serviços contábeis, fiscais, trabalhistas, societários e para agronegócio em Sidrolândia - MS, com atendimento para empresas e produtores rurais.',
  alternates: {
    canonical: '/servicos',
  },
  openGraph: {
    title: 'Serviços Contábeis em Sidrolândia - MS | Brandão Contabilidade',
    description: 'Conheça os serviços da Brandão Contabilidade para empresas, departamento pessoal, planejamento tributário e agronegócio.',
  },
}

export default function ServicosPage() {
  const servicos = [
    {
      title: 'Contabilidade Empresarial',
      description: 'Organização contábil para sua empresa operar com mais clareza, controle e segurança nas decisões.',
      icon: Calculator,
      color: 'from-emerald-500 to-teal-500',
      detalhes: [
        'Apuração de impostos (ICMS, IPI, PIS, COFINS)',
        'Escrituração Fiscal Digital (EFD)',
        'SPED Fiscal e Contribuições',
        'Declarações acessórias',
        'Acompanhamento de obrigações fiscais',
      ],
    },
    {
      title: 'Soluções Societárias',
      description: 'Abertura, estruturação e regularização com orientação prática para cada etapa da empresa.',
      icon: Building2,
      color: 'from-blue-500 to-indigo-500',
      detalhes: [
        'Consulta de viabilidade e registro',
        'Inscrições municipais e estaduais',
        'Alterações contratuais complexas',
        'Baixa e regularização',
        'Holding e proteção patrimonial',
      ],
    },
    {
      title: 'Departamento Pessoal',
      description: 'Rotinas trabalhistas e folha com mais previsibilidade, conformidade e menos ruído no dia a dia.',
      icon: Users,
      color: 'from-purple-500 to-violet-500',
      detalhes: [
        'Folha de pagamento robusta',
        'eSocial e DCTFWeb',
        'Gestão de admissões e férias',
        'Consultoria preventiva',
        'Relatórios de custos previdenciários',
      ],
    },
    {
      title: 'IRPF & Planejamento Fiscal',
      description: 'Planejamento tributário e declarações com foco em reduzir exposição e ganhar eficiência.',
      icon: FileText,
      color: 'from-amber-500 to-orange-500',
      detalhes: [
        'IRPF para investidores',
        'Planejamento tributário anual',
        'Restituições e malha fina',
        'Capitais no Exterior',
        'Ganho de Capital em ativos digitais',
      ],
    },
    {
      title: 'Consultoria Estratégica',
      description: 'Leitura de números e operação para transformar dados em decisões mais seguras.',
      icon: TrendingUp,
      color: 'from-rose-500 to-pink-500',
      detalhes: [
        'Análise de viabilidade econômica',
        'Fluxo de caixa projetado',
        'Controle de custos industriais',
        'Relatórios gerenciais (BI)',
        'Valuation de empresas',
      ],
    },
    {
      title: 'Agronegócio',
      description: 'Atendimento especializado para produtores e empresas do agro, com leitura técnica da operação.',
      icon: Leaf,
      color: 'from-green-500 to-lime-500',
      detalhes: [
        'LCDPR — Livro Caixa Digital',
        'ITR e ADA',
        'Contabilidade de safras e custos',
        'Benefícios previdenciários rurais',
        'Gestão de contratos de parceria',
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-background pt-24">
      {/* Hero */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero pointer-events-none" />
        <div className="container-custom relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-xs font-semibold text-primary mb-6">
            <ArrowUpRight className="w-3 h-3" /> Nosso Portfólio
          </span>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4 max-w-3xl">
            Soluções contábeis para sua empresa <span className="text-primary">crescer com mais segurança</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Cada serviço foi pensado para reduzir gargalos, proteger sua operação e dar mais clareza para a tomada de decisão.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {['Atendimento consultivo', 'Especialização em agro', 'Apoio fiscal, pessoal e societário'].map((item) => (
              <span key={item} className="rounded-full border border-border/70 bg-card/70 px-3 py-2 text-xs font-semibold text-muted-foreground">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Grid de Serviços */}
      <section className="py-16 md:py-20">
        <div className="container-custom">
          <div className="mb-10 rounded-[1.75rem] border border-primary/15 bg-primary/5 px-6 py-6 text-sm text-muted-foreground">
            <strong className="text-foreground">Não sabe por onde começar?</strong> Fale com a equipe e nós indicamos a estrutura ideal de atendimento para o seu momento, sem compromisso.
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicos.map((s, idx) => (
              <div key={idx} className="glass-card p-8 group reveal" style={{ animationDelay: `${idx * 100}ms` }}>
                {/* Ícone */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <s.icon className="w-7 h-7 text-white" />
                </div>

                {/* Título e descrição */}
                <h3 className="text-xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {s.description}
                </p>

                <a
                  href="https://wa.me/5567996011356?text=Olá! Quero entender melhor o serviço de atendimento da Brandão Contabilidade."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-primary mb-6"
                >
                  Conversar sobre este serviço <ChevronRight className="w-3.5 h-3.5" />
                </a>

                {/* Lista de serviços */}
                <div className="pt-5 border-t border-border">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">O que fazemos:</p>
                  <ul className="space-y-2.5">
                    {s.detalhes.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-foreground/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-90" />
        <div className="container-custom text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            O melhor momento para organizar sua operação é antes do problema aparecer.
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
            Se você quer apoio técnico próximo, respostas claras e uma contabilidade que acompanhe o crescimento do negócio, vamos conversar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/5567996011356"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-white text-emerald-700 px-8 py-4 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:brightness-110 transition-all active:scale-[0.98]"
            >
              <Phone className="w-5 h-5" />
              Solicitar atendimento
            </a>
            <Link
              href="/contato"
              className="inline-flex items-center justify-center gap-3 border-2 border-white/30 text-white px-8 py-4 font-semibold rounded-xl hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              <MessageSquare className="w-5 h-5" />
              Pedir proposta
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
