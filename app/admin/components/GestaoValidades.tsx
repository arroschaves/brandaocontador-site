'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Calendar, AlertTriangle, CheckCircle2, Clock, Plus, Trash2, Bell } from 'lucide-react'

export default function GestaoValidades() {
    const [validades, setValidades] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchValidades()
    }, [])

    async function fetchValidades() {
        try {
            const { data, error } = await supabase
                .from('controle_validades')
                .select('*, clientes(nome)')
                .order('vencimento', { ascending: true })

            if (error) throw error
            setValidades(data || [])
        } catch (err) {
            console.error('Erro ao buscar validades:', err)
        } finally {
            setLoading(false)
        }
    }

    const getStatusStyle = (vencimento: string, status: string) => {
        if (status === 'concluido') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        const dias = Math.ceil((new Date(vencimento).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
        if (dias < 0) return 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse'
        if (dias <= 15) return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }

    if (loading) return <div className="p-8 text-center text-neutral-500 font-mono text-[10px] uppercase">Carregando Calendário de Validades...</div>

    return (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-neutral-900/50 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-primary-500" />
                    <div>
                        <h3 className="text-[10px] font-black uppercase text-neutral-100 italic tracking-tight">Gestão de Alvarás & Certificados</h3>
                        <p className="text-[8px] font-mono text-neutral-500 uppercase">Monitoramento preventivo de vencimentos</p>
                    </div>
                </div>
                <button className="p-2 bg-primary-500/10 text-primary-500 rounded border border-primary-500/20 hover:bg-primary-500 hover:text-neutral-950 transition-all">
                    <Plus className="w-3 h-3" />
                </button>
            </div>

            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-neutral-900/30 border-b border-neutral-900">
                            <th className="p-3 text-[8px] font-black text-neutral-600 uppercase">Cliente</th>
                            <th className="p-3 text-[8px] font-black text-neutral-600 uppercase">Documento</th>
                            <th className="p-3 text-[8px] font-black text-neutral-600 uppercase">Vencimento</th>
                            <th className="p-3 text-[8px] font-black text-neutral-600 uppercase text-center">Status</th>
                            <th className="p-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                        {validades.map((v) => (
                            <tr key={v.id} className="hover:bg-neutral-900/20 transition-all group">
                                <td className="p-3">
                                    <span className="text-[9px] font-bold text-neutral-300 uppercase block truncate max-w-[120px]">
                                        {v.clientes?.nome}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <span className="text-[9px] font-black text-neutral-100 uppercase italic">{v.tipo}</span>
                                </td>
                                <td className="p-3">
                                    <span className="text-[9px] font-mono text-neutral-400">
                                        {new Date(v.vencimento).toLocaleDateString()}
                                    </span>
                                </td>
                                <td className="p-3 text-center">
                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${getStatusStyle(v.vencimento, v.status)} uppercase italic`}>
                                        {v.status === 'concluido' ? 'RENOVADO' : 'EM DIA'}
                                    </span>
                                </td>
                                <td className="p-3 flex justify-end gap-2">
                                    <button className="p-1.5 text-neutral-600 hover:text-primary-500 opacity-0 group-hover:opacity-100">
                                        <Bell className="w-3 h-3" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {validades.length === 0 && (
                <div className="p-10 text-center opacity-20">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
                    <p className="text-[10px] uppercase font-black">Nenhum vencimento próximo</p>
                </div>
            )}
        </div>
    )
}
