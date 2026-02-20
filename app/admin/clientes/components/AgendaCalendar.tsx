'use client'

import React, { useState } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Activity, Cpu } from 'lucide-react'

// Interface Sincronizada com o Sovereign Backend (workflow.tarefas)
export interface TarefaSoberana {
    id: string
    empresa_id?: string
    titulo: string
    descricao: string
    data_limite: string
    status: 'PENDENTE' | 'CONCLUIDA' | 'ATRASADA' | 'CANCELADA' | string
    prioridade?: number
}

interface AgendaCalendarProps {
    agendamentos: TarefaSoberana[]
    onDayClick?: (date: Date, tarefas: TarefaSoberana[]) => void
}

/**
 * AgendaCalendar - Masterpiece Component
 * Design Brutalista Industrial para Gestão de Operações Soberanas.
 */
export default function AgendaCalendar({ agendamentos, onDayClick }: AgendaCalendarProps) {
    const [currentDate, setCurrentDate] = useState<Date>(new Date())

    const meses = [
        "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
        "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
    ]

    const mesAnterior = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    const proximoMes = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

    const gerarDias = () => {
        const ano = currentDate.getFullYear()
        const mes = currentDate.getMonth()
        const primeiroDia = new Date(ano, mes, 1).getDay()
        const ultimoDia = new Date(ano, mes + 1, 0).getDate()

        const dias: (Date | null)[] = []
        for (let i = 0; i < primeiroDia; i++) dias.push(null)
        for (let d = 1; d <= ultimoDia; d++) dias.push(new Date(ano, mes, d))
        return dias
    }

    const getTarefasDoDia = (date: Date | null): TarefaSoberana[] => {
        if (!date) return []
        const dateStr = date.toISOString().split('T')[0]
        return agendamentos.filter(a => (a.data_limite || '').startsWith(dateStr))
    }

    const getStatusColor = (status: string): string => {
        const s = status?.toUpperCase()
        if (s === 'CONCLUIDA' || s === 'CONCLUIDO') return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
        if (s === 'ATRASADA' || s === 'ATRASADO') return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
        if (s === 'CANCELADA' || s === 'CANCELADO') return 'bg-neutral-700'
        return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
    }

    const dias = gerarDias()
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    return (
        <div className="bg-black border border-neutral-900 rounded-[2rem] p-8 relative overflow-hidden group/chart select-none">
            {/* Grid de Fundo Abstracto - UI Industrial */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center shadow-2xl group-hover/chart:border-emerald-500/30 transition-all duration-700">
                        <CalendarIcon className="w-7 h-7 text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-white font-black text-3xl uppercase italic tracking-tighter leading-none mb-1">
                            {meses[currentDate.getMonth()]} <span className="text-neutral-700 not-italic">{currentDate.getFullYear()}</span>
                        </h2>
                        <div className="flex items-center gap-2">
                            <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">Protocolo workflow.tarefas active</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 bg-neutral-900/40 p-1.5 rounded-2xl border border-neutral-800 backdrop-blur-sm">
                    <button
                        onClick={mesAnterior}
                        className="w-11 h-11 flex items-center justify-center hover:bg-white hover:text-black transition-all rounded-xl text-neutral-500 active:scale-90"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={proximoMes}
                        className="w-11 h-11 flex items-center justify-center hover:bg-white hover:text-black transition-all rounded-xl text-neutral-500 active:scale-90"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-4">
                {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map(d => (
                    <div key={d} className="text-center text-[10px] font-black text-neutral-700 uppercase tracking-widest pb-6">
                        {d}
                    </div>
                ))}

                {dias.map((dia, index) => {
                    if (!dia) return <div key={`empty-${index}`} className="aspect-square opacity-5" />

                    const tarefas = getTarefasDoDia(dia)
                    const isHoje = dia.toISOString().split('T')[0] === hoje.toISOString().split('T')[0]
                    const temTarefas = tarefas.length > 0

                    return (
                        <div
                            key={index}
                            onClick={() => onDayClick?.(dia, tarefas)}
                            className={`
                                aspect-square p-3 border transition-all duration-500 relative group/day rounded-2xl
                                ${isHoje ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-neutral-950 border-neutral-900'}
                                ${temTarefas ? 'hover:border-emerald-500 cursor-pointer shadow-none hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'hover:border-neutral-700'}
                            `}
                        >
                            <div className="flex flex-col items-center justify-between h-full">
                                <span className={`text-xs font-black ${isHoje ? 'text-emerald-500' : 'text-neutral-500'} group-hover/day:text-white transition-colors`}>
                                    {dia.getDate()}
                                </span>
                                <div className="flex gap-1 justify-center flex-wrap max-w-full">
                                    {tarefas.slice(0, 4).map((t, idx) => (
                                        <div key={idx} className={`w-1.5 h-1.5 rounded-full ${getStatusColor(t.status)}`} />
                                    ))}
                                </div>
                            </div>

                            {/* Tooltip Detalhado Industrial */}
                            {temTarefas && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 pointer-events-none opacity-0 group-hover/day:opacity-100 transition-all duration-300 z-[100] min-w-[220px]">
                                    <div className="bg-black border border-neutral-800 p-5 shadow-3xl backdrop-blur-2xl rounded-2xl">
                                        <div className="flex items-center gap-3 mb-4 border-b border-neutral-900 pb-3">
                                            <Cpu className="w-4 h-4 text-emerald-500" />
                                            <span className="text-[10px] font-black text-white uppercase italic tracking-widest">Buffer Operacional</span>
                                        </div>
                                        <div className="space-y-3">
                                            {tarefas.map((t, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full shrink-0 ${getStatusColor(t.status)}`} />
                                                    <p className="text-[9px] text-neutral-400 font-mono truncate uppercase font-bold">{t.descricao}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-4 h-4 bg-black border-r border-b border-neutral-800 rotate-45 mx-auto -mt-2"></div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <div className="flex items-center justify-between mt-12 pt-8 border-t border-neutral-900">
                <div className="flex gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981]" />
                        <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em]">Sincronizado</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_12px_#f59e0b]" />
                        <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em]">Pendente</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444]" />
                        <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em]">Atrasado</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-neutral-700 uppercase tracking-[0.3em] italic">Brando Matrix v2.0</span>
                </div>
            </div>
        </div>
    )
}
