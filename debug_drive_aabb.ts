
import { google } from 'googleapis';
import { createClient } from './lib/supabase/client';

async function debugMaestro() {
    const supabase = createClient();
    const cnpj = '03.997.574'; // AABB Sidrolandia

    const { data: client } = await supabase.from('clientes').select('*').ilike('cnpj_cpf', `%${cnpj}%`).single();
    if (!client || !client.drive_folder_id) {
        console.error('Cliente não encontrado ou sem Drive ID');
        return;
    }

    console.log(`Lendo Drive para: ${client.nome} (${client.id})`);
    console.log(`Drive Folder ID: ${client.drive_folder_id}`);

    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON!);
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    const drive = google.drive({ version: 'v3', auth });

    // Lógica simplificada do Maestro para ver o que ele acha
    const targetFolderIds = new Set([client.drive_folder_id]);
    const queue = [{ id: client.drive_folder_id, depth: 0 }];
    const foldersMap = new Map();
    foldersMap.set(client.drive_folder_id, 'RAIZ');

    while (queue.length > 0) {
        const current = queue.shift();
        if (!current || current.depth >= 6) continue;

        const res = await drive.files.list({
            q: `'${current.id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
            fields: 'files(id, name)'
        });

        for (const f of res.data.files || []) {
            console.log(`[PASTA] Profundidade ${current.depth + 1}: ${f.name} (${f.id})`);
            foldersMap.set(f.id, f.name);
            queue.push({ id: f.id, depth: current.depth + 1 });
            targetFolderIds.add(f.id);
        }
    }

    console.log('\n--- ARQUIVOS ENCONTRADOS ---');
    for (const fId of targetFolderIds) {
        const res = await drive.files.list({
            q: `'${fId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`,
            fields: 'files(id, name, createdTime)'
        });
        for (const file of res.data.files || []) {
            console.log(`- ${file.name} (Pasta: ${foldersMap.get(fId)}) [Criado em: ${file.createdTime}]`);
        }
    }
}

debugMaestro().catch(console.error);
