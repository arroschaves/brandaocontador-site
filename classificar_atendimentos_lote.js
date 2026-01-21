// Script para classificar atendimentos em lote usando IA do Google Gemini
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Ler .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');

let supabaseUrl = '';
let supabaseKey = '';
let geminiApiKey = '';

envLines.forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
        supabaseKey = line.split('=')[1].trim();
    }
    if (line.startsWith('GEMINI_API_KEY=')) {
        geminiApiKey = line.split('=')[1].trim();
    }
});

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para chamar a API do Gemini
async function classificarComIA(mensagem, tipoMidia = 'texto') {
    const prompt = `Você é um assistente de classificação de atendimentos contábeis. Analise a mensagem abaixo e retorne um JSON com:

1. **categoria**: Uma das opções:
   - CERTIDAO (certidões negativas, positivas, etc)
   - ALVARA (alvarás de funcionamento, sanitário, bombeiros, ambiental)
   - CARTAO_CNPJ_IE (cartão CNPJ, inscrição estadual)
   - FOLHA_PAGAMENTO (folha de pagamento, holerite, férias, rescisão)
   - GUIAS_IMPOSTOS (DAS, DARF, GPS, guias de impostos)
   - DOCUMENTOS_FISCAIS (notas fiscais, XML, DANFE)
   - IR_DECLARACOES (imposto de renda, ITR, declarações)
   - SOCIETARIO (contratos sociais, alterações contratuais)
   - OUTROS (outros assuntos)

2. **prioridade**: 1 (urgente), 2 (alta) ou 3 (normal)
   - 1: Prazos vencendo, multas, urgências
   - 2: Solicitações importantes mas sem urgência imediata
   - 3: Dúvidas, informações gerais

3. **atendimento_automatico**: true ou false
   - true: Pode ser respondido automaticamente (dúvidas simples, informações gerais)
   - false: Precisa de atendimento humano (documentos, processos complexos)

4. **motivo_humano**: Se atendimento_automatico = false, explique o motivo
5. **resposta_automatica**: Se atendimento_automatico = true, gere uma resposta educada
6. **confianca**: Número de 0.00 a 1.00 indicando sua confiança na classificação

Mensagem do cliente (tipo: ${tipoMidia}):
"${mensagem}"

Retorne APENAS o JSON, sem explicações adicionais.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();
        const textoResposta = data.candidates[0].content.parts[0].text;

        // Extrair JSON da resposta
        const jsonMatch = textoResposta.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        throw new Error('Resposta da IA não contém JSON válido');
    } catch (error) {
        console.error('Erro ao classificar com IA:', error.message);
        return null;
    }
}

async function classificarAtendimentosEmLote() {
    console.log('🤖 Iniciando classificação automática de atendimentos...\n');

    if (!geminiApiKey) {
        console.error('❌ ERRO: GEMINI_API_KEY não encontrada no .env.local');
        console.log('\n📋 Adicione a chave da API do Gemini no arquivo .env.local:');
        console.log('GEMINI_API_KEY=sua_chave_aqui\n');
        return;
    }

    try {
        // Buscar atendimentos sem classificação
        const { data: atendimentos, error } = await supabase
            .from('atendimentos')
            .select('*')
            .is('categoria_solicitacao', null)
            .order('created_at', { ascending: false });

        if (error) throw error;

        console.log(`📊 Total de atendimentos para classificar: ${atendimentos.length}\n`);

        let processados = 0;
        let sucesso = 0;
        let falhas = 0;

        for (const atendimento of atendimentos) {
            processados++;
            console.log(`\n[${processados}/${atendimentos.length}] Processando: ${atendimento.mensagem?.substring(0, 50)}...`);

            // Classificar com IA
            const classificacao = await classificarComIA(atendimento.mensagem, atendimento.tipo_midia || 'texto');

            if (classificacao) {
                // Atualizar no banco
                const { error: updateError } = await supabase
                    .from('atendimentos')
                    .update({
                        categoria_solicitacao: classificacao.categoria,
                        prioridade: classificacao.prioridade,
                        atendimento_automatico: classificacao.atendimento_automatico,
                        resposta_automatica: classificacao.resposta_automatica || null,
                        motivo_humano: classificacao.motivo_humano || null,
                        confianca_classificacao: classificacao.confianca
                    })
                    .eq('id', atendimento.id);

                if (updateError) {
                    console.error(`   ❌ Erro ao atualizar: ${updateError.message}`);
                    falhas++;
                } else {
                    console.log(`   ✅ Classificado: ${classificacao.categoria} | Prioridade: ${classificacao.prioridade} | Auto: ${classificacao.atendimento_automatico}`);
                    sucesso++;
                }
            } else {
                console.error('   ❌ Falha na classificação');
                falhas++;
            }

            // Aguardar 1 segundo entre requisições para não sobrecarregar a API
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('\n' + '═'.repeat(80));
        console.log('📈 RESUMO DA CLASSIFICAÇÃO:');
        console.log(`   Total processados: ${processados}`);
        console.log(`   ✅ Sucesso: ${sucesso}`);
        console.log(`   ❌ Falhas: ${falhas}`);
        console.log('═'.repeat(80));

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

classificarAtendimentosEmLote();
