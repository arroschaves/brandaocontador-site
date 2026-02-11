import { describe, it, expect } from 'vitest';

/**
 * Testes de Segurança — Middleware RBAC
 * Verifica: acesso admin, rate limiting, redirecionamentos
 */

describe('Segurança — Middleware', () => {
    it('middleware.ts exporta updateSession', async () => {
        const middleware = await import('@/lib/supabase/middleware');
        expect(typeof middleware.updateSession).toBe('function');
    });
});

describe('Segurança — .gitignore', () => {
    it('deve bloquear arquivos sensíveis', async () => {
        const fs = await import('fs');
        const gitignore = fs.readFileSync('.gitignore', 'utf-8');

        // Documentos fiscais
        expect(gitignore).toContain('ARQUIVOS');
        // PDFs sensíveis
        expect(gitignore).toContain('*.pdf');
        // Credenciais
        expect(gitignore).toContain('credentials.json');
        // SQLs com dados
        expect(gitignore).toContain('*.sql');
        // Executáveis
        expect(gitignore).toContain('*.exe');
        // ENV
        expect(gitignore).toContain('.env');
    });
});

describe('Segurança — Headers e Links', () => {
    it('links de WhatsApp devem ter rel noopener noreferrer', async () => {
        const fs = await import('fs');
        const header = fs.readFileSync('app/components/Header.tsx', 'utf-8');

        // Todos os links externos devem ter proteção
        const externalLinks = header.match(/target="_blank"/g) || [];
        const noopenLinks = header.match(/rel="noopener noreferrer"/g) || [];

        expect(externalLinks.length).toBeGreaterThan(0);
        expect(noopenLinks.length).toBe(externalLinks.length);
    });

    it('links de redes sociais devem ter URLs reais (não #)', () => {
        const fs = require('fs');
        const footer = fs.readFileSync('app/components/Footer.tsx', 'utf-8');

        // Nenhum href="#" morto
        expect(footer).not.toContain('href="#"');

        // Deve ter Instagram e Facebook reais
        expect(footer).toContain('instagram.com/bcbrandaocontabilidade');
        expect(footer).toContain('facebook.com/profile.php');
    });
});

describe('Segurança — Sanitização', () => {
    it('API de contato deve validar campos', async () => {
        // Verifica que o arquivo tem validação
        const fs = require('fs');
        const contatoRoute = fs.readFileSync('app/api/contato/route.ts', 'utf-8');

        expect(contatoRoute).toContain('sanitize');
        expect(contatoRoute).toContain('emailRegex');
        expect(contatoRoute).toContain('isRateLimited');
    });
});
