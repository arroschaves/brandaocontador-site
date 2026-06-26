import {
  Scale, AlertTriangle, ArrowRight, Calendar, FileText,
  Building2, Tractor, Store, Clock, CheckCircle2, XCircle,
  Info, Landmark, Receipt, TrendingUp, Users
} from 'lucide-react';
import { Metadata } from 'next';

/**
 * Página Reforma Tributária 2026 — Brandão Contabilidade
 * Portal completo com cronograma, impactos, regras MS e orientações
 */

export const metadata: Metadata = {
  title: 'Reforma Tributária 2026 | IBS CBS IS — Brandão Contabilidade',
  description: 'Guia completo da Reforma Tributária 2026: IBS, CBS, IS, cronograma de transição, impactos para empresas, agronegócio e MEI em Mato Grosso do Sul. Atualizado.',
  alternates: {
    canonical: '/reforma-tributaria',
  },
  openGraph: {
    title: 'Reforma Tributária 2026 — Guia Completo',
    description: 'Guia da Reforma Tributária com impactos para empresas e agronegócio em Mato Grosso do Sul.',
  },
};

interface TimelineItem {
  ano: string;
  titulo: string;
  descricao: string;
  status: 'concluido' | 'atual' | 'futuro';
}

const cronograma: TimelineItem[] = [
  { ano: '2023', titulo: 'EC 132 — Emenda Constitucional', descricao: 'Aprovação da PEC 45/2019 pelo Congresso Nacional. Base constitucional da reforma.', status: 'concluido' },
  { ano: '2024', titulo: 'Lei Complementar — Regulamentação', descricao: 'LC 214/2025 aprovada. Define regras de IBS, CBS e IS. Regulamenta alíquotas e transição.', status: 'concluido' },
  { ano: '2025', titulo: 'Período Preparatório', descricao: 'Criação do Comitê Gestor do IBS. Sistemas sendo desenvolvidos. Empresas iniciam adequação de ERP e processos.', status: 'concluido' },
  { ano: '2026', titulo: 'Início da Transição — ANO ATUAL', descricao: 'CBS a 0,9% e IBS a 0,1% em teste. Convivência com PIS/Cofins/ICMS/ISS. Período de adaptação obrigatório.', status: 'atual' },
  { ano: '2027', titulo: 'CBS Plena + IPI Extinto (exceto ZFM)', descricao: 'PIS e Cofins substituídos pela CBS. IPI extinto (exceto Zona Franca de Manaus). IBS em alíquota teste.', status: 'futuro' },
  { ano: '2029-2032', titulo: 'Transição Gradual do IBS', descricao: 'ICMS e ISS sendo gradualmente substituídos pelo IBS. Alíquota do IBS sobe progressivamente.', status: 'futuro' },
  { ano: '2033', titulo: 'Novo Sistema Pleno', descricao: 'Extinção total de ICMS, ISS, PIS e Cofins. Apenas CBS (federal), IBS (estadual/municipal) e IS (seletivo).', status: 'futuro' },
];

interface ImpostoInfo {
  sigla: string;
  nome: string;
  substitui: string;
  ambito: string;
  icone: React.ElementType;
  descricao: string;
  aliquotaRef: string;
}

const novosImpostos: ImpostoInfo[] = [
  {
    sigla: 'CBS',
    nome: 'Contribuição sobre Bens e Serviços',
    substitui: 'PIS + Cofins',
    ambito: 'Federal',
    icone: Landmark,
    descricao: 'Imposto federal sobre valor agregado. Base ampla, créditos financeiros amplos, alíquota uniforme (com exceções).',
    aliquotaRef: 'Referência: ~8,8% (2026: 0,9% em teste)',
  },
  {
    sigla: 'IBS',
    nome: 'Imposto sobre Bens e Serviços',
    substitui: 'ICMS + ISS',
    ambito: 'Estadual + Municipal',
    icone: Building2,
    descricao: 'Imposto subnacional sobre valor agregado. Cobrado no destino. Alíquota definida por cada ente (estado + município).',
    aliquotaRef: 'Referência: ~17,7% (2026: 0,1% em teste)',
  },
  {
    sigla: 'IS',
    nome: 'Imposto Seletivo',
    substitui: 'Parte do IPI',
    ambito: 'Federal',
    icone: AlertTriangle,
    descricao: 'Incide sobre bens e serviços prejudiciais à saúde ou meio ambiente: cigarros, bebidas alcoólicas, combustíveis fósseis, veículos poluentes, açúcar em excesso.',
    aliquotaRef: 'Produtos específicos (extrafiscal)',
  },
];

interface ImpactoSetor {
  setor: string;
  icone: React.ElementType;
  mudancas: string[];
  atencao: string[];
}

const impactosMS: ImpactoSetor[] = [
  {
    setor: 'Agronegócio',
    icone: Tractor,
    mudancas: [
      'Cesta básica com alíquota reduzida a 0% (CBS e IBS)',
      'Insumos agropecuários com redução de 60% na alíquota',
      'Produtor rural PF com faturamento até R$ 3,6M: regime simplificado',
      'Crédito presumido de IBS para produtores não optantes do IVA',
      'Cooperativas com regime tributário específico mantido',
      'Funrural e contribuições sobre receita bruta mantidos na transição',
    ],
    atencao: [
      'Adequação de NF-e com novos campos CBS/IBS obrigatórios em 2026',
      'Revisão completa de contratos de venda interestadual (cobrança no destino)',
      'Benefícios fiscais do ICMS MS (MS Competitivo) serão extintos gradualmente',
    ],
  },
  {
    setor: 'Comércio e Serviços',
    icone: Store,
    mudancas: [
      'IVA dual (CBS+IBS) substitui PIS, Cofins, ICMS e ISS',
      'Princípio do destino: imposto cobrado onde o consumo acontece',
      'Crédito financeiro amplo: tudo que entra na operação gera crédito',
      'Fim da guerra fiscal entre estados (alíquota uniforme nacional)',
      'Split payment: recolhimento automático no momento do pagamento',
    ],
    atencao: [
      'Serviços que pagavam ISS (~5%) terão alíquota cheia do IVA (~26,5%)',
      'Necessidade de adequação de ERP/sistemas fiscal para emissão CBS/IBS',
      'Empresas do Simples Nacional mantêm regime atual, mas podem optar pelo IVA',
    ],
  },
  {
    setor: 'Pessoa Física',
    icone: Users,
    mudancas: [
      'Cesta básica nacional com imposto zero',
      'Medicamentos essenciais com alíquota reduzida ou zero',
      'Cashback para famílias de baixa renda (devolução de CBS/IBS)',
      'Transporte público com alíquota reduzida de 60%',
      'Saúde e educação com redução de 60% na alíquota',
    ],
    atencao: [
      'Serviços como advocacia, contabilidade e medicina podem ficar mais caros',
      'Imposto Seletivo encarecerá cigarros, bebidas e veículos poluentes',
      'Acompanhar regulamentação específica de cashback (cadastro obrigatório)',
    ],
  },
];

const regrasMSEspecificas = [
  {
    titulo: 'ICMS MS — Transição Gradual',
    descricao: 'O ICMS de MS será reduzido progressivamente de 2029 a 2032. Em 2033, será totalmente substituído pelo IBS. Benefícios do MS Competitivo e MS Empreendedor serão extintos até 2032.',
  },
  {
    titulo: 'Fundo de Compensação MS',
    descricao: 'Estados que concedem benefícios fiscais de ICMS (como MS) receberão compensação do Fundo Nacional de Desenvolvimento Regional (FNDR) para mitigar perdas.',
  },
  {
    titulo: 'IBS MS — Alíquota Estadual',
    descricao: 'MS definirá sua alíquota de IBS. A alíquota de referência nacional é ~17,7%. O estado pode praticar alíquota diferente, que será somada à municipal.',
  },
  {
    titulo: 'Zona de Processamento de Exportação',
    descricao: 'Empresas em ZPE de MS mantêm tratamento diferenciado para exportação, com imunidade de CBS e IBS sobre exportações.',
  },
  {
    titulo: 'Gás Natural e Energia (MS)',
    descricao: 'Combustíveis e energia terão tratamento monofásico (imposto cobrado uma vez na cadeia). GN do campo de produção de MS tem regras específicas.',
  },
  {
    titulo: 'ITR e CAR — Impacto Indireto',
    descricao: 'Produtores rurais de MS devem manter regularidade do CAR e ITR em dia, pois serão pré-requisitos para regime simplificado de CBS/IBS em 2027.',
  },
];

export default function ReformaTributariaPage() {
  return (
    <main className="min-h-screen bg-background text-foreground pt-24">
      {/* Hero */}
      <section className="py-20 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-electric/5 via-transparent to-transparent pointer-events-none"></div>
        <div className="container-custom relative">
          <div className="flex items-center gap-4 mb-6">
            <span className="w-12 h-[1px] bg-primary"></span>
            <span className="text-xs font-mono text-primary tracking-[0.4em] uppercase">Atualizado 2026</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter leading-[0.8] mb-6">
            REFORMA <span className="text-primary italic font-display">TRIBUTÁRIA</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl font-sans leading-relaxed mb-8">
            Guia completo da nova tributação brasileira: IBS, CBS e Imposto Seletivo.
            Cronograma de transição, impactos por setor e regras específicas para <strong className="text-primary">Mato Grosso do Sul</strong>.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 bg-primary/10 border border-primary/30 text-primary text-xs font-mono uppercase tracking-wider">EC 132/2023</span>
            <span className="px-4 py-2 bg-primary/10 border border-primary/30 text-primary text-xs font-mono uppercase tracking-wider">LC 214/2025</span>
            <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono uppercase tracking-wider">Transição 2026–2033</span>
          </div>
        </div>
      </section>

      {/* Novos Impostos */}
      <section className="py-16 border-b border-border">
        <div className="container-custom">
          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-4">
            Os <span className="text-primary">Novos Impostos</span>
          </h2>
          <p className="text-muted-foreground font-sans mb-12 max-w-2xl">
            O sistema tributário brasileiro perde 5 impostos (PIS, Cofins, IPI, ICMS, ISS) e ganha 3 novos:
          </p>

          <div className="grid lg:grid-cols-3 gap-6">
            {novosImpostos.map((imposto, i) => (
              <div key={i} className="p-8 bg-muted/30 border border-border hover:border-primary/30 transition-all group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-background border border-border flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <imposto.icone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-primary">{imposto.sigla}</h3>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{imposto.ambito}</span>
                  </div>
                </div>
                <p className="text-sm font-bold text-neutral-300 mb-2 uppercase tracking-tight">{imposto.nome}</p>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed mb-4">{imposto.descricao}</p>
                <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                  <Receipt className="w-3.5 h-3.5 text-primary/60" />
                  <span className="text-[10px] font-mono text-muted-foreground">Substitui: {imposto.substitui}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <TrendingUp className="w-3.5 h-3.5 text-primary/60" />
                  <span className="text-[10px] font-mono text-primary/60">{imposto.aliquotaRef}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cronograma */}
      <section className="py-16 border-b border-border">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-8">
            <Calendar className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-display font-bold uppercase tracking-tight">Cronograma de Transição</h2>
          </div>

          <div className="relative">
            {/* Linha vertical */}
            <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-neutral-800"></div>

            <div className="space-y-0">
              {cronograma.map((item, i) => (
                <div key={i} className="relative pl-16 pb-10 group">
                  {/* Marker */}
                  <div className={`absolute left-3 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 ${item.status === 'concluido' ? 'bg-emerald-500/20 border-emerald-500' :
                      item.status === 'atual' ? 'bg-primary border-primary animate-pulse' :
                        'bg-muted border-neutral-700'
                    }`}>
                    {item.status === 'concluido' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    {item.status === 'atual' && <Clock className="w-3 h-3 text-primary-foreground" />}
                  </div>

                  {/* Content */}
                  <div className={`p-6 border transition-all ${item.status === 'atual'
                      ? 'bg-primary/5 border-primary/40'
                      : item.status === 'concluido'
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-muted/30 border-border'
                    }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-lg font-display font-bold font-mono ${item.status === 'atual' ? 'text-primary' :
                          item.status === 'concluido' ? 'text-emerald-400' :
                            'text-muted-foreground'
                        }`}>{item.ano}</span>
                      {item.status === 'atual' && (
                        <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[9px] font-mono font-bold uppercase tracking-widest">
                          Ano Atual
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold uppercase tracking-tight mb-2">{item.titulo}</h3>
                    <p className="text-sm text-muted-foreground font-sans leading-relaxed">{item.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impactos por Setor */}
      <section className="py-16 border-b border-border">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-display font-bold uppercase tracking-tight">Impactos por Setor</h2>
          </div>
          <p className="text-muted-foreground font-sans mb-12 max-w-2xl">
            Como a reforma afeta cada área de atuação — com foco em Mato Grosso do Sul.
          </p>

          <div className="space-y-8">
            {impactosMS.map((setor, i) => (
              <div key={i} className="p-8 bg-muted/30 border border-border">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-primary flex items-center justify-center text-primary-foreground">
                    <setor.icone className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-display font-bold uppercase tracking-tight">{setor.setor}</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> O que muda
                    </h4>
                    <ul className="space-y-3">
                      {setor.mudancas.map((m, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-neutral-300 font-sans">
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-1" />
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Pontos de atenção
                    </h4>
                    <ul className="space-y-3">
                      {setor.atencao.map((a, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-muted-foreground font-sans">
                          <XCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-1" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Regras Específicas MS */}
      <section className="py-16 border-b border-border">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-display font-bold uppercase tracking-tight">
              Regras Específicas — <span className="text-primary">Mato Grosso do Sul</span>
            </h2>
          </div>
          <p className="text-muted-foreground font-sans mb-12 max-w-2xl">
            Como a transição afeta especificamente as empresas sediadas em MS.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regrasMSEspecificas.map((regra, i) => (
              <div key={i} className="p-6 bg-muted/30 border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span className="text-[9px] font-mono text-cyan-400/60 uppercase tracking-widest">MS</span>
                </div>
                <h3 className="text-base font-bold uppercase tracking-tight mb-3 text-foreground">{regra.titulo}</h3>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">{regra.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-4">
            Sua empresa está preparada para <span className="text-primary italic font-display">2026</span>?
          </h2>
          <p className="text-muted-foreground font-sans mb-10 max-w-2xl mx-auto">
            A transição exige planejamento tributário antecipado. Nossa equipe está pronta para orientar sua empresa nesta nova era fiscal.
          </p>
          <a
            href="https://wa.me/5567996011356?text=Olá! Gostaria de saber mais sobre como a Reforma Tributária impacta minha empresa."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-3 !px-12 !py-5 text-lg"
          >
            <Scale className="w-6 h-6" />
            CONSULTAR ESPECIALISTA
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-t border-border">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-xs font-semibold text-primary mb-4">
              <Info className="w-3 h-3" /> Dúvidas Frequentes
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Perguntas sobre a <span className="text-primary">Reforma</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                pergunta: 'Quando a reforma começa a valer?',
                resposta: 'A CBS começa em 2026 com alíquota de 0,9% (em teste). O IBS começa com 0,1%. A transição completa ocorre até 2033, quando ICMS, ISS, PIS e Cofins serão extintos.',
              },
              {
                pergunta: 'O Simples Nacional acaba?',
                resposta: 'Não. O Simples Nacional continua existindo, mas empresas optantes podem escolher migrar para o novo IVA (CBS+IBS) a partir de 2027. A decisão deve ser analisada caso a caso.',
              },
              {
                pergunta: 'Como fica o agronegócio?',
                resposta: 'O agro terá tratamento diferenciado: cesta básica com alíquota 0%, insumos com redução de 60%, e crédito presumido para produtores. Cooperativas mantêm regime específico.',
              },
              {
                pergunta: 'O que é o Imposto Seletivo?',
                resposta: 'É um imposto federal que incide sobre produtos prejudiciais à saúde ou meio ambiente: cigarros, bebidas alcoólicas, combustíveis fósseis, veículos poluentes e açúcar em excesso.',
              },
              {
                pergunta: 'Como fica a guerra fiscal entre estados?',
                resposta: 'Acaba. O IBS será cobrado no destino (onde o consumo acontece), com alíquota uniforme nacional. Benefícios fiscais como o MS Competitivo serão extintos gradualmente até 2032.',
              },
              {
                pergunta: 'Preciso adequar meu ERP/sistema?',
                resposta: 'Sim. Os sistemas precisarão emitir notas com os novos campos CBS/IBS. Em 2026, a convivência com os impostos antigos e novos exige dupla configuração.',
              },
            ].map((faq, i) => (
              <div key={i} className="glass-card p-6">
                <h3 className="text-lg font-display font-bold text-foreground mb-2">{faq.pergunta}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.resposta}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checklist de Preparação */}
      <section className="py-16 border-t border-border">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-xs font-semibold text-primary mb-4">
              <CheckCircle2 className="w-3 h-3" /> Preparação
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Checklist para se <span className="text-primary">preparar</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Ações que sua empresa deve tomar agora para estar pronta para a transição.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            {[
              'Revisar contratos com fornecedores e clientes para incluir cláusulas de reajuste tributário',
              'Adequar o sistema fiscal/ERP para emissão de notas com CBS e IBS',
              'Treinar a equipe contábil e fiscal sobre as novas regras',
              'Mapear os créditos tributários atuais e simular o impacto no novo modelo',
              'Avaliar se o Simples Nacional continua vantajoso ou se vale migrar para o IVA',
              'Acompanhar as publicações do Comitê Gestor do IBS e da Receita Federal',
              'Consultar um contador especializado para planejamento tributário personalizado',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border/50 hover:border-primary/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-primary">{i + 1}</span>
                </div>
                <p className="text-sm font-medium text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
