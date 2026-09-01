import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contato em Sidrolândia - MS',
    description: 'Entre em contato com a Brandão Contabilidade em Sidrolândia - MS. WhatsApp (67) 99601-1356, e-mail e formulário online. Atendimento especializado para empresas e agronegócio.',
    alternates: {
        canonical: '/contato',
    },
    openGraph: {
        title: 'Contato com Contabilidade em Sidrolândia - MS | Brandão Contabilidade',
        description: 'Fale com a Brandão Contabilidade por WhatsApp, e-mail ou formulário. Atendimento para empresas e agronegócio em Sidrolândia e região.',
    },
}

export default function ContatoLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
