import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Agronegócio e Indicadores de Mercado | Brandão Contabilidade',
    description: 'Acompanhe indicadores de mercado, câmbio e conteúdo para agronegócio com foco em Mato Grosso do Sul e apoio contábil especializado.',
    alternates: {
        canonical: '/agronegocio',
    },
    openGraph: {
        title: 'Agronegócio e Indicadores de Mercado | Brandão Contabilidade',
        description: 'Conteúdo para produtores e empresas do agro com foco em Mato Grosso do Sul, incluindo indicadores econômicos e leitura prática.',
    },
}

export default function AgroLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
