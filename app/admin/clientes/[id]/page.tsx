'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Phone, Mail, MapPin, Clock, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface ClientPageProps {
    params: Promise<{ id: string }>
}

export default function ClientDetailsPage({ params }: ClientPageProps) {
    const { id } = use(params)
    const [client, setClient] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function getClient() {
            const { data, error } = await supabase
                .from('clientes')
                .select('*')
                .eq('id', id)
                .single()

            if (data) setClient(data)
            setLoading(false)
        }
        getClient()
    }, [id, supabase])

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        )
    }

    if (!client) {
        return (
            <div className="p-8 text-center text-neutral-400">
                <p>Cliente não encontrado.</p>
                <Link href="/admin/clientes" className="text-primary-500 hover:underline mt-4 inline-block">
                    Voltar para lista
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header com Botão Voltar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/clientes" className="p-2 hover:bg-neutral-800 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-neutral-400" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-100 italic">{client.razao_social || client.nome}</h1>
                        <p className="text-neutral-500 text-sm font-mono mt-1">ID: {id}</p>
                    </div>
                </div>
                <button className="btn-brutal">Editar Perfil</button>
            </div>

            {/* Grid de Informações */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Card Dados Cadastrais */}
                <div className="brutalist-card">
                    <div className="flex items-center gap-2 mb-6 border-b border-neutral-800 pb-4">
                        <User className="w-5 h-5 text-primary-500" />
                        <h2 className="text-lg font-bold text-neutral-200">Dados Cadastrais</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-neutral-400">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">{client.email || 'E-mail não informado'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-neutral-400">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">{client.telefone_whatsapp || 'WhatsApp não informado'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-neutral-400">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{client.cidade || 'Sidrolândia - MS'}</span>
                        </div>
                    </div>
                </div>

                {/* Card Atividades */}
                <div className="md:col-span-2 brutalist-card">
                    <div className="flex items-center gap-2 mb-6 border-b border-neutral-800 pb-4">
                        <Clock className="w-5 h-5 text-primary-500" />
                        <h2 className="text-lg font-bold text-neutral-200">Atividades e Histórico</h2>
                    </div>
                    <div className="flex items-center justify-center py-12">
                        <p className="text-neutral-500 italic text-sm text-center">
                            Nenhuma atividade recente registrada no sistema CRM para este cliente.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
