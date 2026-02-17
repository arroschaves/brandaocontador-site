'use client'

import { useState } from 'react'
import { Clock, CheckCircle2, AlertTriangle, Trash2, Edit2, Filter } from 'lucide-react'

interface Agendamento {
    id: string
    titulo: string // Novo: workflow.tarefas
    tipo_pendencia?: string // Legado: agendamentos_pendencias
    subtipo?: string
    descricao: string
    data_limite: string // Novo: workflow.tarefas
    data_vencimento?: string // Legado: agendamentos_pendencias
    status: 'PENDENTE' | 'CONCLUIDA' | 'ATRASADA' | 'CANCELADA' | 'pendente' | 'concluido' | 'atrasado' | 'cancelado'
    alertas_config?: any
    metadata?: any
}

interface AgendaListProps {
    agendamentos: Agendamento[]
    onMarcarConcluido: (id: string) => void
    onEditar: (agendamento: Agendamento) => void
    onExcluir: (id: string) => void
}

export default function AgendaList({ agendamentos, onMarcarConcluido, onEditar, onExcluir }: AgendaListProps) {
    const [filtroStatus, setFiltroStatus] = useState<string>('todos')
    const [filtroTipo, setFiltroTipo] = useState<string>('todos')

    // Filtrar agendamentos
    const agendamentosFiltrados = agendamentos.filter(ag => {
        const normStatus = ag.status?.toLowerCase()
        if (filtroStatus !== 'todos' && normStatus !== filtroStatus) return false
        if (filtroTipo !== 'todos' && (ag.titulo || '').includes(filtroTipo)) return false
        return true
    })

    // Ordenar por data de vencimento (mais próximos primeiro)
    const agendamentosOrdenados = [...agendamentosFiltrados].sort((a, b) => {
        const dateA = a.data_limite || a.data_vencimento || ''
        const dateB = b.data_limite || b.data_vencimento || ''
        return new Date(dateA).getTime() - new Date(dateB).getTime()
    })

    // Calcular dias restantes
    const getDiasRestantes = (dataVencimento: string) => {
        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)
        const venc = new Date(dataVencimento)
        const diff = Math.ceil((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
        return diff
    }

    // Cor e ícone por status
    const getStatusInfo = (status: string, diasRestantes: number) => {
        const s = status?.toLowerCase()
        if (s === 'concluido' || s === 'concluida') {
            return { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2, label: 'Concluído' }
        }
        if (s === 'atrasado' || s === 'atrasada' || diasRestantes < 0) {
            return { color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: AlertTriangle, label: 'Atrasado' }
        }
        if (diasRestantes <= 3) {
            return { color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: Clock, label: 'Urgente' }
        }
        return { color: 'text-neutral-500 bg-neutral-900 border-neutral-800', icon: Clock, label: 'Pendente' }
    }

    // Tipos de pendências únicos para filtro
    const tiposUnicos = Array.from(new Set(agendamentos.map(a => a.titulo || a.tipo_pendencia || 'OUTRO')))

    return (
        <div className="space-y-6">
            {/* Filtros */}
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-neutral-600" />
                    <span className="text-[9px] font-black text-neutral-600 uppercase">Filtrar:</span>
                </div>

                {/* Filtro de Status */}
                <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="bg-neutral-900 border border-neutral-800 rounded px-3 py-1.5 text-[10px] text-white font-bold uppercase"
                >
                    <option value="todos">Todos Status</option>
                    <option value="pendente">Pendente</option>
                    <option value="atrasado">Atrasado</option>
                    <option value="concluido">Concluído</option>
                </select>

                {/* Filtro de Tipo */}
                <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className="bg-neutral-900 border border-neutral-800 rounded px-3 py-1.5 text-[10px] text-white font-bold uppercase"
                >
                    <option value="todos">Todos os Tipos</option>
                    {tiposUnicos.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo.replace('_', ' ')}</option>
                    ))}
                </select>
            </div>

            {/* Lista de Pendências */}
            <div className="space-y-3">
                {agendamentosOrdenados.length === 0 ? (
                    <div className="p-12 bg-black border border-dashed border-neutral-800 rounded-2xl text-center space-y-3">
                        <Clock className="w-8 h-8 text-neutral-700 mx-auto" />
                        <p className="text-[10px] text-neutral-600 uppercase font-black">
                            {filtroStatus !== 'todos' || filtroTipo !== 'todos'
                                ? 'Nenhuma pendência encontrada com os filtros aplicados'
                                : 'Nenhuma pendência cadastrada'}
                        </p>
                    </div>
                ) : (
                    agendamentosOrdenados.map((ag) => {
                        const dataVenc = ag.data_limite || ag.data_vencimento || ''
                        const diasRestantes = getDiasRestantes(dataVenc)
                        const statusInfo = getStatusInfo(ag.status, diasRestantes)
                        const StatusIcon = statusInfo.icon

                        return (
                            <div
                                key={ag.id}
                                className="p-5 bg-black border border-neutral-800 rounded-xl flex items-center justify-between group hover:border-emerald-500/30 transition-all"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    {/* Ícone de Status */}
                                    <div className={`p-2.5 rounded-lg ${statusInfo.color}`}>
                                        <StatusIcon className="w-5 h-5" />
                                    </div>

                                    {/* Informações */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-[11px] font-black text-white uppercase tracking-wide">
                                                {ag.descricao}
                                            </h4>
                                            <span className="text-[7px] bg-neutral-800 px-2 py-0.5 rounded font-black uppercase text-neutral-500">
                                                {(ag.titulo || ag.tipo_pendencia || 'OUTRO').replace('_', ' ')}
                                            </span>
                                            {ag.subtipo && (
                                                <span className="text-[7px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-black uppercase text-emerald-500">
                                                    {ag.subtipo}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-[9px] font-mono text-neutral-600">
                                            <span>Vencimento: {new Date(ag.data_limite || ag.data_vencimento || '').toLocaleDateString('pt-BR')}</span>
                                            {ag.status?.toLowerCase() !== 'concluido' && (
                                                <span className={diasRestantes < 0 ? 'text-red-500 font-bold' : diasRestantes <= 3 ? 'text-amber-500 font-bold' : ''}>
                                                    {diasRestantes < 0 ? `${Math.abs(diasRestantes)} dias atrasado` : `${diasRestantes} dias restantes`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Ações */}
                                <div className="flex items-center gap-2">
                                    {ag.status === 'pendente' && (
                                        <button
                                            onClick={() => onMarcarConcluido(ag.id)}
                                            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-[9px] font-black uppercase text-emerald-500 rounded transition-all flex items-center gap-1.5"
                                        >
                                            <CheckCircle2 className="w-3 h-3" />
                                            Concluir
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onEditar(ag)}
                                        className="p-2 text-neutral-600 hover:text-white hover:bg-neutral-800 rounded transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onExcluir(ag.id)}
                                        className="p-2 text-neutral-600 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
