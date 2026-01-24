'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, Calendar, ArrowLeft, Download } from 'lucide-react'
import Link from 'next/link'

export default function ClientDetailsPage({ params }: { params: { id: string } }) {
    const [cliente, setCliente] = useState<any>(null)
    const [obrigacoes, setObrigacoes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('obrigacoes')

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/clientes">
                    <button className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-neutral-100">{cliente.nome}</h1>
                    <div className="flex items-center gap-3 text-sm text-neutral-500 mt-1">
                        <span>{cliente.cnpj_cpf}</span>
                        {cliente.inscricao_estadual && <span>• IE: {cliente.inscricao_estadual}</span>}
                        <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase border ${cliente.regime_tributario?.toLowerCase().includes('simples')
                            ? 'border-green-500/30 text-green-400 bg-green-500/10'
                            : cliente.regime_tributario?.toLowerCase().includes('presumido') || cliente.regime_tributario?.toLowerCase().includes('real')
                                ? 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                                : 'border-neutral-500/30 text-neutral-400 bg-neutral-500/10'
                            }`}>
                            {cliente.regime_tributario?.replace(/_/g, ' ') || 'Regime N/D'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Navegação por Abas */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-1 inline-flex gap-1">
                <button
                    onClick={() => setActiveTab('obrigacoes')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'obrigacoes'
                        ? 'bg-neutral-800 text-white'
                        : 'text-neutral-400 hover:text-white'
                        }`}
                >
                    <Calendar className="w-4 h-4" /> Guias & Impostos
                </button>
                <button
                    onClick={() => setActiveTab('notas')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'notas'
                        ? 'bg-neutral-800 text-white'
                        : 'text-neutral-400 hover:text-white'
                        }`}
                >
                    <FileText className="w-4 h-4" /> Notas Fiscais (XML)
                </button>
                <button
                    onClick={() => setActiveTab('dados')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dados'
                        ? 'bg-neutral-800 text-white'
                        : 'text-neutral-400 hover:text-white'
                        }`}
                >
                    Dados Cadastrais
                </button>
            </div>

            <div className="mt-6">
                {/* ABA 1: GUIAS */}
                {activeTab === 'obrigacoes' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {guias.length === 0 && (
                            <div className="col-span-full text-center py-10 text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
                                Nenhuma guia de imposto encontrada para este cliente.
                            </div>
                        )}
                        {guias.map(guia => (
                            <div key={guia.id} className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`p-2 rounded-lg ${guia.tipo === 'DAS' ? 'bg-blue-500/10 text-blue-500' :
                                        guia.tipo === 'FGTS' ? 'bg-orange-500/10 text-orange-500' :
                                            'bg-purple-500/10 text-purple-500'
                                        }`}>
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-mono text-neutral-500">{guia.competencia}</span>
                                </div>
                                <h3 className="text-lg font-bold text-neutral-200 mb-2">{guia.tipo}</h3>
                                <p className="text-sm text-neutral-400 mb-4 truncate" title={guia.arquivo_url}>
                                    {guia.arquivo_url}
                                </p>
                                <button className="w-full px-4 py-2 border border-neutral-700 hover:bg-neutral-800 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
                                    <Download className="w-4 h-4" /> Baixar Guia
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* ABA 2: NOTAS */}
                {activeTab === 'notas' && (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 text-center">
                        <h3 className="text-neutral-300 font-bold mb-2">Módulo de Notas Fiscais</h3>
                        <p className="text-neutral-500 mb-4">Aqui aparecerão os XMLs de Entrada e Saída processados.</p>
                        <p className="text-sm text-neutral-600">Em desenvolvimento...</p>
                    </div>
                )}

                {/* ABA 3: DADOS */}
                {activeTab === 'dados' && (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-neutral-200 mb-6 flex justify-between items-center">
                            Informações Cadastrais
                            {cliente.drive_folder_id && (
                                <a
                                    href={`https://drive.google.com/drive/folders/${cliente.drive_folder_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full border border-green-500/20 hover:bg-green-500/20 transition-colors"
                                >
                                    <Download className="w-3 h-3" /> Ver no Google Drive
                                </a>
                            )}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="md:col-span-2 lg:col-span-3">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Razão Social Completa</label>
                                <p className="text-neutral-100 text-lg font-medium">{cliente.razao_social || cliente.nome}</p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">CNPJ / CPF</label>
                                <p className="text-neutral-200 font-mono">{cliente.cnpj_cpf}</p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Status RFB</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${cliente.status_rfb === 'ATIVA' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <p className="text-neutral-200">{cliente.status_rfb || 'ATIVO'}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Natureza Jurídica</label>
                                <p className="text-neutral-200">{cliente.natureza_juridica || 'N/D'}</p>
                            </div>

                            <div className="lg:col-span-2">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">CNAE Principal</label>
                                <p className="text-neutral-200 text-sm">{cliente.cnae_principal || 'N/D'}</p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Data de Abertura</label>
                                <p className="text-neutral-200">
                                    {cliente.data_abertura ? new Date(cliente.data_abertura).toLocaleDateString('pt-BR') : 'N/D'}
                                </p>
                            </div>

                            <div className="md:col-span-2 lg:col-span-3 pt-4 border-t border-neutral-800">
                                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4">Endereço Fiscal</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="lg:col-span-2">
                                        <label className="text-xs font-bold text-neutral-500 uppercase">Logradouro / Rua</label>
                                        <p className="text-neutral-200">{cliente.logradouro || 'N/D'}, {cliente.numero}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-neutral-500 uppercase">Bairro</label>
                                        <p className="text-neutral-200">{cliente.bairro || 'N/D'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-neutral-500 uppercase">CEP</label>
                                        <p className="text-neutral-200">{cliente.cep || 'N/D'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-neutral-500 uppercase">Cidade / UF</label>
                                        <p className="text-neutral-200">{cliente.cidade || 'Sidrolândia'} - {cliente.estado || 'MS'}</p>
                                    </div>
                                    {cliente.complemento && (
                                        <div className="lg:col-span-4">
                                            <label className="text-xs font-bold text-neutral-500 uppercase">Complemento</label>
                                            <p className="text-neutral-200">{cliente.complemento}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
