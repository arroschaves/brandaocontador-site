import { google } from 'googleapis';

/**
 * Drive Automation - Auto-criação de estrutura de pastas para clientes
 * Cria a árvore completa de pastas padrão do escritório Brandão Contabilidade.
 * 
 * ⚠️ PROTEÇÃO ANTI-DUPLICATA: Verifica se a pasta já existe ANTES de criar.
 * Causa raiz de duplicatas: chamar esta função múltiplas vezes sem salvar drive_folder_id.
 * 
 * ID da pasta raiz CRM: 1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP
 * Estrutura baseada nos 76 clientes existentes em C:\Brandao_Contabilidade.
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

// --- Estrutura BASE PJ (Empresas Ouro) ---
const PJ_FOLDERS: FolderDef[] = [
    {
        name: '01_Societario_Legal',
        children: [
            { name: 'Alvaras' },
            { name: 'Certidoes_Negativas' },
            { name: 'Certificado_Digital' },
            { name: 'Contratos_e_Alteracoes' }
        ]
    },
    {
        name: '02_Fiscal_Tributos',
        children: [
            { name: 'Declaracoes_Fiscais_DCTF_Etc' },
            { name: 'Impostos_e_Guias', children: [{ ...ANO_ATUAL, children: [...MESES] }] },
            { name: 'Notas_Fiscais_XML' }
        ]
    },
    {
        name: '03_Contabil_Financeiro',
        children: [
            { name: 'Balancetes_DRE' },
            { name: 'Extratos_Bancarios', children: [{ ...ANO_ATUAL, children: [...MESES] }] },
            { name: 'Recibos_Faturamento' }
        ]
    },
    {
        name: '04_Folha_RH',
        children: [
            { name: 'Ferias_Rescisoes' },
            { name: 'Guias_INSS_FGTS', children: [{ ...ANO_ATUAL, children: [...MESES] }] },
            { name: 'Recibos_Folha_Pagamento', children: [{ ...ANO_ATUAL, children: [...MESES] }] }
        ]
    }
];

// --- Estrutura BASE PF (Produtor Rural / Especiales) ---
const PF_FOLDERS: FolderDef[] = [
    {
        name: '01_Pessoal_Legal',
        children: [
            { name: 'Certidoes_Negativas' },
            { name: 'Certificado_Digital' },
            { name: 'Documentos_Pessoais' },
            { name: 'IRPF_Declaracao' }
        ]
    },
    {
        name: '02_Produtor_Rural',
        children: [
            { name: 'CAEPF_NIRF_CCIR' },
            { name: 'ITR_Guia_Anual' },
            { name: 'Notas_Bovinos', children: [{ ...ANO_ATUAL, children: [...MESES] }] },
            { name: 'Vacina_Gado' }
        ]
    },
    {
        name: '03_Livro_Caixa_LCDPR',
        children: [
            { name: 'Despesas_Receitas_Fazenda', children: [{ ...ANO_ATUAL, children: [...MESES] }] }
        ]
    },
    {
        name: '04_Folha_RH',
        children: [
            { name: 'Ferias_Rescisoes' },
            { name: 'Guias_INSS_FGTS', children: [{ ...ANO_ATUAL, children: [...MESES] }] },
            { name: 'Recibos_Folha_Pagamento', children: [{ ...ANO_ATUAL, children: [...MESES] }] }
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
 * Verifica se uma pasta já existe no Drive e retorna o ID, ou null
 */
async function findExistingFolder(
    drive: any,
    name: string,
    parentId: string
): Promise<string | null> {
    const res = await drive.files.list({
        q: `'${parentId}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        pageSize: 1,
    });
    const files = res.data.files;
    if (files && files.length > 0) {
        return files[0].id!;
    }
    return null;
}

/**
 * Cria uma pasta no Google Drive — verificando ANTES se já existe (anti-duplicata)
 */
async function createDriveFolder(
    drive: any,
    name: string,
    parentId: string
): Promise<string> {
    // PROTEÇÃO ANTI-DUPLICATA: verificar se já existe antes de criar
    const existente = await findExistingFolder(drive, name, parentId);
    if (existente) {
        console.log(`[DRIVE] ℹ️ Pasta já existe (anti-duplicata): ${name} (${existente})`);
        return existente;
    }

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
        // ID CORRETO da pasta raiz CRM (use sempre este)
        const ROOT_FOLDER_ID = '1iioIcacOKwBKxM7Y0vgevT1YKwjTc1FP';
        const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || ROOT_FOLDER_ID;

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

        // 4. Montar a lista de pastas exclusiva de PF ou PJ
        let allFolders: FolderDef[] = [];
        if (isCNPJ(cnpjCpf)) {
            allFolders = [...PJ_FOLDERS];
            console.log(`[DRIVE] Cliente PJ (CNPJ) → Estrutura Empresarial Departamentalizada (Ouro)`);
        } else {
            allFolders = [...PF_FOLDERS];
            console.log(`[DRIVE] Cliente PF (CPF/Produtor Rural) → Estrutura Rural de Caepf/Livro Caixa`);
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
