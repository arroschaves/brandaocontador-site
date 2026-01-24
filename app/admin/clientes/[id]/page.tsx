'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, Calendar, ArrowLeft, Download, MapPin, Building2, Info, Globe, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ClientDetailsPage({ params }: { params: any }) {
    // Tratamento universal para params (funciona no Next 14, 15 e 16)
    const [id, setId] = useState<string | null>(null)
    const [cliente, setCliente] = useState<any>(null)
    const [obrigacoes, setObrigacoes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('dados')

    useEffect(() => {
        // Resolve o ID idependente de ser Promise ou Objeto
        if (params instanceof Promise) {
            params.then(p => setId(p.id))
        } else if (params && params.id) {
            setId(params.id)
        }
    }, [params])

    useEffect(() => {
        if (id) fetchData()
    }, [id])

    async function fetchData() {
        setLoading(true)
        try {
            // 1. Busca Dados do Cliente
            const { data: clienteData, error: clienteError } = await supabase
                .from('clientes')
                .select('*')
                .eq('id', id)
                .single()

            if (clienteError) throw clienteError
            setCliente(clienteData)

            // 2. Busca Obrigações
            const { data: obgData } = await supabase
                .from('status_obrigacoes')
                .select('*, configuracao_obrigacoes(nome, categoria_pasta)')
                .eq('cliente_id', id)
                .order('ano', { ascending: false })
                .order('mes', { ascending: false })

            if (obgData) setObrigacoes(obgData)
        } catch (err) {
            console.error('Erro ao buscar dados:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-neutral-500 gap-4">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            <p className="font-medium">Carregando perfil do cliente...</p>
        </div>
    )

    if (!cliente) return (
        <div className="p-12 text-center bg-red-500/5 rounded-3xl border border-red-500/20 max-w-2xl mx-auto mt-10">
            <h2 className="text-xl font-bold text-red-500 mb-2">Cliente não encontrado</h2>
            <p className="text-neutral-500 mb-6">Verifique se o ID na URL está correto ou se o cliente existe no banco.</p>
            <Link href="/admin/clientes" className="bg-neutral-800 text-white px-6 py-2 rounded-xl border border-neutral-700 hover:bg-neutral-700 transition-all">Voltar para Lista</Link>
        </div>
    )

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            {/* Header / Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-neutral-900/40 p-6 rounded-[2rem] border border-neutral-800">
                <div className="flex items-center gap-5">
                    <Link href="/admin/clientes">
                        <button className="p-3 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-2xl transition-all border border-neutral-800">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-neutral-100 italic tracking-tight">
                            {cliente.razao_social || cliente.nome}
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-500 mt-2">
                            <span className="font-mono bg-neutral-800 px-2 rounded uppercase tracking-widest text-[10px] py-1 border border-neutral-700 text-neutral-300">{cliente.cnpj_cpf}</span>
                            {cliente.cidade && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary-500" /> {cliente.cidade} - {cliente.estado}</span>}
                        </div>
                    </div>
                </div>

                {cliente.drive_folder_id && (
                    <a
                        href={`https://drive.google.com/drive/folders/${cliente.drive_folder_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-primary-500 text-neutral-950 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.05] transition-all"
                    >
                        <Globe className="w-4 h-4" /> Pasta no Drive
                    </a>
                )}
            </div>

            {/* Navegação por Abas */}
            <div className="bg-black/30 border border-neutral-800 rounded-2xl p-1.5 inline-flex gap-2">
                <button onClick={() => setActiveTab('dados')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'dados' ? 'bg-neutral-800 text-white border border-neutral-700' : 'text-neutral-500 hover:text-neutral-300'}`}>
                    Dados Gerais
                </button>
                <button onClick={() => setActiveTab('obrigacoes')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'obrigacoes' ? 'bg-neutral-800 text-white border border-neutral-700' : 'text-neutral-500 hover:text-neutral-300'}`}>
                    Fiscal & Guia
                </button>
            </div>

            <div className="mt-4">
                {activeTab === 'dados' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-neutral-900/50 border border-neutral-800 rounded-[2rem] p-8">
                                <h2 className="text-xl font-bold text-neutral-100 mb-8 flex items-center gap-3">
                                    <Building2 className="w-5 h-5 text-primary-500" />
                                    Informações Cadastrais
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">Razão Social Oficial</label>
                                        <p className="text-neutral-100 text-lg font-bold">{cliente.razao_social || cliente.nome}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">CNAE Principal</label>
                                        <p className="text-neutral-300 text-sm">{cliente.cnae_principal || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">Natureza Jurídica</label>
                                        <p className="text-neutral-300 text-sm">{cliente.natureza_juridica || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">Data de Abertura</label>
                                        <p className="text-neutral-300 text-sm">{cliente.data_abertura ? new Date(cliente.data_abertura).toLocaleDateString('pt-BR') : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">Regime Tributário</label>
                                        <p className="text-neutral-300 text-sm uppercase">{cliente.regime_tributario || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-neutral-900/40 border border-neutral-800 rounded-[2rem] p-8">
                                <h2 className="text-lg font-bold text-neutral-100 mb-6 flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-primary-500" />
                                    Endereço Fiscal
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">Logradouro / Número</label>
                                        <p className="text-neutral-200 text-sm">{cliente.logradouro || 'N/A'}, {cliente.numero}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">Bairro / CEP</label>
                                        <p className="text-neutral-200 text-sm">{cliente.bairro || 'N/A'} - {cliente.cep}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">Cidade / UF</label>
                                        <p className="text-neutral-200 text-sm">{cliente.cidade || 'Sidrolândia'} / {cliente.estado || 'MS'}</p>
                                    </div>
                                    {cliente.complemento && (
                                        <div>
                                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">Complemento</label>
                                            <p className="text-neutral-200 text-sm">{cliente.complemento}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-neutral-900 border border-neutral-800 rounded-[2rem] p-8">
                                <h3 className="font-black text-neutral-500 text-[10px] uppercase mb-6 tracking-widest">Situação de Débito</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-black/30 rounded-2xl">
                                        <span className="text-xs font-bold text-neutral-400 uppercase">Federal</span>
                                        <span className={`text-[10px] font-black px-2 py-1 rounded ${cliente.situacao_federal === 'REGULAR' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>{cliente.situacao_federal || 'PENDENTE'}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-black/30 rounded-2xl">
                                        <span className="text-xs font-bold text-neutral-400 uppercase">Estadual</span>
                                        <span className={`text-[10px] font-black px-2 py-1 rounded ${cliente.situacao_estadual === 'REGULAR' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>{cliente.situacao_estadual || 'PENDENTE'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'obrigacoes' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {obrigacoes.length === 0 ? (
                            <div className="col-span-full py-20 bg-neutral-900/30 border-2 border-dashed border-neutral-800 rounded-[3rem] flex flex-col items-center justify-center text-neutral-600">
                                <Calendar className="w-12 h-12 mb-4 opacity-10" />
                                <p className="font-black uppercase tracking-widest text-xs">Vazio</p>
                            </div>
                        ) : (
                            obrigacoes.map(item => (
                                <div key={item.id} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 hover:border-primary-500/30 transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="bg-neutral-800 p-3 rounded-2xl group-hover:bg-primary-500 group-hover:text-black transition-all">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-black bg-black/40 px-3 py-1.5 rounded-full text-neutral-400">{item.mes}/{item.ano}</span>
                                    </div>
                                    <h4 className="text-lg font-black text-neutral-100 mb-1">{item.configuracao_obrigacoes?.nome}</h4>
                                    <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest mb-6">{item.configuracao_obrigacoes?.categoria_pasta}</p>
                                    <div className="flex items-center justify-between pt-4 border-t border-neutral-800/50">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${item.status === 'concluido' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span className="text-[10px] font-black uppercase text-neutral-500">{item.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
