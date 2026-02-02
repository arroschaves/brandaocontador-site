
import { createClient } from './lib/supabase/client';

async function checkClient() {
    const supabase = createClient();
    const cnpj = '03.997.574/0001-76';

    console.log('--- BUSCANDO CLIENTE ---');
    const { data: clients, error } = await supabase.from('clientes').select('*').ilike('cnpj_cpf', `%${cnpj}%`);
    if (error) console.error('Erro:', error);
    if (clients) {
        console.log(`Encontrados ${clients.length} clientes.`);
        clients.forEach(c => {
            console.log(`ID: ${c.id}, Nome: ${c.nome}, Drive: ${c.drive_folder_id}, Regime: ${c.regime_tributario}`);
        });

        if (clients.length > 0) {
            const clientId = clients[0].id;
            console.log('\n--- BUSCANDO OBRIGAÇÕES (JANEIRO 2026) ---');
            const { data: obrs } = await supabase.from('obrigacoes_acessorias').select('*').eq('cliente_id', clientId).eq('competencia', '2026-01-01');
            console.log(obrs);
        }
    }
}

checkClient().catch(console.error);
