
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or Key is missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanData() {
  console.log('Iniciando limpeza de clientes (telefone e email nulos)...');

  // Consulta para verificar quantos serão deletados
  const { data: toDelete, error: fetchError } = await supabase
    .from('clientes')
    .select('id, nome')
    .is('telefone_whatsapp', null)
    .is('email', null);

  if (fetchError) {
    console.error('Erro ao buscar clientes:', fetchError);
    return;
  }

  console.log(`Encontrados ${toDelete.length} clientes para exclusão.`);

  if (toDelete.length === 0) {
    console.log('Nenhum cliente para excluir.');
    return;
  }

  // Executar exclusão
  const { error: deleteError } = await supabase
    .from('clientes')
    .delete()
    .is('telefone_whatsapp', null)
    .is('email', null);

  if (deleteError) {
    console.error('Erro ao excluir clientes:', deleteError);
  } else {
    console.log('Limpeza concluída com sucesso!');
  }
}

cleanData();
