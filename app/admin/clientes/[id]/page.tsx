import ClientDetailsClient from './ClientDetailsClient';

export default async function Page({ params }: { params: any }) {
    // No Next.js 15/16, params é uma Promise que deve ser aguardada
    const resolvedParams = await params;
    const id = resolvedParams.id;

    return <ClientDetailsClient id={id} />;
}
