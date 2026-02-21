// Test script to run the audit sync logic
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testFetch() {
    try {
        console.log('Testando Rota Audit Localmente...');

        // Pega um dos IDs do check_drive_folders
        const testClientId = '9a13b6e8-23eb-467f-9467-f3cdaf434a94'; // ARROSCHAVES

        const res = await fetch('http://localhost:3000/api/sync/audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientId: testClientId,
                debug: true
            })
        });

        const data = await res.json();

        if (data.results && data.results[0] && data.results[0].debug) {
            const filesF = data.results[0].debug.filesFound || [];
            console.log(`\n✅ TESTE: Recebidos ${filesF.length} arquivos permitidos:`);
            filesF.slice(0, 5).forEach((f, i) => {
                console.log(`   ${i + 1}. [${f.parentName}] ${f.name}`);
            });
            if (filesF.length > 5) console.log(`   ... mais ${filesF.length - 5} arquivos.`);
        } else {
            console.log('Resultado cru:', JSON.stringify(data, null, 2));
        }

    } catch (e) {
        console.error('Falha ao rodar script de teste', e);
    }
}

testFetch();
