import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createClientDriveStructure } from '@/lib/utils/drive-automation'

/**
 * API de Gestão de Clientes - Criação com Automação
 * Insere no Supabase e cria a estrutura de pastas no Google Drive.
 */
export async function POST(request: Request) {
    try {
        const formData = await request.json()
        const supabase = await createClient()

        // 1. Inserir o cliente (para pegar o ID)
        const { data: client, error: insertErr } = await supabase
            .from('clientes')
            .insert([formData])
            .select()
            .single()

        if (insertErr) throw insertErr

        // 2. Criar Estrutura no Google Drive
        let driveFolderId = ''
        try {
            driveFolderId = await createClientDriveStructure(client.nome, client.cnpj_cpf)

            // 3. Atualizar o cliente com o ID da pasta do Drive
            await supabase
                .from('clientes')
                .update({ drive_folder_id: driveFolderId })
                .eq('id', client.id)

        } catch (driveErr) {
            console.error('Falha na criação automática do Drive:', driveErr)
            // Não bloqueia a criação do cliente no BD, mas avisa no log
        }

        return NextResponse.json({
            success: true,
            clientId: client.id,
            driveFolderId: driveFolderId
        })

    } catch (error: any) {
        console.error('Client API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
