import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface MacroIndicator {
    valor: number;
    variacao?: number;
    atualizado: string;
}

interface AgroIndex {
    nome: string;
    codigo: string;
    valor: number;
    unidade: string;
    variacao: number;
    atualizado: string;
    referencia: string;
    fonte: string;
    descricao: string;
}

const CACHE_DURATION = 30 * 60 * 1000;
let cachedData: { data: unknown; timestamp: number } | null = null;

const B3_SHEETS = {
    milho: 'https://sistemaswebb3-listados.b3.com.br/indexProxy/indexCall/DownloadIndexOnDemand/IFMILHO.xlsx',
    boi: 'https://sistemaswebb3-listados.b3.com.br/indexProxy/indexCall/DownloadIndexOnDemand/IFBOI.xlsx',
};

function excelDateToISO(value: number) {
    const utcDays = Math.floor(value - 25569);
    const utcValue = utcDays * 86400;
    return new Date(utcValue * 1000);
}

async function fetchJson<T>(url: string) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Falha ao buscar ${url}: ${response.status}`);
    }
    return response.json() as Promise<T>;
}

async function fetchAwesomeDolar(): Promise<MacroIndicator & { compra: number; venda: number }> {
    const data = await fetchJson<{ USDBRL: { bid: string; ask: string; pctChange: string; create_date: string } }>(
        'https://economia.awesomeapi.com.br/last/USD-BRL'
    );

    return {
        compra: parseFloat(data.USDBRL.bid),
        venda: parseFloat(data.USDBRL.ask),
        variacao: parseFloat(data.USDBRL.pctChange),
        atualizado: data.USDBRL.create_date,
        valor: parseFloat(data.USDBRL.bid),
    };
}

async function fetchBCBSeries(code: string) {
    const data = await fetchJson<Array<{ data: string; valor: string }>>(
        `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados/ultimos/1?formato=json`
    );
    const latest = data[0];
    return {
        valor: parseFloat(latest.valor),
        atualizado: latest.data,
    };
}

async function fetchB3Index(url: string, nome: string, codigo: string, descricao: string): Promise<AgroIndex> {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Falha ao buscar planilha B3 ${codigo}: ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets['Indice Completo'];
    const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1, defval: '' });

    const dataRows = rows.slice(1).filter((row) => row[0] && row[1]);
    const latest = dataRows[dataRows.length - 1];
    const previous = dataRows[dataRows.length - 2];

    const referenceDate = typeof latest[0] === 'number'
        ? excelDateToISO(latest[0])
        : new Date(String(latest[0]));

    return {
        nome,
        codigo,
        valor: Number(latest[1]),
        unidade: 'pontos',
        variacao: previous ? ((Number(latest[1]) - Number(previous[1])) / Number(previous[1])) * 100 : 0,
        atualizado: String(latest[5] || referenceDate.toLocaleDateString('pt-BR')),
        referencia: referenceDate.toLocaleDateString('pt-BR'),
        fonte: 'B3 — Índices On Demand',
        descricao,
    };
}

export async function GET() {
    try {
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
            return NextResponse.json(cachedData.data, {
                headers: { 'Cache-Control': 'public, s-maxage=1800' },
            });
        }

        const [dolar, selic, ipca, milho, boi] = await Promise.all([
            fetchAwesomeDolar(),
            fetchBCBSeries('432'),
            fetchBCBSeries('13522'),
            fetchB3Index(
                B3_SHEETS.milho,
                'Milho Futuro B3',
                'IFMILHO',
                'Índice oficial da B3 baseado no contrato futuro de milho (CCM), com divulgação D0.'
            ),
            fetchB3Index(
                B3_SHEETS.boi,
                'Boi Futuro B3',
                'IFBOI',
                'Índice oficial da B3 baseado no contrato futuro de boi gordo (BGI), com divulgação D0.'
            ),
        ]);

        const marketData = {
            dolar: {
                compra: dolar.compra,
                venda: dolar.venda,
                variacao: dolar.variacao || 0,
                atualizado: dolar.atualizado,
            },
            macro: {
                selic,
                ipca,
            },
            agroIndices: [milho, boi],
            observacao: 'Painel em modo estrito: exibe apenas dados de fontes oficiais públicas integradas no momento.',
        };

        cachedData = { data: marketData, timestamp: Date.now() };

        return NextResponse.json(marketData, {
            headers: { 'Cache-Control': 'public, s-maxage=1800' },
        });
    } catch (error) {
        console.error('Erro ao buscar cotações oficiais:', error);
        return NextResponse.json({ error: 'Erro ao buscar cotações oficiais' }, { status: 500 });
    }
}
