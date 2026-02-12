import { createClient } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'

/**
 * API de Gestão de Clientes - Criação e Listagem
 * 
 * POST: Insere no Supabase e dispara automação n8n para criar pastas no Drive.
 * GET: Lista todos os clientes (com filtros opcionais).
 */

// Campos TEXT seguros — correspondentes ao formulário do CRM
const CAMPOS_TEXT = [
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
    'telefone',
    'natureza_juridica',
    'porte',
    'atividade_principal',
    'tipo_pessoa',
];

// Campos DATE — precisam de validação extra
const CAMPOS_DATE = [
    'data_abertura',
    'data_situacao_cadastral',
];

// Campos NUMBER
const CAMPOS_NUMBER = [
    'capital_social',
];

/**
 * Valida se uma string é uma data válida no formato YYYY-MM-DD
 */
function isValidDate(dateStr: string): boolean {
    if (!dateStr || typeof dateStr !== 'string') return false;
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return false;

    const year = parseInt(match[1]);
    const month = parseInt(match[2]);
    const day = parseInt(match[3]);

    // Verifica se é uma data válida usando Date
    const date = new Date(year, month - 1, day);
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

/**
 * Filtra e sanitiza o formData antes do insert.
 * - Remove campos não reconhecidos
 * - Remove valores vazios
 * - Valida datas
 */
function sanitizeFormData(raw: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(raw)) {
        // Ignora valores vazios
        if (value === '' || value === null || value === undefined) continue;

        // Campos TEXT
        if (CAMPOS_TEXT.includes(key)) {
            sanitized[key] = String(value).trim();
            continue;
        }

        // Campos DATE — validação rigorosa
        if (CAMPOS_DATE.includes(key)) {
            const dateStr = String(value).trim().substring(0, 10); // Pega só YYYY-MM-DD
            if (isValidDate(dateStr)) {
                sanitized[key] = dateStr;
            } else {
                console.warn(`[SANITIZE] Data inválida ignorada: ${key}=${value}`);
            }
            continue;
        }

        // Campos NUMBER
        if (CAMPOS_NUMBER.includes(key)) {
            const num = parseFloat(value);
            if (!isNaN(num)) {
                sanitized[key] = num;
            }
            continue;
        }

        // Campo drive_folder_id — nunca enviar vazio no insert
        if (key === 'drive_folder_id' && value) {
            sanitized[key] = String(value).trim();
        }
        // Todos os outros campos são IGNORADOS (segurança)
    }

    return sanitized;
}

/**
 * Dispara o webhook do n8n para criar pastas no Google Drive.
 * Agora envia o payload completo do cliente para permitir a criação inteligente de pastas.
 */
async function triggerDriveAutomation(clientData: any): Promise<void> {
    // URL correta do workflow "Cadastro Cliente - Criação de Pastas e Notificações (Golden Path)"
    const webhookUrl = process.env.N8N_CADASTRO_WEBHOOK ||
        'https://webhook.brandaocontador.com.br/webhook/cadastro-cliente';

    try {
        console.log(`[N8N] Disparando Golden Path para: ${clientData.nome}`);
        const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clientData),
            // Aumentado para 15s para dar tempo do Google Drive responder ao n8n
            signal: AbortSignal.timeout(15000),
        });
        const status = res.status;
        console.log(`[N8N] Resposta do webhook: ${status}`);
    } catch (err: any) {
        if (err.name === 'TimeoutError') {
            console.warn('[N8N] O Webhook demorou muito, mas o n8n deve processar em background.');
        } else {
            console.error('[N8N] Erro ao chamar automação:', err.message);
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        const rawData = await request.json();
        const supabase = await createClient();

        // 1. Sanitizar dados — remove campos inválidos, valida datas
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
            campos: Object.keys(formData),
            data_abertura: formData.data_abertura, // Inspecionar campo problemático
            payload: formData // Log completo para debug de data
        });

        // 2. Inserir o cliente no Supabase
        const { data: client, error: insertErr } = await supabase
            .from('clientes')
            .insert([formData])
            .select()
            .single();

        if (insertErr) {
            console.error('[CLIENT API] Erro no insert:', insertErr);

            // Se o erro for de coluna inexistente, tenta sem o campo problemático
            if (insertErr.message?.includes('column') || insertErr.message?.includes('field')) {
                console.log('[CLIENT API] Tentando insert com campos mínimos...');

                // Campos mínimos garantidos
                const minimalData: Record<string, any> = {};
                const SAFE_FIELDS = ['nome', 'cnpj_cpf', 'razao_social', 'email', 'telefone_whatsapp',
                    'regime_tributario', 'status_rfb', 'cidade', 'estado'];

                for (const field of SAFE_FIELDS) {
                    if (formData[field]) minimalData[field] = formData[field];
                }

                const { data: client2, error: err2 } = await supabase
                    .from('clientes')
                    .insert([minimalData])
                    .select()
                    .single();

                if (err2) {
                    return NextResponse.json(
                        { error: `Erro ao salvar: ${err2.message}` },
                        { status: 400 }
                    );
                }

                triggerDriveAutomation(client2);
                return NextResponse.json({
                    success: true,
                    clientId: client2.id,
                    message: `Cliente "${client2.nome || client2.razao_social}" cadastrado (modo seguro). Pastas sendo criadas...`,
                    warning: `Campo ignorado pelo banco: ${insertErr.message}`
                });
            }

            return NextResponse.json(
                { error: `Erro ao salvar: ${insertErr.message}` },
                { status: 400 }
            );
        }

        console.log('[CLIENT API] Cliente criado:', client.id, client.nome);

        // 3. Disparar automação n8n (async) com dados completos
        // O N8N vai receber isso, criar pastas e atualizar o drive_folder_id e status_setup
        triggerDriveAutomation(client);

        return NextResponse.json({
            success: true,
            clientId: client.id,
            message: `Cliente "${client.nome || client.razao_social}" cadastrado com sucesso. Sistema de pastas iniciado.`
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
