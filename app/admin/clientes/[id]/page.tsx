
'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Calendar, CheckCircle, AlertCircle, ArrowLeft, Download, Search } from 'lucide-react'
import Link from 'next/link'

export default function ClientDetailsPage({ params }: { params: { id: string } }) {
    const [cliente, setCliente] = useState<any>(null)
    const [obrigacoes, setObrigacoes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClientComponentClient()
    const router = useRouter()

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setLoading(true)

        // 1. Busca Dados do Cliente
        const { data: clienteData, error: clienteError } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', params.id)
            .single()

        if (clienteError) {
            console.error('Erro ao buscar cliente:', clienteError)
            return
        }
        setCliente(clienteData)

        // 2. Busca Obrigações / Arquivos vinculados
        const { data: obgData, error: obgError } = await supabase
            .from('obrigacoes_acessorias')
            .select('*')
            .eq('cliente_id', params.id)
            .order('competencia', { ascending: false })

        if (obgData) setObrigacoes(obgData)

        setLoading(false)
    }

    if (loading) return <div className="p-8 text-neutral-400">Carregando pasta do cliente...</div>
    if (!cliente) return <div className="p-8 text-red-500">Cliente não encontrado.</div>

    // Separação por Tipo
    const guias = obrigacoes.filter(o => ['DAS', 'FGTS', 'INSS', 'DARF'].includes(o.tipo))
    const notas = obrigacoes.filter(o => !['DAS', 'FGTS', 'INSS', 'DARF'].includes(o.tipo)) // XMLs e outros

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/clientes">
                    <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-neutral-100">{cliente.nome}</h1>
                    <div className="flex items-center gap-3 text-sm text-neutral-500 mt-1">
                        <span>{cliente.cnpj_cpf}</span>
                        {cliente.inscricao_estadual && <span>• IE: {cliente.inscricao_estadual}</span>}
                        <span className={`px-2 py-0.5 rounded textxs font-medium uppercase border ${cliente.regime_tributario?.includes('Simples')
                                ? 'border-green-500/30 text-green-400 bg-green-500/10'
                                : 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                            }`}>
                            {cliente.regime_tributario || 'Regime N/D'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Navegação por Abas */}
            <Tabs defaultValue="obrigacoes" className="w-full">
                <TabsList className="bg-neutral-900 border border-neutral-800 p-1">
                    <TabsTrigger value="obrigacoes" className="data-[state=active]:bg-neutral-800">
                        <Calendar className="w-4 h-4 mr-2" /> Guias & Impostos
                    </TabsTrigger>
                    <TabsTrigger value="notas" className="data-[state=active]:bg-neutral-800">
                        <FileText className="w-4 h-4 mr-2" /> Notas Fiscais (XML)
                    </TabsTrigger>
                    <TabsTrigger value="dados" className="data-[state=active]:bg-neutral-800">
                        Dados Cadastrais
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    {/* ABA 1: GUIAS */}
                    <TabsContent value="obrigacoes" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {guias.length === 0 && (
                                <div className="col-span-full text-center py-10 text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
                                    Nenhuma guia de imposto encontrada para este cliente.
                                </div>
                            )}
                            {guias.map(guia => (
                                <Card key={guia.id} className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-all">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className={`p-2 rounded-lg ${guia.tipo === 'DAS' ? 'bg-blue-500/10 text-blue-500' :
                                                    guia.tipo === 'FGTS' ? 'bg-orange-500/10 text-orange-500' :
                                                        'bg-purple-500/10 text-purple-500'
                                                }`}>
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-mono text-neutral-500">{guia.competencia}</span>
                                        </div>
                                        <CardTitle className="text-lg mt-3 text-neutral-200">{guia.tipo}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-neutral-400 mb-4 truncate" title={guia.arquivo_url}>
                                            {guia.arquivo_url}
                                        </p>
                                        <Button variant="outline" size="sm" className="w-full border-neutral-700 hover:bg-neutral-800">
                                            <Download className="w-4 h-4 mr-2" /> Baixar Guia
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* ABA 2: NOTAS (Placeholder para futuro XML Viewer) */}
                    <TabsContent value="notas">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 text-center">
                            <h3 className="text-neutral-300 font-bold mb-2">Módulo de Notas Fiscais</h3>
                            <p className="text-neutral-500 mb-4">Aqui aparecerão os XMLs de Entrada e Saída processados.</p>
                            {notas.length > 0 ? (
                                <div className="space-y-2">
                                    {notas.map(n => (
                                        <div key={n.id} className="flex items-center justify-between p-3 bg-neutral-950 rounded border border-neutral-800">
                                            <span className="text-neutral-300 text-sm truncate">{n.arquivo_url}</span>
                                            <span className="text-xs text-neutral-600">{n.competencia}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-neutral-600">Nenhum XML vinculado ainda.</p>
                            )}
                        </div>
                    </TabsContent>

                    {/* ABA 3: DADOS */}
                    <TabsContent value="dados">
                        <Card className="bg-neutral-900 border-neutral-800">
                            <CardHeader><CardTitle>Informações da Receita</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-neutral-500">Razão Social</label>
                                        <p className="text-neutral-200">{cliente.nome}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-neutral-500">CNPJ/CPF</label>
                                        <p className="text-neutral-200">{cliente.cnpj_cpf}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-neutral-500">CNAE Principal</label>
                                        <p className="text-neutral-200">{cliente.cnae_principal || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-neutral-500">Status RFB</label>
                                        <p className="text-neutral-200">{cliente.status_rfb || 'Ativo'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs text-neutral-500">Observações do Sistema</label>
                                        <p className="text-neutral-400 text-sm">{cliente.observacoes || 'Sem observações.'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
        </div>
    )
}
