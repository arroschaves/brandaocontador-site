'use client';

import { useState, useEffect } from 'react';
import {
  Newspaper, Filter, ExternalLink, Sparkles, Building2,
  Tractor, Calculator, FileText, Landmark, Store, RefreshCw
} from 'lucide-react';

/**
 * Página de Notícias Contábeis — Brandão Contabilidade
 * Combina RSS público + IA por setor
 * Filtros: Todos, Tributária, Trabalhista, Fiscal, Agro, MEI, SEFAZ MS
 */

interface NewsItem {
  id: string;
  titulo: string;
  resumo: string;
  fonte: string;
  fonteUrl: string;
  categoria: string;
  data: string;
  destaque: boolean;
  link: string;
  icone: string;
}

const CATEGORIAS = [
  { id: 'todos', label: 'Todos', icon: Newspaper },
  { id: 'tributaria', label: 'Tributária', icon: Calculator },
  { id: 'trabalhista', label: 'Trabalhista', icon: Building2 },
  { id: 'fiscal', label: 'Fiscal', icon: FileText },
  { id: 'agronegocio', label: 'Agronegócio', icon: Tractor },
  { id: 'mei', label: 'MEI / Simples', icon: Store },
  { id: 'sefaz_ms', label: 'SEFAZ MS', icon: Landmark },
  { id: 'contabilidade', label: 'Contabilidade', icon: Calculator },
];

const categoriaCores: Record<string, string> = {
  tributaria: 'border-amber-500/40 bg-amber-500/5',
  trabalhista: 'border-blue-500/40 bg-blue-500/5',
  fiscal: 'border-purple-500/40 bg-purple-500/5',
  agronegocio: 'border-emerald-500/40 bg-emerald-500/5',
  mei: 'border-orange-500/40 bg-orange-500/5',
  sefaz_ms: 'border-cyan-500/40 bg-cyan-500/5',
  contabilidade: 'border-neutral-500/40 bg-neutral-500/5',
};

const categoriaLabels: Record<string, string> = {
  tributaria: 'Tributária',
  trabalhista: 'Trabalhista',
  fiscal: 'Fiscal',
  agronegocio: 'Agronegócio',
  mei: 'MEI / Simples',
  sefaz_ms: 'SEFAZ MS',
  contabilidade: 'Contabilidade',
};

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState<NewsItem[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState('todos');
  const [loading, setLoading] = useState(true);

  async function fetchNoticias() {
    setLoading(true);
    try {
      const url = filtroAtivo === 'todos'
        ? '/api/noticias'
        : `/api/noticias?categoria=${filtroAtivo}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setNoticias(data.noticias || []);
      }
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchNoticias(); }, [filtroAtivo]); // eslint-disable-line react-hooks/exhaustive-deps -- fetchNoticias é seguro sem memoização aqui

  const destaque = noticias.find(n => n.destaque);
  const restantes = noticias.filter(n => !n.destaque);

  return (
    <main className="min-h-screen bg-background text-foreground pt-24">
      {/* Hero */}
      <section className="py-16 border-b border-border">
        <div className="container-custom">
          <div className="flex items-center gap-4 mb-4">
            <span className="w-12 h-[1px] bg-primary"></span>
            <span className="text-xs font-mono text-primary tracking-[0.4em] uppercase">Central de Informações</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold uppercase tracking-tighter leading-[0.85] mb-4">
            NOTÍCIAS <span className="text-primary italic font-display">CONTÁBEIS</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl font-sans text-lg">
            Informações atualizadas sobre legislação, tributação, obrigações e mercado — combinando fontes oficiais com análise inteligente.
          </p>

          {/* Tags de Fonte */}
          <div className="flex items-center gap-3 mt-6">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> API + IA
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono uppercase tracking-wider">
              <Newspaper className="w-3 h-3" /> RSS Público
            </span>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="py-6 border-b border-border bg-muted/20 sticky top-24 z-40 backdrop-blur-sm">
        <div className="container-custom">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFiltroAtivo(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all border ${filtroAtivo === cat.id
                  ? 'bg-primary text-primary-foreground border-primary font-bold'
                  : 'bg-transparent text-muted-foreground border-border hover:border-neutral-600'
                  }`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="py-12">
        <div className="container-custom">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Carregando notícias...</span>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Destaque */}
              {destaque && (
                <a
                  href={destaque.link !== '#' ? destaque.link : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group p-10 bg-gradient-to-br from-amber-electric/10 to-transparent border-2 border-primary/30 hover:border-primary/60 transition-all duration-500"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{destaque.icone}</span>
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-[10px] font-mono font-bold uppercase tracking-widest">
                      Destaque
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{destaque.data}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tight mb-4 group-hover:text-primary transition-colors">
                    {destaque.titulo}
                  </h2>
                  <p className="text-muted-foreground font-sans text-lg max-w-3xl leading-relaxed">
                    {destaque.resumo}
                  </p>
                  <div className="flex items-center gap-2 mt-6 text-xs font-mono text-muted-foreground uppercase">
                    Fonte: {destaque.fonte}
                    {destaque.link !== '#' && <ExternalLink className="w-3 h-3" />}
                  </div>
                </a>
              )}

              {/* Lista de Notícias */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restantes.map((noticia) => (
                  <a
                    key={noticia.id}
                    href={noticia.link !== '#' ? noticia.link : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group block p-6 border transition-all duration-300 hover:translate-y-[-2px] ${categoriaCores[noticia.categoria] || 'border-border bg-muted/30'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl">{noticia.icone}</span>
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">
                        {categoriaLabels[noticia.categoria] || noticia.categoria}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold uppercase tracking-tight mb-3 group-hover:text-primary transition-colors leading-tight">
                      {noticia.titulo}
                    </h3>
                    <p className="text-sm text-muted-foreground font-sans leading-relaxed mb-4 line-clamp-3">
                      {noticia.resumo}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-border/30">
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">{noticia.fonte}</span>
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">{noticia.data}</span>
                    </div>
                  </a>
                ))}
              </div>

              {noticias.length === 0 && !loading && (
                <div className="text-center py-20">
                  <span className="text-muted-foreground text-4xl">📭</span>
                  <p className="text-muted-foreground font-mono text-sm mt-4 uppercase tracking-wider">Nenhuma notícia encontrada para esta categoria.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
