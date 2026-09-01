import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Notícias Contábeis, Fiscais e Trabalhistas',
    description: 'Acompanhe notícias contábeis, fiscais, trabalhistas, eSocial, Receita Federal e SEFAZ MS com leitura prática para empresas e agronegócio.',
    alternates: {
        canonical: '/noticias-contabeis',
    },
    openGraph: {
        title: 'Notícias Contábeis, Fiscais e Trabalhistas | Brandão Contabilidade',
        description: 'Painel com fontes reais, notícias recentes e leitura prática para empresas, departamento pessoal e agronegócio.',
    },
}

export default function NoticiasLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
