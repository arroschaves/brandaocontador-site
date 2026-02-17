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

        const { error } = await supabase
            .schema('audit')
            .from('logs')
            .insert({
                usuario_id: (await supabase.auth.getUser()).data.user?.id || '00000000-0000-0000-0000-000000000000',
                tabela: 'core.empresas',
                acao,
                registro_id: cliente_id,
                antes: null,
                dados_novos: {
                    detalhes,
                    ip_address: ip,
                    user_agent: userAgent
                },
                created_at: new Date().toISOString()
            });

        if (error) console.error('[Audit Log Error]:', error.message);
    } catch (err) {
        console.error('[Audit Critical Error]:', err);
    }
}
