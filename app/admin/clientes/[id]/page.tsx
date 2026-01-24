'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Phone, Mail, MapPin, Calendar, Clock, ArrowLeft } from 'lucide-react'
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
        return <div className="p-8 flex items-center justify-center min-h-screen">Carregando dados...</div>
    }

    if (!client) {
        return <div className="p-8 text-center min-h-screen">Cliente não encontrado.</div>
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">
            <div className="flex items-center space-x-4">
                <Link href="/admin/clientes">
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para lista
                    </Button>
                </Link>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">{client.razao_social || client.nome}</h2>
                    <p className="text-slate-500">ID: {id}</p>
                </div>
                <div className="flex space-x-3">
                    <Button className="bg-slate-900 text-white">Editar Perfil</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="col-span-1 border-none shadow-sm bg-white">
                    <CardHeader className="border-b border-slate-100 flex flex-row items-center space-x-2">
                        <User className="h-5 w-5 text-slate-400" />
                        <CardTitle className="text-lg">Informações Pessoais</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 mr-3 text-slate-400" />
                            <span className="text-slate-600">{client.email || 'Não informado'}</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-3 text-slate-400" />
                            <span className="text-slate-600">{client.telefone || 'Não informado'}</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-3 text-slate-400" />
                            <span className="text-slate-600">{client.cidade || 'Localização não cadastrada'}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-2 border-none shadow-sm bg-white">
                    <CardHeader className="border-b border-slate-100 flex flex-row items-center space-x-2">
                        <Clock className="h-5 w-5 text-slate-400" />
                        <CardTitle className="text-lg">Atividades Recentes</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="text-sm text-slate-500 italic">Sem atividades registradas recentemente.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
