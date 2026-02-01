'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    FileText, History, Info, Shield,
    MessageSquare, Upload, ExternalLink,
    Lock, Calendar, CheckCircle2, AlertTriangle,
    Mic, Image as ImageIcon, FileCode, Search,
    ArrowLeft, MoreVertical, Plus
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

    const supabase = createClient()

    useEffect(() => {
        fetchClientData()
    }, [clientId])

    async function fetchClientData() {
        setLoading(true)
        try {
            // 1. Dados do Cliente
            const { data: c } = await supabase.from('clientes').select('*').eq('id', clientId).single()
            setClient(c)

            // 2. Histórico / Auditoria
            const { data: h } = await supabase
                .from('auditoria_crm')
                .select('*, equipe(nome)')
                .eq('cliente_id', clientId)
                .order('created_at', { ascending: false })
            setHistory(h || [])

            // 3. Wiki (Notas)
            const { data: w } = await supabase.from('cliente_wiki').select('conteudo').eq('cliente_id', clientId).single()
            setWiki(w?.conteudo || '')

        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-20 text-center font-mono text-emerald-500 animate-pulse">CARREGANDO HUB MAESTRO...</div>

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Nav Retrô / Brutalista */}
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 bg-neutral-900 border border-neutral-800 hover:border-emerald-500 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-white italic uppercase">{client?.razao_social || client?.nome}</h1>
                        <span className="bg-emerald-500 text-black text-[9px] font-black px-2 py-0.5 uppercase tracking-widest">Ativo</span>
                    </div>
                    <p className="text-[10px] font-mono text-neutral-500 uppercase">{client?.cnpj_cpf} // {client?.cidade} - {client?.estado}</p>
                </div>
            </div>

            {/* Grid Maestro */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Coluna Esquerda: Widgets de Status e Documentos */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Card Seguro: Certificado A1 */}
                    <div className="bg-neutral-900 border-l-4 border-amber-500 p-5 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Lock className="w-3.5 h-3.5 text-amber-500" /> Vault Certificado A1
                            </h3>
                            <button className="text-[9px] font-bold text-amber-500 hover:underline">GERENCIAR</button>
                        </div>
                        <div className="bg-black/40 p-3 border border-neutral-800 rounded">
                            <p className="text-[10px] text-neutral-500 uppercase mb-1">Status de Expiração</p>
                            <div className="flex items-end gap-2">
                                <span className="text-xl font-black text-white">42 Dias</span>
                                <span className="text-[9px] text-amber-500 font-bold mb-1">PENDENTE RENOVAÇÃO</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Info */}
                    <div className="bg-neutral-900 border border-neutral-800 p-5 space-y-4">
                        <h3 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Info className="w-3.5 h-3.5 text-blue-500" /> Dados Estratégicos
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between border-b border-neutral-800 pb-2">
                                <span className="text-[10px] text-neutral-600 uppercase">Regime</span>
                                <span className="text-[10px] font-bold text-neutral-300 uppercase">{client?.regime_tributario || 'NÃO DEF.'}</span>
                            </div>
                            <div className="flex justify-between border-b border-neutral-800 pb-2">
                                <span className="text-[10px] text-neutral-600 uppercase">Faturamento Médio</span>
                                <span className="text-[10px] font-bold text-neutral-300">R$ 45.000,00</span>
                            </div>
                        </div>
                    </div>

                    {/* Google Drive Direct Access */}
                    <div className="bg-neutral-900 border border-neutral-800 p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <ImageIcon className="w-3.5 h-3.5 text-emerald-500" /> Repositório Drive
                            </h3>
                            <a href={`https://drive.google.com/drive/folders/${client?.drive_folder_id}`} target="_blank" className="p-1.5 bg-neutral-800 hover:bg-emerald-500 transition-colors">
                                <ExternalLink className="w-3 h-3 text-white" />
                            </a>
                        </div>
                        <div className="space-y-2">
                            {['DAS_JAN_2026.pdf', 'FOLHA_PGTO.pdf', 'CONTRATO_SOCIAL.xml'].map(file => (
                                <div key={file} className="flex items-center justify-between p-2 bg-black/20 hover:bg-black/40 border border-neutral-800/50 cursor-pointer group transition-all">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-3.5 h-3.5 text-neutral-600 group-hover:text-emerald-500" />
                                        <span className="text-[10px] font-mono text-neutral-400">{file}</span>
                                    </div>
                                    <ArrowLeft className="w-3 h-3 text-neutral-800 rotate-180" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Coluna Direita: Tabs de Conteúdo (Timeline, Wiki, IA Insight) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Tabs Navigation */}
                    <div className="flex gap-1 bg-neutral-900 p-1 border border-neutral-800">
                        {['timeline', 'wiki', 'ia_insights', 'fiscal'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-emerald-500 text-black' : 'text-neutral-500 hover:text-white'}`}
                            >
                                {tab.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content: Timeline (Auditoria & Atividade) */}
                    {activeTab === 'timeline' && (
                        <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-8 min-h-[500px]">
                            {history.length === 0 ? (
                                <p className="text-center text-[10px] text-neutral-600 uppercase italic py-20">Nenhuma atividade registrada no radar.</p>
                            ) : (
                                <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-neutral-800">
                                    {history.map((item, idx) => (
                                        <div key={idx} className="relative pl-8 group">
                                            <div className="absolute left-0 top-1.5 w-[22px] h-[22px] bg-black border-2 border-neutral-800 flex items-center justify-center group-hover:border-emerald-500 transition-colors">
                                                {item.acao === 'ENVIO_WA' ? <MessageSquare className="w-2.5 h-2.5 text-emerald-500" /> : <Activity className="w-2.5 h-2.5 text-neutral-500" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-[11px] font-black text-white uppercase italic tracking-tight">{item.acao}</span>
                                                    <span className="text-[9px] font-mono text-neutral-600">{new Date(item.created_at).toLocaleString('pt-BR')}</span>
                                                </div>
                                                <p className="text-[10px] text-neutral-400 bg-black/40 p-3 border border-neutral-800/50">
                                                    {item.detalhes}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[9px] font-bold text-neutral-500 uppercase italic">Responsável:</span>
                                                    <span className="text-[9px] font-black text-emerald-500/80 uppercase">{item.equipe?.nome || 'ALESSANDRO'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab Content: Wiki (Notas Estratégicas) */}
                    {activeTab === 'wiki' && (
                        <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-[12px] font-black text-white uppercase tracking-[0.2em] italic">Dossiê Estratégico do Cliente</h2>
                                <button className="bg-white text-black text-[9px] font-black px-3 py-1 uppercase">Salvar Notas</button>
                            </div>
                            <textarea
                                className="w-full h-[400px] bg-black border border-neutral-800 p-6 text-[12px] text-neutral-300 font-mono outline-none focus:border-emerald-500/50 leading-relaxed"
                                placeholder="Descreva particularidades do cliente, perfil psicológico, preferências de atendimento ou regras fiscais específicas..."
                                value={wiki}
                                onChange={(e) => setWiki(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Tab Content: IA Insights (Multimídia) */}
                    {activeTab === 'ia_insights' && (
                        <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-6">
                            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                                <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Análise de IA Multimídia</h3>
                                <div className="flex gap-2">
                                    <span className="flex items-center gap-1 text-[9px] font-bold text-neutral-500 bg-black px-2 py-1"><Mic className="w-3 h-3" /> AUDIO</span>
                                    <span className="flex items-center gap-1 text-[9px] font-bold text-neutral-500 bg-black px-2 py-1"><ImageIcon className="w-3 h-3" /> IMAGE</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-black border-l-4 border-emerald-500">
                                    <p className="text-[9px] text-emerald-500 font-black uppercase mb-2">Última Transcrição (WhatsApp Audio)</p>
                                    <p className="text-[11px] italic text-neutral-300">"Oi Alessandro, acabei de mandar o contrato de aluguel novo da fazenda, vê se a retenção de IR está correta por favor."</p>
                                </div>
                                <div className="p-4 bg-black border-l-4 border-amber-500">
                                    <p className="text-[9px] text-amber-500 font-black uppercase mb-2">Análise de Documento (IA Vision)</p>
                                    <p className="text-[11px] text-neutral-400">Detectado: **Contrato de Locação Rural**. Alerta: **Cláusula de reajuste omissa**. Sugestão: Verificar com o cliente se haverá índice IGPM ou IPCA.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function Activity({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
}
