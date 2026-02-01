'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    FileText, History, Info, Shield,
    MessageSquare, Upload, ExternalLink,
    Lock, Calendar, CheckCircle2, AlertTriangle,
    Mic, Image as ImageIcon, FileCode, Search,
    ArrowLeft, MoreVertical, Plus, Hash,
    ChevronRight, LayoutDashboard, Settings,
    FileSearch, Activity, Cpu
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ClientHubPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: clientId } = use(params)
    const router = useRouter()
    const [client, setClient] = useState<any>(null)
    const [activeTab, setActiveTab] = useState('timeline')
    const [history, setHistory] = useState<any[]>([])
    const [wiki, setWiki] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const supabase = createClient()

    useEffect(() => {
        if (clientId) {
            fetchClientData()
        }
    }, [clientId])

    async function fetchClientData() {
        setLoading(true)
        setError(null)
        try {
            // 1. Dados do Cliente
            const { data: c, error: cErr } = await supabase.from('clientes').select('*').eq('id', clientId).single()
            if (cErr) throw new Error('Cliente não encontrado.')
            setClient(c)

            // 2. Histórico / Auditoria (Safe Join)
            const { data: h } = await supabase
                .from('auditoria_crm')
                .select('*')
                .eq('cliente_id', clientId)
                .order('created_at', { ascending: false })
                .limit(20)

            setHistory(h || [])

            // 3. Wiki (Notas) - Safe fetch
            const { data: w } = await supabase.from('cliente_wiki').select('conteudo').eq('cliente_id', clientId).single()
            setWiki(w?.conteudo || '')

        } catch (err: any) {
            console.error('[Hub Maestro Error]:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Activity className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">Sincronizando Hub Maestro...</p>
        </div>
    )

    if (error) return (
        <div className="p-10 bg-red-500/10 border border-red-500/20 rounded-lg text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
            <h2 className="text-white font-black uppercase text-sm">Erro de Conexão ao Maestro</h2>
            <p className="text-neutral-500 text-xs">{error}</p>
            <button onClick={() => router.push('/admin/clientes')} className="bg-white text-black px-4 py-2 text-[10px] font-black uppercase">Voltar para a Lista</button>
        </div>
    )

    return (
        <div className="min-h-screen bg-black text-neutral-300 animate-in fade-in duration-500">
            {/* ClickUp Style Breadcrumb & Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-900">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/admin/clientes')} className="p-2 hover:bg-neutral-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                        <Link href="/admin" className="hover:text-neutral-400">ADMIN</Link>
                        <ChevronRight className="w-3 h-3" />
                        <Link href="/admin/clientes" className="hover:text-neutral-400">CLIENTES</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-emerald-500">{client?.nome || 'HUB'}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2 bg-neutral-900 border border-neutral-800 text-neutral-500 hover:text-white"><Settings className="w-4 h-4" /></button>
                    <button className="bg-emerald-500 text-black px-4 py-2 text-[10px] font-black uppercase flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                        <Plus className="w-4 h-4" /> Nova Demanda
                    </button>
                </div>
            </div>

            {/* Client Top Card - Bento UI */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="md:col-span-3 bg-neutral-900/50 border border-neutral-800 p-8 rounded-2xl flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="w-24 h-24 bg-neutral-800 border-2 border-emerald-500/20 flex items-center justify-center rounded-2xl shadow-2xl">
                        <span className="text-3xl font-black text-white italic">{client?.nome?.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">{client?.razao_social || client?.nome}</h1>
                            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-bold uppercase tracking-widest rounded-full">Ativo</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-[10px] font-mono text-neutral-500 uppercase">
                            <span className="flex items-center gap-1.5"><Hash className="w-3 h-3" /> {client?.cnpj_cpf}</span>
                            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Competência: Jan/2026</span>
                            <span className="flex items-center gap-1.5 text-blue-400"><LayoutDashboard className="w-3 h-3" /> {client?.regime_tributario?.replace('_', ' ')}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-amber-500 p-8 rounded-2xl shadow-[4px_4px_20px_rgba(245,158,11,0.1)] flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-black text-amber-950 uppercase tracking-widest opacity-60">Status de Risco</p>
                        <h2 className="text-xl font-black text-amber-950 mt-1">EM CONFORMIDADE</h2>
                    </div>
                    <CheckCircle2 className="w-10 h-10 text-amber-950/20 self-end" />
                </div>
            </div>

            {/* ClickUp Style Tabs Area */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Tab Content (80%) */}
                <div className="flex-1 space-y-6">
                    <div className="flex gap-1 border-b border-neutral-900 pb-0.5">
                        {[
                            { id: 'timeline', label: 'Overview', icon: History },
                            { id: 'wiki', label: 'Dossiê Técnico', icon: FileText },
                            { id: 'docs', label: 'Arquivos & Drive', icon: FileCode },
                            { id: 'ia', label: 'IA Insights', icon: Activity }
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === t.id ? 'text-white border-b-2 border-emerald-500 bg-neutral-900/40' : 'text-neutral-600 hover:text-neutral-400'}`}
                            >
                                <t.icon className="w-3.5 h-3.5" />
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-8 min-h-[500px]">
                        {activeTab === 'timeline' && (
                            <div className="space-y-6">
                                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8">Atividade Recente</h3>
                                {history.length === 0 ? (
                                    <div className="py-20 text-center opacity-20 italic text-[10px]">Sem movimentos no radar nas últimas 24h.</div>
                                ) : (
                                    <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-neutral-800">
                                        {history.map((log, i) => (
                                            <div key={i} className="relative pl-8 animate-in slide-in-from-left duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                                <div className="absolute left-0 top-1 w-[24px] h-[24px] bg-black border-2 border-neutral-800 flex items-center justify-center rounded-lg group-hover:border-emerald-500 transition-all">
                                                    <Activity className={`w-3 h-3 ${log.acao.includes('ERRO') ? 'text-red-500' : 'text-emerald-500'}`} />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[11px] font-black text-white uppercase italic">{log.acao?.replace('_', ' ')}</span>
                                                        <span className="text-[9px] font-mono text-neutral-600">{new Date(log.created_at).toLocaleString('pt-BR')}</span>
                                                    </div>
                                                    <p className="text-[10px] text-neutral-400 bg-black/40 p-4 border border-neutral-800 rounded-xl leading-relaxed">
                                                        {typeof log.detalhes === 'string' ? log.detalhes : JSON.stringify(log.detalhes)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'wiki' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-white font-black text-xs uppercase tracking-[0.2em]">Manual de Operação do Cliente</h3>
                                    <button className="bg-white text-black text-[9px] font-black px-4 py-2 hover:bg-emerald-500 transition-all">SALVAR DOSSIÊ</button>
                                </div>
                                <textarea
                                    className="w-full h-[400px] bg-black/50 border border-neutral-800 p-8 text-[12px] text-neutral-400 font-mono leading-relaxed outline-none focus:border-emerald-500/30 rounded-2xl"
                                    placeholder="Particularidades deste cliente: Regras de faturamento, perfil dos sócios, regimes especiais..."
                                    value={wiki}
                                    onChange={(e) => setWiki(e.target.value)}
                                />
                            </div>
                        )}

                        {activeTab === 'ia' && (
                            <div className="space-y-6">
                                <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500 text-black rounded-lg"><Cpu className="w-5 h-5" /></div>
                                        <h3 className="text-white font-black text-sm uppercase italic">Brain Maestro Insights</h3>
                                    </div>
                                    <p className="text-neutral-400 text-xs leading-relaxed italic">
                                        "Baseado nos últimos 5 áudios do WhatsApp e nos arquivos PDF de competência enviados, este cliente tende a enviar o DAS no último dia do vencimento. Recomendo disparo de lembrete preventivo D-2."
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-black border border-neutral-800 rounded-xl space-y-2">
                                        <p className="text-[9px] font-black text-neutral-600 uppercase">Análise de Risco</p>
                                        <p className="text-sm font-black text-emerald-500 uppercase">BAIXO RISCO FISCAL</p>
                                    </div>
                                    <div className="p-6 bg-black border border-neutral-800 rounded-xl space-y-2">
                                        <p className="text-[9px] font-black text-neutral-600 uppercase">Next Action</p>
                                        <p className="text-sm font-black text-white uppercase italic">CONCILIAR EXTRATO</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Floating Info Panel (20%) */}
                <div className="w-full lg:w-80 space-y-6">
                    <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl space-y-6">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5 text-amber-500" /> Vault Documental
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-black p-4 rounded-xl border border-neutral-800 flex justify-between items-center group cursor-pointer hover:border-emerald-500 transition-all">
                                <div className="flex items-center gap-3">
                                    <FileCode className="w-4 h-4 text-emerald-500" />
                                    <span className="text-[10px] font-black uppercase text-neutral-400">CERT. A1</span>
                                </div>
                                <ChevronRight className="w-3 h-3 text-neutral-800" />
                            </div>
                            <div className="bg-black p-4 rounded-xl border border-neutral-800 flex justify-between items-center opacity-40">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-neutral-600" />
                                    <span className="text-[10px] font-black uppercase text-neutral-400 tracking-tight">CARTÃO CNPJ</span>
                                </div>
                                <ArrowLeft className="w-3 h-3 rotate-180 text-neutral-800" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl space-y-4">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Atalhos Maestro</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <button className="flex flex-col items-center gap-2 p-4 bg-black border border-neutral-800 rounded-xl hover:border-emerald-500 transition-all">
                                <MessageSquare className="w-4 h-4 text-emerald-500" />
                                <span className="text-[8px] font-black uppercase">Chamar</span>
                            </button>
                            <button className="flex flex-col items-center gap-2 p-4 bg-black border border-neutral-800 rounded-xl hover:border-emerald-500 transition-all">
                                <Upload className="w-4 h-4 text-blue-500" />
                                <span className="text-[8px] font-black uppercase">Subir</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
