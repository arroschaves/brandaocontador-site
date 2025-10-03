import Link from 'next/link';
import { AlertCircle, FileText, Briefcase, DollarSign, Landmark, Scale, TrendingUp } from 'lucide-react';
import { useState } from 'react'; // Para placeholder de refresh (simulado)

export default function NoticiasContabeis() {
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleString('pt-BR'));

  const simulateRefresh = () => {
    // Placeholder: Em produção, integrar com API/RSS para fetch real
    setLastUpdate(new Date().toLocaleString('pt-BR'));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-50 mb-6 text-balance">
            Notícias e <span className="text-gradient">Atualizações</span> Contábeis
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Fique por dentro das informações importantes e atualizações dos principais setores da contabilidade. Conteúdo atualizado a cada hora com fontes oficiais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              onClick={simulateRefresh}
              className="btn-primary w-full sm:w-auto flex items-center"
            >
              <Scale className="w-5 h-5 mr-2" />
              Atualizar Agora
            </button>
            <Link href="/contato" className="btn-secondary w-full sm:w-auto">
              <FileText className="w-5 h-5 mr-2" />
              Consultar Especialista
            </Link>
          </div>
          <div className="text-sm text-neutral-400 mt-2">
            Última atualização: {lastUpdate}
          </div>
        </div>
      </section>

      {/* Setores da Contabilidade */}
      <section id="setores" className="py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-50 mb-4 text-balance">
              Setores Principais
            </h2>
            <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
              Informações relevantes de órgãos e temas contábeis, com links oficiais e alertas recentes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Tributária */}
            <div className="card group p-6">
              <div className="flex items-center mb-4">
                <DollarSign className="w-8 h-8 text-primary-400 mr-3" />
                <h3 className="text-xl font-semibold text-neutral-100">Tributária</h3>
              </div>
              <ul className="space-y-3 text-sm text-neutral-300">
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-warning-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Atualização:</strong> Alíquotas IBS/CBS para 2026 publicadas (out/2025). Transição com cashback para famílias. <a href="https://www.gov.br/receitafederal/pt-br" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">Ver mais na RFB</a></span>
                </li>
                <li className="flex items-start">
                  <FileText className="w-4 h-4 text-success-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Reforma Tributária: LC 214/2025 em vigor. Impacto em Simples Nacional. <a href="https://www.gov.br/economia/pt-br/assuntos/reforma-tributaria" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">Detalhes</a></span>
                </li>
                <li><em>Próxima: Novos incentivos fiscais para exportações (estimado dez/2025).</em></li>
              </ul>
            </div>

            {/* Fiscal */}
            <div className="card group p-6">
              <div className="flex items-center mb-4">
                <FileText className="w-8 h-8 text-primary-400 mr-3" />
                <h3 className="text-xl font-semibold text-neutral-100">Fiscal</h3>
              </div>
              <ul className="space-y-3 text-sm text-neutral-300">
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-warning-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Alerta:</strong> Prazo SPED Fiscal Q4/2025 encurtado. Obrigações acessórias digitalizadas. <a href="https://www.gov.br/receitafederal/pt-br" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">RFB Alertas</a></span>
                </li>
                <li className="flex items-start">
                  <FileText className="w-4 h-4 text-success-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>NF-e 4.0: Validações aprimoradas para 2026. Integração com SEFAZ. <a href="https://www.nfe.fazenda.gov.br" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">Portal SEFAZ</a></span>
                </li>
                <li><em>Atual: Normas para DCTF (out/2025).</em></li>
              </ul>
            </div>

            {/* Trabalhista */}
            <div className="card group p-6">
              <div className="flex items-center mb-4">
                <Briefcase className="w-8 h-8 text-primary-400 mr-3" />
                <h3 className="text-xl font-semibold text-neutral-100">Trabalhista</h3>
              </div>
              <ul className="space-y-3 text-sm text-neutral-300">
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-warning-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Atualização:</strong> eSocial v.S 1.2: Novos campos para folha 2026. Prazo de envio reduzido. <a href="https://www.gov.br/trabalho/pt-br" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">MTE Portal</a></span>
                </li>
                <li className="flex items-start">
                  <FileText className="w-4 h-4 text-success-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Reforma Trabalhista: Ajustes em FGTS para PJ. <a href="https://www.gov.br/receitafederal/pt-br" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">INSS Guia</a></span>
                </li>
                <li><em>Próxima: CAGED digital obrigatório (nov/2025).</em></li>
              </ul>
            </div>

            {/* Econômicos */}
            <div className="card group p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-8 h-8 text-primary-400 mr-3" />
                <h3 className="text-xl font-semibold text-neutral-100">Econômicos</h3>
              </div>
              <ul className="space-y-3 text-sm text-neutral-300">
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-warning-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Relatório:</strong> Inflação e IPCA impactam deduções fiscais (set/2025). <a href="https://www.ibge.gov.br" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">IBGE Dados</a></span>
                </li>
                <li className="flex items-start">
                  <FileText className="w-4 h-4 text-success-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Análise econômica: Crescimento PIB 2.5% projetado para 2026, efeitos na contabilidade. <a href="https://www.bcb.gov.br" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">BCB Relatórios</a></span>
                </li>
                <li><em>Atual: Indicadores setoriais (out/2025).</em></li>
              </ul>
            </div>

            {/* Receita Federal */}
            <div className="card group p-6">
              <div className="flex items-center mb-4">
                <Landmark className="w-8 h-8 text-primary-400 mr-3" />
                <h3 className="text-xl font-semibold text-neutral-100">Receita Federal</h3>
              </div>
              <ul className="space-y-3 text-sm text-neutral-300">
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-warning-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Alerta:</strong> DIRF 2026: Novos campos para IBS. Prazo jan/2025. <a href="https://www.gov.br/receitafederal/pt-br" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">RFB Site</a></span>
                </li>
                <li className="flex items-start">
                  <FileText className="w-4 h-4 text-success-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>ECF: Integração com SPED, multas por atraso. <a href="https://www.gov.br/receitafederal/pt-br" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">Manual ECF</a></span>
                </li>
                <li><em>Próxima: DCTFWeb enhancements (dez/2025).</em></li>
              </ul>
            </div>

            {/* SEFAZ e CFC */}
            <div className="card group p-6">
              <div className="flex items-center mb-4">
                <Scale className="w-8 h-8 text-primary-400 mr-3" />
                <h3 className="text-xl font-semibold text-neutral-100">SEFAZ & CFC</h3>
              </div>
              <ul className="space-y-3 text-sm text-neutral-300">
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-warning-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>SEFAZ:</strong> SINIEF atualiza convênios ICMS (out/2025). <a href="https://www.confaz.fazenda.gov.br" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">CONFAZ Portal</a></span>
                </li>
                <li className="flex items-start">
                  <FileText className="w-4 h-4 text-success-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>CFC: Normas NBC TG 1000 para PMEs. Treinamentos obrigatórios. <a href="https://cfc.org.br" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">CFC Site</a></span>
                </li>
                <li><em>Atual: Resoluções CFC (set/2025).</em></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Nota sobre Updates */}
      <section className="py-20 bg-neutral-800/50">
        <div className="container-custom text-center">
          <p className="text-lg text-neutral-300 mb-4">
            <strong>Nota:</strong> Este conteúdo é estático com exemplos. Para atualizações automáticas a cada hora, integre API/RSS de fontes como RFB, CFC ou agregadores de notícias contábeis (ex: via cron job no servidor ou service worker para client-side fetch).
          </p>
          <Link href="/reforma-tributaria" className="btn-secondary">
            Ver Reforma Tributária 2026
          </Link>
        </div>
      </section>
    </main>
  );
}
