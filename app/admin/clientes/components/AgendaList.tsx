'use client'

import React, { useState } from 'react'
import { Clock, CheckCircle2, AlertTriangle, Trash2, Edit2, Filter, Zap, Target, History, MoreHorizontal } from 'lucide-react'
import { TarefaSoberana } from './AgendaCalendar'

interface AgendaListProps {
    agendamentos: TarefaSoberana[]
    onMarcarConcluido: (id: string) => void
    onEditar: (agendamento: TarefaSoberana) => void
    onExcluir: (id: string) => void
}

/**
 * AgendaList - Masterpiece Component
 * Lista de operações sincronizada com o workflow.tarefas.
 */
export default function AgendaList({ agendamentos, onMarcarConcluido, onEditar, onExcluir }: AgendaListProps) {
    const [filtroStatus, setFiltroStatus] = useState<string>('todos')

    const agendamentosFiltrados = agendamentos.filter(ag => {
        const normStatus = ag.status?.toUpperCase()
        if (filtroStatus !== 'todos' && normStatus !== filtroStatus) return false
        return true
    })

    const agendamentosOrdenados = [...agendamentosFiltrados].sort((a, b) => {
        return new Date(a.data_limite).getTime() - new Date(b.data_limite).getTime()
    })

    const getDiasRestantes = (dataVenc: string): number => {
        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)
        const venc = new Date(dataVenc)
        return Math.ceil((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    }

    const getStatusInfo = (status: string, dias: number) => {
        const s = status?.toUpperCase()
        if (s === 'CONCLUIDA' || s === 'CONCLUIDO') {
            return { color: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20', icon: CheckCircle2, label: 'MISSÃO CUMPRIDA' }
        }
        if (s === 'ATRASADA' || s === 'ATRASADO' || (s === 'PENDENTE' && dias < 0)) {
            return { color: 'text-red-500 bg-red-500/5 border-red-500/20', icon: AlertTriangle, label: 'VIOLAÇÃO DE PRAZO' }
        }
        if (dias >= 0 && dias <= 3) {
            return { color: 'text-amber-500 bg-amber-500/5 border-amber-500/20', icon: Zap, label: 'ALTA PRIORIDADE' }
        }
        return { color: 'text-neutral-500 bg-neutral-900/50 border-neutral-800', icon: Target, label: 'AGENDADO' }
    }

    return (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom duration-1000">
            {/* Maestro Operational Header */}
            <div className="bg-black border border-neutral-900 p-10 rounded-[3rem] flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group/header">
                <div className="absolute -top-10 -right-10 opacity-[0.02] group-hover:scale-110 transition-transform duration-1000">
                    <History className="w-64 h-64 text-white" />
                </div>

                <div className="relative z-10">
                    <h3 className="text-white font-black text-sm uppercase tracking-[0.4em] italic mb-3">Fluxo de Operações Soberanas</h3>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <p className="text-[10px] text-neutral-600 uppercase font-black tracking-widest">Protocolo workflow.tarefas: Ativo e Sincronizado</p>
                    </div>
                </div>

                <div className="flex items-center gap-5 bg-neutral-950 border border-neutral-900 p-5 rounded-2xl relative z-10 shadow-2xl">
                    <Filter className="w-4 h-4 text-neutral-500" />
                    <select
                        aria-label="Filtrar status da operação"
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                        className="bg-transparent text-[11px] text-white font-black uppercase outline-none min-w-[180px] cursor-pointer"
                    >
                        <option value="todos">FILTRAR: TODOS</option>
                        <option value="PENDENTE">STATUS: PENDENTE</option>
                        <option value="ATRASADA">STATUS: ATRASADA</option>
                        <option value="CONCLUIDA">STATUS: CONCLUÍDA</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {agendamentosOrdenados.length === 0 ? (
                    <div className="p-32 bg-neutral-950/50 border border-dashed border-neutral-900 text-center rounded-[4rem]">
                        <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6 opacity-20">
                            <MoreHorizontal className="text-white w-10 h-10" />
                        </div>
                        <p className="text-[12px] font-black text-neutral-700 uppercase italic tracking-[0.3em]">Operação Nominal: Sem pendências no buffer</p>
                    </div>
                ) : (
                    agendamentosOrdenados.map((ag) => {
                        const dias = getDiasRestantes(ag.data_limite)
                        const info = getStatusInfo(ag.status, dias)
                        const Icon = info.icon

                        return (
                            <div key={ag.id} className="group bg-neutral-950 border border-neutral-900 rounded-[3rem] p-1.5 hover:border-emerald-500/20 transition-all duration-700">
                                <div className="p-10 bg-black rounded-[2.8rem] flex flex-col xl:flex-row xl:items-center justify-between gap-10">
                                    <div className="flex items-center gap-10 flex-1">
                                        {/* Status Badge Industrial */}
                                        <div className={`w-24 h-24 rounded-[2rem] border ${info.color} flex flex-col items-center justify-center gap-1.5 group-hover:scale-105 transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.4)]`}>
                                            <Icon className="w-9 h-9" />
                                            <span className="text-[8px] font-black uppercase opacity-40">SOB</span>
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            <div className="flex flex-wrap items-center gap-4">
                                                <h4 className="text-2xl text-white font-black uppercase italic tracking-tighter group-hover:text-emerald-400 transition-colors duration-500">
                                                    {ag.descricao}
                                                </h4>
                                                <div className="h-1.5 w-1.5 rounded-full bg-neutral-800"></div>
                                                <span className="text-[10px] bg-neutral-900/50 border border-neutral-800 px-5 py-1.5 rounded-full font-black text-neutral-500 uppercase tracking-[0.2em] group-hover:border-neutral-700 transition-all">
                                                    {ag.titulo}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-8">
                                                <div className="flex items-center gap-3">
                                                    <Clock size={16} className="text-neutral-800" />
                                                    <span className="text-[12px] font-black text-neutral-500 uppercase tracking-tighter">
                                                        LIMITE: <span className="text-white">{new Date(ag.data_limite).toLocaleDateString('pt-BR')}</span>
                                                    </span>
                                                </div>
                                                {ag.status !== 'CONCLUIDA' && (
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2.5 h-2.5 rounded-full ${dias < 0 ? 'bg-red-500 animate-ping' : dias <= 3 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                                                        <span className={`text-[12px] font-black uppercase tracking-tighter ${dias < 0 ? 'text-red-500' : 'text-neutral-500'}`}>
                                                            {dias < 0 ? `${Math.abs(dias)} DIAS DE VIOLAÇÃO` : dias === 0 ? 'VENCE HOJE' : `${dias} DIAS RESTANTES`}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions Panel */}
                                    <div className="flex items-center gap-4 self-end xl:self-center">
                                        {ag.status === 'PENDENTE' && (
                                            <button
                                                onClick={() => onMarcarConcluido(ag.id)}
                                                className="h-16 px-10 bg-white text-black text-[11px] font-black uppercase italic rounded-2xl hover:bg-emerald-500 transition-all border-b-[6px] border-neutral-300 hover:border-emerald-600 active:translate-y-1 active:border-b-0 shadow-2xl"
                                            >
                                                AUTORIZAR FINALIZAÇÃO
                                            </button>
                                        )}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => onEditar(ag)}
                                                className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center text-neutral-600 hover:text-white hover:border-blue-500 transition-all active:scale-90"
                                                title="Editar Parâmetros"
                                            >
                                                <Edit2 size={22} />
                                            </button>
                                            <button
                                                onClick={() => onExcluir(ag.id)}
                                                className="w-16 h-16 bg-neutral-900/30 border border-neutral-800 rounded-2xl flex items-center justify-center text-neutral-800 hover:text-red-500 hover:bg-red-500/5 hover:border-red-500/30 transition-all active:scale-90"
                                                title="Eliminar Registro"
                                            >
                                                <Trash2 size={22} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <div className="mt-20 flex justify-center opacity-30">
                <p className="text-[10px] font-black text-neutral-800 uppercase tracking-[0.5em] italic">Brando Sovereign Operational Protocol v2.0</p>
            </div>
        </div>
    )
}
