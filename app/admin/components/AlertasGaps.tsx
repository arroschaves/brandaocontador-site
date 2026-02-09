'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, ChevronRight, FileWarning, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react'

export default function AlertasGaps() {
    const [gaps, setGaps] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchGaps()
    }, [])

    async function fetchGaps() {
        try {
            setLoading(true)
            const res = await fetch('/api/audit/gaps')
            const data = await res.json()
            if (data.success) {
                setGaps(data.gaps)
            }
        } catch (err) {
            console.error('Erro ao buscar gaps:', err)
        } finally {
            setLoading(false)
        }
    }

    const mesReferencia = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date())
    const anoReferencia = new Date().getFullYear()

    if (loading) return (
        <div className="p-12 lucid-card flex flex-col items-center justify-center gap-4 bg-secondary/10">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <Loader2 className="w-8 h-8 animate-spin text-primary relative" />
            </div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em]">Escaneando Gaps Fiscais...</span>
        </div>
    )

    return (
        <div className="lucid-card p-0 flex flex-col shadow-xl shadow-amber-500/5 border border-border/40 bg-card">
            <div className="p-5 bg-secondary/30 border-b border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <FileWarning className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-[11px] font-bold uppercase text-foreground tracking-tight">Radar de Geração Faltante</h3>
                        <p className="text-[9px] font-semibold text-muted-foreground uppercase opacity-60">Ausência de documentos Maestro</p>
                    </div>
                </div>
                <button onClick={fetchGaps} className="p-2 hover:bg-secondary rounded-xl text-muted-foreground transition-all">
                    <RefreshCw className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="max-h-[340px] overflow-y-auto no-scrollbar">
                {gaps.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-[10px] font-bold uppercase text-primary tracking-widest">Processo 100% Documentado</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/20">
                        {gaps.map((gap, i) => (
                            <div key={i} className="p-5 flex items-center justify-between hover:bg-secondary/30 transition-all group">
                                <div className="space-y-1.5 min-w-0">
                                    <span className="text-[12px] font-bold text-foreground uppercase truncate block group-hover:text-primary transition-colors">
                                        {gap.clienteNome}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${gap.prioridade === 'ALTA' ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-muted-foreground'} uppercase`}>
                                            {gap.obrigacao}
                                        </span>
                                        <span className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-tighter">{gap.grupo}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-right">
                                        <span className="text-[9px] font-bold text-amber-500 uppercase block leading-none">Pendente</span>
                                        <span className="text-[9px] font-medium text-muted-foreground/40 uppercase mt-0.5 block">{mesReferencia}/{anoReferencia}</span>
                                    </div>
                                    <div className="p-2 bg-amber-500/5 rounded-full group-hover:bg-amber-500/10 transition-colors">
                                        <AlertCircle className="w-4 h-4 text-amber-600" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 bg-secondary/10 border-t border-border/40 text-center">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{gaps.length} pendências críticas de geração</p>
            </div>
        </div>
    )
}
