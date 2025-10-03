import Link from 'next/link';
import { MapPin, TrendingUp, Shield, Award, Calculator, Users, Phone, MessageSquare } from 'lucide-react';

export default function Agronegocio() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-50 mb-6 text-balance">
            Contabilidade para <span className="text-gradient">Agronegócio</span> e Produtor Rural
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Soluções especializadas para produtores rurais (PF e PJ) no Mato Grosso do Sul e região. Gestão contábil, tributária e fiscal adaptada ao agronegócio, com foco na Reforma Tributária 2026.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/contato" className="btn-primary w-full sm:w-auto">
              <Phone className="w-5 h-5 mr-2" />
              Consultoria Rural Gratuita
            </Link>
            <Link href="/reforma-tributaria" className="btn-secondary w-full sm:w-auto">
              <TrendingUp className="w-5 h-5 mr-2" />
              Reforma 2026 no Agro
            </Link>
          </div>
          <div className="flex items-center gap-6 text-sm text-neutral-400 mt-8 justify-center">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-success-400" />
              Especialistas em ICMS Rural
            </div>
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-2 text-primary-400" />
              +200 Clientes no Agro
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-warning-400" />
              PF e PJ Atendidas
            </div>
          </div>
        </div>
      </section>

      {/* Desafios no Agronegócio */}
      <section className="py-20 bg-neutral-800/30">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-neutral-50 mb-16 text-balance">
            Desafios Contábeis no Agronegócio
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center group">
              <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-500/30 transition-colors">
                <MapPin className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100 mb-4">Tributação Rural</h3>
              <p className="text-neutral-300 leading-relaxed">Gestão de ICMS rural, Funrural e regimes diferenciados para produtores PF/PJ. Otimização de créditos e deduções sazonais.</p>
            </div>
            <div className="card text-center group">
              <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-500/30 transition-colors">
                <TrendingUp className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100 mb-4">Reforma Tributária no Agro</h3>
              <p className="text-neutral-300 leading-relaxed">Impactos do IBS/CBS em 2026: Regimes específicos para agricultura, preservação de incentivos fiscais e transição suave.</p>
            </div>
            <div className="card text-center group">
              <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-500/30 transition-colors">
                <Calculator className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100 mb-4">Declarações e Obrigações</h3>
              <p className="text-neutral-300 leading-relaxed">DCTRural, ITR, DIRF rural e eSocial para agro. Conformidade com SEFAZ MS e Receita Federal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços para Produtor Rural */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-50 mb-4 text-balance">
              Nossos Serviços para o Agronegócio
            </h2>
            <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
              Atendimento especializado para produtores rurais de todos os portes
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card group">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                <Shield className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100 mb-3">ICMS Rural</h3>
              <p className="text-neutral-300 mb-4 leading-relaxed">Apuração e otimização de ICMS diferencial de alíquota para operações interesbtais.</p>
              <ul className="text-sm text-neutral-400 space-y-2">
                <li>• Créditos presumidos</li>
                <li>• Exportações de commodities</li>
                <li>• Regime especial MS</li>
              </ul>
            </div>
            <div className="card group">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                <Award className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100 mb-3">Funrural e ITR</h3>
              <p className="text-neutral-300 mb-4 leading-relaxed">Gestão de contribuições previdenciárias e Imposto Territorial Rural.</p>
              <ul className="text-sm text-neutral-400 space-y-2">
                <li>• Descontos para PF rural</li>
                <li>• Planejamento sucessório</li>
                <li>• Isenções para pequenas propriedades</li>
              </ul>
            </div>
            <div className="card group">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                <Calculator className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100 mb-3">Regimes Tributários</h3>
              <p className="text-neutral-300 mb-4 leading-relaxed">Assessoria em Lucro Presumido, Real e Simples para PJ rural.</p>
              <ul className="text-sm text-neutral-400 space-y-2">
                <li>• Elegibilidade Funrural</li>
                <li>• Planejamento para Reforma</li>
                <li>• Otimização de custos</li>
              </ul>
            </div>
            <div className="card group">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                <Users className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100 mb-3">Consultoria Agro</h3>
              <p className="text-neutral-300 mb-4 leading-relaxed">Estratégias financeiras e fiscais adaptadas ao ciclo produtivo.</p>
              <ul className="text-sm text-neutral-400 space-y-2">
                <li>• Análise de safra</li>
                <li>• Financiamentos rurais</li>
                <li>• Sustentabilidade fiscal</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Impacto da Reforma no Agro */}
      <section className="py-20 bg-neutral-800/30">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-neutral-50 mb-16 text-balance">
            Reforma Tributária e o Produtor Rural
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card p-6">
              <TrendingUp className="w-12 h-12 text-primary-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-100 mb-4 text-center">2025-2026: Mudanças no Setor</h3>
              <p className="text-neutral-300 leading-relaxed text-center">
                IBS diferenciado para agronegócio, preservando incentivos do ICMS rural. Cashback para insumos essenciais. Transição gradual para PF/PJ, com foco em não cumulatividade.
              </p>
              <ul className="text-sm text-neutral-400 mt-4 space-y-2">
                <li>• Regime específico para produtores</li>
                <li>• Créditos sobre energia e fertilizantes</li>
                <li>• Integração com exportações agro</li>
              </ul>
            </div>
            <div className="card p-6">
              <Shield className="w-12 h-12 text-primary-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-100 mb-4 text-center">Como Podemos Ajudar</h3>
              <p className="text-neutral-300 leading-relaxed text-center">
                Nossa equipe conhece as especificidades do agro MS. Deixe-nos guiar na adaptação à Reforma e otimização tributária.
              </p>
              <ul className="text-sm text-neutral-400 mt-4 space-y-2">
                <li>• Auditoria tributária rural</li>
                <li>• Planejamento para 2026</li>
                <li>• Suporte em declarações</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-500">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6 text-balance">
            Eleve sua Produção com Contabilidade Inteligente
          </h2>
          <p className="text-lg text-neutral-800 mb-8 max-w-2xl mx-auto leading-relaxed">
            Contate-nos para serviços personalizados no agronegócio. Especialistas em produtor rural em Campo Grande e interior de MS.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://wa.me/5567996011356?text=Interesse%20em%20contabilidade%20para%20agroneg%C3%B3cio"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neutral-900 text-primary-400 px-8 py-4 rounded-xl font-semibold hover:bg-neutral-800 transition-all duration-300 flex items-center justify-center w-full sm:w-auto shadow-lg hover:shadow-xl"
            >
              <Phone className="w-5 h-5 mr-2" />
              WhatsApp Rural
            </a>
            <Link
              href="/contato"
              className="border-2 border-neutral-900 text-neutral-900 px-8 py-4 rounded-xl font-semibold hover:bg-neutral-900 hover:text-primary-400 transition-all duration-300 flex items-center justify-center w-full sm:w-auto"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Orçamento Agro
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
