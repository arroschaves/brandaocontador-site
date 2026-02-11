import { describe, it, expect } from 'vitest';

/**
 * Testes de SEO e Dados Estruturados
 * Verifica: sitemap, JSON-LD, metadata
 */

describe('SEO — Sitemap', () => {
    it('deve conter todas as rotas públicas', async () => {
        const sitemap = (await import('@/app/sitemap')).default;
        const routes = sitemap();

        const urls = routes.map((r: { url: string }) => r.url);

        // Rotas obrigatórias
        expect(urls).toContain('https://www.brandaocontador.com.br');
        expect(urls).toContain('https://www.brandaocontador.com.br/servicos');
        expect(urls).toContain('https://www.brandaocontador.com.br/contato');
        expect(urls).toContain('https://www.brandaocontador.com.br/agronegocio');
        expect(urls).toContain('https://www.brandaocontador.com.br/reforma-tributaria');
        expect(urls).toContain('https://www.brandaocontador.com.br/noticias-contabeis');
        expect(urls).toContain('https://www.brandaocontador.com.br/links-uteis');
    });

    it('cada rota deve ter prioridade, frequência e data', async () => {
        const sitemap = (await import('@/app/sitemap')).default;
        const routes = sitemap();

        for (const route of routes) {
            expect(route).toHaveProperty('url');
            expect(route).toHaveProperty('lastModified');
            expect(route).toHaveProperty('changeFrequency');
            expect(route).toHaveProperty('priority');
            expect(route.priority).toBeGreaterThanOrEqual(0);
            expect(route.priority).toBeLessThanOrEqual(1);
        }
    });

    it('homepage deve ter prioridade 1', async () => {
        const sitemap = (await import('@/app/sitemap')).default;
        const routes = sitemap();
        const home = routes.find((r: { url: string }) => r.url === 'https://www.brandaocontador.com.br');

        expect(home).toBeDefined();
        expect(home.priority).toBe(1);
    });

    it('páginas de conteúdo dinâmico devem ter mudança diária', async () => {
        const sitemap = (await import('@/app/sitemap')).default;
        const routes = sitemap();

        const agro = routes.find((r: { url: string }) => r.url.includes('/agronegocio'));
        const noticias = routes.find((r: { url: string }) => r.url.includes('/noticias-contabeis'));

        expect(agro?.changeFrequency).toBe('daily');
        expect(noticias?.changeFrequency).toBe('daily');
    });
});

describe('SEO — JSON-LD', () => {
    it('componente JsonLd exporta função válida', async () => {
        const JsonLd = (await import('@/app/components/JsonLd')).default;
        expect(typeof JsonLd).toBe('function');
    });
});

describe('SEO — Robots.txt', () => {
    it('robots.ts exporta função', async () => {
        const robots = (await import('@/app/robots')).default;
        const result = robots();

        expect(result).toHaveProperty('rules');
        expect(result).toHaveProperty('sitemap');
        expect(result.sitemap).toContain('brandaocontador.com.br');
    });
});
