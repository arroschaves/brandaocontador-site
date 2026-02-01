import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { decrypt } from '@/lib/vault'
import { logAudit } from '@/lib/utils/audit'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: certId } = await params
        const supabase = await createClient()

        // 1. Buscar os dados encriptados
        const { data: cert, error } = await supabase
            .from('cliente_certificados')
            .select('*')
            .eq('id', certId)
            .single()

        if (error || !cert) {
            return NextResponse.json({ error: 'Certificado não encontrado' }, { status: 404 })
        }

        // 2. AUDITORIA ZERO-TRUST (Logamos ANTES de descriptografar)
        await logAudit({
            cliente_id: cert.cliente_id,
            acao: 'ACESSO_VAULT',
            detalhes: `ACESSO CRÍTICO: Descriptografia da senha do certificado '${cert.nome_arquivo}' realizada.`,
            request
        })

        // 3. Descriptografar a senha (para exibição rápida no painel)
        const decryptedPassword = decrypt({
            data: cert.senha_dados,
            iv: cert.senha_iv,
            tag: cert.senha_tag
        }).toString()

        return NextResponse.json({
            password: decryptedPassword,
            fileName: cert.nome_arquivo
        })

    } catch (error: any) {
        console.error('[Cert Decrypt Error]:', error)
        return NextResponse.json({ error: 'Falha na descriptografia' }, { status: 500 })
    }
}

// DELETE para remover certificado
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: certId } = await params
        const supabase = await createClient()

        const { data: cert } = await supabase.from('cliente_certificados').select('cliente_id, nome_arquivo').eq('id', certId).single()

        const { error } = await supabase.from('cliente_certificados').delete().eq('id', certId)
        if (error) throw error

        if (cert) {
            await logAudit({
                cliente_id: cert.cliente_id,
                acao: 'ACESSO_VAULT',
                detalhes: `Certificado '${cert.nome_arquivo}' removido do Vault.`,
                request
            })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
