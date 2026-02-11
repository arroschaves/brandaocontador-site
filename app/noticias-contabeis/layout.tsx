import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Notícias Contábeis | Tributária, Fiscal, Trabalhista — Brandão Contabilidade',
    description: 'Notícias atualizadas sobre contabilidade, tributação, eSocial, SPED, Reforma Tributária, Simples Nacional e SEFAZ MS. Fontes oficiais + análise com IA.',
    openGraph: {
        title: 'Notícias Contábeis — Brandão Contabilidade',
        description: 'Acompanhe as principais notícias contábeis, fiscais e trabalhistas do Brasil e MS.',
    },
}

export default function NoticiasLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
