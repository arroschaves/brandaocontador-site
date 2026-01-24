'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, Calendar, ArrowLeft, Download, MapPin, Building2, Info, Globe } from 'lucide-react'
import Link from 'next/link'

export default function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrapping params for Next.js 15+
    const paramsResolved = React.use(params)
    const id = paramsResolved.id

    const [cliente, setCliente] = useState<any>(null)
    const [obrigacoes, setObrigacoes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('dados') // Começa nos dados para ver o enriquecimento

    useEffect(() => {
        if (id) fetchData()
    }, [id])

    async function fetchData() {
        setLoading(true)

        // 1. Busca Dados do Cliente
        const { data: clienteData, error: clienteError } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', id)
            .single()

        if (clienteError) {
            console.error('Erro ao buscar cliente:', clienteError)
            setLoading(false)
            return
        }
        setCliente(clienteData)

        // 2. Busca Obrigações / Arquivos vinculados
        const { data: obgData } = await supabase
            .from('status_obrigacoes')
            .select('*, configuracao_obrigacoes(nome, categoria_pasta)')
            .eq('cliente_id', id)
            .order('ano', { ascending: false })
            .order('mes', { ascending: false })

        if (obgData) setObrigacoes(obgData)

        setLoading(false)
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-neutral-500 gap-4">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-medium animate-pulse">Carregando perfil do cliente...</p>
        </div>
    )

    if (!cliente) return (
        <div className="p-12 text-center bg-red-500/5 rounded-3xl border border-red-500/20 max-w-2xl mx-auto mt-10">
            <h2 className="text-xl font-bold text-red-500 mb-2">Cliente não encontrado</h2>
            <p className="text-neutral-500 mb-6">O link pode estar quebrado ou o cliente foi removido.</p>
            <Link href="/admin/clientes" className="btn-primary px-6 py-2 inline-block">Voltar para Lista</Link>
        </div>
    )

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header / Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-neutral-900/40 p-6 rounded-3xl border border-neutral-800">
                <div className="flex items-center gap-5">
                    <Link href="/admin/clientes">
                        <button className="p-3 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-2xl transition-all border border-neutral-800 shadow-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-neutral-100 tracking-tight">
                            {cliente.razao_social || cliente.nome}
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-500 mt-2">
                            <span className="font-mono bg-neutral-800 px-2 rounded uppercase tracking-widest text-[10px] py-1 border border-neutral-700 text-neutral-300">{cliente.cnpj_cpf}</span>
                            {cliente.cidade && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary-500" /> {cliente.cidade} - {cliente.estado}</span>}
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm ${cliente.regime_tributario?.toLowerCase().includes('simples')
                                    ? 'border-green-500/30 text-green-400 bg-green-500/10'
                                    : 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                                }`}>
                                {cliente.regime_tributario?.replace(/_/g, ' ') || 'Regime N/D'}
                            </span>
                        </div>
                    </div>
                </div>

                {cliente.drive_folder_id && (
                    <a
                        href={`https://drive.google.com/drive/folders/${cliente.drive_folder_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-primary-500 text-neutral-950 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/30 hover:scale-[1.05] active:scale-95 transition-all"
                    >
                        <Globe className="w-4 h-4" /> Pasta no Drive
                    </a>
                )}
            </div>

            {/* Navegação por Abas */}
            <div className="bg-black/40 border border-neutral-800 rounded-2xl p-1.5 inline-flex gap-2 sticky top-4 z-50 shadow-2xl backdrop-blur-xl">
                <button onClick={() => setActiveTab('dados')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'dados' ? 'bg-neutral-800 text-white shadow-inner border border-neutral-700' : 'text-neutral-500 hover:text-neutral-300'}`}>
                    <Building2 className="w-4 h-4" /> Dados Gerais
                </button>
                <button onClick={() => setActiveTab('obrigacoes')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'obrigacoes' ? 'bg-neutral-800 text-white shadow-inner border border-neutral-700' : 'text-neutral-500 hover:text-neutral-300'}`}>
                    <Calendar className="w-4 h-4" /> Fiscal & Guia
                </button>
                <button onClick={() => setActiveTab('historial')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'historial' ? 'bg-neutral-800 text-white shadow-inner border border-neutral-700' : 'text-neutral-500 hover:text-neutral-300'}`}>
                    <FileText className="w-4 h-4" /> Notas Fiscais
                </button>
            </div>

            <div className="mt-8">
                {/* ABA DADOS GERAIS - ENRIQUECIDA */}
                {activeTab === 'dados' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cartão de Identificação Principal */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-neutral-900/50 border border-neutral-800 rounded-[2.5rem] p-10 backdrop-blur-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Building2 className="w-32 h-32" />
                                </div>
                                <h2 className="text-xl font-black text-neutral-100 mb-10 flex items-center gap-3 border-l-4 border-primary-500 pl-4">
                                    Informações Estruturais
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] block mb-3">Razão Social Oficial (Enriquecida)</label>
                                        <p className="text-neutral-100 text-xl font-bold leading-tight">{cliente.razao_social || cliente.nome}</p>
                                        {cliente.razao_social && <p className="text-primary-500 text-xs font-bold mt-2 uppercase">Identificado via ReceitaWS</p>}
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] block mb-2">CNAE Principal</label>
                                        <p className="text-neutral-300 text-sm leading-relaxed font-medium">{cliente.cnae_principal || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] block mb-2">Natureza Jurídica</label>
                                        <p className="text-neutral-300 text-sm font-medium">{cliente.natureza_juridica || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] block mb-2">Inscrição Estadual</label>
                                        <p className="text-neutral-300 text-sm font-medium">{cliente.inscricao_estadual || 'Não informada'}</p>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] block mb-2">Data de Abertura</label>
                                        <p className="text-neutral-300 text-sm font-medium">
                                            {cliente.data_abertura ? new Date(cliente.data_abertura).toLocaleDateString('pt-BR') : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Endereço Fiscal */}
                            <div className="bg-neutral-900/30 border border-neutral-800 rounded-[2.5rem] p-10 backdrop-blur-sm">
                                <h2 className="text-xl font-black text-neutral-100 mb-10 flex items-center gap-3 border-l-4 border-primary-500 pl-4">
                                    Endereço e Localização
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] block mb-2">Logradouro / Rua</label>
                                        <p className="text-neutral-200 text-sm font-bold">{cliente.logradouro || 'N/A'}, {cliente.numero}</p>
                                        {cliente.complemento && <p className="text-neutral-500 text-xs mt-1">{cliente.complemento}</p>}
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] block mb-2">Bairro</label>
                                        <p className="text-neutral-200 text-sm font-bold">{cliente.bairro || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] block mb-2">CEP</label>
                                        <p className="text-neutral-200 text-sm font-bold">{cliente.cep || 'N/A'}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] block mb-2">Cidade / UF</label>
                                        <p className="text-neutral-200 text-sm font-bold">{cliente.cidade || 'Sidrolândia'} - {cliente.estado || 'MS'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar de Status e Contato */}
                        <div className="space-y-6">
                            <div className="bg-neutral-900 border border-neutral-800 rounded-[2rem] p-8 shadow-xl">
                                <h3 className="font-black text-neutral-500 text-[10px] uppercase mb-6 tracking-widest">Situação Fiscal</h3>
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-neutral-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${cliente.situacao_federal === 'REGULAR' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
                                            <span className="text-xs font-bold text-neutral-300">Receita Federal</span>
                                        </div>
                                        <span className={`text-[10px] font-black ${cliente.situacao_federal === 'REGULAR' ? 'text-green-500' : 'text-red-500'}`}>{cliente.situacao_federal || 'PENDENTE'}</span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-neutral-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${cliente.situacao_estadual === 'REGULAR' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
                                            <span className="text-xs font-bold text-neutral-300">SEFAZ MS</span>
                                        </div>
                                        <span className={`text-[10px] font-black ${cliente.situacao_estadual === 'REGULAR' ? 'text-green-500' : 'text-red-500'}`}>{cliente.situacao_estadual || 'PENDENTE'}</span>
                                    </div>

                                    <p className="text-[9px] text-neutral-600 text-center font-bold uppercase tracking-tighter">Última checagem: {cliente.data_ultima_consulta_fiscal ? new Date(cliente.data_ultima_consulta_fiscal).toLocaleDateString('pt-BR') : 'Nunca'}</p>
                                </div>
                            </div>

                            <div className="bg-primary-500/10 border border-primary-500/20 rounded-[2rem] p-8">
                                <h3 className="font-black text-primary-500 text-[10px] uppercase mb-4 tracking-widest">Canais de Contato</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[9px] font-bold text-neutral-600 uppercase">Principal WhatsApp</label>
                                        <p className="text-neutral-100 font-bold text-base">{cliente.telefone_whatsapp || 'Sem número'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold text-neutral-600 uppercase">E-mail de Faturamento</label>
                                        <p className="text-neutral-300 text-sm font-medium truncate">{cliente.email || 'Sem e-mail'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ABA FISCAL - OBRIGAÇÕES */}
                {activeTab === 'obrigacoes' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {obrigacoes.length === 0 ? (
                            <div className="col-span-full py-24 bg-neutral-900/40 border-2 border-dashed border-neutral-800 rounded-[3rem] flex flex-col items-center justify-center text-neutral-600">
                                <Calendar className="w-16 h-16 mb-4 opacity-10" />
                                <p className="font-black uppercase tracking-[0.3em] text-xs">Sem Obrigações</p>
                                <p className="text-[10px] mt-4 font-bold text-neutral-700">O robô buscará as guias assim que estiverem disponíveis no Drive.</p>
                            </div>
                        ) : (
                            obrigacoes.map(item => (
                                <div key={item.id} className="bg-neutral-900 border border-neutral-800 rounded-[2rem] p-7 hover:border-primary-500/50 transition-all group relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="bg-neutral-800 p-3 rounded-2xl group-hover:bg-primary-500 group-hover:text-black transition-all">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[11px] font-black bg-black/60 px-3 py-1.5 rounded-full text-neutral-300 shadow-sm">{item.mes}/{item.ano}</span>
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-black text-neutral-100 mb-2">{item.configuracao_obrigacoes?.nome}</h4>
                                    <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest mb-8">{item.configuracao_obrigacoes?.categoria_pasta}</p>

                                    <div className="flex items-center justify-between pt-6 border-t border-neutral-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2.5 h-2.5 rounded-full ${item.status === 'concluido' ? 'bg-green-500' : 'bg-red-500'} shadow-sm`}></div>
                                            <span className="text-[10px] font-black uppercase text-neutral-400 tracking-tighter">{item.status}</span>
                                        </div>
                                        {item.arquivo_drive_id && (
                                            <button className="bg-neutral-800 p-2 rounded-lg text-primary-500 hover:text-white hover:bg-primary-500 transition-all">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        )}
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
