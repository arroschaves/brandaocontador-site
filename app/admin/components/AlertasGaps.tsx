'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, ChevronRight, FileWarning, Loader2, RefreshCw } from 'lucide-react'

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
        <div className="p-8 bg-neutral-900/50 rounded-2xl border border-neutral-800 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            <span className="text-[10px] uppercase font-black text-neutral-500 italic">Analisando Buracos Contábeis...</span>
        </div>
    )

    return (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-neutral-900/50 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FileWarning className="w-4 h-4 text-amber-500" />
                    <div>
                        <h3 className="text-[10px] font-black uppercase text-neutral-100 italic tracking-tighter">Radar de Geração Faltante</h3>
                        <p className="text-[8px] font-mono text-neutral-500 uppercase">Documentos não localizados no Drive</p>
                    </div>
                </div>
                <button onClick={fetchGaps} className="p-1.5 hover:bg-neutral-800 rounded text-neutral-400">
                    <RefreshCw className="w-3 h-3" />
                </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                {gaps.length === 0 ? (
                    <div className="p-10 text-center opacity-30">
                        <p className="text-[10px] font-bold uppercase italic text-emerald-500 tracking-widest">Processo 100% Documentado</p>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-900">
                        {gaps.map((gap, i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-neutral-900/30 transition-all group">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-neutral-200 uppercase truncate max-w-[180px]">
                                        {gap.clienteNome}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${gap.prioridade === 'ALTA' ? 'bg-red-500/10 text-red-500' : 'bg-neutral-800 text-neutral-500'} uppercase italic`}>
                                            {gap.obrigacao}
                                        </span>
                                        <span className="text-[8px] font-mono text-neutral-600 uppercase">{gap.grupo}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <span className="text-[8px] font-black text-amber-500 uppercase block">FALTA GERAR</span>
                                        <span className="text-[7px] text-neutral-600 uppercase italic">Ref: {mesReferencia}/{anoReferencia}</span>
                                    </div>
                                    <AlertCircle className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-3 bg-neutral-900/20 border-t border-neutral-900 text-center">
                <p className="text-[8px] font-black text-neutral-600 italic uppercase">Exibindo {gaps.length} pendências críticas de geração</p>
            </div>
        </div>
    )
}
