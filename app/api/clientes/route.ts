import { createClient } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'

/**
 * API de Gestão de Clientes - Criação e Listagem
 * 
 * POST: Insere no Supabase e dispara automação n8n para criar pastas no Drive.
 * GET: Lista todos os clientes (com filtros opcionais).
 */

// Campos válidos na tabela 'clientes' do Supabase
const CAMPOS_VALIDOS = [
    'nome',
    'cnpj_cpf',
    'telefone_whatsapp',
    'email',
    'razao_social',
    'regime_tributario',
    'cnae_principal',
    'logradouro',
    'numero',
    'bairro',
    'cep',
    'cidade',
    'estado',
    'inscricao_estadual',
    'inscricao_municipal',
    'status_rfb',
    'drive_folder_id',
    'tipo_pessoa',
    'data_abertura',
    'natureza_juridica',
    'porte',
    'capital_social',
    'telefone',
    'situacao_cadastral',
    'data_situacao_cadastral',
    'motivo_situacao_cadastral',
    'atividade_principal',
    'atividades_secundarias',
];

/**
 * Filtra o formData para enviar apenas campos que existem na tabela.
 * Remove campos vazios/undefined e campos não reconhecidos.
 */
function sanitizeFormData(raw: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(raw)) {
        // Ignora campos não reconhecidos
        if (!CAMPOS_VALIDOS.includes(key)) continue;

        // Ignora valores vazios (string vazia, null, undefined)
        if (value === '' || value === null || value === undefined) continue;

        sanitized[key] = value;
    }

    return sanitized;
}

/**
 * Dispara o webhook do n8n para criar pastas no Google Drive.
 * O workflow n8n busca clientes sem drive_folder_id e cria automaticamente.
 */
async function triggerDriveAutomation(): Promise<void> {
    const webhookUrl = process.env.N8N_DRIVE_WEBHOOK_URL ||
        'https://webhook.brandaocontador.com.br/webhook/3232dacd-f6a4-40ed-9b57-5a22045de998';

    try {
        const res = await fetch(webhookUrl, {
            method: 'GET',
            signal: AbortSignal.timeout(10000), // 10s timeout
        });
        console.log(`[N8N] Drive automation triggered: ${res.status}`);
    } catch (err: any) {
        // Não bloqueia — o n8n processa async
        console.warn('[N8N] Drive automation trigger falhou (não-bloqueante):', err.message);
    }
}

export async function POST(request: NextRequest) {
    try {
        const rawData = await request.json();
        const supabase = await createClient();

        // 1. Sanitizar dados — remove campos inválidos e vazios
        const formData = sanitizeFormData(rawData);

        if (!formData.nome && !formData.razao_social) {
            return NextResponse.json(
                { error: 'Nome ou Razão Social é obrigatório' },
                { status: 400 }
            );
        }

        console.log('[CLIENT API] Inserindo cliente:', {
            nome: formData.nome,
            cnpj_cpf: formData.cnpj_cpf,
            campos: Object.keys(formData).length
        });

        // 2. Inserir o cliente no Supabase
        const { data: client, error: insertErr } = await supabase
            .from('clientes')
            .insert([formData])
            .select()
            .single();

        if (insertErr) {
            console.error('[CLIENT API] Erro no insert:', insertErr);
            return NextResponse.json(
                { error: `Erro ao salvar: ${insertErr.message}` },
                { status: 400 }
            );
        }

        console.log('[CLIENT API] Cliente criado:', client.id, client.nome);

        // 3. Disparar automação n8n para criação de pastas no Drive (async, não-bloqueante)
        triggerDriveAutomation();

        return NextResponse.json({
            success: true,
            clientId: client.id,
            message: `Cliente "${client.nome || client.razao_social}" cadastrado com sucesso. Pastas do Drive serão criadas automaticamente.`
        });

    } catch (error: any) {
        console.error('[CLIENT API] Erro inesperado:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno ao cadastrar cliente' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        let query = supabase
            .from('clientes')
            .select('*')
            .order('nome', { ascending: true });

        if (search) {
            query = query.or(`nome.ilike.%${search}%,cnpj_cpf.ilike.%${search}%,razao_social.ilike.%${search}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[CLIENT API] Erro ao listar:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
