
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use service key to bypass RLS if needed, though reading is usually fine with Anon if policies allow
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Environment variables missing.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyze() {
    console.log('Analisando clientes com telefone e email nulos...');

    // 1. Get IDs of candidates for deletion
    const { data: clients, error: clientError } = await supabase
        .from('clientes')
        .select('id, nome')
        .is('telefone_whatsapp', null)
        .is('email', null);

    if (clientError) {
        console.error('Error fetching clients:', clientError);
        return;
    }

    const clientIds = clients.map(c => c.id);
    console.log(`Clientes candidatos a exclusão: ${clients.length}`);

    if (clientIds.length === 0) return;

    // 2. Count obligations for these clients
    const { data: obligations, error: obError } = await supabase
        .from('obrigacoes_acessorias')
        .select('id, cliente_id')
        .in('cliente_id', clientIds);

    if (obError) {
        console.error('Error fetching obligations:', obError);
        return;
    }

    console.log(`Total de Obrigações Acessórias vinculadas a esses clientes: ${obligations.length}`);

    // Show a few examples if there are any
    if (obligations.length > 0) {
        console.log('Exemplos de clientes que possuem obrigações e seriam afetados:');
        const affectedClientIds = [...new Set(obligations.map(o => o.cliente_id))].slice(0, 5);
        const affectedClients = clients.filter(c => affectedClientIds.includes(c.id));
        affectedClients.forEach(c => console.log(`- ${c.nome} (ID: ${c.id})`));
        console.log('... e outros.');
    } else {
        console.log('Nenhuma obrigação acessória encontrada para esses clientes. A exclusão é segura.');
    }

    // 3. Check for 'atendimentos' (Support tickets) as well, just in case
    const { data: tickets, error: ticketError } = await supabase
        .from('atendimentos')
        .select('id')
        .in('cliente_id', clientIds);

    if (!ticketError && tickets.length > 0) {
        console.log(`\nATENÇÃO: Existem ${tickets.length} atendimentos vinculados a esses clientes.`);
    }
}

analyze();
