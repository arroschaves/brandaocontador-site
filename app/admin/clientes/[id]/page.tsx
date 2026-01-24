'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Phone, Mail, MapPin, Clock, ArrowLeft, Loader2, Calendar, FileCheck, ShieldAlert, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface ClientPageProps {
    params: Promise<{ id: string }>
}

/**
 * Página de Detalhes do Cliente (Admin)
 * Estabilizada para Next.js 15
 */
export default function ClientDetailsPage({ params }: ClientPageProps) {
    const { id } = use(params)
    const [client, setClient] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        let isMounted = true;

        async function getClient() {
            if (!id) return;

            try {
                setLoading(true)
                const { data, error } = await supabase
                    .from('clientes')
                    .select('*')
                    .eq('id', id)
                    .maybeSingle()

                if (error) throw error;

                if (isMounted) {
                    setClient(data)
                }
            } catch (err: any) {
                console.error('Erro na carga do cliente:', err)
                if (isMounted) {
                    setFetchError(err.message || 'Falha na comunicação com o servidor de dados.')
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        getClient()
        return () => { isMounted = false };
    }, [id])

    if (loading) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-amber-electric animate-pulse">
                <Loader2 className="w-12 h-12 animate-spin" />
                <span className="font-mono text-xs uppercase tracking-[0.3em]">Sincronizando Núcleo...</span>
            </div>
        )
    }

    if (fetchError) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] p-8 text-center space-y-6">
                <AlertTriangle className="w-16 h-16 text-amber-500 mb-2" />
                <h2 className="text-2xl font-black italic uppercase text-neutral-100">CONFLITO DE DADOS</h2>
                <p className="text-neutral-500 max-w-sm font-mono text-xs opacity-70">ERRO: {fetchError}</p>
                <Link href="/admin/clientes" className="btn-brutal px-10">REINSTALAR CONEXÃO</Link>
            </div>
        )
    }

    if (!client) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] p-8 text-center space-y-6">
                <ShieldAlert className="w-16 h-16 text-red-500 mb-2" />
                <h2 className="text-2xl font-black italic uppercase text-neutral-100">CLIENTE NÃO LOCALIZADO</h2>
                <p className="text-neutral-500 max-w-sm">A identificação <span className="text-white font-mono">{id}</span> não foi encontrada.</p>
                <Link href="/admin/clientes" className="btn-brutal px-10">VOLTAR À BASE</Link>
            </div>
        )
    }

    return (
        <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
            {/* Header: Ação e Título */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-800 pb-8">
                <div className="space-y-4">
                    <Link href="/admin/clientes" className="inline-flex items-center gap-2 text-neutral-500 hover:text-amber-electric transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-mono text-[10px] font-black uppercase tracking-widest">Lista Geral</span>
                    </Link>
                    <h1 className="text-4xl font-black text-neutral-100 italic tracking-tighter uppercase leading-none">
                        {client.razao_social || client.nome}
                    </h1>
                    <div className="flex items-center gap-4 text-neutral-500 font-mono text-[11px] uppercase tracking-wider">
                        <span className="bg-neutral-900 border border-neutral-800 px-3 py-1 text-neutral-300">CNPJ: {client.cnpj_cpf}</span>
                        <span className="opacity-50">REGIME: {client.regime_tributario || 'N/A'}</span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="btn-brutal text-xs px-8">EDITAR PERFIL</button>
                    <button className="btn-brutal-outline text-xs px-8">ABRIR DRIVE</button>
                </div>
            </div>

            {/* Grid de Informações Brutalistas */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Coluna 1: Dados Vitais */}
                <div className="brutalist-card space-y-8">
                    <div className="pb-4 border-b border-neutral-800">
                        <h2 className="font-black italic text-amber-electric tracking-widest uppercase">DADOS VITAIS</h2>
                    </div>
                    <div className="space-y-6">
                        <div className="group">
                            <label className="text-[10px] font-black text-neutral-600 uppercase mb-2 block">Canais de Contato</label>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-neutral-300">
                                    <Mail className="w-4 h-4 text-amber-electric" />
                                    <span className="text-sm font-bold">{client.email || 'E-MAIL NÃO CADASTRADO'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-neutral-300">
                                    <Phone className="w-4 h-4 text-amber-electric" />
                                    <span className="text-sm font-bold">{client.telefone_whatsapp || 'WHATSAPP NÃO INFORMADO'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="group">
                            <label className="text-[10px] font-black text-neutral-600 uppercase mb-2 block">Localização Fiscal</label>
                            <div className="flex items-center gap-3 text-neutral-300">
                                <MapPin className="w-4 h-4 text-amber-electric" />
                                <span className="text-sm font-bold">{client.cidade || 'SIDROLÂNDIA'} - {client.estado || 'MS'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coluna 2: Status Contábil */}
                <div className="lg:col-span-2 brutalist-card relative overflow-hidden group">
                    <div className="pb-4 border-b border-neutral-800 flex items-center justify-between">
                        <h2 className="font-black italic text-amber-electric tracking-widest uppercase">HISTÓRICO & PERFORMANCE</h2>
                        <Clock className="w-5 h-5 text-neutral-700" />
                    </div>
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                        <Calendar className="w-12 h-12 text-neutral-800 mb-2" />
                        <p className="text-neutral-500 font-bold uppercase text-xs tracking-[0.2em]">Sem atividades registradas recentemente</p>
                        <p className="text-neutral-700 text-[10px] max-w-xs">O monitoramento de obrigações fiscais aparecerá neste quadrante após o próximo fechamento mensal.</p>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <FileCheck className="w-48 h-48" />
                    </div>
                </div>
            </div>
        </div>
    )
}
