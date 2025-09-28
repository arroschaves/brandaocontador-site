import Header from '../components/Header';
import { Calculator, Building, Users, FileText, TrendingUp, Leaf, Shield, Clock, Award } from 'lucide-react';

export default function ServicosPage() {
  const servicos = [
    {
      title: "Escrituração Fiscal",
      description: "Escrituração completa e atualizada conforme legislação vigente",
      icon: <Calculator className="w-8 h-8" />,
      color: "yellow",
      detalhes: [
        "Apuração de impostos (ICMS, IPI, PIS, COFINS)",
        "Escrituração Fiscal Digital (EFD)",
        "SPED Fiscal e Contribuições",
        "Declarações acessórias",
        "Acompanhamento de obrigações fiscais"
      ]
    },
    {
      title: "Abertura de Empresas",
      description: "Processo completo de abertura, alteração e baixa de empresas",
      icon: <Building className="w-8 h-8" />,
      color: "blue",
      detalhes: [
        "Consulta de viabilidade",
        "Registro na Junta Comercial",
        "Inscrições municipais e estaduais",
        "Alterações contratuais",
        "Baixa de empresas"
      ]
    },
    {
      title: "Área Trabalhista",
      description: "Folha de pagamento, eSocial, admissões e demissões",
      icon: <Users className="w-8 h-8" />,
      color: "green",
      detalhes: [
        "Folha de pagamento completa",
        "eSocial e DCTFWeb",
        "Admissões e demissões",
        "Férias e 13º salário",
        "Rescisões trabalhistas"
      ]
    },
    {
      title: "Imposto de Renda",
      description: "Declaração completa para pessoas físicas e jurídicas",
      icon: <FileText className="w-8 h-8" />,
      color: "purple",
      detalhes: [
        "Declaração de Pessoa Física",
        "Declaração de Pessoa Jurídica",
        "Planejamento tributário",
        "Restituição e parcelamento",
        "Retificação de declarações"
      ]
    },
    {
      title: "Gestão Empresarial",
      description: "Consultoria e planejamento estratégico para seu negócio",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "orange",
      detalhes: [
        "Análise de viabilidade econômica",
        "Planejamento tributário",
        "Consultoria empresarial",
        "Controle de custos",
        "Relatórios gerenciais"
      ]
    },
    {
      title: "Contabilidade Rural",
      description: "Especialização em agronegócio e atividades rurais",
      icon: <Leaf className="w-8 h-8" />,
      color: "emerald",
      detalhes: [
        "ITR - Imposto Territorial Rural",
        "Contabilidade de safras",
        "Certificação de imóveis rurais",
        "Benefícios previdenciários rurais",
        "Controle de produção agrícola"
      ]
    }
  ];

  const colorClasses = {
    yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400",
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400",
    green: "from-green-500/20 to-green-600/20 border-green-500/30 text-green-400",
    purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400",
    orange: "from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400",
    emerald: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400"
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Award className="w-4 h-4 mr-2" />
            Serviços Especializados
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Nossos <span className="text-yellow-500">Serviços</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Oferecemos soluções completas e personalizadas para empresários, 
            produtores rurais e pessoas físicas em Sidrolândia-MS
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-green-400" />
              Certificado Digital
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-blue-400" />
              Atendimento Rápido
            </div>
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-2 text-yellow-400" />
              +15 Anos de Experiência
            </div>
          </div>
        </div>
      </section>

      {/* Serviços Detalhados */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {servicos.map((servico, idx) => (
              <div
                key={idx}
                className={`bg-gradient-to-br ${colorClasses[servico.color as keyof typeof colorClasses]} rounded-xl p-8 border backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-300`}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[servico.color as keyof typeof colorClasses]}`}>
                    {servico.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{servico.title}</h3>
                    <p className="text-gray-300">{servico.description}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-white">O que inclui:</h4>
                  <ul className="space-y-2">
                    {servico.detalhes.map((detalhe, detIdx) => (
                      <li key={detIdx} className="flex items-start gap-2 text-gray-300">
                        <span className="text-yellow-400 mt-1">•</span>
                        <span className="text-sm">{detalhe}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-yellow-500 mb-6">
            Precisa de Algum Desses Serviços?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Entre em contato conosco e solicite um orçamento personalizado
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/5567996011356"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-yellow-500 text-black px-8 py-4 rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-300 flex items-center justify-center"
            >
              Solicitar Orçamento
            </a>
            <a
              href="/contato"
              className="border-2 border-yellow-500 text-yellow-500 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-500 hover:text-black transition-all duration-300"
            >
              Fale Conosco
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
