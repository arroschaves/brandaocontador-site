import {
    ExternalLink, Shield, FileCheck, Building2, Landmark,
    Scale, Briefcase, Globe, CreditCard, Users, FileText,
    AlertTriangle, Download, Search
} from 'lucide-react';
import { Metadata } from 'next';

/**
 * Página de Links Úteis + Certidões Negativas — Brandão Contabilidade
 * Todos os portais governamentais e certidões em um só lugar
 */

export const metadata: Metadata = {
    title: 'Links Úteis e Certidões Negativas | Brandão Contabilidade',
    description: 'Acesse portais governamentais, emita certidões negativas (FGTS CRF, CND Federal, SEFAZ MS, TRT, Polícia Federal, INSS) e consulte serviços online. Tudo em um só lugar.',
    openGraph: {
        title: 'Links Úteis e Certidões — Brandão Contabilidade',
        description: 'Portais governamentais e certidões negativas. SEFAZ MS, Receita Federal, INSS, TRT, FGTS e mais.',
    },
}

interface LinkItem {
    nome: string;
    descricao: string;
    url: string;
    tipo: 'certidao' | 'portal' | 'consulta';
}

interface LinkGroup {
    titulo: string;
    icone: React.ElementType;
    cor: string;
    links: LinkItem[];
}

const gruposLinks: LinkGroup[] = [
    {
        titulo: 'Certidões Negativas',
        icone: Shield,
        cor: 'border-emerald-500/30 hover:border-emerald-500/60',
        links: [
            {
                nome: 'CND Federal — Certidão Conjunta (RFB + PGFN)',
                descricao: 'Certidão Negativa de Débitos relativos a Tributos Federais e Dívida Ativa da União.',
                url: 'https://solucoes.receita.fazenda.gov.br/Servicos/certidaointernet/PJ/Emitir',
                tipo: 'certidao',
            },
            {
                nome: 'CRF — Certificado de Regularidade do FGTS',
                descricao: 'Certidão de regularidade junto ao FGTS emitida pela Caixa Econômica Federal.',
                url: 'https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf',
                tipo: 'certidao',
            },
            {
                nome: 'CNDT — Certidão Negativa de Débitos Trabalhistas',
                descricao: 'Emitida pelo Tribunal Superior do Trabalho (TST). Validade de 180 dias.',
                url: 'https://www.tst.jus.br/certidao1',
                tipo: 'certidao',
            },
            {
                nome: 'CND INSS — Certidão de Regularidade Previdenciária',
                descricao: 'Certidão de regularidade previdenciária via e-CAC da Receita Federal.',
                url: 'https://solucoes.receita.fazenda.gov.br/Servicos/certidaointernet/PJ/Emitir',
                tipo: 'certidao',
            },
            {
                nome: 'Certidão SEFAZ MS — ICMS',
                descricao: 'Certidão Negativa de Débitos Estaduais (ICMS) junto à SEFAZ/MS.',
                url: 'https://efazenda.servicos.ms.gov.br/certidaonegativa/',
                tipo: 'certidao',
            },
            {
                nome: 'Certidão Municipal — ISS Sidrolândia',
                descricao: 'Certidão Negativa de Débitos Municipais (ISS, IPTU). Portal da Prefeitura.',
                url: 'https://www.sidrolandia.ms.gov.br/',
                tipo: 'certidao',
            },
            {
                nome: 'Certidão Polícia Federal — Antecedentes',
                descricao: 'Certidão de Antecedentes Criminais da Polícia Federal.',
                url: 'https://servicos.dpf.gov.br/antecedentes-criminais/certidao',
                tipo: 'certidao',
            },
            {
                nome: 'CND TCU — Tribunal de Contas da União',
                descricao: 'Certidão Negativa de Responsáveis pelo TCU.',
                url: 'https://contas.tcu.gov.br/ords/f?p=CERTIDAO',
                tipo: 'certidao',
            },
        ],
    },
    {
        titulo: 'Receita Federal',
        icone: Landmark,
        cor: 'border-amber-500/30 hover:border-amber-500/60',
        links: [
            {
                nome: 'e-CAC — Centro de Atendimento Virtual',
                descricao: 'Acesso a serviços da RFB: DCTF, ECF, IRPF, IRPJ, parcelamentos e processos.',
                url: 'https://cav.receita.fazenda.gov.br/',
                tipo: 'portal',
            },
            {
                nome: 'CNPJ — Comprovante de Inscrição',
                descricao: 'Emissão de comprovante de inscrição e situação cadastral do CNPJ.',
                url: 'https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/cnpjreva_solicitacao.asp',
                tipo: 'consulta',
            },
            {
                nome: 'CPF — Situação Cadastral',
                descricao: 'Consulta de situação cadastral do CPF na Receita Federal.',
                url: 'https://servicos.receita.fazenda.gov.br/servicos/cpf/consultasituacao/consultapublica.asp',
                tipo: 'consulta',
            },
            {
                nome: 'PGMEI — Programa Gerador do MEI',
                descricao: 'Emissão de DAS MEI, declaração anual (DASN-SIMEI) e consulta de débitos.',
                url: 'https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/',
                tipo: 'portal',
            },
            {
                nome: 'Simples Nacional',
                descricao: 'Portal do Simples Nacional: DAS, PGDAS-D, DEFIS, parcelamento e opção.',
                url: 'https://www8.receita.fazenda.gov.br/SimplesNacional/',
                tipo: 'portal',
            },
            {
                nome: 'SPED — Sistema Público de Escrituração Digital',
                descricao: 'ECD, ECF, EFD ICMS/IPI, EFD Contribuições, NF-e e outros módulos SPED.',
                url: 'https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/sped-sistema-publico-de-escrituracao-digital',
                tipo: 'portal',
            },
        ],
    },
    {
        titulo: 'SEFAZ MS — Fazenda Estadual',
        icone: Building2,
        cor: 'border-cyan-500/30 hover:border-cyan-500/60',
        links: [
            {
                nome: 'ICMS Transparente',
                descricao: 'Portal do ICMS MS: consultas, guias, legislação e serviços ao contribuinte.',
                url: 'https://www.icmstransparente.ms.gov.br/',
                tipo: 'portal',
            },
            {
                nome: 'NF-e MS — Nota Fiscal Eletrônica',
                descricao: 'Portal estadual da NF-e: emissão, consulta, cancelamento e inutilização.',
                url: 'https://www.nfe.fazenda.gov.br/portal/principal.aspx',
                tipo: 'portal',
            },
            {
                nome: 'e-Fazenda MS',
                descricao: 'Portal de serviços da SEFAZ/MS: inscrição estadual, guias, DARE e consultas.',
                url: 'https://efazenda.servicos.ms.gov.br/',
                tipo: 'portal',
            },
            {
                nome: 'Legislação SEFAZ MS',
                descricao: 'Base de legislação tributária estadual: RICMS, decretos, portarias e resoluções.',
                url: 'https://www.sefaz.ms.gov.br/legislacao/',
                tipo: 'consulta',
            },
        ],
    },
    {
        titulo: 'Trabalho e Previdência',
        icone: Users,
        cor: 'border-blue-500/30 hover:border-blue-500/60',
        links: [
            {
                nome: 'eSocial',
                descricao: 'Portal do eSocial: folha de pagamento, admissão, rescisão e obrigações trabalhistas.',
                url: 'https://login.esocial.gov.br/',
                tipo: 'portal',
            },
            {
                nome: 'FGTS Digital',
                descricao: 'Nova plataforma de recolhimento do FGTS integrada ao eSocial.',
                url: 'https://www.fgtsdigital.gov.br/',
                tipo: 'portal',
            },
            {
                nome: 'Meu INSS',
                descricao: 'Serviços previdenciários: simulação, extrato, agendamento e requerimentos.',
                url: 'https://meu.inss.gov.br/',
                tipo: 'portal',
            },
            {
                nome: 'CAGED / Novo CAGED',
                descricao: 'Cadastro Geral de Empregados e Desempregados — via eSocial.',
                url: 'https://servicos.mte.gov.br/caged/',
                tipo: 'portal',
            },
            {
                nome: 'TRT 24ª Região — MS',
                descricao: 'Tribunal Regional do Trabalho de Mato Grosso do Sul. Consulta processual.',
                url: 'https://www.trt24.jus.br/',
                tipo: 'consulta',
            },
            {
                nome: 'Seguro Desemprego',
                descricao: 'Portal de habilitação e acompanhamento do Seguro Desemprego.',
                url: 'https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/seguro-desemprego',
                tipo: 'portal',
            },
        ],
    },
    {
        titulo: 'Órgãos e Serviços Diversos',
        icone: Globe,
        cor: 'border-neutral-500/30 hover:border-neutral-400/60',
        links: [
            {
                nome: 'Junta Comercial MS — JUCEMS',
                descricao: 'Registro comercial, abertura, alteração e baixa de empresas em MS.',
                url: 'https://www.jucems.ms.gov.br/',
                tipo: 'portal',
            },
            {
                nome: 'REDESIM — Rede Nacional de Simplificação',
                descricao: 'Abertura, alteração e baixa de empresas integrada entre órgãos.',
                url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim',
                tipo: 'portal',
            },
            {
                nome: 'Gov.br',
                descricao: 'Portal de serviços do Governo Federal: +4.000 serviços digitais.',
                url: 'https://www.gov.br/',
                tipo: 'portal',
            },
            {
                nome: 'Polícia Federal — Serviços',
                descricao: 'Passaporte, SINCRE, certidões, registro de armas e outros serviços.',
                url: 'https://www.gov.br/pf/pt-br',
                tipo: 'portal',
            },
            {
                nome: 'IBGE — Dados Econômicos',
                descricao: 'Indicadores econômicos, IPCA, PIB, pesquisas agropecuárias e demográficas.',
                url: 'https://www.ibge.gov.br/',
                tipo: 'consulta',
            },
            {
                nome: 'Banco Central — Registrato',
                descricao: 'Consulta de informações financeiras: contas, empréstimos e chaves PIX.',
                url: 'https://www.bcb.gov.br/meubc/registrato',
                tipo: 'consulta',
            },
        ],
    },
    {
        titulo: 'Consultas e Ferramentas',
        icone: Search,
        cor: 'border-rose-500/30 hover:border-rose-500/60',
        links: [
            {
                nome: 'Consulta Optante Simples/MEI',
                descricao: 'Verifica se empresa é optante pelo Simples Nacional ou é MEI.',
                url: 'https://www8.receita.fazenda.gov.br/SimplesNacional/aplicacoes.aspx?id=21',
                tipo: 'consulta',
            },
            {
                nome: 'Consulta NF-e Nacional',
                descricao: 'Consulta de notas fiscais eletrônicas pela chave de acesso.',
                url: 'https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx',
                tipo: 'consulta',
            },
            {
                nome: 'Tabelas IRPF/IRPJ',
                descricao: 'Tabelas de alíquotas do Imposto de Renda atualizadas.',
                url: 'https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/tributos/irpf-imposto-de-renda-pessoa-fisica',
                tipo: 'consulta',
            },
            {
                nome: 'Calculadora de Rescisão',
                descricao: 'Cálculo de rescisão trabalhista, férias proporcionais e multa FGTS.',
                url: 'https://www.tst.jus.br/web/trabalhista/calculadora-de-rescisao',
                tipo: 'consulta',
            },
        ],
    },
];

const tipoIcones = {
    certidao: { icon: FileCheck, label: 'Certidão', cor: 'text-emerald-400' },
    portal: { icon: Globe, label: 'Portal', cor: 'text-blue-400' },
    consulta: { icon: Search, label: 'Consulta', cor: 'text-amber-400' },
};

export default function LinksUteisPage() {
    return (
        <main className="min-h-screen bg-background text-foreground pt-24">
            {/* Hero */}
            <section className="py-16 border-b border-border">
                <div className="container-custom">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="w-12 h-[1px] bg-primary"></span>
                        <span className="text-xs font-mono text-primary tracking-[0.4em] uppercase">Acesso Rápido</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-display font-bold uppercase tracking-tighter leading-[0.85] mb-4">
                        LINKS ÚTEIS E <span className="text-primary italic font-display">CERTIDÕES</span>
                    </h1>
                    <p className="text-muted-foreground max-w-3xl font-sans text-lg">
                        Todos os portais governamentais, certidões negativas e ferramentas de consulta que sua empresa precisa — em um só lugar.
                    </p>

                    {/* Alerta importante */}
                    <div className="mt-8 p-4 bg-primary/5 border border-primary/20 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground font-sans">
                            <strong className="text-primary">Importante:</strong> Alguns portais exigem certificado digital (e-CNPJ/e-CPF) ou senha Gov.br nível prata/ouro.
                            Em caso de dúvida, entre em contato conosco via{' '}
                            <a href="https://wa.me/5567996011356" className="text-primary hover:underline">WhatsApp</a>.
                        </p>
                    </div>
                </div>
            </section>

            {/* Links por Grupo */}
            <section className="py-12">
                <div className="container-custom space-y-16">
                    {gruposLinks.map((grupo, gi) => (
                        <div key={gi}>
                            {/* Cabeçalho do grupo */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-10 h-10 bg-muted border border-border flex items-center justify-center text-primary">
                                    <grupo.icone className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-display font-bold uppercase tracking-tight">{grupo.titulo}</h2>
                                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{grupo.links.length} links</span>
                            </div>

                            {/* Grid de Links */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {grupo.links.map((link, li) => {
                                    const tipoInfo = tipoIcones[link.tipo];
                                    return (
                                        <a
                                            key={li}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`group flex items-start gap-5 p-6 bg-muted/30 border transition-all duration-300 hover:translate-y-[-1px] hover:shadow-lg ${grupo.cor}`}
                                        >
                                            <div className="shrink-0 mt-1">
                                                <tipoInfo.icon className={`w-5 h-5 ${tipoInfo.cor}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm leading-tight">
                                                        {link.nome}
                                                    </h3>
                                                    <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                                </div>
                                                <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                                                    {link.descricao}
                                                </p>
                                                <span className={`inline-block mt-2 text-[9px] font-mono uppercase tracking-widest ${tipoInfo.cor}`}>
                                                    {tipoInfo.label}
                                                </span>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 border-t border-border">
                <div className="container-custom text-center">
                    <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider mb-6">
                        Precisa de ajuda para emitir certidões ou acessar portais?
                    </p>
                    <a
                        href="https://wa.me/5567996011356"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex items-center gap-3 !px-12 !py-5"
                    >
                        <CreditCard className="w-5 h-5" />
                        SOLICITAR SUPORTE
                    </a>
                </div>
            </section>
        </main>
    );
}
