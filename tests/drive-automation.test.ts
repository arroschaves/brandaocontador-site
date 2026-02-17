import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClientDriveStructure } from '@/lib/utils/drive-automation';
import { google } from 'googleapis';

vi.mock('googleapis', () => {
    const driveMock = {
        files: {
            list: vi.fn(),
            create: vi.fn(),
        },
    };
    return {
        google: {
            auth: {
                GoogleAuth: vi.fn().mockImplementation(function () {
                    return { getClient: vi.fn() };
                }),
            },
            drive: vi.fn().mockReturnValue(driveMock),
        },
    };
});

describe('Drive Automation - createClientDriveStructure', () => {
    let driveMock: any;

    beforeEach(() => {
        vi.clearAllMocks();
        driveMock = google.drive({ version: 'v3' });
        process.env.GOOGLE_CREDENTIALS_JSON = JSON.stringify({ project_id: 'test' });
        process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID = 'root_123';
    });

    it('deve retornar o ID se a pasta já existir', async () => {
        driveMock.files.list.mockResolvedValueOnce({
            data: { files: [{ id: 'existing_id', name: 'TESTE (123)' }] }
        });

        const result = await createClientDriveStructure('Teste', '123');

        expect(result).toBe('existing_id');
        expect(driveMock.files.create).not.toHaveBeenCalled();
    });

    it('deve criar uma nova estrutura se a pasta não existir', async () => {
        // Mock list (não encontrado)
        driveMock.files.list.mockResolvedValueOnce({ data: { files: [] } });

        // Mock create (pasta raiz)
        driveMock.files.create.mockResolvedValueOnce({ data: { id: 'new_root_id' } });

        // Mock subpastas (simplificado)
        driveMock.files.create.mockResolvedValue({ data: { id: 'sub_id' } });

        const result = await createClientDriveStructure('Novo Cliente', '12345678901234'); // PJ

        expect(result).toBe('new_root_id');
        expect(driveMock.files.create).toHaveBeenCalled();
    });
});
