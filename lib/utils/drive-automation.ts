import { google } from 'googleapis';

/**
 * Drive Automation - Auto-criação de estrutura de pastas para clientes
 * Cria a árvore completa de pastas padrão do escritório Brandão Contabilidade.
 * 
 * Estrutura baseada nos 76 clientes existentes em C:\Brandao_Contabilidade.
 * PJ (CNPJ): Estrutura completa com ALVARAS
 * PF (CPF): Estrutura base sem ALVARAS
 */

// --- Definição de tipos ---
interface FolderDef {
    name: string;
    children?: FolderDef[];
}

// --- Meses do ano (padrão Brandão) ---
const MESES: FolderDef[] = [
    { name: '01_Janeiro' },
    { name: '02_Fevereiro' },
    { name: '03_Marco' },
    { name: '04_Abril' },
    { name: '05_Maio' },
    { name: '06_Junho' },
    { name: '07_Julho' },
    { name: '08_Agosto' },
    { name: '09_Setembro' },
    { name: '10_Outubro' },
    { name: '11_Novembro' },
    { name: '12_Dezembro' },
    { name: '13_Salario' },
];

// --- Ano atual com meses ---
const ANO_ATUAL: FolderDef = {
    name: '2026',
    children: [...MESES]
};

// --- Subpastas de RH (dentro de 02 - RH) ---
// Algumas têm Ano/Mês, outras são flat
const RH_SUBFOLDERS: FolderDef[] = [
    { name: 'AVISO_PREVIO' },
    { name: 'FGTS', children: [{ ...ANO_ATUAL, children: [...MESES] }] },
    { name: 'FICHAS_EMPREGADOS' },
    { name: 'INSS', children: [{ ...ANO_ATUAL, children: [...MESES] }] },
    { name: 'PEDIDO_REGISTRO' },
    { name: 'RECIBO_FERIAS', children: [{ ...ANO_ATUAL, children: [...MESES] }] },
    { name: 'RECIBO_FOLHA', children: [{ ...ANO_ATUAL, children: [...MESES] }] },
    { name: 'RECIBO_RESCISAO', children: [{ ...ANO_ATUAL, children: [...MESES] }] },
];

// --- Estrutura BASE para TODOS os clientes ---
const BASE_FOLDERS: FolderDef[] = [
    { name: '01 - CND (Certidões Negativas)' },
    { name: '02 - PENDÊNCIAS FISCAIS (Federal, Estadual, Municipal)' },
    { name: '03 - DOCUMENTOS PESSOAIS' },
    { name: '04 - CERTIFICADO DIGITAL' },
    { name: '05 - DOCUMENTOS TERRA' },
    { name: '06 - IRPF' },
    { name: '07 - JUNTA COMERCIAL' },
    { name: '08 - FATURAMENTO' },
    { name: '09 - CAEPF' },
    {
        name: '10 - RH - ESCRITA - CONTABILIDADE',
        children: [
            {
                name: '01 - FISCAL',
                children: [{ ...ANO_ATUAL, children: [...MESES] }]
            },
            {
                name: '02 - RH',
                children: RH_SUBFOLDERS
            },
            {
                name: '03 - IMPOSTOS E GUIAS',
                children: [{ ...ANO_ATUAL, children: [...MESES] }]
            },
        ]
    },
    {
        name: 'GERAL',
        children: [
            { name: 'AVISO_PREVIO' },
            { name: 'FGTS' },
            { name: 'FICHAS_EMPREGADOS' },
            { name: 'INSS' },
            { name: 'PEDIDO_REGISTRO' },
            { name: 'RECIBO_FERIAS' },
            { name: 'RECIBO_FOLHA' },
            { name: 'RECIBO_RESCISAO' },
        ]
    }
];

// --- Pastas adicionais somente para PJ (CNPJ) ---
const PJ_EXTRA_FOLDERS: FolderDef[] = [
    {
        name: '11 - ALVARAS',
        children: [
            { name: 'BOMBEIRO' },
            { name: 'SANITARIO' },
            { name: 'MEIO AMBIENTE' },
            { name: 'FUNCIONAMENTO' },
        ]
    }
];

/**
 * Detecta se o documento é CNPJ (14 dígitos) ou CPF (11 dígitos)
 */
function isCNPJ(cnpjCpf: string): boolean {
    const digits = cnpjCpf.replace(/\D/g, '');
    return digits.length >= 14;
}

/**
 * Inicializa o cliente Google Drive com Service Account
 */
function getDriveClient() {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON!);
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive'],
    });
    return google.drive({ version: 'v3', auth });
}

/**
 * Cria uma pasta no Google Drive e retorna o ID
 */
async function createDriveFolder(
    drive: any,
    name: string,
    parentId: string
): Promise<string> {
    const res = await drive.files.create({
        requestBody: {
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId],
        },
        fields: 'id',
    });

    if (!res.data.id) {
        throw new Error(`Falha ao criar pasta: ${name}`);
    }

    return res.data.id;
}

/**
 * Cria recursivamente a árvore de pastas
 */
async function createFolderTree(
    drive: any,
    folders: FolderDef[],
    parentId: string
): Promise<void> {
    for (const folder of folders) {
        const folderId = await createDriveFolder(drive, folder.name, parentId);

        if (folder.children && folder.children.length > 0) {
            await createFolderTree(drive, folder.children, folderId);
        }
    }
}

/**
 * Função principal: Cria a estrutura completa de pastas para um novo cliente.
 * 
 * @param clientName - Nome do cliente (ex: "ALESSANDRO BRANDÃO")
 * @param cnpjCpf - CNPJ ou CPF do cliente
 * @returns O ID da pasta raiz do cliente no Google Drive
 */
export async function createClientDriveStructure(
    clientName: string,
    cnpjCpf: string
): Promise<string> {
    try {
        const drive = getDriveClient();
        const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

        if (!rootFolderId) {
            throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID não configurado no .env');
        }

        // 1. Nome da pasta raiz do cliente: "NOME (CNPJ/CPF)"
        const sanitizedCnpjCpf = cnpjCpf.replace(/\D/g, '');
        const folderName = `${clientName.toUpperCase()} (${sanitizedCnpjCpf})`;

        console.log(`[DRIVE] Criando estrutura para: ${folderName}`);

        // 2. Verificar se a pasta já existe (evitar duplicatas)
        const existing = await drive.files.list({
            q: `'${rootFolderId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            fields: 'files(id, name)',
        });

        if (existing.data.files && existing.data.files.length > 0) {
            const existingId = existing.data.files[0].id!;
            console.log(`[DRIVE] Pasta já existe: ${folderName} (${existingId})`);
            return existingId;
        }

        // 3. Criar pasta raiz do cliente
        const clientFolderId = await createDriveFolder(drive, folderName, rootFolderId);
        console.log(`[DRIVE] Pasta criada: ${folderName} (${clientFolderId})`);

        // 4. Montar a lista de pastas (base + extras PJ)
        const allFolders = [...BASE_FOLDERS];
        if (isCNPJ(cnpjCpf)) {
            allFolders.push(...PJ_EXTRA_FOLDERS);
            console.log(`[DRIVE] Cliente PJ (CNPJ) → incluindo ALVARAS`);
        } else {
            console.log(`[DRIVE] Cliente PF (CPF) → estrutura base`);
        }

        // 5. Criar toda a árvore de subpastas
        await createFolderTree(drive, allFolders, clientFolderId);

        const totalFolders = countFolders(allFolders);
        console.log(`[DRIVE] ✅ Estrutura completa: ${totalFolders} pastas criadas`);

        return clientFolderId;

    } catch (error: any) {
        console.error('[DRIVE] ❌ Erro na automação:', error.message);
        throw error;
    }
}

/**
 * Conta o total de pastas na árvore (para log)
 */
function countFolders(folders: FolderDef[]): number {
    let count = 0;
    for (const f of folders) {
        count += 1;
        if (f.children) {
            count += countFolders(f.children);
        }
    }
    return count;
}
