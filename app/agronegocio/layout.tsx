import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Painel Mercado Agro | Cotações Diárias — Brandão Contabilidade',
    description: 'Cotações diárias de commodities: Soja, Milho, Boi Gordo, Vaca, Bezerro, Novilha, Dólar PTAX, SELIC, IPCA. Foco MS e Brasil. Atualizado diariamente.',
    openGraph: {
        title: 'Painel Mercado Agro — Cotações MS e Brasil',
        description: 'Acompanhe cotações de grãos e pecuária com foco em Mato Grosso do Sul. Dólar, SELIC e índices econômicos em tempo real.',
    },
}

export default function AgroLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
