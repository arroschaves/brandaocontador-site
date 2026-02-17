import { NextRequest, NextResponse } from 'next/server'

/**
 * API Proxy para consulta de CNPJ na Receita Federal
 * 
 * Usa o serviço open.cnpja.com (gratuito, sem API key) como proxy.
 * Isso resolve o problema de CORS ao fazer a consulta no frontend.
 * 
 * Fallback: BrasilAPI (serviço de backup).
 */

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const cnpj = searchParams.get('cnpj')?.replace(/\D/g, '')

    if (!cnpj || cnpj.length !== 14) {
        return NextResponse.json(
            { error: 'CNPJ inválido. Forneça 14 dígitos.' },
            { status: 400 }
        )
    }

    // Fonte 1: CNPJA.com (open, sem key)
    try {
        console.log(`[CNPJ Proxy] Consultando CNPJA: ${cnpj}`)
        const res = await fetch(`https://open.cnpja.com/office/${cnpj}`, {
            signal: AbortSignal.timeout(8000),
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'BrandaoContabilidade/1.0',
            },
        })

        if (res.ok) {
            const data = await res.json()
            console.log(`[CNPJ Proxy] CNPJA OK: ${data.name}`)

            return NextResponse.json({
                source: 'cnpja',
                nome_fantasia: data.alias || data.company?.name || data.name,
                razao_social: data.name,
                email: data.emails?.[0]?.address || '',
                telefone: data.phones?.[0] ? `${data.phones[0].area}${data.phones[0].number}` : '',
                cnae_principal: data.mainActivity
                    ? `${data.mainActivity.id || data.mainActivity.code} - ${data.mainActivity.text}`
                    : '',
                cnaes_secundarios: data.sideActivities
                    ? data.sideActivities.map((a: any) => `${a.id || a.code} - ${a.text}`).join('; ')
                    : '',
                status_rfb: data.status?.text || data.registration?.status || 'ATIVA',
                natureza_juridica: data.nature?.text || '',
                porte: data.size?.text || data.company?.size?.text || '',
                capital_social: data.company?.equity || data.equity || 0,
                inicio_atividade: data.founded || data.company?.founded || '',
                logradouro: data.address?.street || '',
                numero: data.address?.number || '',
                bairro: data.address?.district || '',
                cep: data.address?.zip || '',
                cidade: data.address?.city || '',
                estado: data.address?.state || '',
                inscricao_estadual: '',
                simples_nacional: data.tax?.simples?.optant || false,
                regime_tributario: data.tax?.simples?.optant ? 'SIMPLES_NACIONAL' : 'LUCRO_PRESUMIDO'
            })
        }

        console.warn(`[CNPJ Proxy] CNPJA falhou: ${res.status}`)
    } catch (err: any) {
        console.warn(`[CNPJ Proxy] CNPJA timeout/error: ${err.message}`)
    }

    // Fonte 2: BrasilAPI (fallback)
    try {
        console.log(`[CNPJ Proxy] Consultando BrasilAPI: ${cnpj}`)
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
            signal: AbortSignal.timeout(8000),
        })

        if (res.ok) {
            const data = await res.json()
            console.log(`[CNPJ Proxy] BrasilAPI OK: ${data.razao_social}`)

            return NextResponse.json({
                source: 'brasilapi',
                nome_fantasia: data.nome_fantasia || data.razao_social,
                razao_social: data.razao_social,
                email: data.email || '',
                telefone: data.ddd_telefone_1 || '',
                cnae_principal: data.cnae_fiscal
                    ? `${data.cnae_fiscal} - ${data.cnae_fiscal_descricao}`
                    : '',
                status_rfb: data.descricao_situacao_cadastral || 'ATIVA',
                natureza_juridica: data.natureza_juridica || '',
                porte: data.porte || '',
                capital_social: data.capital_social || 0,
                inicio_atividade: data.data_inicio_atividade || '',
                logradouro: data.logradouro || '',
                numero: data.numero || '',
                bairro: data.bairro || '',
                cep: data.cep?.toString() || '',
                cidade: data.municipio || '',
                estado: data.uf || '',
                inscricao_estadual: '',
            })
        }
    } catch (err: any) {
        console.warn(`[CNPJ Proxy] BrasilAPI falhou: ${err.message}`)
    }

    return NextResponse.json(
        { error: 'Não foi possível consultar o CNPJ. Tente novamente em instantes.' },
        { status: 502 }
    )
}
