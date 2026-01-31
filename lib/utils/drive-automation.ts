import { google } from 'googleapis';

/**
 * Utilitário de Automação do Google Drive
 * Gerencia a criação de estruturas de pastas para novos clientes.
 */

const FOLDER_STRUCTURE = [
    '01. FISCAL',
    '02. RH_FOLHA',
    '03. CONTABIL',
    '04. SOCIETARIO',
    '05. CERTIDOES_CADASTRO',
    '06. IMPOSTO_RENDA',
    '07. AGRO_PRODUTOR_RURAL'
];

export async function createClientDriveStructure(clientName: string, cnpjCpf: string) {
    try {
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON!);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive'],
        });
        const drive = google.drive({ version: 'v3', auth });

        // 1. Localizar a pasta raiz do CRM (Brandão Contabilidade CRM)
        // Se já tivermos o ID da pasta pai configurado, usamos ele.
        // Caso contrário, busca no root.
        const parentFolderId = '1_L6L-LqE6V4f2D1Q-9m_L_L_L_L_L_L'; // Exemplo, deve ser configurado

        // 2. Criar a pasta do cliente: "NOME (CNPJ/CPF)"
        const folderName = `${clientName} (${cnpjCpf})`;
        const folderMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || '']
        };

        const clientFolder = await drive.files.create({
            requestBody: folderMetadata,
            fields: 'id',
        });

        const clientFolderId = clientFolder.data.id;
        if (!clientFolderId) throw new Error('Falha ao criar pasta do cliente');

        // 3. Criar subpastas
        for (const subName of FOLDER_STRUCTURE) {
            await drive.files.create({
                requestBody: {
                    name: subName,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [clientFolderId]
                }
            });
        }

        return clientFolderId;

    } catch (error: any) {
        console.error('Drive Automation Error:', error);
        throw error;
    }
}
