import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Calculadoras e Simuladores Contábeis',
    description: 'Ferramentas gratuitas: CLT x PJ, enquadramento tributário, férias e 13º salário — simulações rápidas para empresas e profissionais em Sidrolândia - MS.',
    alternates: {
        canonical: '/ferramentas',
    },
    openGraph: {
        title: 'Calculadoras e Simuladores Contábeis | Brandão Contabilidade',
        description: 'Simuladores contábeis gratuitos da Brandão Contabilidade para apoiar decisões de contratação, tributação e folha de pagamento.',
    },
}

export default function FerramentasLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
