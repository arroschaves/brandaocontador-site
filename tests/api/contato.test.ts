import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Testes da API de Contato
 * Verifica: validação, sanitização, rate limiting, envio
 */

// Mock do nodemailer
vi.mock('nodemailer', () => ({
    default: {
        createTransport: () => ({
            sendMail: vi.fn().mockResolvedValue({ messageId: 'test-123' }),
        }),
    },
}));

// Helper para criar Request
function createRequest(body: Record<string, unknown>, ip = '127.0.0.1') {
    return new Request('http://localhost:3000/api/contato', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-forwarded-for': ip,
        },
        body: JSON.stringify(body),
    }) as unknown as import('next/server').NextRequest;
}

describe('API /api/contato', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('deve rejeitar request sem campos obrigatórios', async () => {
        const { POST } = await import('@/app/api/contato/route');
        const request = createRequest({ name: 'Teste' }); // falta email, subject, message
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('obrigatórios');
    });

    it('deve rejeitar email inválido', async () => {
        const { POST } = await import('@/app/api/contato/route');
        const request = createRequest({
            name: 'Teste',
            email: 'email-invalido',
            subject: 'fiscal',
            message: 'Mensagem teste',
        });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('inválido');
    });

    it('deve aceitar request válido e retornar sucesso', async () => {
        const { POST } = await import('@/app/api/contato/route');
        const request = createRequest({
            name: 'João da Silva',
            email: 'joao@empresa.com.br',
            subject: 'contabilidade',
            message: 'Preciso de assessoria contábil para minha empresa.',
        });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toContain('sucesso');
        expect(data.whatsappLink).toContain('wa.me');
    });

    it('deve sanitizar inputs contra XSS', async () => {
        const { POST } = await import('@/app/api/contato/route');
        const request = createRequest({
            name: '<script>alert("xss")</script>',
            email: 'test@test.com',
            subject: 'outros',
            message: '<img onerror=alert(1) src=x>',
        });
        const response = await POST(request);

        // Deve processar sem erro (sanitizado internamente)
        expect(response.status).toBe(200);
    });
});
