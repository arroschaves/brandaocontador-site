
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function checkSchema() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
        console.error('URL ou Key não encontrada no .env.local')
        return
    }

    const supabase = createClient(url, key)

    console.log('Tentando selecionar uma linha da tabela core.empresas...')
    const { data: row, error: rowErr } = await supabase
        .schema('core')
        .from('empresas')
        .select('*')
        .limit(1)

    if (rowErr) {
        console.error('Erro ao buscar linha:', rowErr)
    } else {
        console.log('Colunas encontradas na tabela core.empresas:')
        console.log(Object.keys(row[0] || {}))
    }
}

checkSchema()
