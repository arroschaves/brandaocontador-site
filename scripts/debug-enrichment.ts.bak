
import { createClient } from './lib/supabase/client';

async function debugEnrichment() {
    const supabase = createClient();

    console.log('--- BUSCANDO CANDIDATOS ---');
    const { data: clients, error } = await supabase
        .from('clientes')
        .select('id, nome, cnpj_cpf, logradouro, inscricao_estadual')
        .not('cnpj_cpf', 'is', null)
        .limit(10);

    if (error) {
        console.error('Erro ao buscar:', error);
        return;
    }

    const candidates = (clients || []).filter(c => {
        const cleanCnpj = c.cnpj_cpf.replace(/\D/g, '')
        const isPJ = cleanCnpj.length === 14
        const isMissingData = !c.logradouro || !c.inscricao_estadual
        return isPJ && isMissingData
    });

    console.log('Candidatos PJ encontrados:', candidates.length);
    console.log(JSON.stringify(candidates.slice(0, 3), null, 2));

    if (candidates.length > 0) {
        const testClient = candidates[0];
        console.log(`\n--- TESTANDO ENRIQUECIMENTO PARA: ${testClient.nome} (${testClient.cnpj_cpf}) ---`);

        // Simular o que o service faz
        const cleanId = testClient.cnpj_cpf.replace(/\D/g, '');
        console.log('Clean ID:', cleanId);
    }
}

debugEnrichment();
