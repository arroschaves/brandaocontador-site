import { describe, it, expect } from 'vitest';

/**
 * Testes de Integridade — Páginas e Componentes
 * Verifica: existência de páginas, links de navegação, consistência
 */

describe('Integridade — Páginas Públicas', () => {
    const publicPages = [
        'app/page.tsx',
        'app/servicos/page.tsx',
        'app/contato/page.tsx',
        'app/agronegocio/page.tsx',
        'app/noticias-contabeis/page.tsx',
        'app/reforma-tributaria/page.tsx',
        'app/links-uteis/page.tsx',
        'app/login/page.tsx',
    ];

    it.each(publicPages)('página %s deve existir', (pagePath) => {
        const fs = require('fs');
        expect(fs.existsSync(pagePath)).toBe(true);
    });
});

describe('Integridade — APIs', () => {
    const apiRoutes = [
        'app/api/contato/route.ts',
        'app/api/mercado/cotacoes/route.ts',
        'app/api/noticias/route.ts',
        'app/api/og/route.tsx',
    ];

    it.each(apiRoutes)('API %s deve existir', (apiPath) => {
        const fs = require('fs');
        expect(fs.existsSync(apiPath)).toBe(true);
    });
});

describe('Integridade — Componentes Críticos', () => {
    const components = [
        'app/components/Header.tsx',
        'app/components/Footer.tsx',
        'app/components/JsonLd.tsx',
    ];

    it.each(components)('componente %s deve existir', (compPath) => {
        const fs = require('fs');
        expect(fs.existsSync(compPath)).toBe(true);
    });
});

describe('Integridade — Navegação', () => {
    it('Header deve ter todas as rotas de navegação', () => {
        const fs = require('fs');
        const header = fs.readFileSync('app/components/Header.tsx', 'utf-8');

        const requiredRoutes = [
            '/servicos',
            '/agronegocio',
            '/noticias-contabeis',
            '/reforma-tributaria',
            '/links-uteis',
            '/contato',
            '/login',
        ];

        for (const route of requiredRoutes) {
            expect(header).toContain(route);
        }
    });

    it('Footer deve ter links de redes sociais', () => {
        const fs = require('fs');
        const footer = fs.readFileSync('app/components/Footer.tsx', 'utf-8');

        expect(footer).toContain('instagram.com');
        expect(footer).toContain('facebook.com');
    });

    it('não deve ter link /cliente/login (rota antiga)', () => {
        const fs = require('fs');
        const header = fs.readFileSync('app/components/Header.tsx', 'utf-8');

        expect(header).not.toContain('/cliente/login');
    });

    it('não deve ter CONTATO_IMEDIATO (label antigo)', () => {
        const fs = require('fs');
        const header = fs.readFileSync('app/components/Header.tsx', 'utf-8');

        expect(header).not.toContain('CONTATO_IMEDIATO');
    });

    it('não deve ter telefone fixo inexistente', () => {
        const fs = require('fs');
        const contato = fs.readFileSync('app/contato/page.tsx', 'utf-8');

        expect(contato).not.toContain('3272-1356');
        expect(contato).not.toContain('3272-3266');
    });
});

describe('Integridade — CRM Admin', () => {
    it('Header deve ter botão admin condicional', () => {
        const fs = require('fs');
        const header = fs.readFileSync('app/components/Header.tsx', 'utf-8');

        expect(header).toContain('isAdmin');
        expect(header).toContain('/admin');
        expect(header).toContain('Shield');
    });

    it('middleware deve verificar roles admin/staff/master', () => {
        const fs = require('fs');
        const middleware = fs.readFileSync('lib/supabase/middleware.ts', 'utf-8');

        expect(middleware).toContain('admin');
        expect(middleware).toContain('staff');
        expect(middleware).toContain('master');
        expect(middleware).toContain('allowedRoles');
    });
});
