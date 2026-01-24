const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const pdf = require('node-pdf-parser');

/**
 * 🕵️‍♂️ SCRIPT DE DIAGNÓSTICO (v3 - Usando node-pdf-parser)
 */

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const PASTA_FOLHA = 'F:\\ACESSO RAPÍDO\\FOLHA PAGAMENTO\\RECIBO FOLHA';

async function diagnostico() {
    console.log(`\n🔍 INICIANDO DIAGNÓSTICO DE PASTAS`);
    console.log(`📍 Caminho: ${PASTA_FOLHA}`);

    if (!fs.existsSync(PASTA_FOLHA)) {
        console.error(`❌ ERRO: Caminho não encontrado.`);
        return;
    }

    try {
        const { data: clientes } = await supabase.from('clientes').select('nome, cnpj_cpf');
        const baseDados = (clientes || []).map(c => ({
            nome: c.nome,
            doc: c.cnpj_cpf ? c.cnpj_cpf.toString().replace(/\D/g, '') : ''
        })).filter(c => c.doc !== '');

        console.log(`📊 Clientes no CRM com Doc: ${baseDados.length}`);
        if (baseDados.length > 0) {
            console.log(`📝 Exemplo CRM: ${baseDados[0].nome} (${baseDados[0].doc})`);
        }

        const itens = fs.readdirSync(PASTA_FOLHA);
        let count = 0;

        for (const nomePasta of itens) {
            const pathSub = path.join(PASTA_FOLHA, nomePasta);
            if (fs.statSync(pathSub).isDirectory()) {
                const arquivos = fs.readdirSync(pathSub);
                const pdfs = arquivos.filter(f => f.toLowerCase().endsWith('.pdf'));

                if (pdfs.length > 0) {
                    const arquivoPdf = path.join(pathSub, pdfs[0]);
                    console.log(`\n📂 Pasta: ${nomePasta} | 📄 Arq: ${pdfs[0]}`);

                    try {
                        const data = await pdf.parsepdf(arquivoPdf);
                        const textoCompleto = data.pages.join(' ');
                        const textoLimpo = textoCompleto.replace(/\D/g, '');

                        const dono = baseDados.find(c => textoLimpo.includes(c.doc));
                        if (dono) {
                            console.log(`   ✅ ENCONTREI CPF/CNPJ DE: ${dono.nome}`);
                        } else {
                            console.log(`   ❓ Não encontrado. Snippet texto: ${textoCompleto.substring(0, 100).replace(/\n/g, ' ')}...`);
                            console.log(`   🔢 Digitos extraídos (primeiros 50): ${textoLimpo.substring(0, 50)}`);
                        }
                    } catch (e) {
                        console.log(`   ❌ Erro ao ler PDF: ${e.message}`);
                    }
                    count++;
                    if (count > 10) break; // Limitar para não inundar o console
                }
            }
        }

    } catch (err) {
        console.error('❌ Erro fatal:', err.message);
    }
}

diagnostico();
