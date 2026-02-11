'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Wheat, Beef,
  RefreshCw, BarChart3, ArrowUpRight, ArrowDownRight, Minus,
  Activity, Percent
} from 'lucide-react';

/**
 * Página Mercado Agro — Cotações Diárias
 * Foco: MS e Brasil | Pecuária + Grãos + Câmbio + Índices
 */

interface CommodityPrice {
  nome: string;
  preco: number;
  unidade: string;
  variacao: number;
  fonte: string;
  atualizado: string;
  regiao: string;
}

interface MarketData {
  dolar: { compra: number; venda: number; variacao: number; atualizado: string };
  commodities: CommodityPrice[];
  indices: { selic: number; ipca: number; igpm: number };
}

function VariacaoTag({ valor }: { valor: number }) {
  if (valor > 0) return (
    <span className="inline-flex items-center gap-1 text-emerald-400 text-sm font-mono font-bold">
      <ArrowUpRight className="w-3.5 h-3.5" /> +{valor.toFixed(2)}%
    </span>
  );
  if (valor < 0) return (
    <span className="inline-flex items-center gap-1 text-red-400 text-sm font-mono font-bold">
      <ArrowDownRight className="w-3.5 h-3.5" /> {valor.toFixed(2)}%
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-neutral-500 text-sm font-mono font-bold">
      <Minus className="w-3.5 h-3.5" /> 0.00%
    </span>
  );
}

export default function MercadoAgroPage() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');

  async function fetchData() {
    setLoading(true);
    try {
      const response = await fetch('/api/mercado/cotacoes');
      if (response.ok) {
        const result = await response.json();
        setData(result);
        setLastUpdate(new Date().toLocaleString('pt-BR'));
      }
    } catch (error) {
      console.error('Erro ao buscar cotações:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  // Separar commodities por categoria
  const graos = data?.commodities.filter(c => ['Soja', 'Milho'].includes(c.nome)) || [];
  const pecuaria = data?.commodities.filter(c => !['Soja', 'Milho'].includes(c.nome)) || [];

  return (
    <main className="min-h-screen bg-obsidian text-neutral-100 pt-24">
      {/* Hero */}
      <section className="py-16 border-b border-neutral-800">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <span className="w-12 h-[1px] bg-amber-electric"></span>
                <span className="text-xs font-mono text-amber-electric tracking-[0.4em] uppercase">Mercado em Tempo Real</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[0.85]">
                PAINEL <span className="text-amber-electric italic font-display">AGRO</span>
              </h1>
              <p className="text-neutral-400 mt-4 max-w-lg font-sans">
                Cotações diárias de commodities, pecuária e índices econômicos com foco em Mato Grosso do Sul.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchData}
                disabled={loading}
                className="btn-brutal !py-3 !px-6 text-sm flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Atualizando...' : 'Atualizar'}
              </button>
              {lastUpdate && (
                <span className="text-[10px] font-mono text-neutral-600 uppercase">
                  Última: {lastUpdate}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dólar + Índices Econômicos */}
      <section className="py-8 bg-neutral-900/50 border-b border-neutral-800">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Dólar */}
            <div className="col-span-2 p-6 bg-obsidian border border-amber-electric/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-electric/5 rounded-full -translate-y-8 translate-x-8"></div>
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-6 h-6 text-amber-electric" />
                <span className="text-xs font-mono text-amber-electric uppercase tracking-widest">Dólar PTAX</span>
              </div>
              <div className="flex items-end gap-6 mt-3">
                <div>
                  <div className="text-[10px] font-mono text-neutral-600 uppercase">Compra</div>
                  <div className="text-3xl font-black font-mono text-neutral-100">
                    R$ {data?.dolar.compra.toFixed(4) || '-.----'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-neutral-600 uppercase">Venda</div>
                  <div className="text-2xl font-bold font-mono text-neutral-300">
                    R$ {data?.dolar.venda.toFixed(4) || '-.----'}
                  </div>
                </div>
                <div className="ml-auto">
                  {data && <VariacaoTag valor={data.dolar.variacao} />}
                </div>
              </div>
              <div className="text-[9px] font-mono text-neutral-700 mt-3 uppercase">
                Fonte: Banco Central do Brasil • {data?.dolar.atualizado || '-'}
              </div>
            </div>

            {/* SELIC */}
            <div className="p-6 bg-obsidian border border-neutral-800 hover:border-neutral-700 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <Percent className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">SELIC</span>
              </div>
              <div className="text-2xl font-black font-mono">{data?.indices.selic.toFixed(2) || '-'}%</div>
              <div className="text-[9px] font-mono text-neutral-700 uppercase mt-1">Taxa anual</div>
            </div>

            {/* IPCA */}
            <div className="p-6 bg-obsidian border border-neutral-800 hover:border-neutral-700 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">IPCA</span>
              </div>
              <div className="text-2xl font-black font-mono">{data?.indices.ipca.toFixed(2) || '-'}%</div>
              <div className="text-[9px] font-mono text-neutral-700 uppercase mt-1">Acum. 12 meses</div>
            </div>

            {/* IGP-M */}
            <div className="p-6 bg-obsidian border border-neutral-800 hover:border-neutral-700 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">IGP-M</span>
              </div>
              <div className="text-2xl font-black font-mono">{data?.indices.igpm.toFixed(2) || '-'}%</div>
              <div className="text-[9px] font-mono text-neutral-700 uppercase mt-1">Acum. 12 meses</div>
            </div>
          </div>
        </div>
      </section>

      {/* Grãos */}
      <section className="py-12">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-8">
            <Wheat className="w-6 h-6 text-amber-electric" />
            <h2 className="text-2xl font-black uppercase tracking-tighter">Grãos</h2>
            <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider ml-2">CEPEA / ESALQ</span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {graos.map((item, i) => (
              <div key={i} className="group p-8 bg-neutral-900/40 border border-neutral-800 hover:border-amber-electric/30 transition-all duration-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter">{item.nome}</h3>
                    <span className="text-[10px] font-mono text-neutral-600 uppercase">{item.regiao}</span>
                  </div>
                  <VariacaoTag valor={item.variacao} />
                </div>
                <div className="text-4xl font-black font-mono text-amber-electric mb-2">
                  R$ {item.preco.toFixed(2)}
                </div>
                <div className="text-xs text-neutral-500 font-mono">{item.unidade}</div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-neutral-800/50">
                  <span className="text-[9px] font-mono text-neutral-700 uppercase">Fonte: {item.fonte}</span>
                  <span className="text-[9px] font-mono text-neutral-700 uppercase">{item.atualizado}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pecuária */}
      <section className="py-12 border-t border-neutral-800">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-8">
            <Beef className="w-6 h-6 text-amber-electric" />
            <h2 className="text-2xl font-black uppercase tracking-tighter">Pecuária</h2>
            <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider ml-2">Foco MS</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pecuaria.map((item, i) => (
              <div key={i} className="group p-6 bg-neutral-900/40 border border-neutral-800 hover:border-amber-electric/20 transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-black uppercase tracking-tight">{item.nome}</h3>
                  <VariacaoTag valor={item.variacao} />
                </div>
                <div className="text-2xl font-black font-mono text-amber-electric">
                  R$ {item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono mt-1">{item.unidade}</div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-neutral-800/30">
                  <span className="text-[9px] font-mono text-neutral-700 uppercase">{item.fonte}</span>
                  <span className="text-[9px] font-mono text-neutral-700 uppercase">{item.regiao}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 border-t border-neutral-800">
        <div className="container-custom">
          <p className="text-[10px] font-mono text-neutral-700 uppercase tracking-wider text-center max-w-3xl mx-auto leading-relaxed">
            Cotações de referência. Valores podem variar conforme região e negociação. Dólar: Banco Central do Brasil (PTAX).
            Grãos: CEPEA/ESALQ. Pecuária: Indicadores regionais MS/BR. Consulte seu contador para decisões financeiras.
          </p>
        </div>
      </section>
    </main>
  );
}
