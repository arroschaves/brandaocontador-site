import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

/**
 * API de Cotações — Brandão Contabilidade
 * ========================================
 * Painel Agro com dados oficiais e reais:
 *  - Dólar PTAX (Banco Central) com fallback AwesomeAPI
 *  - SELIC meta anual (BCB SGS 4390) com fallback BrasilAPI
 *  - IPCA acumulado 12m (BCB SGS 13522) com fallback BrasilAPI
 *  - Milho e Boi Gordo: PREÇOS REAIS (R$/saca 60kg e R$/@) via planilhas
 *    oficiais da B3 (planilha Carteira), variação via Índice Completo
 *
 * Resiliência:
 *  - Cada fonte é isolada (try/catch próprio) — uma falha não derruba o painel
 *  - Timeout de 8s por chamada externa (AbortController)
 *  - Cache em memória (30 min) + stale-while-revalidate: se a fonte falhar
 *    e houver dados antigos, servimos os antigos marcados como "stale"
 *  - O endpoint só responde 500 se TODAS as fontes falharem E não houver cache
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const maxDuration = 30;

const CACHE_DURATION = 30 * 60 * 1000; // 30 min (valores diários, sem necessidade de tempo real)
const FETCH_TIMEOUT_MS = 8000;
const PTAX_BUDGET_MS = 6000; // orçamento total para tentar o PTAX antes de cair no fallback

let cachedData: { data: unknown; timestamp: number } | null = null;

interface MacroIndicator {
  valor: number;
  variacao?: number;
  atualizado: string;
  fonte: string;
}

interface AgroIndex {
  nome: string;
  codigo: string;
  valor: number; // preço real (R$/saca, R$/@) quando disponível; senão pontos do índice
  unidade: string;
  variacao: number;
  atualizado: string;
  referencia: string;
  fonte: string;
  descricao: string;
  tipo: 'indice' | 'preco';
}

interface MarketData {
  dolar: { compra: number; venda: number; variacao: number; atualizado: string; fonte: string };
  macro: {
    selic: MacroIndicator;
    ipca: MacroIndicator;
  };
  agroIndices: AgroIndex[];
  observacao: string;
  atualizadoEm: string;
  stale: boolean;
}

const B3_SHEETS = {
  milho: {
    url: 'https://sistemaswebb3-listados.b3.com.br/indexProxy/indexCall/DownloadIndexOnDemand/IFMILHO.xlsx',
    nome: 'Milho Futuro B3',
    codigo: 'IFMILHO',
    unidade: 'R$/saca 60kg',
    descricao: 'Preço do contrato futuro de milho (CCM) com maior liquidez, divulgado oficialmente pela B3 — referência diária para produtores.',
  },
  boi: {
    url: 'https://sistemaswebb3-listados.b3.com.br/indexProxy/indexCall/DownloadIndexOnDemand/IFBOI.xlsx',
    nome: 'Boi Gordo Futuro B3',
    codigo: 'IFBOI',
    unidade: 'R$/@ (arroba)',
    descricao: 'Preço do contrato futuro de boi gordo (BGI) com maior liquidez, divulgado oficialmente pela B3 — referência diária para pecuaristas.',
  },
} as const;

/** Fetch com timeout — evita travamentos quando uma fonte externa não responde */
async function fetchWithTimeout(url: string, timeoutMs: number = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { cache: 'no-store', signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`Falha ao buscar ${url}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function excelDateToISO(value: number) {
  const utcDays = Math.floor(value - 25569);
  const utcValue = utcDays * 86400;
  return new Date(utcValue * 1000);
}

/* ════════════════════════════════════════════
   DÓLAR — PTAX (Banco Central) → AwesomeAPI
   ════════════════════════════════════════════ */

async function fetchOfficialDolar(): Promise<MarketData['dolar']> {
  // Coleta cotações dos últimos dias e calcula a variação entre as duas mais recentes
  const quotes: Array<{ cotacaoCompra: number; cotacaoVenda: number; dataHoraCotacao: string }> = [];

  for (let offset = 0; offset < 4 && quotes.length < 2; offset++) {
    const date = new Date();
    date.setDate(date.getDate() - offset);

    const formatted = date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });

    const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='${formatted}'&$top=1&$format=json`;
    const data = await fetchJson<{ value: Array<{ cotacaoCompra: number; cotacaoVenda: number; dataHoraCotacao: string }> }>(url);
    const latest = data.value?.[0];
    if (latest) quotes.push(latest);
  }

  const newest = quotes[0];
  const previous = quotes[1];
  if (!newest) {
    throw new Error('Não foi possível obter a cotação oficial PTAX no Banco Central.');
  }

  const variacao = previous && previous.cotacaoCompra !== 0
    ? ((newest.cotacaoCompra - previous.cotacaoCompra) / previous.cotacaoCompra) * 100
    : 0;

  return {
    compra: newest.cotacaoCompra,
    venda: newest.cotacaoVenda,
    variacao,
    atualizado: newest.dataHoraCotacao,
    fonte: 'PTAX — Banco Central',
  };
}

async function fetchAwesomeDolar(): Promise<MarketData['dolar']> {
  const data = await fetchJson<{
    USDBRL: {
      bid: string;
      ask: string;
      pctChange: string;
      create_date: string;
    };
  }>('https://economia.awesomeapi.com.br/json/last/USD-BRL');

  return {
    compra: parseFloat(data.USDBRL.bid),
    venda: parseFloat(data.USDBRL.ask),
    variacao: parseFloat(data.USDBRL.pctChange),
    atualizado: data.USDBRL.create_date,
    fonte: 'AwesomeAPI (fallback)',
  };
}

/** Executa uma promise com orçamento de tempo — se estourar, rejeita (o fallback assume) */
async function withBudget<T>(promise: Promise<T>, budgetMs: number): Promise<T> {
  let timeout: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(`Orçamento de ${budgetMs}ms excedido`)), budgetMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeout!);
  }
}

async function fetchDolar(): Promise<MarketData['dolar']> {
  // AwesomeAPI é rápido e confiável (0.3s); PTAX é oficial mas instável em datacenter.
  // Dispara os dois em paralelo: se o PTAX responder dentro do orçamento, usa o oficial;
  // caso contrário, usa a AwesomeAPI (que já resolveu).
  const awesomePromise = fetchAwesomeDolar();
  try {
    const ptax = await withBudget(fetchOfficialDolar(), PTAX_BUDGET_MS);
    return ptax;
  } catch (error) {
    console.warn('[COTACOES] PTAX lento/indisponível, usando AwesomeAPI:', error);
    return awesomePromise;
  }
}

/* ════════════════════════════════════════════
   MACRO — SELIC e IPCA (BCB SGS → BrasilAPI)
   ════════════════════════════════════════════ */

async function fetchBCBSeries(code: string): Promise<{ valor: number; atualizado: string }> {
  const data = await fetchJson<Array<{ data: string; valor: string }>>(
    `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados/ultimos/1?formato=json`
  );
  const latest = data[0];
  if (!latest) throw new Error(`Série BCB ${code} sem dados`);
  return {
    valor: parseFloat(latest.valor),
    atualizado: latest.data,
  };
}

async function fetchBrasilAPITaxas(): Promise<Array<{ nome: string; valor: number }>> {
  return fetchJson<Array<{ nome: string; valor: number }>>('https://brasilapi.com.br/api/taxas/v1');
}

async function fetchSelic(): Promise<MacroIndicator> {
  // BrasilAPI é confiável e retorna a taxa anual correta (Selic ~14% a.a.)
  try {
    const taxas = await fetchBrasilAPITaxas();
    const selic = taxas.find((t) => t.nome.toLowerCase() === 'selic');
    if (!selic) throw new Error('BrasilAPI sem SELIC');
    return {
      valor: selic.valor,
      atualizado: new Date().toISOString().slice(0, 10),
      fonte: 'BrasilAPI (taxa anual)',
    };
  } catch (error) {
    console.warn('[COTACOES] BrasilAPI SELIC indisponível, usando BCB SGS:', error);
    // Fallback: série 4189 = Selic anualizada base 252 (taxa anual correta)
    const series = await fetchBCBSeries('4189');
    return { valor: series.valor, atualizado: series.atualizado, fonte: 'BCB SGS (Selic anualizada)' };
  }
}

async function fetchIpca(): Promise<MacroIndicator> {
  // BrasilAPI retorna IPCA acumulado 12 meses (4.44% em jul/2026)
  try {
    const taxas = await fetchBrasilAPITaxas();
    const ipca = taxas.find((t) => t.nome.toLowerCase() === 'ipca');
    if (!ipca) throw new Error('BrasilAPI sem IPCA');
    return {
      valor: ipca.valor,
      atualizado: new Date().toISOString().slice(0, 10),
      fonte: 'BrasilAPI (IPCA 12m)',
    };
  } catch (error) {
    console.warn('[COTACOES] BrasilAPI IPCA indisponível, usando BCB SGS:', error);
    // Série 13522 = IPCA acumulado em 12 meses
    const series = await fetchBCBSeries('13522');
    return { valor: series.valor, atualizado: series.atualizado, fonte: 'BCB SGS (IPCA 12m)' };
  }
}

/* ════════════════════════════════════════════
   AGRO — Milho e Boi via planilhas oficiais da B3
   Preço REAL extraído da planilha "Carteira" (AdjstdQt)
   ════════════════════════════════════════════ */

async function fetchB3Index(sheet: (typeof B3_SHEETS)[keyof typeof B3_SHEETS]): Promise<AgroIndex> {
  const response = await fetchWithTimeout(sheet.url);
  if (!response.ok) {
    throw new Error(`Falha ao buscar planilha B3 ${sheet.codigo}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  // ── Preço real (planilha Carteira) ──
  // Colunas: RptDt | TckrSymb | ISIN | Asst | ThrlQty | AdjstdQt | EcncVal | PrtcptnPct
  // AdjstdQt = preço ajustado do contrato de maior liquidez (R$/saca para CCM, R$/@ para BGI)
  let precoReal: number | null = null;
  let contrato: string | null = null;
  const carteiraSheet = workbook.Sheets['Carteira'];
  if (carteiraSheet) {
    const carteiraRows = XLSX.utils.sheet_to_json<(string | number)[]>(carteiraSheet, { header: 1, defval: '' });
    const dataRow = carteiraRows
      .slice(1)
      .filter((row) => row[0] && row[1])
      .pop();
    if (dataRow && typeof dataRow[5] === 'number' && dataRow[5] > 0) {
      precoReal = Number(dataRow[5]);
      contrato = String(dataRow[1]);
    }
  }

  // ── Índice e variação (planilha Índice Completo) ──
  const indexSheet = workbook.Sheets['Indice Completo'];
  if (!indexSheet) throw new Error(`Planilha B3 ${sheet.codigo} sem aba 'Indice Completo'`);
  const rows = XLSX.utils.sheet_to_json<(string | number)[]>(indexSheet, { header: 1, defval: '' });

  const dataRows = rows.slice(1).filter((row) => row[0] && row[1]);
  const latest = dataRows[dataRows.length - 1];
  const previous = dataRows[dataRows.length - 2];

  const referenceDate = typeof latest[0] === 'number'
    ? excelDateToISO(latest[0])
    : new Date(String(latest[0]));

  const variacao = previous
    ? ((Number(latest[1]) - Number(previous[1])) / Number(previous[1])) * 100
    : 0;

  return {
    nome: sheet.nome,
    codigo: sheet.codigo,
    valor: precoReal ?? Number(latest[1]),
    unidade: precoReal !== null ? sheet.unidade : 'pontos',
    variacao,
    atualizado: String(latest[5] || referenceDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })),
    referencia: referenceDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
    fonte: precoReal !== null && contrato ? `B3 — contrato ${contrato}` : 'B3 — Índices On Demand',
    descricao: sheet.descricao,
    tipo: precoReal !== null ? 'preco' : 'indice',
  };
}

/* ════════════════════════════════════════════
   GET — monta o painel com resiliência
   ════════════════════════════════════════════ */

export async function GET() {
  // Cache válido → responde rápido
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return NextResponse.json(cachedData.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400, stale-if-error=86400',
      },
    });
  }

  // Busca todas as fontes em paralelo, cada uma isolada (Promise.allSettled)
  const [dolarResult, selicResult, ipcaResult, milhoResult, boiResult] = await Promise.allSettled([
    fetchDolar(),
    fetchSelic(),
    fetchIpca(),
    fetchB3Index(B3_SHEETS.milho),
    fetchB3Index(B3_SHEETS.boi),
  ]);

  const failures: string[] = [];
  const dolar = dolarResult.status === 'fulfilled' ? dolarResult.value : (failures.push('dólar'), null);
  const selic = selicResult.status === 'fulfilled' ? selicResult.value : (failures.push('SELIC'), null);
  const ipca = ipcaResult.status === 'fulfilled' ? ipcaResult.value : (failures.push('IPCA'), null);
  const milho = milhoResult.status === 'fulfilled' ? milhoResult.value : (failures.push('milho'), null);
  const boi = boiResult.status === 'fulfilled' ? boiResult.value : (failures.push('boi'), null);

  for (const failure of failures) {
    console.error(`[COTACOES] Fonte falhou: ${failure}`);
  }

  // Se alguma fonte falhou mas temos cache antigo → serve dados antigos marcados como stale
  const hasFresh = dolar && selic && ipca && milho && boi;
  if (!hasFresh && cachedData) {
    const cached = cachedData.data as MarketData;
    return NextResponse.json(
      {
        ...cached,
        atualizadoEm: new Date().toISOString(),
        stale: true,
        observacao:
          'Algumas fontes externas estavam indisponíveis. Exibindo último painel válido (dados podem estar defasados).',
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400, stale-if-error=86400',
        },
      }
    );
  }

  // Se nada funcionou e não há cache → erro honesto com detalhes
  if (!dolar && !selic && !ipca && !milho && !boi) {
    return NextResponse.json(
      {
        error: 'Erro ao buscar cotações oficiais',
        detalhes: 'Todas as fontes externas falharam (BCB, BrasilAPI, AwesomeAPI, B3). Tente novamente em alguns minutos.',
      },
      { status: 503 }
    );
  }

  const marketData: MarketData = {
    dolar: dolar ?? {
      compra: 0,
      venda: 0,
      variacao: 0,
      atualizado: '-',
      fonte: 'indisponível',
    },
    macro: {
      selic: selic ?? { valor: 0, atualizado: '-', fonte: 'indisponível' },
      ipca: ipca ?? { valor: 0, atualizado: '-', fonte: 'indisponível' },
    },
    agroIndices: [milho, boi].filter((item): item is AgroIndex => item !== null),
    observacao:
      'Painel com dados oficiais de fontes públicas (Banco Central, BrasilAPI e B3). Milho e boi exibem preços reais de contratos futuros (R$/saca e R$/@).',
    atualizadoEm: new Date().toISOString(),
    stale: false,
  };

  cachedData = { data: marketData, timestamp: Date.now() };

  return NextResponse.json(marketData, {
    headers: {
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400, stale-if-error=86400',
    },
  });
}
