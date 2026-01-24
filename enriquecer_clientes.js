
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function enriquecerDadosCNPJ(cnpj) {
    try {
        const cleanCnpj = cnpj.replace(/\D/g, '');
        console.log(`📡 Buscando dados para CNPJ: ${cleanCnpj}...`);

        // Usando API gratuita do ReceitaWS (limite de 3 requisições por minuto)
        const response = await axios.get(`https://receitaws.com.br/v1/cnpj/${cleanCnpj}`);

        if (response.data.status === 'ERROR') {
            console.error(`   ❌ Erro na API: ${response.data.message}`);
            return null;
        }

        const d = response.data;
        return {
            razao_social: d.nome,
            logradouro: d.logradouro,
            numero: d.numero,
            complemento: d.complemento,
            bairro: d.bairro,
            cidade: d.municipio,
            estado: d.uf,
            cep: d.cep,
            data_abertura: d.abertura ? d.abertura.split('/').reverse().join('-') : null,
            natureza_juridica: d.natureza_juridica,
            cnae_principal: d.atividade_principal && d.atividade_principal[0] ? d.atividade_principal[0].code : null,
            cnaes_secundarios: d.atividades_secundarias || [],
            status_rfb: d.situacao
        };
    } catch (err) {
        console.error(`   ❌ Erro ao buscar CNPJ ${cnpj}:`, err.message);
        return null;
    }
}

async function iniciarEnriquecimento() {
    console.log('🚀 Iniciando Enriquecimento de Dados Cadastrais...');

    // Busca clientes que não possuem cidade cadastrada (indicativo de falta de dados)
    let { data: clientes, error } = await supabase
        .from('clientes')
        .select('id, nome, cnpj_cpf')
        .or('cidade.is.null,razao_social.is.null');

    if (error) {
        if (error.code === '42703') {
            console.error('\n❌ ERRO DE BANCO DE DADOS: Colunas não encontradas!');
            console.error('👉 Você precisa executar o script "MIGRACAO_DADOS_CADASTRAIS.sql" no SQL Editor do Supabase primeiro.');
        } else {
            console.error('Erro ao buscar clientes:', error);
        }
        return;
    }

    console.log(`📊 Encontrados ${clientes.length} clientes para enriquecer.`);

    for (const cliente of clientes) {
        if (!cliente.cnpj_cpf) {
            console.log(`\n⚠️ Cliente ${cliente.nome} não possui CNPJ/CPF cadastrado. Pulando...`);
            continue;
        }

        let doc = cliente.cnpj_cpf.toString().replace(/\D/g, '');

        // Trata zero à esquerda
        if (doc.length === 13) {
            doc = '0' + doc;
            console.log(`   💡 CNPJ com 13 dígitos detectado. Corrigindo para: ${doc}`);
        } else if (doc.length === 10) {
            doc = '0' + doc;
            console.log(`   💡 CPF com 10 dígitos detectado. Corrigindo para: ${doc}`);
        }

        if (doc.length === 14) { // CNPJ
            console.log(`\n🏢 Processando: ${cliente.nome}`);
            const dados = await enriquecerDadosCNPJ(doc);

            if (dados) {
                const { error: updError } = await supabase
                    .from('clientes')
                    .update(dados)
                    .eq('id', cliente.id);

                if (updError) console.error(`   ❌ Erro ao atualizar: ${updError.message}`);
                else console.log(`   ✅ Dados atualizados com sucesso.`);
            }

            // Wait to respect API limit (3 req/min)
            console.log('💤 Aguardando 20 segundos para próxima requisição...');
            await sleep(21000);
        } else {
            console.log(`\n👤 Cliente ${cliente.nome} é Pessoa Física (CPF). Pulando busca automática por enquanto.`);
        }
    }

    console.log('\n✨ Processo de enriquecimento finalizado.');
}

iniciarEnriquecimento();
