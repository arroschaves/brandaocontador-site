'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Users, Plus, Search, Filter, Briefcase,
    Calendar, Clock, CheckCircle2, AlertTriangle,
    ChevronRight, ArrowRight, FileText, UserPlus, FileMinus
} from 'lucide-react'
import Link from 'next/link'

interface EventoDP {
    id: string
    empresa_id: string
    template_id: string
    funcionario_nome: string
    funcionario_cpf: string
    data_evento: string
    data_limite: string
    status: string
    created_at: string
    empresa?: { razao_social: string; nome_fantasia: string }
    template?: { nome: string; departamento: string }
}

export const dynamic = 'force-dynamic';

export default function DepartamentoPessoalPage() {
    const supabase = createClient()
    const [eventos, setEventos] = useState<EventoDP[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')

    const fetchEventos = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .schema('dp')
            .from('eventos')
            .select(`
                *,
                template:eventos_templates(nome, departamento)
            `)
            .order('data_limite', { ascending: true })

        if (error) {
            console.error('Erro ao buscar eventos de DP:', error)
        } else {
            setEventos(data || [])
        }
        setLoading(false)
    }, [supabase])

    useEffect(() => {
        fetchEventos()
    }, [fetchEventos])

    const getStatusStyle = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'CONCLUIDO': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            case 'PENDENTE': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            case 'ATRASADO': return 'bg-red-500/10 text-red-500 border-red-500/20'
            case 'RASCUNHO': return 'bg-neutral-800 text-neutral-400 border-neutral-700'
            default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        }
    }

    const getEventIcon = (nome: string) => {
        if (!nome) return <FileText className="w-5 h-5" />
        if (nome.toLowerCase().includes('admiss')) return <UserPlus className="w-5 h-5 text-blue-400" />
        if (nome.toLowerCase().includes('rescis')) return <FileMinus className="w-5 h-5 text-red-400" />
        if (nome.toLowerCase().includes('férias') || nome.toLowerCase().includes('ferias')) return <Calendar className="w-5 h-5 text-amber-400" />
        return <Briefcase className="w-5 h-5 text-emerald-400" />
    }

    const filteredEventos = eventos.filter(e => {
        const matchesSearch =
            e.funcionario_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.funcionario_cpf?.includes(searchTerm);
        const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
        return matchesSearch && matchesStatus;
    })

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-black border border-neutral-800 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-14 h-14 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center shadow-inner">
                        <Users className="w-7 h-7 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Hub Departamento Pessoal</h1>
                        <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">
                            Gestão de Admissões, Rescisões e Férias
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/25">
                        <Plus className="w-4 h-4" /> Novo Evento DP
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Eventos Ativos', value: eventos.length, color: 'text-white' },
                    { label: 'Pendentes Hoje', value: eventos.filter(e => e.status === 'PENDENTE').length, color: 'text-amber-500' },
                    { label: 'Atrasados', value: eventos.filter(e => e.status === 'ATRASADO').length, color: 'text-red-500' },
                    { label: 'Concluídos (Mês)', value: eventos.filter(e => e.status === 'CONCLUIDO').length, color: 'text-emerald-500' }
                ].map((stat, i) => (
                    <div key={i} className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-2xl">
                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{stat.label}</p>
                        <p className={`text-3xl font-black mt-2 ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Buscar funcionário, CPF ou Cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black border border-neutral-800 text-xs text-white uppercase pl-10 pr-4 py-3 rounded-xl focus:border-blue-500 transition-colors outline-none placeholder:normal-case"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                    {['ALL', 'PENDENTE', 'CONCLUIDO', 'ATRASADO', 'PROCESSANDO'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase whitespace-nowrap border transition-all ${statusFilter === status ? 'bg-white text-black border-white' : 'bg-black text-neutral-500 border-neutral-800 hover:border-neutral-600'}`}
                        >
                            {status === 'ALL' ? 'Todos' : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Event List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 h-48 animate-pulse"></div>
                    ))}
                </div>
            ) : filteredEventos.length === 0 ? (
                <div className="bg-black border border-neutral-800 rounded-2xl p-16 flex flex-col items-center text-center">
                    <Briefcase className="w-12 h-12 text-neutral-800 mb-4" />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Nenhum evento encontrado</h3>
                    <p className="text-[10px] text-neutral-500 uppercase mt-2 max-w-sm">Crie resciões, admissões ou cadastre férias para iniciar a gestão do Departamento Pessoal.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEventos.map(evento => (
                        <Link href={`#`} key={evento.id} className="group relative bg-black border border-neutral-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] block overflow-hidden">
                            {/* Status Indicator Line */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${evento.status === 'PENDENTE' ? 'bg-amber-500' : evento.status === 'CONCLUIDO' ? 'bg-emerald-500' : evento.status === 'ATRASADO' ? 'bg-red-500' : 'bg-blue-500'}`}></div>

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center">
                                        {getEventIcon(evento.template?.nome || '')}
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{evento.template?.nome || 'Evento DP'}</p>
                                        <h3 className="text-white font-bold uppercase truncate max-w-[150px]">{evento.funcionario_nome}</h3>
                                    </div>
                                </div>
                                <span className={`text-[8px] font-black uppercase px-2 py-1 border rounded ${getStatusStyle(evento.status)}`}>
                                    {evento.status}
                                </span>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-medium">
                                    <Briefcase className="w-3.5 h-3.5 text-neutral-600" />
                                    <span className="truncate">{evento.empresa_id ? `Cod Empresa: ${evento.empresa_id.split('-')[0]}` : 'Empresa Desconhecida'}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-neutral-400 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-neutral-600" />
                                        <span>Evento: {new Date(evento.data_evento).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </div>
                                {evento.data_limite && (
                                    <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-medium bg-neutral-900/50 p-1.5 rounded border border-neutral-800">
                                        <AlertTriangle className={`w-3.5 h-3.5 ${new Date(evento.data_limite) < new Date() && evento.status !== 'CONCLUIDO' ? 'text-red-500' : 'text-neutral-500'}`} />
                                        <span className={new Date(evento.data_limite) < new Date() && evento.status !== 'CONCLUIDO' ? 'text-red-400' : ''}>
                                            Prazo Legal: {new Date(evento.data_limite).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-neutral-900 group-hover:border-neutral-800 transition-colors">
                                <span className="text-[9px] font-mono text-neutral-600">ID: {evento.id.substring(0, 8)}</span>
                                <div className="text-blue-500 text-[10px] font-black uppercase flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                                    Detalhes <ArrowRight className="w-3 h-3" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
