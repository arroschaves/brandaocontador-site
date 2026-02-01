'use client'

import { useState, useEffect, use, useRef } from 'react'
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
    const [obrigacoes, setObrigacoes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [syncing, setSyncing] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [savingWiki, setSavingWiki] = useState(false)
    const [certificados, setCertificados] = useState<any[]>([])
    const [showVault, setShowVault] = useState(false)
    const [loadingCerts, setLoadingCerts] = useState(false)
    const [competenciaReferencia, setCompetenciaReferencia] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const supabase = createClient()

    useEffect(() => {
        if (clientId) {
            fetchClientData()
            fetchCertificados()
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

            // Determinar competência (Mês anterior ao atual se for início do mês)
            const agora = new Date()
            const refDate = new Date(agora.getFullYear(), agora.getMonth() - (agora.getDate() < 15 ? 1 : 0), 1)
            const refStr = refDate.toISOString().split('T')[0]
            setCompetenciaReferencia(refStr)

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

            // 4. Obrigações do Mês Atual (competência de referência)
            const { data: obr } = await supabase
                .from('obrigacoes_acessorias')
                .select('*')
                .eq('cliente_id', clientId)
                .eq('competencia', refStr)

            setObrigacoes(obr || [])

        } catch (err: any) {
            console.error('[Hub Maestro Error]:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleSync() {
        setSyncing(true)
        try {
            const res = await fetch('/api/sync/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId })
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'Falha na sincronização')

            alert('MAESTRO: Sincronização concluída com sucesso!')
            await fetchClientData()
            await fetchCertificados()
        } catch (err: any) {
            console.error('Erro ao sincronizar:', err)
            alert(`ERRO DE SINCRONIZAÇÃO: ${err.message}`)
        } finally {
            setSyncing(false)
        }
    }

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('clientId', clientId)

        // Inferência básica de rotina pelo nome do arquivo
        const fileName = file.name.toUpperCase()
        let routine = ''
        if (fileName.includes('DAS')) routine = 'DAS'
        else if (fileName.includes('FGTS')) routine = 'FGTS'
        else if (fileName.includes('INSS')) routine = 'INSS'
        else if (fileName.includes('DCTF')) routine = 'DCTFWeb'
        else if (fileName.includes('FOLHA')) routine = 'Folha de Pagamento'

        if (routine) formData.append('routineName', routine)

        try {
            const res = await fetch('/api/drive/upload', {
                method: 'POST',
                body: formData
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'Falha no upload')

            await fetchClientData()
        } catch (err: any) {
            console.error('Erro no upload:', err)
            alert(`Erro: ${err.message}`)
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    async function handleSaveWiki() {
        setSavingWiki(true)
        try {
            const res = await fetch('/api/clientes/wiki', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId, conteudo: wiki })
            })
            if (!res.ok) {
                const result = await res.json()
                throw new Error(result.error || 'Falha ao salvar dossiê')
            }
            alert('Dossiê atualizado com sucesso!')
        } catch (err: any) {
            console.error('Erro ao salvar wiki:', err)
            alert(`Erro: ${err.message}`)
        } finally {
            setSavingWiki(false)
        }
    }

    async function fetchCertificados() {
        setLoadingCerts(true)
        try {
            const res = await fetch(`/api/clientes/certificados?clientId=${clientId}`)
            const data = await res.json()
            if (res.ok) {
                setCertificados(Array.isArray(data) ? data : [])
            } else {
                console.error('Erro ao buscar certificados:', data.error)
            }
        } catch (err) {
            console.error('Erro de rede ao buscar certificados:', err)
        } finally {
            setLoadingCerts(false)
        }
    }

    async function handleViewPassword(certId: string) {
        try {
            const res = await fetch(`/api/clientes/certificados/${certId}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            alert(`Senha do Certificado: ${data.password}\n(Este acesso foi registrado na auditoria)`)
        } catch (err: any) {
            alert(`Erro: ${err.message}`)
        }
    }

    async function handleUpdateCertPassword(certId: string, password: string) {
        // Tenta pegar a data de emissão do usuário para calcular o vencimento
        const emission = prompt(`Informe a DATA DE EMISSÃO do certificado (DD/MM/AAAA):`)
        let dataVencimento = null

        if (emission) {
            const [d, m, y] = emission.split('/')
            const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
            date.setFullYear(date.getFullYear() + 1)
            dataVencimento = date.toISOString().split('T')[0]
        }

        try {
            const res = await fetch(`/api/clientes/certificados/${certId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, dataVencimento })
            })
            if (res.ok) {
                alert('Certificado agora está protegido no Vault!')
                fetchCertificados()
            } else {
                const err = await res.json()
                throw new Error(err.error)
            }
        } catch (err: any) {
            alert(err.message)
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
                            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Competência: {new Date(competenciaReferencia + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).toUpperCase()}</span>
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
                                    <button
                                        onClick={handleSaveWiki}
                                        disabled={savingWiki}
                                        className={`bg-white text-black text-[9px] font-black px-4 py-2 hover:bg-emerald-500 transition-all ${savingWiki ? 'opacity-50 animate-pulse' : ''}`}
                                    >
                                        {savingWiki ? 'SALVANDO...' : 'SALVAR DOSSIÊ'}
                                    </button>
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

                        {activeTab === 'docs' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg border border-blue-500/20">
                                            <FileCode className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-black text-sm uppercase italic">Obrigações & Drive</h3>
                                            <p className="text-[9px] font-mono text-neutral-600 uppercase">Documentos Sincronizados - Jan/2026</p>
                                        </div>
                                    </div>
                                    {client?.drive_folder_id && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSync}
                                                disabled={syncing}
                                                className={`flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-[9px] font-black uppercase text-emerald-500 rounded transition-all italic border border-emerald-500/20 ${syncing ? 'animate-pulse opacity-50' : ''}`}
                                            >
                                                <Activity className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                                                {syncing ? 'Sincronizando...' : 'Sincronizar Drive'}
                                            </button>
                                            <button
                                                onClick={() => window.open(`https://drive.google.com/drive/folders/${client.drive_folder_id}`, '_blank')}
                                                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-[9px] font-black uppercase text-white rounded transition-all italic border border-neutral-700"
                                            >
                                                <ExternalLink className="w-3 h-3" /> Abrir no Drive
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {['DAS', 'FGTS', 'INSS', 'DCTFWeb', 'Folha de Pagamento'].map((tipo) => {
                                        const ob = obrigacoes.find(o => o.tipo.toUpperCase() === tipo.toUpperCase());
                                        const status = ob?.status || 'pendente';

                                        return (
                                            <div key={tipo} className="p-5 bg-black border border-neutral-800 rounded-xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 bg-neutral-900 border border-neutral-800 flex items-center justify-center rounded-lg ${status === 'concluido' ? 'text-emerald-500' : 'text-neutral-600'} group-hover:text-emerald-500 transition-colors`}>
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-black text-neutral-300 uppercase tracking-widest">{tipo === 'Folha de Pagamento' ? 'Folha' : tipo}</p>
                                                        <p className="text-[8px] font-mono text-neutral-600 uppercase">Ref: {new Date(competenciaReferencia + 'T00:00:00').toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase italic ${status === 'concluido' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                                        status === 'atrasado' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                                            'bg-neutral-900 border-neutral-800 text-neutral-600'
                                                        }`}>
                                                        {status === 'concluido' ? 'No Drive' : status === 'atrasado' ? 'Atrasado' : 'Pendente'}
                                                    </span>
                                                    {status === 'concluido' ? (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    ) : (
                                                        <div className="w-4 h-4 rounded-full border border-neutral-800" />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Seção de Arquivos Recentes baseada na Auditoria */}
                                <div className="mt-8 space-y-4">
                                    <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Uploads Recentes</h4>
                                    <div className="space-y-2">
                                        {history.filter(h => h.acao === 'UPLOAD').length === 0 ? (
                                            <div className="p-4 bg-black/20 border border-dashed border-neutral-800 rounded-xl text-center text-[9px] text-neutral-600 uppercase">
                                                Nenhum arquivo enviado recentemente via CRM.
                                            </div>
                                        ) : (
                                            history.filter(h => h.acao === 'UPLOAD').slice(0, 5).map((up, idx) => (
                                                <div key={idx} className="p-3 bg-black border border-neutral-900 rounded-lg flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <FileCode className="w-3.5 h-3.5 text-blue-400" />
                                                        <span className="text-[10px] text-neutral-400 font-mono truncate max-w-[200px]">{up.detalhes}</span>
                                                    </div>
                                                    <span className="text-[8px] text-neutral-700 font-mono">{new Date(up.created_at).toLocaleDateString()}</span>
                                                </div>
                                            ))
                                        )}
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
                            <div
                                onClick={() => setShowVault(true)}
                                className="bg-black p-4 rounded-xl border border-neutral-800 flex justify-between items-center group cursor-pointer hover:border-emerald-500 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <FileCode className="w-4 h-4 text-emerald-500" />
                                    <span className="text-[10px] font-black uppercase text-neutral-400">CERT. A1</span>
                                    {certificados.length > 0 && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
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
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className={`flex flex-col items-center gap-2 p-4 bg-black border border-neutral-800 rounded-xl hover:border-emerald-500 transition-all ${uploading ? 'opacity-50 cursor-wait' : ''}`}
                            >
                                <Upload className={`w-4 h-4 text-blue-500 ${uploading ? 'animate-bounce' : ''}`} />
                                <span className="text-[8px] font-black uppercase">{uploading ? 'Subindo...' : 'Subir'}</span>
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleUpload}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal Vault - Certificados */}
            {showVault && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-amber-500" />
                                <h2 className="text-white font-black uppercase italic text-sm">Cofre de Certificados - Vault</h2>
                            </div>
                            <button onClick={() => setShowVault(false)} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-500 hover:text-white transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8 overflow-y-auto">
                            {/* Upload Section */}
                            <div className="p-6 bg-black border border-neutral-800 rounded-xl space-y-4">
                                <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Adicionar Novo Certificado</h3>
                                <form className="space-y-4" onSubmit={async (e) => {
                                    e.preventDefault()
                                    const form = e.target as HTMLFormElement
                                    const formData = new FormData(form)
                                    formData.append('clientId', clientId)

                                    try {
                                        const res = await fetch('/api/clientes/certificados', { method: 'POST', body: formData })
                                        const result = await res.json()

                                        if (res.ok) {
                                            alert('MAESTRO: Certificado protegido e salvo com sucesso no cofre!')
                                            form.reset()
                                            fetchCertificados()
                                            fetchClientData()
                                        } else {
                                            throw new Error(result.error || 'Erro desconhecido ao salvar certificado.')
                                        }
                                    } catch (err: any) {
                                        console.error('Erro no Vault:', err)
                                        alert(`ERRO NO VAULT: ${err.message}`)
                                    }
                                }}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-neutral-500 uppercase">Data de Emissão (A1 = +1 Ano)</label>
                                            <input
                                                type="date"
                                                name="emissao"
                                                required
                                                className="w-full bg-neutral-900 border border-neutral-800 p-3 rounded text-[10px] text-white"
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val) {
                                                        const d = new Date(val);
                                                        d.setFullYear(d.getFullYear() + 1);
                                                        const venc = d.toISOString().split('T')[0];
                                                        const vencInput = (e.target.form as HTMLFormElement).elements.namedItem('vencimento') as HTMLInputElement;
                                                        if (vencInput) vencInput.value = venc;
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-neutral-500 uppercase">Vencimento Calculado</label>
                                            <input type="date" name="vencimento" readOnly className="w-full bg-neutral-900/50 border border-neutral-800 p-3 rounded text-[10px] text-neutral-500" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-neutral-500 uppercase">Arquivo do Certificado</label>
                                            <input type="file" name="file" required className="w-full bg-neutral-900 border border-neutral-800 p-3 rounded text-[10px] text-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-neutral-500 uppercase">Senha</label>
                                            <input type="password" name="password" placeholder="SENHA" required className="w-full bg-neutral-900 border border-neutral-800 p-3 rounded text-[10px] text-white font-mono" />
                                        </div>
                                    </div>
                                    <button className="w-full bg-amber-500 text-black font-black text-[10px] uppercase p-4 hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/10">
                                        PROTEGER E SALVAR NO COFRE
                                    </button>
                                </form>
                            </div>

                            {/* List Section */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Certificados Armazenados</h3>
                                {certificados.length === 0 ? (
                                    <div className="py-10 text-center opacity-20 italic text-[10px] uppercase">Nenhum certificado no cofre.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {certificados.map((cert) => (
                                            <div key={cert.id} className="p-4 bg-black border border-neutral-800 rounded-xl flex items-center justify-between group">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-lg ${cert.senha_dados === 'PENDENTE' ? 'bg-amber-500/10 text-amber-500 animate-pulse' : 'bg-neutral-900 text-amber-500'}`}>
                                                        <FileCode className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-[11px] font-black text-white uppercase">{cert.nome_arquivo}</p>
                                                            {cert.senha_dados === 'PENDENTE' && (
                                                                <span className="text-[7px] bg-amber-500 text-black px-1.5 py-0.5 font-black uppercase rounded">Drive</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[9px] font-mono text-neutral-600">
                                                            {cert.senha_dados === 'PENDENTE' ? 'Aguardando configuração de senha' : `Vence em: ${cert.data_vencimento ? new Date(cert.data_vencimento).toLocaleDateString() : 'Não informado'}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {cert.senha_dados === 'PENDENTE' ? (
                                                        <button
                                                            onClick={() => {
                                                                const pwd = prompt(`O Maestro localizou este certificado no Drive para Ana Lucia.\nInforme a senha para criptografar agora:`)
                                                                if (pwd) handleUpdateCertPassword(cert.id, pwd)
                                                            }}
                                                            className="px-3 py-1.5 bg-amber-500 text-black text-[8px] font-black uppercase hover:bg-white transition-all"
                                                        >
                                                            Configurar Senha
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleViewPassword(cert.id)}
                                                            className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-[8px] font-black uppercase text-neutral-400 hover:text-white hover:border-emerald-500 transition-all flex items-center gap-2"
                                                        >
                                                            <Shield className="w-3 h-3" /> Ver Senha
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm('Remover do Vault permanentemente?')) {
                                                                await fetch(`/api/clientes/certificados/${cert.id}`, { method: 'DELETE' })
                                                                fetchCertificados()
                                                            }
                                                        }}
                                                        className="p-1.5 text-neutral-800 hover:text-red-500 transition-colors"
                                                    >
                                                        <AlertTriangle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-amber-500/5 border-t border-neutral-800 text-center">
                            <p className="text-[8px] font-black text-amber-500/60 uppercase tracking-widest leading-relaxed">
                                Segurança AES-256 GCM Ativa. Todos os acessos são monitorados pelo Maestro.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
