/**
 * Última atualização: 2026-03-02 (AIOS ADE - Epic 4 Execution Engine)
 * Rota Totalmente Desacoplada: Salva os dados massivos fiscais no Supabase e "Atira" o N8N de forma silenciosa para que o Google Drive processe quando quiser.
 */
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse, NextRequest } from 'next/server'

// Campos TEXT seguros — O Supabase é a Fonte da Verdade. Entrarão todos os cadastrais importantes.
const CAMPOS_TEXT = [
    'documento',
    'razao_social',
    'nome_fantasia',
    'email',
    'telefone',
    'telefone_whatsapp',
    'regime_tributario',
    'cnae_principal',
    'cnaes_secundarios',
    'logradouro',
    'numero',
    'bairro',
    'cep',
    'cidade',
    'estado',
    'inscricao_estadual',
    'inscricao_municipal',
    'status_rfb',
    'natureza_juridica',
    'porte',
    'tipo_pessoa',
    'atendimento_automatico',
    'quadro_societario',
    'tipo_cadastro',
    'status',
];

// Campos DATE — Foco em Certidões e Alvarás Contábeis
const CAMPOS_DATE = [
    'inicio_atividade',
    'data_situacao_cadastral',
    'vencimento_alvara_funcionamento',
    'vencimento_alvara_sanitario',
    'vencimento_alvara_bombeiros',
    'vencimento_alvara_ambiental',
    'vencimento_certidao_negativa_federal',
    'vencimento_certidao_negativa_estadual',
    'vencimento_certidao_negativa_municipal',
    'vencimento_certidao_fgts',
];

const CAMPOS_NUMBER = [
    'capital_social',
];

function isValidDate(dateStr: string): boolean {
    if (!dateStr || typeof dateStr !== 'string') return false;
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return false;
    const year = parseInt(match[1]);
    const month = parseInt(match[2]);
    const day = parseInt(match[3]);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function sanitizeFormData(raw: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(raw)) {
        if (value === '' || value === null || value === undefined) continue;

        if (CAMPOS_TEXT.includes(key)) {
            sanitized[key] = String(value).trim();
            continue;
        }

        if (CAMPOS_DATE.includes(key)) {
            const dateStr = String(value).trim().substring(0, 10);
            if (isValidDate(dateStr)) {
                sanitized[key] = dateStr;
            } else {
                console.warn(`[SANITIZE] Data inválida ignorada na entrada: ${key}=${value}`);
            }
            continue;
        }

        if (CAMPOS_NUMBER.includes(key)) {
            const num = parseFloat(value);
            if (!isNaN(num)) sanitized[key] = num;
            continue;
        }

        if (key === 'simples_nacional') {
            sanitized[key] = value === true || value === 'true' || value === 1;
            continue;
        }

        if (key === 'drive_folder_id' && value) {
            sanitized[key] = String(value).trim();
        }
    }
    return sanitized;
}

/**
 * Disparo Fire-and-Forget: Envia a requisição pro n8n e NÃO ESPERA a lógica dele acabar. 
 * O Next.js não segura a tela do usuário travada por causa do N8N ou do Google Drive.
 */
function triggerDriveAutomation(clientData: any): void {
    const webhookUrl = process.env.N8N_CADASTRO_WEBHOOK ||
        'https://webhook.brandaocontador.com.br/webhook/cadastro-cliente';

    console.log(`[N8N] Disparando em background o Cadastro para: ${clientData.nome_fantasia || clientData.razao_social}`);

    // Assegura que passamos telefone_whatsapp preenchido caso N8N Precise mandar msg
    const phoneToN8n = clientData.telefone_whatsapp || clientData.telefone;

    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            body: {
                ...clientData,
                nome: clientData.nome_fantasia,
                cnpj_cpf: clientData.documento,
                telefone_whatsapp: phoneToN8n
            }
        }),
        // Somente um pequeno timer de segurança da rede de 3s
        signal: AbortSignal.timeout(3000),
    })
        .then(res => console.log(`[N8N] Webhook postado com sucesso. HTTP: ${res.status}`))
        .catch(err => {
            // Nós simplesmente logamos o erro e o sistema segue. Assim o painel nunca trava para você.
            console.warn('[N8N] Aviso de background:', err.name === 'TimeoutError' ? 'O N8N vai processar, conexão fechada pós 3s.' : err.message);
        });
}

export async function POST(request: NextRequest) {
    try {
        const rawData = await request.json();
        const supabase = createAdminClient();

        // 1. O Supabase é a Fonte Única da Verdade. O Frontend cadastra tudo da matriz Fiscal/Cadastral.
        const formData = sanitizeFormData(rawData);

        if (!formData.nome_fantasia && !formData.razao_social) {
            return NextResponse.json({ error: 'Nome Fantasia ou Razão Social é obrigatório' }, { status: 400 });
        }

        console.log('[CLIENT API] Gravando matriz fiscal do cliente:', formData.documento);

        // 2. Inserir Cliente Físico e Fiscal Seguro
        const { data: client, error: insertErr } = await supabase
            .schema('core')
            .from('empresas')
            .insert([formData])
            .select()
            .single();

        if (insertErr) {
            console.error('[CLIENT API] Erro no Supabase:', insertErr);

            // Redução inteligente se tentamos injetar um campo inexistente 
            if (insertErr.message?.includes('column') || insertErr.message?.includes('field')) {
                console.log('[CLIENT API] Reduzindo pacote de dados por conflito de tabela (Segurança RLS)...');

                const minimalData: Record<string, any> = {};
                const SAFE_FIELDS = ['nome_fantasia', 'documento', 'razao_social', 'email', 'telefone',
                    'telefone_whatsapp', 'regime_tributario', 'status_rfb', 'cidade', 'estado'];

                for (const field of SAFE_FIELDS) {
                    if (formData[field]) minimalData[field] = formData[field];
                }

                const { data: client2, error: err2 } = await supabase
                    .schema('core')
                    .from('empresas')
                    .insert([minimalData])
                    .select('*')
                    .single();

                if (err2) {
                    return NextResponse.json({ error: `Erro base do banco de dados: ${err2.message}` }, { status: 400 });
                }

                triggerDriveAutomation(client2);
                return NextResponse.json({
                    success: true,
                    clientId: client2.id,
                    message: `Cliente salvo no sistema de segurança (sem alguns campos conflitantes). Pastas na nuvem iniciarão sozinhas...`
                });
            }

            return NextResponse.json({ error: `Houve um bloqueio ao salvar: ${insertErr.message}` }, { status: 400 });
        }

        // 3. Cadastrou limpo? Disprama a Esteira N8N em background para as Duplicatas sumirem da tela.
        triggerDriveAutomation(client);

        return NextResponse.json({
            success: true,
            clientId: client.id,
            message: `Ficha cadastral salva 100%. O Sistema GDrive do cliente está sendo gerado remotamente sem travas.`
        });

    } catch (error: any) {
        console.error('[CLIENT API] Quebra fatal na API:', error);
        return NextResponse.json({ error: error.message || 'Falha de comunicação global no servidor.' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient(); // Para listagens usa a sessão cliente amarrada no Browser
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        let query = supabase
            .schema('core')
            .from('empresas')
            .select('*')
            .order('razao_social', { ascending: true });

        if (search) {
            query = query.or(`nome_fantasia.ilike.%${search}%,documento.ilike.%${search}%,razao_social.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[CLIENT API] Erro ao listar a malha de clientes:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
