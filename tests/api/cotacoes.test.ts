import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Testes da API de Cotações do Mercado
 * Verifica: fetch BCB, estrutura de dados, cache, tratamento de erros
 */

// Mock de fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API /api/mercado/cotacoes', () => {
    beforeEach(() => {
        vi.resetModules();
        mockFetch.mockReset();
    });

    it('deve retornar estrutura de dados correta', async () => {
        // Mock das respostas do BCB
        mockFetch
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    value: [{ cotacaoCompra: 5.85, cotacaoVenda: 5.86 }],
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    value: [{ cotacaoCompra: 5.84, cotacaoVenda: 5.85 }],
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([{ valor: '13.25' }]),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([{ valor: '4.83' }]),
            })
            .mockResolvedValue({
                ok: false,
                json: () => Promise.resolve({}),
            });

        const { GET } = await import('@/app/api/mercado/cotacoes/route');
        const response = await GET();
        const data = await response.json();

        // Verifica estrutura
        expect(data).toHaveProperty('dolar');
        expect(data).toHaveProperty('commodities');
        expect(data).toHaveProperty('indices');

        // Verifica dólar
        expect(data.dolar).toHaveProperty('compra');
        expect(data.dolar).toHaveProperty('venda');
        expect(data.dolar).toHaveProperty('variacao');
        expect(typeof data.dolar.compra).toBe('number');

        // Verifica commodities
        expect(Array.isArray(data.commodities)).toBe(true);
        expect(data.commodities.length).toBeGreaterThanOrEqual(9);

        // Verifica presença de todas as commodities solicitadas
        const nomes = data.commodities.map((c: { nome: string }) => c.nome);
        expect(nomes).toContain('Soja');
        expect(nomes).toContain('Milho');
        expect(nomes).toContain('Boi Gordo');
        expect(nomes).toContain('Vaca p/ Abate');
        expect(nomes).toContain('Bezerro');
        expect(nomes).toContain('Bezerra');
        expect(nomes).toContain('Novilha');
        expect(nomes).toContain('Novilho');

        // Verifica índices
        expect(data.indices).toHaveProperty('selic');
        expect(data.indices).toHaveProperty('ipca');
        expect(data.indices).toHaveProperty('igpm');
    });

    it('cada commodity deve ter todos os campos necessários', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({}),
        });

        const { GET } = await import('@/app/api/mercado/cotacoes/route');
        const response = await GET();
        const data = await response.json();

        for (const commodity of data.commodities) {
            expect(commodity).toHaveProperty('nome');
            expect(commodity).toHaveProperty('preco');
            expect(commodity).toHaveProperty('unidade');
            expect(commodity).toHaveProperty('variacao');
            expect(commodity).toHaveProperty('fonte');
            expect(commodity).toHaveProperty('regiao');
            expect(typeof commodity.preco).toBe('number');
            expect(commodity.preco).toBeGreaterThan(0);
        }
    });
});
