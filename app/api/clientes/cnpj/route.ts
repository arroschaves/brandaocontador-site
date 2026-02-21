import { NextRequest, NextResponse } from 'next/server'
import consultarCNPJ from 'consultar-cnpj'

/**
 * API Proxy para consulta de CNPJ na Receita Federal
 * 
 * Usa o pacote consultar-cnpj (CNPJ.ws) como fonte primária.
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

    // Fonte 1: consultar-cnpj (CNPJ.ws)
    try {
        console.log(`[CNPJ Proxy] Consultando CNPJ.ws (via pacote): ${cnpj}`)
        // Token é opcional na API pública (limite 3/min)
        const data = await consultarCNPJ(cnpj);

        if (data && data.estabelecimento) {
            console.log(`[CNPJ Proxy] CNPJ.ws OK: ${data.razao_social}`)

            const est = data.estabelecimento;
            const porte = data.porte?.descricao || '';
            const isSimples = (data.simples as any)?.optante ?? false;

            // Format phones if available
            let telefone = '';
            if (est.ddd1 && est.telefone1) {
                telefone = `${est.ddd1}${est.telefone1}`;
            }

            return NextResponse.json({
                source: 'cnpj.ws',
                nome_fantasia: est.nome_fantasia || data.razao_social,
                razao_social: data.razao_social,
                email: est.email || '',
                telefone: telefone,
                cnae_principal: est.atividade_principal ? `${est.atividade_principal.id} - ${est.atividade_principal.descricao}` : '',
                cnaes_secundarios: est.atividades_secundarias ? est.atividades_secundarias.map((a: any) => `${a.id} - ${a.descricao}`).join('; ') : '',
                status_rfb: est.situacao_cadastral || 'ATIVA',
                natureza_juridica: data.natureza_juridica?.descricao || '',
                porte: porte,
                capital_social: data.capital_social ? parseFloat(data.capital_social) : 0,
                inicio_atividade: est.data_inicio_atividade || '',
                logradouro: est.logradouro || '',
                numero: est.numero || '',
                complemento: est.complemento || '',
                bairro: est.bairro || '',
                cep: est.cep || '',
                cidade: est.cidade?.nome || '',
                estado: est.estado?.sigla || '',
                inscricao_estadual: est.inscricoes_estaduais?.[0]?.inscricao_estadual || '',
                simples_nacional: isSimples,
                regime_tributario: isSimples ? 'SIMPLES_NACIONAL' : 'LUCRO_PRESUMIDO', // default assumption if not simples
                quadro_societario: data.socios ? data.socios.map((s: any) => s.nome).join(', ') : ''
            })
        }
    } catch (err: any) {
        console.warn(`[CNPJ Proxy] CNPJ.ws falhou: ${err.message || err}`)
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
