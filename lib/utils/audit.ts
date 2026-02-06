import { createClient } from '@/lib/supabase/server'

interface AuditOptions {
    cliente_id?: string;
    acao: 'UPLOAD' | 'ENVIO_WA' | 'ENVIO_EMAIL' | 'EDICAO_CADASTRO' | 'SISTEMA' | 'ACESSO_VAULT' | 'VISUALIZACAO_SENHA' | 'EXCLUSAO_CERTIFICADO' | 'OFFBOARDING_CONCLUIDO' | 'ENRIQUECIMENTO';
    detalhes: string;
    request?: Request;
}

export async function logAudit({ cliente_id, acao, detalhes, request }: AuditOptions) {
    try {
        const supabase = await createClient();

        let ip = '0.0.0.0';
        let userAgent = 'unknown';

        if (request) {
            ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '0.0.0.0';
            userAgent = request.headers.get('user-agent') || 'unknown';
        }

        const { error } = await supabase.from('auditoria_crm').insert({
            cliente_id,
            acao,
            detalhes,
            ip_address: ip,
            user_agent: userAgent,
            created_at: new Date().toISOString()
        });

        if (error) console.error('[Audit Log Error]:', error.message);
    } catch (err) {
        console.error('[Audit Critical Error]:', err);
    }
}
