
/**
 * Utilitário Profissional de Auditoria Contábil
 * Analisa CNAE, Regime Tributário e Prazos baseados na legislação de 2026.
 */

export const REGIMES = {
    SIMPLES: 'SIMPLES_NACIONAL',
    PRESUMIDO: 'LUCRO_PRESUMIDO',
    REAL: 'LUCRO_REAL',
    PF_AGRO: 'PF_FAZENDA',
    HOLDING: 'HOLDING_AGRO'
};

export interface AccountingRoutine {
    name: string;
    periodicity: 'Mensal' | 'Trimestral' | 'Anual';
    taxGroup: 'Fiscal' | 'RH' | 'Contábil' | 'Agro';
    description: string;
}

export function getRoutinesByClientType(regime: string, isAgro: boolean): AccountingRoutine[] {
    const routines: AccountingRoutine[] = [
        { name: 'FGTS', periodicity: 'Mensal', taxGroup: 'RH', description: 'Geração e conferência da guia FGTS Digital.' },
        { name: 'INSS', periodicity: 'Mensal', taxGroup: 'RH', description: 'Apuração de previdência via DCTFWeb.' },
        { name: 'Folha de Pagamento', periodicity: 'Mensal', taxGroup: 'RH', description: 'Recibos e holerites mensais.' }
    ];

    if (regime === REGIMES.SIMPLES) {
        routines.push({ name: 'DAS', periodicity: 'Mensal', taxGroup: 'Fiscal', description: 'Apuração mensal do PGDAS-D.' });
    }

    if (regime === REGIMES.PRESUMIDO || regime === REGIMES.REAL) {
        routines.push({ name: 'EFD-Reinf', periodicity: 'Mensal', taxGroup: 'Fiscal', description: 'Escrituração Fiscal Digital de Retenções.' });
        routines.push({ name: 'DCTFWeb', periodicity: 'Mensal', taxGroup: 'Fiscal', description: 'Declaração de Débitos e Créditos Tributários.' });
        routines.push({ name: 'IRPJ/CSLL', periodicity: 'Trimestral', taxGroup: 'Fiscal', description: 'Apuração trimestral de imposto de renda e contribuição social.' });
    }

    if (isAgro) {
        routines.push({ name: 'LCDPR', periodicity: 'Anual', taxGroup: 'Agro', description: 'Livro Caixa Digital do Produtor Rural.' });
        routines.push({ name: 'ITR/CCIR', periodicity: 'Anual', taxGroup: 'Agro', description: 'Imposto sobre a Propriedade Territorial Rural.' });
    }

    return routines;
}

/**
 * Tenta inferir o regime tributário baseado no CNAE e porte
 */
export function inferTaxRegime(cnae: string, size: string): string {
    const agricultureCnaes = ['01', '02', '03']; // Início do código CNAE para Agro
    const isAgro = agricultureCnaes.some(pref => cnae.startsWith(pref));

    if (size === 'ME' || size === 'EPP') return REGIMES.SIMPLES;
    if (isAgro && size === 'DEMAIS') return REGIMES.REAL; // Geralmente grandes holdings

    return REGIMES.PRESUMIDO; // Fallback seguro para auditoria inicial
}
