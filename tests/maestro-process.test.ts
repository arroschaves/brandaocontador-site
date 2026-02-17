import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/maestro/process/route';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase/admin');

describe('Maestro Vision API - POST /api/maestro/process', () => {
    let mockSupabase: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock do client Supabase
        mockSupabase = {
            schema: vi.fn().mockReturnThis(),
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(),
            insert: vi.fn().mockReturnThis(),
        };

        (createAdminClient as any).mockReturnValue(mockSupabase);
    });

    it('deve retornar 400 se faltarem campos obrigatórios', async () => {
        const req = new NextRequest('http://localhost/api/maestro/process', {
            method: 'POST',
            body: JSON.stringify({}), // Payload vazio
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error).toContain('obrigatórios');
    });

    it('deve processar com sucesso um documento existente', async () => {
        const payload = {
            drive_file_id: 'drive_123',
            empresa_id: 'empresa_456',
            tipo: 'DAS',
            vencimento: '2026-03-20',
            valor: 150.50
        };

        // Mock lookup documento
        mockSupabase.single.mockResolvedValueOnce({
            data: { id: 'doc_uuid_789' },
            error: null
        });

        // Mock insert documentos_processados
        mockSupabase.single.mockResolvedValueOnce({
            data: { id: 'proc_uuid_000', vencimento: '2026-03-20', valor: 150.50 },
            error: null
        });

        const req = new NextRequest('http://localhost/api/maestro/process', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.id).toBe('proc_uuid_000');
    });

    it('deve criar registro base se o documento não existir no storage_docs', async () => {
        const payload = {
            drive_file_id: 'drive_novo',
            empresa_id: 'empresa_456',
            tipo: 'FGTS'
        };

        // Mock lookup documento - não encontrado (PGRST116)
        mockSupabase.single.mockResolvedValueOnce({
            data: null,
            error: { code: 'PGRST116', message: 'Not Found' }
        });

        // Mock criação do documento base
        mockSupabase.single.mockResolvedValueOnce({
            data: { id: 'novo_doc_uuid' },
            error: null
        });

        // Mock insert documentos_processados
        mockSupabase.single.mockResolvedValueOnce({
            data: { id: 'novo_proc_uuid', status_processamento: 'sucesso' },
            error: null
        });

        const req = new NextRequest('http://localhost/api/maestro/process', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(mockSupabase.insert).toHaveBeenCalled(); // Verificamos se tentou criar o doc base
    });

    it('deve retornar 500 em caso de erro no banco de dados', async () => {
        const payload = {
            drive_file_id: 'drive_erro',
            empresa_id: 'empresa_err',
            tipo: 'DARF'
        };

        mockSupabase.single.mockResolvedValueOnce({
            data: null,
            error: { code: 'X', message: 'Erro Crítico de SQL' }
        });

        const req = new NextRequest('http://localhost/api/maestro/process', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data.error).toContain('Erro Crítico');
    });
});
