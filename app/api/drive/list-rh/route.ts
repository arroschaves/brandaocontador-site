import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId')

    if (!folderId) return NextResponse.json({ error: 'Missing folderId' }, { status: 400 })

    try {
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON!)
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        })

        const drive = google.drive({ version: 'v3', auth })

        // 1. Tentar localizar a pasta RH
        const resFolders = await drive.files.list({
            q: `'${folderId}' in parents and name contains 'RH' and mimeType = 'application/vnd.google-apps.folder'`,
            fields: 'files(id, name)',
        })

        const rhFolder = resFolders.data.files?.[0]
        if (!rhFolder) return NextResponse.json({ files: [] })

        // 2. Listar arquivos recursivamente ou os principais
        const resFiles = await drive.files.list({
            q: `'${rhFolder.id}' in parents and trashed = false`,
            fields: 'files(id, name, mimeType, webViewLink, modifiedTime)',
            orderBy: 'modifiedTime desc'
        })

        return NextResponse.json({ files: resFiles.data.files || [] })

    } catch (error: any) {
        console.error('Drive API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
