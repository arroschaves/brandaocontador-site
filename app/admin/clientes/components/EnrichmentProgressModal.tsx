'use client'

import React, { useState, useEffect } from 'react'
import {
    Loader2,
    CheckCircle2,
    AlertCircle,
    X,
    Sparkles,
    Building2,
    ShieldAlert,
    Pause,
    Play,
    Zap
} from 'lucide-react'

interface EnrichmentProgressModalProps {
    isOpen: boolean
    candidates: any[]
    onClose: (refetch: boolean) => void
}

export default function EnrichmentProgressModal({ isOpen, candidates, onClose }: EnrichmentProgressModalProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle')
    const [results, setResults] = useState<{ id: string, nome: string, success: boolean, error?: string }[]>([])
    const [currentClientName, setCurrentClientName] = useState('')

    useEffect(() => {
        if (isOpen && status === 'idle' && candidates.length > 0) {
            startEnrichment()
        }
    }, [isOpen])

    async function startEnrichment() {
        setStatus('running')
        processNext(0)
    }

    async function processNext(index: number) {
        if (index >= candidates.length) {
            setStatus('completed')
            return
        }

        if (status === 'paused') return

        const client = candidates[index]
        setCurrentIndex(index)
        setCurrentClientName(client.nome)

        try {
            const res = await fetch(`/api/clientes/${client.id}/enrich`, { method: 'POST' })
            const data = await res.json()

            if (res.ok) {
                setResults(prev => [...prev, { id: client.id, nome: client.nome, success: true }])
            } else {
                setResults(prev => [...prev, { id: client.id, nome: client.nome, success: false, error: data.error }])
                if (res.status === 429) {
                    setStatus('paused')
                    alert('Limite de 3 consultas por minuto atingido. Aguarde 60 segundos para retomar.')
                    return
                }
            }
        } catch (err) {
            setResults(prev => [...prev, { id: client.id, nome: client.nome, success: false, error: 'Erro de conexão' }])
        }

        // Delay para respeitar o limite de 3req/min (aprox 21s)
        if (index < candidates.length - 1) {
            setTimeout(() => {
                if ((status as string) !== 'paused') processNext(index + 1)
            }, 21000)
        } else {
            setStatus('completed')
        }
    }

    if (!isOpen) return null

    const progress = ((currentIndex + 1) / candidates.length) * 100
    const successCount = results.filter(r => r.success).length
    const errorCount = results.filter(r => !r.success).length

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-card border border-border/50 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col page-fade-in shadow-primary/10">

                {/* Header Lúcido */}
                <div className="p-6 bg-secondary/30 border-b border-border/40 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-foreground tracking-tight">Maestro Enrichment</h2>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">Inteligência Cadastral em Tempo Real</p>
                        </div>
                    </div>
                    {status === 'completed' && (
                        <button onClick={() => onClose(true)} className="p-2 hover:bg-secondary rounded-xl transition-colors text-muted-foreground">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="p-10 space-y-10 flex-1 overflow-y-auto no-scrollbar">

                    {/* Status Display */}
                    <div className="text-center space-y-4">
                        {status === 'running' && (
                            <div className="flex flex-col items-center gap-5">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                                    <Loader2 className="w-12 h-12 text-primary animate-spin relative" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                                        Processando Cliente • {currentIndex + 1} de {candidates.length}
                                    </p>
                                    <h3 className="text-xl font-bold text-foreground tracking-tight truncate w-full px-4">
                                        {currentClientName}
                                    </h3>
                                </div>
                            </div>
                        )}

                        {status === 'completed' && (
                            <div className="flex flex-col items-center gap-5 animate-in zoom-in duration-500">
                                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 shadow-sm shadow-primary/5">
                                    <CheckCircle2 className="w-12 h-12 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-foreground">Sincronização Finalizada</h3>
                                    <p className="text-xs font-medium text-muted-foreground">Toda a carteira selecionada foi atualizada com sucesso.</p>
                                </div>
                            </div>
                        )}

                        {status === 'paused' && (
                            <div className="flex flex-col items-center gap-5">
                                <div className="p-4 bg-amber-100/50 rounded-2xl border border-amber-200 animate-pulse">
                                    <ShieldAlert className="w-12 h-12 text-amber-600" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-amber-600">Janela de Espera</h3>
                                    <p className="text-xs font-medium text-muted-foreground">Aguardando intervalo de segurança para evitar bloqueio da RFB.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar Moderno */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end px-1">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Progresso do Maestro</p>
                            <p className="text-[11px] font-bold text-primary">{Math.round(progress)}%</p>
                        </div>
                        <div className="h-3 w-full bg-secondary/50 rounded-full overflow-hidden border border-border/20 shadow-inner p-0.5">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-sm shadow-primary/20"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight px-1">
                            <span className="text-primary flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" /> {successCount} Enriquecidos
                            </span>
                            <span className="text-destructive flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" /> {errorCount} Falhas
                            </span>
                        </div>
                    </div>

                    {/* Recent Logs Sleek */}
                    <div className="bg-secondary/20 border border-border/30 rounded-2xl p-6 space-y-4 max-h-48 overflow-y-auto no-scrollbar">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Monitor de Eventos</p>
                        <div className="space-y-3">
                            {results.slice(-5).reverse().map((res, i) => (
                                <div key={i} className="flex items-center justify-between p-2.5 bg-card/40 rounded-xl border border-border/10 animate-in slide-in-from-bottom-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${res.success ? 'bg-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                                        <span className="text-xs font-semibold text-foreground truncate max-w-[220px]">{res.nome}</span>
                                    </div>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${res.success ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                                        {res.success ? 'OK' : 'ERRO'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions Lúcido */}
                <div className="p-8 bg-secondary/10 border-t border-border/40 flex gap-4">
                    {status === 'running' && (
                        <button
                            onClick={() => setStatus('paused')}
                            className="flex-1 py-4 bg-card border border-border/60 text-muted-foreground rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-secondary transition-all shadow-sm"
                        >
                            <Pause className="w-4 h-4" /> Pausar Master
                        </button>
                    )}
                    {status === 'paused' && (
                        <button
                            onClick={() => { setStatus('running'); processNext(currentIndex); }}
                            className="flex-1 py-4 btn-modern flex items-center justify-center gap-2 shadow-primary/20"
                        >
                            <Play className="w-4 h-4" /> Retomar Processo
                        </button>
                    )}
                    {status === 'completed' ? (
                        <button
                            onClick={() => onClose(true)}
                            className="w-full btn-modern py-4 shadow-primary/20"
                        >
                            Finalizar e Sincronizar Base
                        </button>
                    ) : (
                        <button
                            onClick={() => { if (confirm('Deseja cancelar a operação?')) onClose(true); }}
                            className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground hover:text-destructive transition-colors"
                        >
                            Abortar
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
