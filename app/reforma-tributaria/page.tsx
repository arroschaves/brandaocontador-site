import Link from 'next/link';
import { FileText, TrendingUp, Shield, Users, Calculator, Clock, MessageSquare, Award, Phone } from 'lucide-react';

export default function ReformaTributaria() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-50 mb-6 text-balance">
            Reforma Tributária <span className="text-gradient">2026</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Entenda as mudanças da Reforma Tributária (EC 132/2023 e LC 214/2025) e como impactarão seu negócio em 2025 vs 2026. Soluções personalizadas para adaptação.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/contato" className="btn-primary w-full sm:w-auto">
              <MessageSquare className="w-5 h-5 mr-2" />
              Consultoria Gratuita
            </Link>
            <a
              href="https://www.gov.br/fazenda/pt-br/acesso-a-informacao/acoes-e-programas/reforma-tributaria/regulamentacao-da-reforma-tributaria"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full sm:w-auto"
            >
              <FileText className="w-5 h-5 mr-2" />
              Site Oficial
            </a>
          </div>
          <div className="flex items-center gap-6 text-sm text-neutral-400 mt-8 justify-center">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-success-400" />
              Regulada por EC 132/2023
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-primary-400" />
              Transição 2024-2032
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-warning-400" />
              Impacta Todos os Setores
            </div>
          </div>
        </div>
      </section>

      {/* Introdução Geral */}
      <section className="py-20 bg-neutral-800/30">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-neutral-50 mb-8 text-balance">
            O que é a Reforma Tributária?
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="card p-6">
              <FileText className="w-12 h-12 text-primary-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-100 mb-4 text-center">2025: Fase de Transição Inicial</h3>
              <p className="text-neutral-300 leading-relaxed text-center">
                Início da implementação com ICMS e ISS coexistindo com IBS e CBS. Alíquotas testadas, foco em cashback para famílias e regimes diferenciados. Lei Complementar 214/2025 estabelece normas gerais.
              </p>
              <ul className="text-sm text-neutral-400 mt-4 space-y-2">
                <li>• Comitê Gestor Provisório do IBS</li>
                <li>• Avaliação quinquenal de impactos</li>
                <li>• Manutenção de regimes como Simples Nacional</li>
              </ul>
            </div>
            <div className="card p-6">
              <TrendingUp className="w-12 h-12 text-primary-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-100 mb-4 text-center">2026: Implementação Plena</h3>
              <p className="text-neutral-300 leading-relaxed text-center">
                Substituição gradual por IBS (estadual/municipal) e CBS (federal/union). Imposto Seletivo sobre produtos prejudiciais. Unificação de alíquotas, fim da guerra fiscal, distribuição de receitas entre entes federativos.
              </p>
              <ul className="text-sm text-neutral-400 mt-4 space-y-2">
                <li>• Alíquotas estimadas: IBS ~17-26%, CBS ~8-12%</li>
                <li>• Cashback para Cesta Básica e exportações</li>
                <li>• Transição até 2032 para regimes especiais</li>
              </ul>
            </div>
          </div>
          <div className="text-center">
            <a
              href="https://datanalytics.worldbank.org/simvat/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <Calculator className="w-5 h-5 mr-2 inline" />
              Simulador de Alíquotas - Banco Mundial
            </a>
          </div>
        </div>
      </section>

      {/* Impactos por Setor */}
      <section id="setores" className="py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-50 mb-4 text-balance">
              Impactos por Setor: 2025 vs 2026
            </h2>
            <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
              Análise detalhada das mudanças para diferentes setores econômicos
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card group">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                <Users className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100 mb-3">Comércio</h3>
              <div className="space-y-2 text-sm text-neutral-400">
                <p><strong>2025:</strong> ICMS com alíquota teste 1% IBS + 0.9% CBS.</p>
                <p><strong>2026:</strong> IBS pleno (20-25%), créditos amplos em estoque.</p>
              </div>
            </div>
            <div className="card group">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                <Shield className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100 mb-3">Indústria</h3>
              <div className="space-y-2 text-sm text-neutral-400">
                <p><strong>2025:</strong> Manutenção de regimes aduaneiros, transição gradual.</p>
                <p><strong>2026:</strong> CBS sobre produção, benefícios para bens de capital.</p>
              </div>
            </div>
            <div className="card group">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                <TrendingUp className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100 mb-3">Prestação de Serviços</h3>
              <div className="space-y-2 text-sm text-neutral-400">
                <p><strong>2025:</strong> ISS com teste de CBS 0.9%, planejamento inicial.</p>
                <p><strong>2026:</strong> IBS sobre serviços (alíquota unificada), fim de cumulatividade.</p>
              </div>
            </div>
            <div className="card group">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                <Award className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100 mb-3">Produtores Rurais</h3>
              <div className="space-y-2 text-sm text-neutral-400">
                <p><strong>2025:</strong> Regime específico com ICMS rural preservado.</p>
                <p><strong>2026:</strong> IBS diferenciado para PF/PJ, foco em agronegócio com créditos ampliados.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regimes de Tributação */}
      <section className="py-20 bg-neutral-800/30">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-neutral-50 mb-16 text-balance">
            Impacto nos Regimes de Tributação
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center group">
              <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-500/30 transition-colors">
                <Calculator className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100 mb-4">Simples Nacional</h3>
              <p className="text-neutral-300 leading-relaxed">2025: Manutenção com anexo para IBS/CBS. 2026: Adaptação para micro/pequenas, alíquotas progressivas até 4.5% CBS + IBS proporcional.</p>
            </div>
            <div className="card text-center group">
              <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-500/30 transition-colors">
                <FileText className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100 mb-4">Lucro Presumido</h3>
              <p className="text-neutral-300 leading-relaxed">2025: Presunção ajustada para novos tributos. 2026: Base presumida para IBS/CBS, redução cumulatividade com créditos totais.</p>
            </div>
            <div className="card text-center group">
              <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-500/30 transition-colors">
                <TrendingUp className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100 mb-4">Lucro Real</h3>
              <p className="text-neutral-300 leading-relaxed">2025: Integração gradual de créditos. 2026: Tributação sobre valor agregado real, IBS/CBS não cumulativos, foco em grandes empresas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-500">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6 text-balance">
            Prepare seu Negócio para 2026
          </h2>
          <p className="text-lg text-neutral-800 mb-8 max-w-2xl mx-auto leading-relaxed">
            Nossa equipe de especialistas está pronta para assessorar na transição tributária. Agende uma consulta gratuita.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/contato"
              className="bg-neutral-900 text-primary-400 px-8 py-4 rounded-xl font-semibold hover:bg-neutral-800 transition-all duration-300 flex items-center justify-center w-full sm:w-auto shadow-lg hover:shadow-xl"
            >
              <Phone className="w-5 h-5 mr-2" />
              Agendar Consulta
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
