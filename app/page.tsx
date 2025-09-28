import Link from 'next/link';
import { Phone, Mail, MapPin, Users, Shield, Clock, Award, Calculator, FileText, TrendingUp, MessageSquare } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-50 mb-6 text-balance">
            Contabilidade que <span className="text-gradient">Impulsiona</span> seu Negócio
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            <strong className="text-neutral-100">Mais de 15 anos</strong> de experiência oferecendo soluções contábeis completas para <strong className="text-primary-400">empresas de todos os portes</strong>. Transformamos números em estratégias de crescimento.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="btn-primary w-full sm:w-auto">
              <MessageSquare className="w-5 h-5 mr-2" />
              Solicitar Proposta
            </button>
            <button className="btn-secondary w-full sm:w-auto">
              <Phone className="w-5 h-5 mr-2" />
              Falar no WhatsApp
            </button>
          </div>
          <div className="flex items-center gap-6 text-sm text-neutral-400 mt-8 justify-center">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-success-400" />
              Certificado Digital
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-primary-400" />
              Atendimento Rápido
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-warning-400" />
              +200 Clientes
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-20 bg-neutral-800/30">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-neutral-50 mb-16 text-balance">
            Por que escolher a <span className="text-gradient">Brandão Contabilidade</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center group">
              <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-500/30 transition-colors">
                <Shield className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100 mb-4">Segurança Total</h3>
              <p className="text-neutral-300 leading-relaxed">Seus dados protegidos com tecnologia de ponta e conformidade total com a LGPD</p>
            </div>
            <div className="card text-center group">
              <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-500/30 transition-colors">
                <Clock className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100 mb-4">Agilidade</h3>
              <p className="text-neutral-300 leading-relaxed">Processos otimizados que economizam seu tempo e aceleram resultados</p>
            </div>
            <div className="card text-center group">
              <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-500/30 transition-colors">
                <Users className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100 mb-4">Atendimento Personalizado</h3>
              <p className="text-neutral-300 leading-relaxed">Cada cliente é único. Oferecemos soluções sob medida para seu negócio</p>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços Principais */}
      <section id="servicos" className="py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-50 mb-4 text-balance">
              Nossos <span className="text-gradient">Serviços</span>
            </h2>
            <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
              Soluções completas em contabilidade para impulsionar seu negócio
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card group">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                <Calculator className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100 mb-3">Contabilidade Empresarial</h3>
              <p className="text-neutral-300 mb-4 leading-relaxed">Escrituração completa, balanços e demonstrações financeiras</p>
              <ul className="text-sm text-neutral-400 space-y-2">
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>Escrituração fiscal e contábil</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>Balanços e demonstrações</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>Análise de indicadores</li>
              </ul>
            </div>
            <div className="card group">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                <FileText className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100 mb-3">Departamento Fiscal</h3>
              <p className="text-neutral-300 mb-4 leading-relaxed">Gestão completa de obrigações fiscais e tributárias</p>
              <ul className="text-sm text-neutral-400 space-y-2">
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>Apuração de impostos</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>Declarações obrigatórias</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>Planejamento tributário</li>
              </ul>
            </div>
            <div className="card group">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                <Users className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100 mb-3">Departamento Pessoal</h3>
              <p className="text-neutral-300 mb-4 leading-relaxed">Folha de pagamento e gestão de recursos humanos</p>
              <ul className="text-sm text-neutral-400 space-y-2">
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>Folha de pagamento</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>Admissões e demissões</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>Benefícios e encargos</li>
              </ul>
            </div>
            <div className="card group">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                <Award className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100 mb-3">Abertura de Empresas</h3>
              <p className="text-neutral-300 mb-4 leading-relaxed">Processo completo de constituição empresarial</p>
              <ul className="text-sm text-neutral-400 space-y-2">
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>Registro na Junta Comercial</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>Inscrições municipais</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>Licenças e alvarás</li>
              </ul>
            </div>
            <div className="card group">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                <TrendingUp className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100 mb-3">Consultoria</h3>
              <p className="text-neutral-300 mb-4 leading-relaxed">Orientação estratégica para crescimento do negócio</p>
              <ul className="text-sm text-neutral-400 space-y-2">
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>Análise financeira</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>Planejamento estratégico</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>Otimização de processos</li>
              </ul>
            </div>
            <div className="card group">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                <Shield className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100 mb-3">Imposto de Renda</h3>
              <p className="text-neutral-300 mb-4 leading-relaxed">Declaração completa para pessoas físicas e jurídicas</p>
              <ul className="text-sm text-neutral-400 space-y-2">
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>Pessoa física e jurídica</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>Restituição máxima</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>Regularização pendências</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-500">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6 text-balance">
            Pronto para Transformar sua Contabilidade?
          </h2>
          <p className="text-lg text-neutral-800 mb-8 max-w-2xl mx-auto leading-relaxed">
            Entre em contato conosco e descubra como podemos ajudar seu negócio a crescer com soluções contábeis personalizadas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://wa.me/5567996011356"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neutral-900 text-primary-400 px-8 py-4 rounded-xl font-semibold hover:bg-neutral-800 transition-all duration-300 flex items-center justify-center w-full sm:w-auto shadow-lg hover:shadow-xl"
            >
              <Phone className="w-5 h-5 mr-2" />
              Falar com Especialista
            </a>
            <a
              href="/contato"
              className="border-2 border-neutral-900 text-neutral-900 px-8 py-4 rounded-xl font-semibold hover:bg-neutral-900 hover:text-primary-400 transition-all duration-300 flex items-center justify-center w-full sm:w-auto"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Solicitar Orçamento
            </a>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-16 bg-neutral-800/50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-4">
              Entre em Contato
            </h2>
            <p className="text-xl text-neutral-300 leading-relaxed">
              Estamos prontos para atender você
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="bg-success-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="w-8 h-8 text-success-400" />
              </div>
              <h3 className="text-xl font-bold text-success-400 mb-4">WhatsApp</h3>
              <div className="space-y-2 text-neutral-300">
                <p>(67) 99601-1356</p>
              </div>
            </div>
            <div className="card text-center">
              <div className="bg-primary-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-primary-400 mb-4">E-mail</h3>
              <p className="text-neutral-300">adm@brandaocontador.com.br</p>
            </div>
            <div className="card text-center">
              <div className="bg-warning-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-warning-400" />
              </div>
              <h3 className="text-xl font-bold text-warning-400 mb-4">Endereço</h3>
              <p className="text-neutral-300">
                Rua Santa Catarina, 1010<br />
                Centro - Campo Grande - MS
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
