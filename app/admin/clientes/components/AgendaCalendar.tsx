'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, AlertTriangle } from 'lucide-react'

interface Agendamento {
    id: string
    tipo_pendencia: string
    subtipo?: string
    descricao: string
    data_vencimento: string
    status: 'pendente' | 'concluido' | 'atrasado' | 'cancelado'
}

interface AgendaCalendarProps {
    agendamentos: Agendamento[]
    onDayClick?: (date: Date, agendamentos: Agendamento[]) => void
}

export default function AgendaCalendar({ agendamentos, onDayClick }: AgendaCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())

    // Navegação de meses
    const mesAnterior = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const proximoMes = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    // Gerar dias do calendário
    const gerarDiasCalendario = () => {
        const ano = currentDate.getFullYear()
        const mes = currentDate.getMonth()
        const primeiroDia = new Date(ano, mes, 1)
        const ultimoDia = new Date(ano, mes + 1, 0)

        const diasMesAnterior = primeiroDia.getDay() // 0 = domingo
        const totalDias = ultimoDia.getDate()

        const dias: (Date | null)[] = []

        // Dias do mês anterior (vazios)
        for (let i = 0; i < diasMesAnterior; i++) {
            dias.push(null)
        }

        // Dias do mês atual
        for (let dia = 1; dia <= totalDias; dia++) {
            dias.push(new Date(ano, mes, dia))
        }

        return dias
    }

    // Buscar agendamentos de um dia específico
    const getAgendamentosDoDia = (date: Date | null) => {
        if (!date) return []
        const dateStr = date.toISOString().split('T')[0]
        return agendamentos.filter(a => a.data_vencimento === dateStr)
    }

    // Determinar cor do badge por status
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'atrasado': return 'bg-red-500'
            case 'concluido': return 'bg-emerald-500'
            case 'pendente': return 'bg-amber-500'
            default: return 'bg-neutral-600'
        }
    }

    const dias = gerarDiasCalendario()
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    return (
        <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-6 space-y-6">
            {/* Header do Calendário */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                        <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-white font-black text-sm uppercase italic">
                            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
                        </h3>
                        <p className="text-[9px] font-mono text-neutral-600 uppercase">
                            {agendamentos.filter(a => a.status === 'pendente').length} pendências ativas
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={mesAnterior}
                        className="p-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded transition-all"
                    >
                        <ChevronLeft className="w-4 h-4 text-neutral-400" />
                    </button>
                    <button
                        onClick={proximoMes}
                        className="p-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded transition-all"
                    >
                        <ChevronRight className="w-4 h-4 text-neutral-400" />
                    </button>
                </div>
            </div>

            {/* Grid do Calendário */}
            <div className="grid grid-cols-7 gap-2">
                {/* Cabeçalho dos dias da semana */}
                {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map(dia => (
                    <div key={dia} className="text-center text-[9px] font-black text-neutral-600 uppercase py-2">
                        {dia}
                    </div>
                ))}

                {/* Dias do mês */}
                {dias.map((dia, index) => {
                    if (!dia) {
                        return <div key={`empty-${index}`} className="aspect-square" />
                    }

                    const agendamentosDoDia = getAgendamentosDoDia(dia)
                    const isHoje = dia.toISOString().split('T')[0] === hoje.toISOString().split('T')[0]
                    const temPendencias = agendamentosDoDia.length > 0

                    return (
                        <button
                            key={index}
                            onClick={() => onDayClick?.(dia, agendamentosDoDia)}
                            className={`
                                aspect-square p-2 rounded-xl transition-all relative group
                                ${isHoje ? 'bg-emerald-500/10 border-2 border-emerald-500/30' : 'bg-black border border-neutral-800'}
                                ${temPendencias ? 'hover:border-emerald-500 cursor-pointer' : 'hover:border-neutral-700'}
                            `}
                        >
                            <div className="flex flex-col items-center justify-between h-full">
                                <span className={`text-xs font-black ${isHoje ? 'text-emerald-500' : 'text-neutral-400'} group-hover:text-white transition-colors`}>
                                    {dia.getDate()}
                                </span>

                                {temPendencias && (
                                    <div className="flex gap-1 flex-wrap justify-center">
                                        {agendamentosDoDia.slice(0, 3).map((ag, i) => (
                                            <div
                                                key={i}
                                                className={`w-1.5 h-1.5 rounded-full ${getStatusColor(ag.status)}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Tooltip ao hover */}
                            {temPendencias && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-max max-w-xs">
                                    <div className="bg-black border border-neutral-800 rounded-lg p-3 space-y-1">
                                        {agendamentosDoDia.map((ag, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${getStatusColor(ag.status)}`} />
                                                <span className="text-[9px] text-neutral-400 font-mono">
                                                    {ag.descricao.substring(0, 30)}...
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Legenda */}
            <div className="flex items-center gap-4 pt-4 border-t border-neutral-800">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-[9px] text-neutral-500 uppercase font-bold">Concluído</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-[9px] text-neutral-500 uppercase font-bold">Pendente</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-[9px] text-neutral-500 uppercase font-bold">Atrasado</span>
                </div>
            </div>
        </div>
    )
}
