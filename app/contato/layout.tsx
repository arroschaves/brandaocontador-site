import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contato | Brandão Contabilidade — Sidrolândia MS',
    description: 'Entre em contato com a Brandão Contabilidade em Sidrolândia - MS. WhatsApp (67) 99601-1356, e-mail e formulário online. Atendimento especializado para empresas e agronegócio.',
    openGraph: {
        title: 'Contato | Brandão Contabilidade',
        description: 'Fale conosco! WhatsApp, e-mail e formulário. Mais de 30 anos de experiência em Sidrolândia - MS.',
    },
}

export default function ContatoLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
