import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * API de Notícias Contábeis
 * Fontes: RSS Público (G1 Economia, G1 Agro, Tributário)
 * Cache: 1 hora
 */

const CACHE_DURATION = 60 * 60 * 1000; // 1 hora
let cachedNews: { data: any[]; timestamp: number } | null = null;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const categoria = searchParams.get('categoria');

        if (cachedNews && Date.now() - cachedNews.timestamp < CACHE_DURATION) {
            let data = cachedNews.data;
            if (categoria && categoria !== 'todos') {
                data = data.filter(n => n.categoria === categoria);
            }
            return NextResponse.json({ noticias: data, total: data.length });
        }

        const feeds = [
            { url: 'https://g1.globo.com/rss/g1/economia/', categoria: 'fiscal', icon: '💰', fonte: 'G1 Economia' },
            { url: 'https://g1.globo.com/rss/g1/economia/agronegocios/', categoria: 'agronegocio', icon: '🌾', fonte: 'G1 Agro' },
            { url: 'https://cfc.org.br/feed/', categoria: 'contabilidade', icon: '📋', fonte: 'CFC' },
            { url: 'https://www.gov.br/receitafederal/pt-br/assuntos/noticias/RSS', categoria: 'tributaria', icon: '🏛️', fonte: 'Receita Federal' }
        ];

        let allNews: any[] = [];
        let idCounter = 1;

        for (const feed of feeds) {
            try {
                const response = await fetch(feed.url, { cache: 'no-store' });
                const text = await response.text();
                
                const items = text.match(/<item>([\s\S]*?)<\/item>/gi) || [];
                
                for (const item of items.slice(0, 8)) {
                    let title = item.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1] || '';
                    let description = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] || item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '';
                    
                    // Limpa tags HTML
                    title = title.replace(/<[^>]*>/g, '').trim();
                    description = description.replace(/<[^>]*>/g, '').trim();
                    if(description.length > 200) description = description.substring(0, 197) + '...';

                    const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '';
                    const pubDateStr = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
                    const pubDate = pubDateStr ? new Date(pubDateStr).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');

                    if (title && description) {
                        allNews.push({
                            id: `rss-${idCounter++}`,
                            titulo: title,
                            resumo: description,
                            fonte: feed.fonte,
                            fonteUrl: feed.url,
                            categoria: feed.categoria,
                            data: pubDate,
                            destaque: idCounter === 2, // O primeiro vira destaque
                            link: link.trim() || '#',
                            icone: feed.icon,
                        });
                    }
                }
            } catch (err) {
                console.error('Erro no RSS:', feed.url, err);
            }
        }

        // Embaralha para que não fique tudo junto e o destaque pode variar
        const destaques = allNews.filter(n => n.destaque);
        const restantes = allNews.filter(n => !n.destaque).sort(() => Math.random() - 0.5);
        allNews = [...destaques, ...restantes];

        cachedNews = { data: allNews, timestamp: Date.now() };

        let filteredNews = allNews;
        if (categoria && categoria !== 'todos') {
            filteredNews = allNews.filter(n => n.categoria === categoria);
        }

        return NextResponse.json({ noticias: filteredNews, total: filteredNews.length }, {
            headers: { 'Cache-Control': 'public, s-maxage=3600' }
        });

    } catch (error) {
        console.error('Erro na API Noticias:', error);
        return NextResponse.json({ error: 'Falha ao buscar notícias' }, { status: 500 });
    }
}
