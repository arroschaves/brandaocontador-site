import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { decrypt, encrypt } from '@/lib/vault'
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

        // 2. VERIFICAÇÃO DE CONFIGURAÇÃO
        if (cert.senha_dados === 'PENDENTE') {
            return NextResponse.json({
                error: 'Este certificado foi detectado no Google Drive, mas a senha ainda não foi configurada por você no CRM.'
            }, { status: 400 })
        }

        // 3. AUDITORIA ZERO-TRUST (Logamos ANTES de descriptografar)
        await logAudit({
            cliente_id: cert.cliente_id,
            acao: 'ACESSO_VAULT',
            detalhes: `ACESSO CRÍTICO: Descriptografia da senha do certificado '${cert.nome_arquivo}' realizada.`,
            request
        })

        // 4. Descriptografar a senha
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

// PATCH para configurar senha e data de certificados detectados
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: certId } = await params
        const { password, dataVencimento } = await request.json()
        const supabase = await createClient()

        if (!password) return NextResponse.json({ error: 'Senha é obrigatória' }, { status: 400 })

        // 1. Criptografar a senha
        const encryptedPassword = encrypt(password)

        // 2. Atualizar no banco
        const { error } = await supabase
            .from('cliente_certificados')
            .update({
                senha_dados: encryptedPassword.data,
                senha_iv: encryptedPassword.iv,
                senha_tag: encryptedPassword.tag,
                data_vencimento: dataVencimento || null,
                tipo: 'A1', // Efetiva como certificado oficial protegido
                updated_at: new Date().toISOString()
            })
            .eq('id', certId)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('[Cert PATCH Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
