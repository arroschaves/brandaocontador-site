'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign, Wheat, Beef,
  RefreshCw, BarChart3, ArrowUpRight, ArrowDownRight, Minus,
  Activity, Percent, Tractor, ShieldAlert
} from 'lucide-react';

/**
 * Página Mercado Agro — Cotações Diárias
 * Foco: MS e Brasil | Câmbio + Macroeconomia + Preços reais do agro
 * Preços reais (R$/saca e R$/@) vêm de planilhas oficiais da B3;
 * Dólar PTAX, SELIC e IPCA vêm do Banco Central com fallback BrasilAPI/AwesomeAPI.
 */

interface CommodityPrice {
  nome: string;
  valor: number;
  codigo: string;
  unidade: string;
  variacao: number;
  fonte: string;
  atualizado: string;
  referencia: string;
  descricao: string;
  tipo?: 'indice' | 'preco';
}

interface MarketData {
  dolar: { compra: number; venda: number; variacao: number; atualizado: string; fonte: string };
  agroIndices: CommodityPrice[];
  macro: {
    selic: { valor: number; atualizado: string; fonte?: string };
    ipca: { valor: number; atualizado: string; fonte?: string };
  };
  observacao: string;
  atualizadoEm: string;
  stale?: boolean;
}

function VariacaoTag({ valor }: { valor: number }) {
  if (valor > 0) return (
    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-mono font-bold">
      <ArrowUpRight className="w-3.5 h-3.5" /> +{valor.toFixed(2)}%
    </span>
  );
  if (valor < 0) return (
    <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 text-sm font-mono font-bold">
      <ArrowDownRight className="w-3.5 h-3.5" /> {valor.toFixed(2)}%
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground text-sm font-mono font-bold">
      <Minus className="w-3.5 h-3.5" /> 0.00%
    </span>
  );
}

export default function MercadoAgroPage() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [error, setError] = useState('');

  async function fetchData() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/mercado/cotacoes');
      if (response.ok) {
        const result = await response.json();
        setData(result);
        setLastUpdate(new Date().toLocaleString('pt-BR'));
      } else {
        const body = await response.json().catch(() => null);
        setError(body?.error || 'Não foi possível carregar os indicadores oficiais agora.');
      }
    } catch (err) {
      console.error('Erro ao buscar cotações:', err);
      setError('Não foi possível carregar os indicadores oficiais agora.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  const graos = data?.agroIndices.filter(c => c.codigo === 'IFMILHO') || [];
  const pecuaria = data?.agroIndices.filter(c => c.codigo === 'IFBOI') || [];

  const formatarPreco = (item: CommodityPrice) => {
    if (item.tipo === 'preco') {
      return `R$ ${item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  return (
    <main className="min-h-screen bg-background pt-24">
      {/* Hero */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero pointer-events-none" />
        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-xs font-semibold text-green-600 dark:text-green-400 mb-4">
                <Tractor className="w-3 h-3" /> Indicadores e Referências de Mercado
              </span>
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground">
                Painel <span className="text-primary">Agro</span>
              </h1>
              <p className="text-muted-foreground mt-3 max-w-lg">
                Preços reais do agro (R$/saca e R$/@), câmbio e indicadores macroeconômicos de fontes oficiais: Banco Central, BrasilAPI e B3.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchData}
                disabled={loading}
                className="btn-secondary text-xs py-2.5 px-5 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Atualizando...' : 'Atualizar'}
              </button>
              {lastUpdate && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  Última: {lastUpdate}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dólar + Índices */}
      <section className="py-6 bg-muted/30 border-y border-border">
        <div className="container-custom">
          {error && (
            <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-700 dark:text-amber-300">
              {error}
            </div>
          )}
          {data?.stale && (
            <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Algumas fontes externas estavam indisponíveis na última atualização. Exibindo o último painel válido — os valores podem estar defasados. Clique em &ldquo;Atualizar&rdquo; para tentar novamente.</span>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Dólar */}
            <div className="col-span-2 glass-card p-6 border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <DollarSign className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dólar Comercial</span>
              </div>
              <div className="flex items-end gap-6">
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase">Compra</div>
                  <div className="text-2xl font-display font-bold text-foreground font-mono">
                    {data ? `R$ ${data.dolar.compra.toFixed(4)}` : '-.----'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase">Venda</div>
                  <div className="text-xl font-bold text-foreground/70 font-mono">
                    {data ? `R$ ${data.dolar.venda.toFixed(4)}` : '-.----'}
                  </div>
                </div>
                <div className="ml-auto">
                  {data && <VariacaoTag valor={data.dolar.variacao} />}
                </div>
              </div>
              <div className="text-[9px] text-muted-foreground font-mono mt-3">
                Fonte: {data?.dolar.fonte || 'Banco Central'} • {data?.dolar.atualizado || '-'}
              </div>
            </div>

            {/* SELIC */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Percent className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">SELIC Meta</span>
              </div>
              <div className="text-2xl font-display font-bold font-mono text-foreground">
                {data ? `${data.macro.selic.valor.toFixed(2)}%` : '-'}
              </div>
              <div className="text-[9px] text-muted-foreground font-mono mt-1">Taxa anual (Copom)</div>
              <div className="text-[9px] text-muted-foreground font-mono mt-1">Ref.: {data?.macro.selic.atualizado || '-'}</div>
            </div>

            {/* IPCA */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">IPCA</span>
              </div>
              <div className="text-2xl font-display font-bold font-mono text-foreground">
                {data ? `${data.macro.ipca.valor.toFixed(2)}%` : '-'}
              </div>
              <div className="text-[9px] text-muted-foreground font-mono mt-1">Acum. 12 meses</div>
              <div className="text-[9px] text-muted-foreground font-mono mt-1">Ref.: {data?.macro.ipca.atualizado || '-'}</div>
            </div>

            {/* Painel estrito */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Modo do Painel</span>
              </div>
              <div className="text-base font-display font-bold text-foreground">Estrito oficial</div>
              <div className="text-[9px] text-muted-foreground font-mono mt-1">Sem dados simulados</div>
            </div>
          </div>
        </div>
      </section>

      {/* Grãos */}
      <section className="py-12">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Wheat className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">Grãos</h2>
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider ml-2">B3 — contrato futuro (preço real)</span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {graos.map((item, i) => (
              <div key={i} className="glass-card p-8 group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-display font-bold text-foreground">{item.nome}</h3>
                    <span className="text-[10px] text-muted-foreground font-mono">{item.codigo}</span>
                  </div>
                  <VariacaoTag valor={item.variacao} />
                </div>
                <div className="text-3xl font-display font-bold text-primary font-mono mb-1">
                  {formatarPreco(item)}
                </div>
                <div className="text-xs text-muted-foreground font-mono">{item.unidade}</div>
                <p className="text-sm text-muted-foreground leading-relaxed mt-4">{item.descricao}</p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                  <span className="text-[9px] text-muted-foreground font-mono">Fonte: {item.fonte}</span>
                  <span className="text-[9px] text-muted-foreground font-mono">Ref.: {item.referencia}</span>
                </div>
              </div>
            ))}
          </div>
          {!loading && graos.length === 0 && (
            <div className="rounded-2xl border border-border/70 bg-card/70 p-6 text-sm text-muted-foreground">
              Nenhum índice oficial de grãos disponível no momento.
            </div>
          )}
        </div>
      </section>

      {/* Pecuária */}
      <section className="py-12 border-t border-border">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-rose-500/10">
              <Beef className="w-5 h-5 text-rose-500" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">Pecuária</h2>
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider ml-2">B3 — contrato futuro (preço real)</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pecuaria.map((item, i) => (
              <div key={i} className="glass-card p-6 group">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-display font-bold text-foreground">{item.nome}</h3>
                  <VariacaoTag valor={item.variacao} />
                </div>
                <div className="text-2xl font-display font-bold text-primary font-mono">
                  {formatarPreco(item)}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono mt-1">{item.unidade}</div>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3">{item.descricao}</p>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50">
                  <span className="text-[9px] text-muted-foreground font-mono">{item.fonte}</span>
                  <span className="text-[9px] text-muted-foreground font-mono">Ref.: {item.referencia}</span>
                </div>
              </div>
            ))}
          </div>
          {!loading && pecuaria.length === 0 && (
            <div className="rounded-2xl border border-border/70 bg-card/70 p-6 text-sm text-muted-foreground">
              Nenhum índice oficial de pecuária disponível no momento.
            </div>
          )}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 border-t border-border">
        <div className="container-custom">
          <p className="text-[10px] text-muted-foreground font-mono text-center max-w-3xl mx-auto leading-relaxed">
            {data?.observacao || 'Painel em modo estrito: exibe apenas dados de fontes oficiais públicas integradas no momento.'} Dólar: PTAX/Banco Central (fallback AwesomeAPI). SELIC e IPCA: Banco Central (fallback BrasilAPI). Milho e boi: preços reais de contratos futuros divulgados pela B3 em planilhas públicas diárias.
          </p>
        </div>
      </section>
    </main>
  );
}
