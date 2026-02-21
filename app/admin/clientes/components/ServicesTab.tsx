'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, CheckCircle2, Shield, AlertCircle, ShoppingCart, Tag, Clock } from 'lucide-react'

interface Servico {
    id: string
    nome: string
    descricao: string
    categoria: string
    tipo_cobranca: string // MENSAL, AVULSO
    valor_base: number
    ativo: boolean
}

interface EmpresaServico {
    id: string
    servico_id: string
    data_inicio: string
    data_fim: string | null
    valor_acordado: number
    ativo: boolean
    servico?: Servico
}

export default function ServicesTab({ clientId }: { clientId: string }) {
    const supabase = createClient()
    const [mservicos, setMservicos] = useState<Servico[]>([])
    const [contratados, setContratados] = useState<EmpresaServico[]>([])
    const [loading, setLoading] = useState(true)
    const [showCatalog, setShowCatalog] = useState(false)
    const [error, setError] = useState('')

    const fetchData = useCallback(async () => {
        setLoading(true)

        // 1. Busca Catálogo de Serviços
        const { data: servs } = await supabase
            .schema('core')
            .from('servicos')
            .select('*')
            .eq('ativo', true)
            .order('categoria')

        // 2. Busca Serviços Contratados pela Empresa
        const { data: vinculados } = await supabase
            .schema('core')
            .from('empresa_servicos')
            .select('*, servico:servicos(*)')
            .eq('empresa_id', clientId)
            .eq('ativo', true)

        setMservicos(servs || [])
        setContratados(vinculados || [])
        setLoading(false)
    }, [clientId, supabase])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleAssinar = async (servico: Servico) => {
        if (!confirm(`Confirmar adição do serviço: ${servico.nome}?`)) return

        try {
            const payload = {
                empresa_id: clientId,
                servico_id: servico.id,
                data_inicio: new Date().toISOString().split('T')[0], // Hoje
                valor_acordado: servico.valor_base,
                ativo: true
            }

            const { error: insErr } = await supabase
                .schema('core')
                .from('empresa_servicos')
                .insert([payload])

            if (insErr) throw insErr

            setShowCatalog(false)
            fetchData()
        } catch (err: any) {
            setError(err.message || 'Falha ao vincular serviço')
        }
    }

    const handleCancelar = async (id: string) => {
        if (!confirm('Cancelar este serviço?')) return

        try {
            await supabase
                .schema('core')
                .from('empresa_servicos')
                .update({
                    ativo: false,
                    data_fim: new Date().toISOString().split('T')[0]
                })
                .eq('id', id)

            fetchData()
        } catch (e) {
            console.error(e)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-white font-bold text-sm uppercase flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-emerald-500" />
                        Planos & Serviços Adicionais
                    </h3>
                    <p className="text-[10px] text-neutral-500 uppercase mt-1">Gerencie produtos Maestro contratados pelo cliente</p>
                </div>
                {!showCatalog && (
                    <button
                        onClick={() => setShowCatalog(true)}
                        className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase rounded hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Adicionar Serviço
                    </button>
                )}
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] flex items-center gap-2 rounded mb-4">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            {showCatalog && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 animate-in slide-in-from-top-4 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-[12px] font-bold text-white uppercase flex items-center gap-2">
                            <Tag className="w-4 h-4 text-emerald-500" /> Catálogo de Serviços
                        </h4>
                        <button onClick={() => setShowCatalog(false)} className="text-[10px] font-bold text-neutral-500 uppercase hover:text-white">Fechar Catálogo</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mservicos.map(s => {
                            const isAssinado = contratados.some(c => c.servico_id === s.id)
                            return (
                                <div key={s.id} className={`p-4 rounded-xl border ${isAssinado ? 'bg-neutral-950 border-neutral-800 opacity-50' : 'bg-black border-neutral-800 hover:border-emerald-500/50'} transition-all flex flex-col justify-between group`}>
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[8px] font-black px-2 py-0.5 bg-neutral-800 text-neutral-400 uppercase rounded">{s.categoria || 'Geral'}</span>
                                            {isAssinado && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                        </div>
                                        <h5 className="text-sm font-bold text-white uppercase mb-1">{s.nome}</h5>
                                        <p className="text-[10px] text-neutral-500 line-clamp-2">{s.descricao}</p>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-neutral-900 flex justify-between items-center">
                                        <div>
                                            {s.valor_base ? (
                                                <span className="text-xs font-black text-emerald-400">R$ {s.valor_base.toFixed(2)} <span className="text-[8px] text-neutral-600 font-normal">/{s.tipo_cobranca === 'MENSAL' ? 'mês' : 'un'}</span></span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-neutral-500 uppercase">Sob Consulta</span>
                                            )}
                                        </div>
                                        {!isAssinado ? (
                                            <button
                                                onClick={() => handleAssinar(s)}
                                                className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase rounded hover:bg-emerald-500 hover:text-black transition-colors"
                                            >
                                                Adicionar
                                            </button>
                                        ) : (
                                            <span className="text-[9px] font-bold text-neutral-600 uppercase">Ativo</span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {!showCatalog && contratados.length === 0 && (
                <div className="p-12 border-2 border-dashed border-neutral-900 rounded-xl flex flex-col items-center text-center">
                    <Shield className="w-10 h-10 text-neutral-800 mb-4" />
                    <p className="text-[10px] font-black uppercase text-neutral-600 mb-2">Nenhum serviço extra ativo</p>
                    <p className="text-[9px] uppercase text-neutral-700 max-w-sm">Adicione BPO Financeiro, Recuperação Tributária, Certificados, etc., para ter no roadmap do cliente.</p>
                </div>
            )}

            <div className="space-y-3">
                {contratados.map(c => (
                    <div key={c.id} className="p-4 bg-black border border-neutral-900 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-neutral-800 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white uppercase">{c.servico?.nome || 'Serviço Desconhecido'}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] text-neutral-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Início: {new Date(c.data_inicio).toLocaleDateString()}</span>
                                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">{c.servico?.tipo_cobranca || 'MENSAL'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[9px] font-black text-neutral-600 uppercase">Valor Acordado</p>
                                <p className="text-xs font-bold text-emerald-400">R$ {c.valor_acordado ? c.valor_acordado.toFixed(2) : '0,00'}</p>
                            </div>
                            <button
                                onClick={() => handleCancelar(c.id)}
                                className="p-2 bg-neutral-900 hover:bg-red-500/10 border border-neutral-800 hover:border-red-500/30 text-neutral-500 hover:text-red-500 rounded-lg transition-all group"
                                title="Cancelar Serviço"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
