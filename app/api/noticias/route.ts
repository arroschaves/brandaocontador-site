import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type NewsCategory =
    | 'tributaria'
    | 'trabalhista'
    | 'fiscal'
    | 'agronegocio'
    | 'sefaz_ms'
    | 'contabilidade';

interface NewsItem {
    id: string;
    titulo: string;
    resumo: string;
    fonte: string;
    fonteUrl: string;
    categoria: NewsCategory;
    data: string;
    publishedAt: string;
    destaque: boolean;
    link: string;
    icone: string;
    analise: string;
}

interface NewsAnalysis {
    resumoExecutivo: string;
    alertas: string[];
    contagemPorCategoria: Record<string, number>;
    fontesMonitoradas: string[];
    atualizadoEm: string;
}

interface NewsSource {
    type: 'rss' | 'html';
    url: string;
    categoria: NewsCategory;
    icon: string;
    fonte: string;
}

const CACHE_DURATION = 60 * 60 * 1000;
let cachedNews: { data: NewsItem[]; analysis: NewsAnalysis; timestamp: number } | null = null;

const SOURCES: NewsSource[] = [
    { type: 'rss', url: 'https://g1.globo.com/rss/g1/economia/', categoria: 'fiscal', icon: '💰', fonte: 'G1 Economia' },
    { type: 'rss', url: 'https://g1.globo.com/rss/g1/economia/agronegocios/', categoria: 'agronegocio', icon: '🌾', fonte: 'G1 Agro' },
    { type: 'rss', url: 'https://cfc.org.br/feed/', categoria: 'contabilidade', icon: '📋', fonte: 'CFC' },
    { type: 'rss', url: 'https://www.gov.br/receitafederal/pt-br/assuntos/noticias/RSS', categoria: 'tributaria', icon: '🏛️', fonte: 'Receita Federal' },
    { type: 'html', url: 'https://www.gov.br/esocial/pt-br/noticias', categoria: 'trabalhista', icon: '👥', fonte: 'eSocial' },
    { type: 'html', url: 'https://www.sefaz.ms.gov.br/noticias/', categoria: 'sefaz_ms', icon: '📍', fonte: 'SEFAZ MS' },
];

const fallbackNews: NewsItem[] = [
    {
        id: 'fallback-1',
        titulo: 'Acompanhe as atualizações fiscais e contábeis com apoio consultivo.',
        resumo: 'Nossa equipe monitora diariamente Receita Federal, CFC e principais veículos para orientar clientes com contexto prático e seguro.',
        fonte: 'Brandão Contabilidade',
        fonteUrl: 'https://www.brandaocontador.com.br/noticias-contabeis',
        categoria: 'contabilidade',
        data: new Date().toLocaleDateString('pt-BR'),
        publishedAt: new Date().toISOString(),
        destaque: true,
        link: 'https://www.brandaocontador.com.br/contato',
        icone: '📌',
        analise: 'A equipe acompanha publicações relevantes para orientar empresas e produtores rurais com mais rapidez.',
    },
];

function decodeHtml(value: string) {
    return value
        .replace(/<!\[CDATA\[|\]\]>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#8217;/g, "'")
        .replace(/&#8211;/g, '-')
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/&#8230;/g, '...')
        .replace(/&#038;/g, '&')
        .replace(/&#039;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeText(value: string, maxLength = 220) {
    const clean = decodeHtml(value);
    if (clean.length <= maxLength) return clean;
    return `${clean.slice(0, maxLength - 3).trim()}...`;
}

function parseDate(value: string) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;

    const brMatch = value.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (brMatch) {
        const [, day, month, year] = brMatch;
        const fallback = new Date(`${year}-${month}-${day}T12:00:00-04:00`);
        if (!Number.isNaN(fallback.getTime())) return fallback;
    }

    return new Date();
}

function inferAnalysis(title: string, summary: string, category: NewsCategory) {
    const text = `${title} ${summary}`.toLowerCase();

    if (/parada|indisponibilidade|suspens|manuten/.test(text)) {
        return 'Pode impactar prazos, envios ou rotinas operacionais. Vale checar agenda e contingência.';
    }

    if (/reforma tribut|nota t[ée]cnica|portaria|al[ií]quota|dctfweb|fgts|sal[aá]rio m[ií]nimo/.test(text)) {
        return 'Tema com potencial de ajuste operacional ou fiscal. Recomenda revisão rápida das rotinas envolvidas.';
    }

    if (/golpe|falsa|alerta/.test(text)) {
        return 'Exige atenção imediata da equipe para evitar fraude, clique indevido ou comunicação enganosa.';
    }

    if (category === 'agronegocio') {
        return 'Pode influenciar decisões do agro, planejamento de safra, custos ou leitura de mercado.';
    }

    if (category === 'sefaz_ms') {
        return 'Importante para contribuintes de Mato Grosso do Sul, especialmente em documentos fiscais e regras estaduais.';
    }

    if (category === 'trabalhista') {
        return 'Pode exigir conferência de eSocial, folha, eventos periódicos ou processos do departamento pessoal.';
    }

    return 'Atualização relevante para acompanhamento contábil e tomada de decisão com mais contexto.';
}

function buildAnalysis(items: NewsItem[]): NewsAnalysis {
    const contagemPorCategoria = items.reduce<Record<string, number>>((acc, item) => {
        acc[item.categoria] = (acc[item.categoria] || 0) + 1;
        return acc;
    }, {});

    const fontesMonitoradas = [...new Set(items.map((item) => item.fonte))];
    const recentes = items.slice(0, 6);

    const hasSystemAlert = recentes.some((item) => /parada|indisponibilidade|suspens|manuten/i.test(`${item.titulo} ${item.resumo}`));
    const hasTaxMovement = recentes.some((item) => /reforma tribut|nota t[ée]cnica|portaria|al[ií]quota|fgts|dctfweb/i.test(`${item.titulo} ${item.resumo}`));
    const hasAgro = recentes.some((item) => item.categoria === 'agronegocio');

    const bulletPool = [
        hasSystemAlert ? 'Há alertas operacionais ou de sistema que merecem atenção imediata para evitar atraso em envios.' : '',
        hasTaxMovement ? 'O noticiário traz mudanças normativas e técnicas com possível impacto em fiscal, folha ou documentos eletrônicos.' : '',
        hasAgro ? 'O agronegócio segue aparecendo no radar com temas que podem influenciar planejamento e conformidade no campo.' : '',
        contagemPorCategoria.sefaz_ms ? 'As publicações estaduais da SEFAZ MS reforçam a importância de acompanhar obrigações locais e notas técnicas.' : '',
    ].filter(Boolean);

    return {
        resumoExecutivo: bulletPool[0] || 'O painel reúne atualizações recentes de fontes oficiais e setoriais para apoiar acompanhamento fiscal, trabalhista e contábil.',
        alertas: bulletPool.slice(0, 3),
        contagemPorCategoria,
        fontesMonitoradas,
        atualizadoEm: new Date().toLocaleString('pt-BR'),
    };
}

async function fetchRssSource(source: NewsSource) {
    const response = await fetch(source.url, { cache: 'no-store' });
    const text = await response.text();
    const items = text.match(/<item>([\s\S]*?)<\/item>/gi) || [];

    return items.slice(0, 8).map((item, index) => {
        const title = normalizeText(item.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '', 160);
        const description = normalizeText(item.match(/<description>([\s\S]*?)<\/description>/i)?.[1] || '', 220);
        const link = decodeHtml(item.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || '').trim();
        const pubDateRaw = decodeHtml(item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || '');
        const pubDate = parseDate(pubDateRaw || new Date().toISOString());

        if (!title || !description) return null;

        return {
            id: `${source.categoria}-${index}-${pubDate.getTime()}`,
            titulo: title,
            resumo: description,
            fonte: source.fonte,
            fonteUrl: source.url,
            categoria: source.categoria,
            data: pubDate.toLocaleDateString('pt-BR'),
            publishedAt: pubDate.toISOString(),
            destaque: false,
            link: link || '#',
            icone: source.icon,
            analise: inferAnalysis(title, description, source.categoria),
        } satisfies NewsItem;
    }).filter(Boolean) as NewsItem[];
}

async function fetchESocialNews(source: NewsSource) {
    const response = await fetch(source.url, { cache: 'no-store' });
    const html = await response.text();
    const pattern = /##\s+\[(\d+)†([^\]]+)\][\s\S]*?\n([\s\S]*?)\n\s*publicado\s+(\d{2}\/\d{2}\/\d{4})/g;
    const news: NewsItem[] = [];
    let match: RegExpExecArray | null;
    let index = 0;

    while ((match = pattern.exec(html)) && news.length < 8) {
        const title = normalizeText(match[2], 180);
        const summary = normalizeText(match[3], 220);
        const date = parseDate(match[4]);
        const linkId = match[1];
        const linkMatch = html.match(new RegExp(`\\【${linkId}†([^】]+)】`));
        const link = linkMatch?.[1]?.startsWith('http') ? linkMatch[1] : `${source.url}`;

        if (!title || !summary) continue;

        news.push({
            id: `${source.categoria}-${index++}-${date.getTime()}`,
            titulo: title,
            resumo: summary,
            fonte: source.fonte,
            fonteUrl: source.url,
            categoria: source.categoria,
            data: date.toLocaleDateString('pt-BR'),
            publishedAt: date.toISOString(),
            destaque: false,
            link,
            icone: source.icon,
            analise: inferAnalysis(title, summary, source.categoria),
        });
    }

    return news;
}

async function fetchSefazNews(source: NewsSource) {
    const response = await fetch(source.url, { cache: 'no-store' });
    const html = await response.text();
    const itemPattern = /<h2 class="entry-title[^"]*">\s*<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/h2>[\s\S]*?<time class="entry-date published" datetime="([^"]+)"/g;
    const news: NewsItem[] = [];
    let match: RegExpExecArray | null;
    let index = 0;

    while ((match = itemPattern.exec(html)) && news.length < 8) {
        const link = decodeHtml(match[1]);
        const title = normalizeText(match[2], 180);
        const date = parseDate(match[3]);

        if (!title) continue;

        news.push({
            id: `${source.categoria}-${index++}-${date.getTime()}`,
            titulo: title,
            resumo: 'Atualização publicada pela SEFAZ MS com possível impacto em documentos fiscais, regras estaduais ou procedimentos para contribuintes.',
            fonte: source.fonte,
            fonteUrl: source.url,
            categoria: source.categoria,
            data: date.toLocaleDateString('pt-BR'),
            publishedAt: date.toISOString(),
            destaque: false,
            link,
            icone: source.icon,
            analise: inferAnalysis(title, title, source.categoria),
        });
    }

    return news;
}

async function fetchSource(source: NewsSource) {
    if (source.type === 'rss') return fetchRssSource(source);
    if (source.fonte === 'eSocial') return fetchESocialNews(source);
    return fetchSefazNews(source);
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const categoria = searchParams.get('categoria');

        if (cachedNews && Date.now() - cachedNews.timestamp < CACHE_DURATION) {
            const data = categoria && categoria !== 'todos'
                ? cachedNews.data.filter((item) => item.categoria === categoria)
                : cachedNews.data;

            return NextResponse.json({
                noticias: data,
                total: data.length,
                analise: cachedNews.analysis,
            });
        }

        const sourceResults = await Promise.allSettled(SOURCES.map((source) => fetchSource(source)));
        let allNews = sourceResults.flatMap((result) => result.status === 'fulfilled' ? result.value : []);

        allNews = allNews
            .filter((item, index, array) =>
                array.findIndex((candidate) => candidate.link === item.link || candidate.titulo === item.titulo) === index
            )
            .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

        if (allNews.length === 0) {
            allNews = fallbackNews;
        } else {
            allNews = allNews.map((item, index) => ({ ...item, destaque: index === 0 }));
        }

        const analysis = buildAnalysis(allNews);
        cachedNews = { data: allNews, analysis, timestamp: Date.now() };

        const filteredNews = categoria && categoria !== 'todos'
            ? allNews.filter((item) => item.categoria === categoria)
            : allNews;

        return NextResponse.json({
            noticias: filteredNews,
            total: filteredNews.length,
            analise: analysis,
        }, {
            headers: { 'Cache-Control': 'public, s-maxage=3600' },
        });
    } catch (error) {
        console.error('Erro na API Noticias:', error);
        return NextResponse.json({
            noticias: fallbackNews,
            total: fallbackNews.length,
            analise: buildAnalysis(fallbackNews),
        });
    }
}
