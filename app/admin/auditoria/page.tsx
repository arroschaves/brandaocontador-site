'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    ShieldAlert, Search, Filter, Calendar,
    User, Eye, Trash2, ShieldCheck, Clock,
    Monitor, Server, FileText, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

export default function AuditoriaMasterPage() {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('')
    const supabase = createClient()

    useEffect(() => {
        fetchLogs()
    }, [])

    async function fetchLogs() {
        setLoading(true)
        const { data, error } = await supabase
            .from('auditoria_crm')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100)

        if (data) setLogs(data)
        setLoading(false)
    }

    const filteredLogs = logs.filter(log =>
        log.detalhes?.toLowerCase().includes(filter.toLowerCase()) ||
        log.acao?.toLowerCase().includes(filter.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-black text-neutral-400 p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-end">
                    <div className="space-y-4">
                        <Link href="/admin/clientes" className="flex items-center gap-2 text-[10px] font-black uppercase text-neutral-600 hover:text-emerald-500 transition-colors">
                            <ArrowLeft className="w-3 h-3" /> Voltar ao Painel
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                <ShieldCheck className="w-8 h-8 text-emerald-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Centro de Auditoria Elite</h1>
                                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-600">Monitoramento Zero-Trust Brandão Contabilidade</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="FILTRAR POR AÇÃO OU DETALHE..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="bg-neutral-900/50 border border-neutral-800 p-4 pl-12 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white focus:outline-none focus:border-emerald-500 transition-all w-[400px]"
                            />
                        </div>
                    </div>
                </div>

                {/* Dashboard Stats (Audit focus) */}
                <div className="grid grid-cols-4 gap-6">
                    {[
                        { label: 'Total de Eventos', value: logs.length, icon: FileText, color: 'emerald' },
                        { label: 'Acessos ao Vault', value: logs.filter(l => l.acao === 'VISUALIZACAO_SENHA').length, icon: Eye, color: 'amber' },
                        { label: 'Exclusões Realizadas', value: logs.filter(l => l.acao === 'EXCLUSAO_CERTIFICADO').length, icon: Trash2, color: 'rose' },
                        { label: 'Alertas de Sistema', value: 0, icon: ShieldAlert, color: 'emerald' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-neutral-900/40 border border-neutral-900 p-6 rounded-2xl space-y-2">
                            <div className="flex justify-between items-start">
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600">{stat.label}</p>
                                <stat.icon className={`w-4 h-4 text-${stat.color}-500`} />
                            </div>
                            <p className="text-3xl font-black text-white italic">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Main Log Table */}
                <div className="bg-neutral-900/20 border border-neutral-900 rounded-3xl overflow-hidden backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-900/50 border-b border-neutral-900">
                                <tr>
                                    <th className="p-6 text-[10px] font-black uppercase text-neutral-500">Evento / Status</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-neutral-500">Detalhamento da Ação</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-neutral-500">Origem (IP)</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-neutral-500">Horário</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-900">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="p-20 text-center">
                                            <div className="animate-pulse flex flex-col items-center gap-4">
                                                <Clock className="w-8 h-8 text-neutral-800" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando registros de segurança...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredLogs.map((log) => (
                                    <tr key={log.id} className="group hover:bg-neutral-900/40 transition-colors">
                                        <td className="p-6 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-[8px] font-black uppercase rounded ${log.acao === 'VISUALIZACAO_SENHA' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                    log.acao === 'EXCLUSAO_CERTIFICADO' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                                                        'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                }`}>
                                                {log.acao}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <p className="text-xs text-neutral-300 font-bold max-w-md">{log.detalhes}</p>
                                        </td>
                                        <td className="p-6 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-mono text-neutral-500 flex items-center gap-2">
                                                    <Server className="w-3 h-3" /> {log.ip_address}
                                                </span>
                                                <span className="text-[8px] font-mono text-neutral-700 truncate max-w-[200px]">
                                                    <Monitor className="w-2.5 h-2.5 inline mr-1" /> {log.user_agent}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-neutral-500">
                                                <Clock className="w-3 h-3" />
                                                {new Date(log.created_at).toLocaleString('pt-BR')}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
