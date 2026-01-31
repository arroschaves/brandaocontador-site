/**
 * Utilitários de formatação para padrões brasileiros.
 */

export function formatCNPJ(cnpj: string): string {
    const clean = cnpj.replace(/\D/g, '');
    if (clean.length !== 14) return cnpj;
    return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

export function formatCPF(cpf: string): string {
    const clean = cpf.replace(/\D/g, '');
    if (clean.length !== 11) return cpf;
    return clean.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatPhone(phone: string): string {
    const clean = phone.replace(/\D/g, '');
    // Remove 55 if present
    const noDDI = clean.startsWith('55') ? clean.substring(2) : clean;

    if (noDDI.length === 11) {
        return noDDI.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (noDDI.length === 10) {
        return noDDI.replace(/^(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return phone;
}
