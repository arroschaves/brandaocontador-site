import Link from 'next/link';
import { Phone, Mail, MapPin, Users, Shield, Clock, Award, Calculator, FileText, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <main className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="inline-flex items-center bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Award className="w-4 h-4 mr-2" />
                Tradição e confiança desde 1992 em Sidrolândia-MS
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Sua <span className="text-yellow-500">Contabilidade</span> em 
                <span className="block text-yellow-400">Mãos Seguras</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl">
                Especialistas em contabilidade para <strong className="text-white">empresários</strong>, <strong className="text-white">produtores rurais</strong> e <strong className="text-white">pessoas físicas</strong> em Sidrolândia-MS. 
                Cuidamos da sua empresa para você focar no que realmente importa: <strong className="text-yellow-400">crescer</strong>.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a
                  href="https://wa.me/5567996011356"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-yellow-500 text-black px-8 py-4 rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-300 text-center flex items-center justify-center"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Fale Conosco no WhatsApp
                </a>
                <a
                  href="#servicos"
                  className="border-2 border-yellow-500 text-yellow-500 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-500 hover:text-black transition-all duration-300 text-center"
                >
                  Conheça Nossos Serviços
                </a>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-green-400" />
                  Certificado Digital
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-blue-400" />
                  Atendimento Rápido
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-purple-400" />
                  +200 Clientes
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-yellow-500/20 to-transparent rounded-3xl p-8 backdrop-blur-sm border border-yellow-500/30">
                <img
                  src="/logocirculo.png"
                  alt="Brandão Contabilidade"
                  className="w-64 h-64 mx-auto mb-6 rounded-full shadow-2xl"
                />
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-yellow-400 mb-2">Brandão Contabilidade</h3>
                  <p className="text-gray-300">Sidrolândia - MS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-16 px-6 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-500 mb-4">
              Por que escolher a Brandão Contabilidade?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Oferecemos soluções completas e personalizadas para cada tipo de cliente
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-700 hover:border-yellow-500/50 transition-all duration-300">
              <div className="bg-yellow-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Calculator className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-yellow-400 mb-4">Para Empresários</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Abertura e legalização de empresas</li>
                <li>• Escrituração fiscal e contábil</li>
                <li>• Folha de pagamento completa</li>
                <li>• Planejamento tributário</li>
                <li>• Consultoria empresarial</li>
              </ul>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-700 hover:border-yellow-500/50 transition-all duration-300">
              <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-4">Para Produtores Rurais</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Contabilidade rural especializada</li>
                <li>• ITR e declarações específicas</li>
                <li>• Controle de safras e custos</li>
                <li>• Benefícios previdenciários rurais</li>
                <li>• Certificação de imóveis rurais</li>
              </ul>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-700 hover:border-yellow-500/50 transition-all duration-300">
              <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-blue-400 mb-4">Para Pessoas Físicas</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Imposto de Renda completo</li>
                <li>• Declaração de bens e direitos</li>
                <li>• Regularização de CPF</li>
                <li>• Orientação tributária</li>
                <li>• Planejamento sucessório</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços Principais */}
      <section id="servicos" className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-500 mb-4">
              Nossos Serviços Especializados
            </h2>
            <p className="text-xl text-gray-300">
              Soluções completas para todas as suas necessidades contábeis
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Escrituração Fiscal",
                description: "Escrituração completa e atualizada conforme legislação vigente",
                icon: "📊"
              },
              {
                title: "Abertura de Empresas",
                description: "Processo completo de abertura, alteração e baixa de empresas",
                icon: "🏢"
              },
              {
                title: "Área Trabalhista",
                description: "Folha de pagamento, eSocial, admissões e demissões",
                icon: "👥"
              },
              {
                title: "Imposto de Renda",
                description: "Declaração completa para pessoas físicas e jurídicas",
                icon: "📋"
              },
              {
                title: "Gestão Empresarial",
                description: "Consultoria e planejamento estratégico para seu negócio",
                icon: "📈"
              },
              {
                title: "Contabilidade Rural",
                description: "Especialização em agronegócio e atividades rurais",
                icon: "🌾"
              }
            ].map((servico, idx) => (
              <div
                key={idx}
                className="bg-slate-900/50 rounded-xl p-6 border border-slate-700 hover:border-yellow-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="text-4xl mb-4">{servico.icon}</div>
                <h3 className="text-xl font-bold text-yellow-400 mb-3">{servico.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {servico.description}
                </p>
                <Link 
                  href="/servicos" 
                  className="inline-block mt-4 text-yellow-500 hover:text-yellow-400 font-medium text-sm"
                >
                  Saiba mais →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-yellow-500 mb-6">
            Pronto para Simplificar sua Contabilidade?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Entre em contato conosco e descubra como podemos ajudar sua empresa a crescer
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/5567996011356"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-yellow-500 text-black px-8 py-4 rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-300 flex items-center justify-center"
            >
              <Phone className="w-5 h-5 mr-2" />
              WhatsApp: (67) 99601-1356
            </a>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-16 px-6 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-500 mb-4">
              Entre em Contato
            </h2>
            <p className="text-xl text-gray-300">
              Estamos prontos para atender você
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-700 text-center">
              <div className="bg-yellow-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-yellow-400 mb-4">WhatsApp</h3>
              <div className="space-y-2 text-gray-300">
                <p>(67) 99601-1356</p>
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-700 text-center">
              <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-blue-400 mb-4">E-mail</h3>
              <p className="text-gray-300">adm@brandaocontador.com.br</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-700 text-center">
              <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-4">Endereço</h3>
              <p className="text-gray-300">
                Rua Santa Catarina, 1010<br />
                Centro - Sidrolândia - MS
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
