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
    yellow: "from-primary-500/20 to-primary-600/20 border-primary-500/30 text-primary-400",
    blue: "from-primary-500/20 to-primary-600/20 border-primary-500/30 text-primary-400",
    green: "from-success-500/20 to-success-600/20 border-success-500/30 text-success-400",
    purple: "from-primary-500/20 to-primary-600/20 border-primary-500/30 text-primary-400",
    orange: "from-warning-500/20 to-warning-600/20 border-warning-500/30 text-warning-400",
    emerald: "from-success-500/20 to-success-600/20 border-success-500/30 text-success-400"
  };

  return (
    <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20">
        <div className="container-custom text-center">
          <div className="inline-flex items-center bg-primary-500/20 text-primary-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Award className="w-4 h-4 mr-2" />
            Serviços Especializados
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Nossos <span className="text-gradient">Serviços</span>
          </h1>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Oferecemos soluções completas e personalizadas para empresários, 
            produtores rurais e pessoas físicas em Campo Grande-MS
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-neutral-400">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-success-400" />
              Certificado Digital
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-primary-400" />
              Atendimento Rápido
            </div>
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-2 text-primary-400" />
              32+ Anos de Tradição
            </div>
          </div>
        </div>
      </section>

      {/* Serviços Detalhados */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-8">
            {servicos.map((servico, idx) => (
              <div
                key={idx}
                className={`card bg-gradient-to-br ${colorClasses[servico.color as keyof typeof colorClasses]} border backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-300`}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[servico.color as keyof typeof colorClasses]}`}>
                    {servico.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-neutral-100 mb-2">{servico.title}</h3>
                    <p className="text-neutral-300 leading-relaxed">{servico.description}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-neutral-100">O que inclui:</h4>
                  <ul className="space-y-2">
                    {servico.detalhes.map((detalhe, detIdx) => (
                      <li key={detIdx} className="flex items-start gap-2 text-neutral-300">
                        <span className="text-primary-400 mt-1">•</span>
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
      <section className="py-20 bg-neutral-800/50">
        <div className="container-custom max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-6">
            Precisa de Algum Desses Serviços?
          </h2>
          <p className="text-xl text-neutral-300 mb-8 leading-relaxed">
            Entre em contato conosco e solicite um orçamento personalizado
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/5567996011356"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center justify-center"
            >
              Solicitar Orçamento
            </a>
            <a
              href="/contato"
              className="btn-secondary"
            >
              Fale Conosco
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
