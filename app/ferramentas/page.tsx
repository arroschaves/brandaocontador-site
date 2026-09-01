'use client';

import { useState } from 'react';
import {
  Calculator, Building2, Users, FileText, TrendingUp, Phone,
  ArrowRight, RefreshCw, DollarSign, Percent, Calendar, Briefcase,
  ChevronDown, ChevronUp, Info, AlertTriangle
} from 'lucide-react';

type Calculadora = 'clt-pj' | 'enquadramento' | 'ferias-13';

interface ResultadoCLTPJ {
  custoCLT: number;
  custoPJ: number;
  economia: number;
  percentualEconomia: number;
}

interface ResultadoEnquadramento {
  simples: number;
  lucroPresumido: number;
  lucroReal: number;
  melhorOpcao: string;
}

interface ResultadoFerias13 {
  ferias: number;
  tercoConstitucional: number;
  decimoTerceiro: number;
  total: number;
}

export default function FerramentasPage() {
  const [calculadoraAtiva, setCalculadoraAtiva] = useState<Calculadora>('clt-pj');

  // CLT vs PJ
  const [salarioCLT, setSalarioCLT] = useState('');
  const [resultadoCLTPJ, setResultadoCLTPJ] = useState<ResultadoCLTPJ | null>(null);

  // Enquadramento Tributário
  const [faturamentoMensal, setFaturamentoMensal] = useState('');
  const [resultadoEnquadramento, setResultadoEnquadramento] = useState<ResultadoEnquadramento | null>(null);

  // Férias e 13º
  const [salarioFerias, setSalarioFerias] = useState('');
  const [mesesTrabalhados, setMesesTrabalhados] = useState('12');
  const [resultadoFerias13, setResultadoFerias13] = useState<ResultadoFerias13 | null>(null);

  const calcularCLTPJ = () => {
    const salario = parseFloat(salarioCLT.replace(/[^\d,]/g, '').replace(',', '.'));
    if (isNaN(salario) || salario <= 0) return;

    // Custo CLT para a empresa
    const inssPatronal = salario * 0.20;
    const fgts = salario * 0.08;
    const sistemaS = salario * 0.058;
    const ferias = salario / 12;
    const tercoFerias = ferias / 3;
    const decimoTerceiro = salario / 12;
    const custoCLT = salario + inssPatronal + fgts + sistemaS + ferias + tercoFerias + decimoTerceiro;

    // Custo PJ (estimativa)
    const custoPJ = salario * 1.1; // 10% acima do salário líquido

    const economia = custoCLT - custoPJ;
    const percentualEconomia = (economia / custoCLT) * 100;

    setResultadoCLTPJ({
      custoCLT,
      custoPJ,
      economia,
      percentualEconomia,
    });
  };

  const calcularEnquadramento = () => {
    const faturamento = parseFloat(faturamentoMensal.replace(/[^\d,]/g, '').replace(',', '.'));
    if (isNaN(faturamento) || faturamento <= 0) return;

    const faturamentoAnual = faturamento * 12;

    // Simples Nacional (faixas simplificadas)
    let aliquotaSimples = 0;
    if (faturamentoAnual <= 180000) aliquotaSimples = 0.06;
    else if (faturamentoAnual <= 360000) aliquotaSimples = 0.112;
    else if (faturamentoAnual <= 720000) aliquotaSimples = 0.135;
    else if (faturamentoAnual <= 1800000) aliquotaSimples = 0.16;
    else if (faturamentoAnual <= 3600000) aliquotaSimples = 0.21;
    else aliquotaSimples = 0.33;

    const simples = faturamentoAnual * aliquotaSimples;

    // Lucro Presumido (estimativa)
    const basePresumida = faturamentoAnual * 0.32; // 32% para serviços
    const irpjPresumido = basePresumida * 0.15;
    const csllPresumido = basePresumida * 0.09;
    const pisPresumido = faturamentoAnual * 0.0065;
    const cofinsPresumido = faturamentoAnual * 0.03;
    const lucroPresumido = irpjPresumido + csllPresumido + pisPresumido + cofinsPresumido;

    // Lucro Real (estimativa)
    const baseLucroReal = faturamentoAnual * 0.25; // 25% de margem estimada
    const irpjReal = baseLucroReal * 0.15;
    const csllReal = baseLucroReal * 0.09;
    const pisReal = faturamentoAnual * 0.0165;
    const cofinsReal = faturamentoAnual * 0.076;
    const lucroReal = irpjReal + csllReal + pisReal + cofinsReal;

    let melhorOpcao = 'Simples Nacional';
    let menorImposto = simples;

    if (lucroPresumido < menorImposto) {
      melhorOpcao = 'Lucro Presumido';
      menorImposto = lucroPresumido;
    }
    if (lucroReal < menorImposto) {
      melhorOpcao = 'Lucro Real';
    }

    setResultadoEnquadramento({
      simples,
      lucroPresumido,
      lucroReal,
      melhorOpcao,
    });
  };

  const calcularFerias13 = () => {
    const salario = parseFloat(salarioFerias.replace(/[^\d,]/g, '').replace(',', '.'));
    const meses = parseInt(mesesTrabalhados);
    if (isNaN(salario) || salario <= 0 || isNaN(meses) || meses < 1 || meses > 12) return;

    const ferias = (salario / 12) * meses;
    const tercoConstitucional = ferias / 3;
    const decimoTerceiro = (salario / 12) * meses;
    const total = ferias + tercoConstitucional + decimoTerceiro;

    setResultadoFerias13({
      ferias,
      tercoConstitucional,
      decimoTerceiro,
      total,
    });
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatarPercentual = (valor: number) => {
    return valor.toFixed(1).replace('.', ',') + '%';
  };

  const limparFormatacao = (valor: string) => {
    return valor.replace(/[^\d,]/g, '');
  };

  return (
    <main className="min-h-screen bg-background text-foreground pt-24">
      {/* Hero */}
      <section className="py-16 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero pointer-events-none" />
        <div className="container-custom relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="w-12 h-[1px] bg-primary"></span>
            <span className="text-xs font-mono text-primary tracking-[0.4em] uppercase">Ferramentas Úteis</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tighter leading-[0.95] mb-4">
            Calculadoras <span className="text-primary italic font-display">e simuladores</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl font-sans text-lg">
            Ferramentas práticas para ajudar na tomada de decisões. Calcule custos, simule enquadramento tributário e planeje seus gastos.
          </p>
        </div>
      </section>

      {/* Seletor de Calculadoras */}
      <section className="py-8 border-b border-border bg-muted/20 sticky top-24 z-40 backdrop-blur-sm">
        <div className="container-custom">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
            <Calculator className="w-4 h-4 text-muted-foreground shrink-0" />
            {[
              { id: 'clt-pj' as Calculadora, label: 'CLT vs PJ', icon: Users },
              { id: 'enquadramento' as Calculadora, label: 'Enquadramento Tributário', icon: Percent },
              { id: 'ferias-13' as Calculadora, label: 'Férias & 13º', icon: Calendar },
            ].map((calc) => (
              <button
                key={calc.id}
                onClick={() => setCalculadoraAtiva(calc.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all border rounded-full ${calculadoraAtiva === calc.id
                  ? 'bg-primary text-primary-foreground border-primary font-bold'
                  : 'bg-transparent text-muted-foreground border-border hover:border-neutral-600'
                  }`}
              >
                <calc.icon className="w-3.5 h-3.5" />
                {calc.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="py-12">
        <div className="container-custom">
          {/* CLT vs PJ */}
          {calculadoraAtiva === 'clt-pj' && (
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="glass-card p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-foreground">CLT vs PJ</h2>
                    <p className="text-sm text-muted-foreground">Compare o custo para a empresa</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Salário Bruto Mensal (CLT)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Ex: 5.000,00"
                        value={salarioCLT}
                        onChange={(e) => setSalarioCLT(limparFormatacao(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                      />
                    </div>
                  </div>

                  <button
                    onClick={calcularCLTPJ}
                    className="w-full btn-primary py-3 text-sm"
                  >
                    <Calculator className="w-4 h-4" />
                    Calcular Comparativo
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Esta é uma estimativa simplificada. O custo real pode variar conforme o regime tributário, acordos coletivos e benefícios adicionais.
                    </p>
                  </div>
                </div>
              </div>

              {/* Resultado CLT vs PJ */}
              <div className="glass-card p-8 space-y-6">
                <h3 className="text-lg font-display font-bold text-foreground">Resultado da Comparação</h3>

                {resultadoCLTPJ ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <p className="text-xs font-mono text-blue-500 uppercase tracking-wider mb-1">Custo CLT (para a empresa)</p>
                      <p className="text-2xl font-display font-bold text-foreground">{formatarMoeda(resultadoCLTPJ.custoCLT)}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-xs font-mono text-emerald-500 uppercase tracking-wider mb-1">Custo PJ (estimativa)</p>
                      <p className="text-2xl font-display font-bold text-foreground">{formatarMoeda(resultadoCLTPJ.custoPJ)}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <p className="text-xs font-mono text-amber-500 uppercase tracking-wider mb-1">Economia Potencial</p>
                      <p className="text-2xl font-display font-bold text-foreground">{formatarMoeda(resultadoCLTPJ.economia)}</p>
                      <p className="text-sm text-foreground/70 mt-1">{formatarPercentual(resultadoCLTPJ.percentualEconomia)} de economia</p>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          <strong>Atenção:</strong> A comparação CLT x PJ deve considerar não apenas o custo, mas também os direitos trabalhistas, estabilidade e questões legais. Consulte um especialista para uma análise completa.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calculator className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground text-sm">Preencha o salário e clique em calcular para ver o resultado.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enquadramento Tributário */}
          {calculadoraAtiva === 'enquadramento' && (
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="glass-card p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                    <Percent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-foreground">Enquadramento Tributário</h2>
                    <p className="text-sm text-muted-foreground">Simule o melhor regime para sua empresa</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Faturamento Mensal Bruto
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Ex: 50.000,00"
                        value={faturamentoMensal}
                        onChange={(e) => setFaturamentoMensal(limparFormatacao(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                      />
                    </div>
                  </div>

                  <button
                    onClick={calcularEnquadramento}
                    className="w-full btn-primary py-3 text-sm"
                  >
                    <Calculator className="w-4 h-4" />
                    Simular Enquadramento
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Esta simulação é uma estimativa simplificada. O enquadramento ideal depende de diversos fatores como tipo de atividade, folha de pagamento e deduções específicas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Resultado Enquadramento */}
              <div className="glass-card p-8 space-y-6">
                <h3 className="text-lg font-display font-bold text-foreground">Resultado da Simulação</h3>

                {resultadoEnquadramento ? (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-xl border ${resultadoEnquadramento.melhorOpcao === 'Simples Nacional' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-muted/50 border-border/50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-foreground">Simples Nacional</p>
                        {resultadoEnquadramento.melhorOpcao === 'Simples Nacional' && (
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-emerald-500 text-white rounded-full">Melhor Opção</span>
                        )}
                      </div>
                      <p className="text-2xl font-display font-bold text-foreground">{formatarMoeda(resultadoEnquadramento.simples)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Impostos anuais estimados</p>
                    </div>

                    <div className={`p-4 rounded-xl border ${resultadoEnquadramento.melhorOpcao === 'Lucro Presumido' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-muted/50 border-border/50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-foreground">Lucro Presumido</p>
                        {resultadoEnquadramento.melhorOpcao === 'Lucro Presumido' && (
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-blue-500 text-white rounded-full">Melhor Opção</span>
                        )}
                      </div>
                      <p className="text-2xl font-display font-bold text-foreground">{formatarMoeda(resultadoEnquadramento.lucroPresumido)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Impostos anuais estimados</p>
                    </div>

                    <div className={`p-4 rounded-xl border ${resultadoEnquadramento.melhorOpcao === 'Lucro Real' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-muted/50 border-border/50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-foreground">Lucro Real</p>
                        {resultadoEnquadramento.melhorOpcao === 'Lucro Real' && (
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-purple-500 text-white rounded-full">Melhor Opção</span>
                        )}
                      </div>
                      <p className="text-2xl font-display font-bold text-foreground">{formatarMoeda(resultadoEnquadramento.lucroReal)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Impostos anuais estimados</p>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          <strong>Recomendação:</strong> Para uma análise precisa, consulte um contador. O enquadramento ideal depende do seu tipo de atividade, margem de lucro e deduções específicas.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Percent className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground text-sm">Preencha o faturamento e clique em simular para ver o resultado.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Férias e 13º */}
          {calculadoraAtiva === 'ferias-13' && (
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="glass-card p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-foreground">Férias & 13º Salário</h2>
                    <p className="text-sm text-muted-foreground">Calcule os valores proporcionais</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Salário Bruto Mensal
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Ex: 3.000,00"
                        value={salarioFerias}
                        onChange={(e) => setSalarioFerias(limparFormatacao(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Meses Trabalhados no Ano
                    </label>
                    <select
                      value={mesesTrabalhados}
                      onChange={(e) => setMesesTrabalhados(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((mes) => (
                        <option key={mes} value={mes}>{mes} {mes === 1 ? 'mês' : 'meses'}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={calcularFerias13}
                    className="w-full btn-primary py-3 text-sm"
                  >
                    <Calculator className="w-4 h-4" />
                    Calcular Valores
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      O cálculo considera férias proporcionais ao tempo trabalhado + 1/3 constitucional + 13º salário proporcional. Descontos de INSS e IRRF não estão inclusos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Resultado Férias e 13º */}
              <div className="glass-card p-8 space-y-6">
                <h3 className="text-lg font-display font-bold text-foreground">Resultado do Cálculo</h3>

                {resultadoFerias13 ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <p className="text-xs font-mono text-amber-500 uppercase tracking-wider mb-1">Férias Proporcionais</p>
                      <p className="text-2xl font-display font-bold text-foreground">{formatarMoeda(resultadoFerias13.ferias)}</p>
                      <p className="text-xs text-muted-foreground mt-1">{mesesTrabalhados} {parseInt(mesesTrabalhados) === 1 ? 'mês' : 'meses'} trabalhados</p>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <p className="text-xs font-mono text-blue-500 uppercase tracking-wider mb-1">1/3 Constitucional</p>
                      <p className="text-2xl font-display font-bold text-foreground">{formatarMoeda(resultadoFerias13.tercoConstitucional)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Adicional de férias</p>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-xs font-mono text-emerald-500 uppercase tracking-wider mb-1">13º Salário Proporcional</p>
                      <p className="text-2xl font-display font-bold text-foreground">{formatarMoeda(resultadoFerias13.decimoTerceiro)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Proporcional aos meses</p>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                      <p className="text-xs font-mono text-primary uppercase tracking-wider mb-1">Total a Receber</p>
                      <p className="text-3xl font-display font-bold text-foreground">{formatarMoeda(resultadoFerias13.total)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Valor bruto (sem descontos)</p>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          <strong>Nota:</strong> Este cálculo é uma estimativa. O valor final pode variar conforme convenções coletivas, adicionais e descontos obrigatórios (INSS, IRRF).
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground text-sm">Preencha o salário e os meses trabalhados para ver o resultado.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 text-center">
            <div className="glass-card p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-display font-bold text-foreground mb-4">
                Precisa de uma análise mais detalhada?
              </h3>
              <p className="text-muted-foreground mb-6">
                Nossas calculadoras são estimativas simplificadas. Para uma análise completa e personalizada, fale com um de nossos especialistas.
              </p>
              <a
                href="https://wa.me/5567996011356"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-8 py-3 text-sm"
              >
                <Phone className="w-4 h-4" />
                Falar com um especialista
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
