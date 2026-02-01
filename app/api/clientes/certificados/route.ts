import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { encrypt } from '@/lib/vault'
import { logAudit } from '@/lib/utils/audit'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const clientId = searchParams.get('clientId')

        if (!clientId) {
            return NextResponse.json({ error: 'Cliente ID é obrigatório' }, { status: 400 })
        }

        const supabase = await createClient()
        const { data, error } = await supabase
            .from('cliente_certificados')
            .select('id, tipo, nome_arquivo, data_vencimento, created_at')
            .eq('cliente_id', clientId)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        console.error('[Cert Listing Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const password = formData.get('password') as string
        const clientId = formData.get('clientId') as string
        const vencimento = formData.get('vencimento') as string

        if (!file || !password || !clientId) {
            return NextResponse.json({ error: 'Arquivo, Senha e Cliente ID são obrigatórios' }, { status: 400 })
        }

        // 1. Criptografar o Arquivo
        const fileBuffer = Buffer.from(await file.arrayBuffer())
        const encryptedFile = encrypt(fileBuffer)

        // 2. Criptografar a Senha
        const encryptedPassword = encrypt(password)

        const supabase = await createClient()

        // 3. Salvar no Banco
        const { data, error } = await supabase.from('cliente_certificados').insert({
            cliente_id: clientId,
            nome_arquivo: file.name,
            data_vencimento: vencimento || null,
            arquivo_dados: encryptedFile.data,
            arquivo_iv: encryptedFile.iv,
            arquivo_tag: encryptedFile.tag,
            senha_dados: encryptedPassword.data,
            senha_iv: encryptedPassword.iv,
            senha_tag: encryptedPassword.tag
        }).select().single()

        if (error) throw error

        // 4. Auditoria
        await logAudit({
            cliente_id: clientId,
            acao: 'ACESSO_VAULT',
            detalhes: `Novo Certificado A1 '${file.name}' adicionado ao Vault.`,
            request
        })

        return NextResponse.json({ success: true, id: data.id })

    } catch (error: any) {
        console.error('[Cert Upload Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
