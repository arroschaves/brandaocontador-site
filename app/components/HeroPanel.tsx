'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Shield, FileText, Users, Tractor, Building2, ArrowUpRight,
  CheckCircle2, TrendingUp, MapPin, Phone, Star,
} from 'lucide-react';

interface LiveQuote {
  nome: string;
  valor: number;
  unidade: string;
  fonte: string;
}

/**
 * Painel do hero (lado direito) — profundo e profissional:
 *  - Pilares do ecossistema em grid 2x2
 *  - Mini "Painel Agro ao vivo" com cotações reais (Soja, Milho, Boi, Bezerro)
 *  - Indicadores de confiança + CTA
 */
export default function HeroPanel() {
  const [quotes, setQuotes] = useState<LiveQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    fetch('/api/mercado/cotacoes', { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        const list: LiveQuote[] = (d?.agroIndices || []).map((a: any) => ({
          nome: a.nome, valor: a.valor, unidade: a.unidade, fonte: a.fonte,
        }));
        const keywords: Record<string, string> = { IFMILHO: 'milho', IFBOI: 'boi', SOJA: 'soja', BEZERRO: 'bezerro' };
        const sorted = Object.keys(keywords)
          .map((code) => list.find((x) => x.nome.toLowerCase().includes(keywords[code])))
          .filter((x): x is LiveQuote => Boolean(x));
        setQuotes(sorted.length ? sorted : list.slice(0, 4));
        setLoading(false);
      })
      .catch(() => {
        if (active) { setOffline(true); setLoading(false); }
      })
      .finally(() => clearTimeout(timer));

    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, []);

  const pillars = [
    { icon: FileText, title: 'Fiscal', desc: 'Impostos e obrigações sob controle' },
    { icon: Users, title: 'Pessoal', desc: 'Folha, eSocial e rotinas trabalhistas' },
    { icon: Building2, title: 'Societário', desc: 'Abertura e regularização sem burocracia' },
    { icon: Tractor, title: 'Agro', desc: 'Acompanhamento para o produtor rural' },
  ];

  return (
    <div className="glass-card p-6 md:p-7 h-full flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-display font-bold text-foreground">Ecossistema Completo</p>
            <p className="text-[11px] text-muted-foreground">Fiscal, pessoal, societário e agro</p>
          </div>
        </div>
        <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
          Desde 1993
        </span>
      </div>

      {/* Pilares 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        {pillars.map((p, i) => (
          <div key={i} className="rounded-2xl border border-border/70 bg-muted/30 p-4 transition-colors hover:bg-primary/5">
            <div className="p-2 rounded-xl bg-primary/10 w-fit mb-2.5">
              <p.icon className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm font-bold text-foreground">{p.title}</p>
            <p className="text-[11px] text-muted-foreground leading-snug">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Painel Agro ao vivo */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="text-xs font-bold text-foreground">Painel Agro ao vivo</p>
          </div>
          <Link href="/agronegocio" className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
            Ver painel <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : offline || quotes.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">
            Cotações indisponíveis no momento. Acesse o Painel Agro para acompanhar soja, milho, boi e bezerro.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {quotes.map((q, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-card/70 p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide truncate">{q.nome}</p>
                <p className="text-base font-display font-bold text-foreground leading-tight">
                  R$ {q.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[9px] text-muted-foreground font-mono">{q.unidade}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confiança + CTA */}
      <div className="mt-auto space-y-4">
        <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-card/60 p-4">
          <div className="flex -space-x-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 border-2 border-background flex items-center justify-center">
                <Users className="w-3 h-3 text-white" />
              </div>
            ))}
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5"><strong className="text-foreground">500+</strong> clientes</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/contato" className="btn-primary flex-1 justify-center text-sm py-3">
            <Phone className="w-4 h-4" /> Falar com especialista
          </Link>
          <Link href="/agronegocio" className="btn-secondary flex-1 justify-center text-sm py-3">
            <MapPin className="w-4 h-4" /> Ver cotações
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-center justify-center">
          {['31 anos de história', '100% precisão fiscal', 'Atendimento consultivo'].map((t) => (
            <span key={t} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 text-primary" /> {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
