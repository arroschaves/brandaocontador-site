require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

(async () => {
  const { data, error } = await supabase
    .from('clientes')
    .select('id, nome, drive_folder_id')
    .order('nome');

  if (error) {
    console.error('Erro:', error);
    return;
  }

  const comPasta = data.filter(c => c.drive_folder_id);
  const semPasta = data.filter(c => !c.drive_folder_id);

  console.log('\n=== CLIENTES COM PASTA DO GOOGLE DRIVE ===');
  console.log('Total:', comPasta.length);
  comPasta.slice(0, 15).forEach(c => {
    console.log(`- ${c.nome}: ${c.drive_folder_id}`);
  });
  if (comPasta.length > 15) {
    console.log(`... e mais ${comPasta.length - 15} clientes`);
  }

  console.log('\n=== CLIENTES SEM PASTA DO GOOGLE DRIVE ===');
  console.log('Total:', semPasta.length);
  semPasta.forEach(c => {
    console.log(`- ${c.nome}`);
  });

  console.log('\n=== RESUMO ===');
  console.log(`Total de clientes: ${data.length}`);
  console.log(`Com pasta: ${comPasta.length}`);
  console.log(`Sem pasta: ${semPasta.length}`);
})();
