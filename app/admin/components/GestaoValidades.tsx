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
            setLoading(true)
            const { data, error } = await supabase
                .from('clientes')
                .select('id, nome, vencimento_alvara_funcionamento, vencimento_alvara_sanitario, vencimento_alvara_bombeiros, vencimento_alvara_ambiental, vencimento_certificado_a1, vencimento_certificado_a3')

            if (error) throw error

            const allValidades: any[] = []
            const mapeamento = [
                { field: 'vencimento_alvara_funcionamento', label: 'Alvará Funcionamento' },
                { field: 'vencimento_alvara_sanitario', label: 'Alvará Sanitário' },
                { field: 'vencimento_alvara_bombeiros', label: 'Alvará Bombeiros' },
                { field: 'vencimento_alvara_ambiental', label: 'Alvará Ambiental' },
                { field: 'vencimento_certificado_a1', label: 'Certificado A1' },
                { field: 'vencimento_certificado_a3', label: 'Certificado A3' },
            ]

            data?.forEach((c: any) => {
                mapeamento.forEach(m => {
                    if (c[m.field]) {
                        allValidades.push({
                            id: `${c.id}-${m.field}`,
                            clientes: { nome: c.nome },
                            tipo: m.label,
                            vencimento: c[m.field],
                            status: 'pendente' // Default, lógica de status já trata
                        })
                    }
                })
            })

            // Ordenar por vencimento mais próximo
            allValidades.sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime())

            setValidades(allValidades)
        } catch (err) {
            console.error('Erro ao buscar validades:', err)
        } finally {
            setLoading(false)
        }
    }

    const getStatusStyle = (vencimento: string, status: string) => {
        if (status === 'concluido') return 'bg-primary/10 text-primary border-primary/20'
        const dias = Math.ceil((new Date(vencimento).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
        if (dias < 0) return 'bg-destructive/10 text-destructive border-destructive/20 animate-pulse'
        if (dias <= 15) return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }

    if (loading) return (
        <div className="p-12 lucid-card flex flex-col items-center justify-center gap-4 bg-secondary/10">
            <Clock className="w-8 h-8 animate-pulse text-muted-foreground/30" />
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Sincronizando Validades...</span>
        </div>
    )

    return (
        <div className="lucid-card p-0 flex flex-col shadow-xl shadow-primary/5 border border-border/40 bg-card">
            <div className="p-5 bg-secondary/30 border-b border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                        <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-[11px] font-bold uppercase text-foreground tracking-tight">Alvarás & Certificados</h3>
                        <p className="text-[9px] font-semibold text-muted-foreground uppercase opacity-60">Monitoramento Preventivo</p>
                    </div>
                </div>
                <button className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm">
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/30 border-b border-border/40">
                            <th className="p-4 pl-6 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cliente</th>
                            <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Documento</th>
                            <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Vencimento</th>
                            <th className="p-4 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                            <th className="p-4 pr-6"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                        {validades.map((v) => (
                            <tr key={v.id} className="hover:bg-secondary/30 transition-all group">
                                <td className="p-4 pl-6">
                                    <span className="text-[11px] font-bold text-foreground uppercase block truncate max-w-[140px] group-hover:text-primary transition-colors">
                                        {v.clientes?.nome}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{v.tipo}</span>
                                </td>
                                <td className="p-4">
                                    <span className="text-[11px] font-mono font-medium text-foreground/80">
                                        {new Date(v.vencimento).toLocaleDateString()}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border ${getStatusStyle(v.vencimento, v.status)} uppercase`}>
                                        {v.status === 'concluido' ? 'RENOVADO' : 'PENDENTE'}
                                    </span>
                                </td>
                                <td className="p-4 pr-6 text-right">
                                    <button className="p-2 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100 bg-secondary rounded-lg">
                                        <Bell className="w-3.5 h-3.5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {validades.length === 0 && (
                <div className="p-16 text-center space-y-3 opacity-40">
                    <Clock className="w-10 h-10 mx-auto text-muted-foreground/30" />
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Nenhum vencimento crítico</p>
                </div>
            )}
        </div>
    )
}
