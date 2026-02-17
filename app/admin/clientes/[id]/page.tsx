'use client'

import { useState, useEffect, use, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    FileText, History, Info, Shield,
    MessageSquare, Upload, ExternalLink,
    Lock, Calendar, CheckCircle2, AlertTriangle,
    Mic, Image as ImageIcon, FileCode, Search,
    ArrowLeft, MoreVertical, Plus, Hash,
    ChevronRight, LayoutDashboard, Settings,
    FileSearch, Activity, Cpu, Trash2, ShieldAlert,
    Zap, RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AgendaCalendar from '../components/AgendaCalendar'
import AgendaList from '../components/AgendaList'
import PendenciaModal from '../components/PendenciaModal'

export const dynamic = 'force-dynamic';

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
    const [showMappingModal, setShowMappingModal] = useState(false)
    const [mappingData, setMappingData] = useState<any>(null)
    const [mappingLoading, setMappingLoading] = useState(false)
    const [selectedRoutine, setSelectedRoutine] = useState<any>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Estados para Agenda de Pendências
    const [agendamentos, setAgendamentos] = useState<any[]>([])
    const [loadingAgendamentos, setLoadingAgendamentos] = useState(false)
    const [showPendenciaModal, setShowPendenciaModal] = useState(false)
    const [agendamentoEditando, setAgendamentoEditando] = useState<any | null>(null)

    const supabase = createClient()

    const fetchClientData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            // 1. Dados da Empresa (Schema CORE)
            const { data: c, error: cErr } = await supabase
                .schema('core')
                .from('empresas')
                .select('*')
                .eq('id', clientId)
                .single()
            if (cErr) throw new Error('Empresa não encontrada.')
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

            // 4. Obrigações do Ano/Mês (Schema FISCAL)
            const year = agora.getFullYear()
            const month = refDate.getMonth() + 1
            const { data: obr } = await supabase
                .schema('fiscal')
                .from('calendario')
                .select('*, template:template_id(nome, departamento)')
                .eq('empresa_id', clientId)
                .eq('ano_referencia', year)
                .eq('mes_referencia', month)

            setObrigacoes(obr || [])

        } catch (err: any) {
            console.error('[Hub Maestro Error]:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [clientId, supabase])

    const fetchCertificados = useCallback(async () => {
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
    }, [clientId])

    const fetchAgendamentos = useCallback(async () => {
        setLoadingAgendamentos(true)
        try {
            const res = await fetch(`/api/clientes/${clientId}/agendamentos`)
            const data = await res.json()
            if (res.ok) {
                setAgendamentos(Array.isArray(data) ? data : [])
            } else {
                console.error('Erro ao buscar agendamentos:', data.error)
            }
        } catch (err) {
            console.error('Erro de rede ao buscar agendamentos:', err)
        } finally {
            setLoadingAgendamentos(false)
        }
    }, [clientId])

    const [maestroDocs, setMaestroDocs] = useState<any[]>([])
    const [loadingMaestro, setLoadingMaestro] = useState(false)

    const fetchMaestroVision = useCallback(async () => {
        setLoadingMaestro(true)
        try {
            const { data, error } = await supabase
                .schema('compliance')
                .from('documentos_processados')
                .select(`
                    *,
                    doc:documento_id(drive_file_id, nome_arquivo)
                `)
                .eq('empresa_id', clientId)
                .order('processado_em', { ascending: false });

            if (error) throw error;
            setMaestroDocs(data || []);
        } catch (err) {
            console.error('Erro ao buscar Maestro Vision:', err);
        } finally {
            setLoadingMaestro(false)
        }
    }, [clientId, supabase])

    useEffect(() => {
        if (clientId) {
            fetchClientData()
            fetchCertificados()
            fetchAgendamentos()
            fetchMaestroVision()
        }
    }, [clientId, fetchClientData, fetchCertificados, fetchAgendamentos, fetchMaestroVision])

    async function handleSync() {
        setSyncing(true)
        try {
            const res = await fetch('/api/sync/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId, debug: true })
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'Falha na sincronização')

            // Salva dados de debug para o mapeamento manual se necessário
            if (result.results?.[0]?.debug) {
                setMappingData(result.results[0].debug)
            }

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

    async function openMappingDialog(routine: any) {
        setSelectedRoutine(routine)
        setShowMappingModal(true)

        // Se ainda não temos dados de mapeamento do último sync, buscamos em modo debug
        if (!mappingData) {
            setMappingLoading(true)
            try {
                const res = await fetch('/api/sync/audit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ clientId, debug: true })
                })
                const result = await res.json()
                if (result.results?.[0]?.debug) {
                    setMappingData(result.results[0].debug)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setMappingLoading(false)
            }
        }
    }

    async function handleManualLink(file: any) {
        setMappingLoading(true)
        try {
            const res = await fetch('/api/sync/audit/manual-map', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId,
                    tipo: selectedRoutine.tipo,
                    competencia: competenciaReferencia,
                    fileId: file.id,
                    fileName: file.name
                })
            })
            const result = await res.json()
            if (result.success) {
                setShowMappingModal(false)
                fetchClientData()
            } else {
                alert('Erro ao vincular: ' + result.error)
            }
        } catch (err) {
            console.error(err)
            alert('Falha crítica ao vincular arquivo.')
        } finally {
            setMappingLoading(false)
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


    // ========================================================================
    // FUNÇÕES DE GERENCIAMENTO DE AGENDAMENTOS
    // ========================================================================


    async function handleSalvarAgendamento(agendamentoData: any) {
        try {
            if (agendamentoEditando) {
                // Atualizar existente
                const res = await fetch(`/api/clientes/${clientId}/agendamentos`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        agendamentoId: agendamentoEditando.id,
                        ...agendamentoData
                    })
                })

                if (!res.ok) {
                    const error = await res.json()
                    throw new Error(error.error || 'Erro ao atualizar agendamento')
                }

                alert('✅ Agendamento atualizado com sucesso!')
            } else {
                // Criar novo
                const res = await fetch(`/api/clientes/${clientId}/agendamentos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(agendamentoData)
                })

                if (!res.ok) {
                    const error = await res.json()
                    throw new Error(error.error || 'Erro ao criar agendamento')
                }

                alert('✅ Agendamento criado com sucesso!')
            }

            setShowPendenciaModal(false)
            setAgendamentoEditando(null)
            await fetchAgendamentos()
        } catch (err: any) {
            console.error('Erro ao salvar agendamento:', err)
            alert(`❌ Erro: ${err.message}`)
        }
    }

    async function handleMarcarConcluido(agendamentoId: string) {
        try {
            const res = await fetch(`/api/clientes/${clientId}/agendamentos`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agendamentoId,
                    status: 'concluido'
                })
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Erro ao marcar como concluído')
            }

            await fetchAgendamentos()
        } catch (err: any) {
            console.error('Erro ao marcar concluído:', err)
            alert(`❌ Erro: ${err.message}`)
        }
    }

    async function handleExcluirAgendamento(agendamentoId: string) {
        if (!confirm('Deseja realmente excluir esta pendência?')) return

        try {
            const res = await fetch(`/api/clientes/${clientId}/agendamentos?agendamentoId=${agendamentoId}`, {
                method: 'DELETE'
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Erro ao excluir agendamento')
            }

            await fetchAgendamentos()
        } catch (err: any) {
            console.error('Erro ao excluir agendamento:', err)
            alert(`❌ Erro: ${err.message}`)
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

        const tipo = prompt(`Tipo do Certificado (A1 PJ ou A1 PF)?`, 'A1 PJ')

        try {
            const res = await fetch(`/api/clientes/certificados/${certId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, dataVencimento, tipo })
            })
            if (res.ok) {
                alert('MAESTRO: Certificado agora está protegido e classificado no Vault!')
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
                            <h1 className="text-4xl font-black text-white italic uppercase tracking-tight leading-none">{client?.razao_social || client?.nome}</h1>
                            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full">Ativo</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
                            <span className="flex items-center gap-1.5 bg-neutral-800/50 px-2 py-1 rounded border border-neutral-800"><Hash className="w-3.5 h-3.5 text-neutral-600" /> {client?.cnpj_cpf}</span>
                            <span className="flex items-center gap-1.5 bg-neutral-800/50 px-2 py-1 rounded border border-neutral-800 text-emerald-500"><Calendar className="w-3.5 h-3.5" /> COMPETÊNCIA: {new Date(competenciaReferencia + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}</span>
                            <span className="flex items-center gap-1.5 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 text-blue-400"><LayoutDashboard className="w-3.5 h-3.5" /> {client?.regime_tributario?.replace('_', ' ')}</span>
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
                            { id: 'info', label: 'Informações', icon: Info },
                            { id: 'timeline', label: 'Overview', icon: History },
                            { id: 'wiki', label: 'Dossiê Técnico', icon: FileText },
                            { id: 'docs', label: 'Arquivos & Drive', icon: FileCode },
                            { id: 'maestro', label: 'Maestro Vision', icon: Zap },
                            { id: 'agenda', label: 'Agenda', icon: Calendar },
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

                        {/* NOVA ABA: Informações Cadastrais */}
                        {activeTab === 'info' && (
                            <div className="space-y-6">
                                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8">Dados Cadastrais Completos</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Dados Básicos */}
                                    <div className="p-6 bg-black border border-neutral-800 rounded-xl space-y-4">
                                        <h4 className="text-[10px] font-black text-neutral-500 uppercase flex items-center gap-2">
                                            <Info className="w-3 h-3" />
                                            Identificação
                                        </h4>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-[8px] text-neutral-600 uppercase font-bold">Razão Social</p>
                                                <p className="text-[11px] text-white font-black">{client?.razao_social || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] text-neutral-600 uppercase font-bold">Nome Fantasia</p>
                                                <p className="text-[11px] text-white">{client?.nome || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] text-neutral-600 uppercase font-bold">CNPJ / CPF</p>
                                                <p className="text-[11px] text-white font-mono">{client?.cnpj_cpf || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] text-neutral-600 uppercase font-bold">Inscrição Estadual</p>
                                                <p className="text-[11px] text-white font-mono">{client?.inscricao_estadual || 'Isento'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contato */}
                                    <div className="p-6 bg-black border border-neutral-800 rounded-xl space-y-4">
                                        <h4 className="text-[10px] font-black text-neutral-500 uppercase flex items-center gap-2">
                                            <MessageSquare className="w-3 h-3" />
                                            Contato
                                        </h4>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-[8px] text-neutral-600 uppercase font-bold">Email</p>
                                                <p className="text-[11px] text-white">{client?.email || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] text-neutral-600 uppercase font-bold">Telefone</p>
                                                <p className="text-[11px] text-white font-mono">{client?.telefone || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] text-neutral-600 uppercase font-bold">Endereço</p>
                                                <p className="text-[11px] text-white">{client?.endereco || 'Não cadastrado'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tributação */}
                                    <div className="p-6 bg-black border border-neutral-800 rounded-xl space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Info className="w-4 h-4 text-emerald-500" />
                                            <h4 className="text-xs font-bold text-white uppercase tracking-wide">Overview Fiscal</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-[10px] text-neutral-500 uppercase font-semibold mb-1">Situação Cadastral</p>
                                                <p className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded inline-block">ATIVA</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-neutral-500 uppercase font-semibold mb-1">Regime Tributário</p>
                                                <p className="text-xs text-blue-400 font-bold uppercase">{client?.regime_tributario || 'Não Informado'}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[10px] text-neutral-500 uppercase font-semibold mb-1">Atividade Principal (CNAE)</p>
                                                <p className="text-xs text-neutral-300 leading-relaxed">{client?.cnae_principal ? `${client.cnae_principal} - ${client.cnaes || ''}` : 'Não cadastrado'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Certificados */}
                                    <div className="p-6 bg-black border border-neutral-800 rounded-xl space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-amber-500" />
                                                <h4 className="text-xs font-bold text-white uppercase tracking-wide">Certificados Digitais</h4>
                                            </div>
                                            {certificados.length > 3 && (
                                                <button onClick={() => setShowVault(true)} className="text-[10px] text-amber-500 hover:text-amber-400 font-bold uppercase">
                                                    Ver Todos
                                                </button>
                                            )}
                                        </div>

                                        {certificados.length === 0 ? (
                                            <div className="p-4 rounded-lg bg-neutral-900/30 border border-neutral-800 text-center">
                                                <p className="text-[10px] text-neutral-500">Nenhum certificado cadastrado</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {certificados.slice(0, 3).map((cert) => {
                                                    const isVencido = cert.data_vencimento && new Date(cert.data_vencimento) < new Date();
                                                    return (
                                                        <div key={cert.id} className="flex items-center justify-between p-3 bg-neutral-900/50 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-2 h-2 rounded-full ${isVencido ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                                                <span className="text-[11px] text-neutral-200 font-medium">{cert.tipo || 'A1'}</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[9px] text-neutral-500 uppercase font-semibold">Vencimento</p>
                                                                <span className={`text-[10px] font-bold ${isVencido ? 'text-red-500' : 'text-neutral-300'}`}>
                                                                    {cert.data_vencimento ? new Date(cert.data_vencimento).toLocaleDateString('pt-BR') : 'Sem data'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
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
                                        &quot;Baseado nos últimos 5 áudios do WhatsApp e nos arquivos PDF de competência enviados, este cliente tende a enviar o DAS no último dia do vencimento. Recomendo disparo de lembrete preventivo D-2.&quot;
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-black border border-neutral-800 rounded-xl space-y-2">
                                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Análise de Risco</p>
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-emerald-500" />
                                            <p className="text-sm font-bold text-emerald-400 uppercase">BAIXO RISCO FISCAL</p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-black border border-neutral-800 rounded-xl space-y-2">
                                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Next Action</p>
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-blue-500" />
                                            <p className="text-sm font-bold text-white uppercase">CONCILIAR EXTRATO</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'maestro' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-amber-500 text-black rounded-xl shadow-lg shadow-amber-500/20">
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Maestro Vision Engine</h3>
                                            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Inteligência Artificial e Conformidade Documental</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={fetchMaestroVision}
                                        className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-400 transition-all"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loadingMaestro ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>

                                {loadingMaestro ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                                        <Activity className="w-8 h-8 text-amber-500 animate-spin" />
                                        <p className="text-[10px] font-mono text-neutral-500 uppercase">Varrendo registros soberanos...</p>
                                    </div>
                                ) : maestroDocs.length === 0 ? (
                                    <div className="py-20 text-center bg-black/40 border border-neutral-800 rounded-2xl border-dashed">
                                        <Cpu className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                                        <h4 className="text-sm font-black text-neutral-500 uppercase italic">Aguardando Processamento</h4>
                                        <p className="text-[10px] text-neutral-600 mt-2 max-w-xs mx-auto">
                                            Os documentos enviados via MaestroSync ainda não passaram pelo radar de inteligência para este cliente.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {maestroDocs.map((doc) => (
                                            <div key={doc.id} className="group bg-black border border-neutral-800 p-6 rounded-2xl hover:border-amber-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-black/20">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 bg-neutral-900 rounded-xl flex items-center justify-center border border-neutral-800 group-hover:bg-amber-500/10 group-hover:border-amber-500/20 transition-all">
                                                        <FileText className="w-7 h-7 text-neutral-600 group-hover:text-amber-500 transition-colors" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[16px] font-black text-white italic uppercase tracking-tight">{doc.tipo}</span>
                                                            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase ${doc.status_processamento === 'sucesso' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                                {doc.status_processamento}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] font-mono text-neutral-500 uppercase truncate max-w-[200px]">
                                                            {doc.doc?.nome_arquivo || 'ARQUIVO_PROCESSADO.pdf'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-8 items-center bg-neutral-900/40 p-4 rounded-xl border border-neutral-800/50">
                                                    <div className="text-center md:text-left">
                                                        <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Competência</p>
                                                        <p className="text-[12px] font-black text-neutral-300">
                                                            {doc.competencia ? new Date(doc.competencia + 'T12:00:00').toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }) : '-'}
                                                        </p>
                                                    </div>
                                                    <div className="text-center md:text-left">
                                                        <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Vencimento</p>
                                                        <p className="text-[12px] font-black text-emerald-500 italic">
                                                            {doc.vencimento ? new Date(doc.vencimento + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                                                        </p>
                                                    </div>
                                                    <div className="text-center md:text-left">
                                                        <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Valor Extraído</p>
                                                        <p className="text-[14px] font-black text-white tracking-tight tabular-nums">
                                                            R$ {doc.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {doc.doc?.drive_file_id && (
                                                        <a
                                                            href={`https://drive.google.com/open?id=${doc.doc.drive_file_id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl border border-neutral-800 transition-all"
                                                            title="Ver Arquivo Original"
                                                        >
                                                            <ExternalLink className="w-5 h-5" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* NOVA ABA: Agenda de Pendências */}
                        {activeTab === 'agenda' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-white font-black text-xs uppercase tracking-[0.2em]">Agenda de Pendências</h3>
                                        <p className="text-[9px] font-mono text-neutral-600 uppercase mt-1">
                                            {agendamentos.filter(a => a.status === 'pendente').length} pendências ativas
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setAgendamentoEditando(null)
                                            setShowPendenciaModal(true)
                                        }}
                                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 text-[9px] font-black uppercase rounded transition-all shadow-xl shadow-emerald-500/10"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Nova Pendência
                                    </button>
                                </div>

                                {loadingAgendamentos ? (
                                    <div className="py-20 flex items-center justify-center">
                                        <Activity className="w-8 h-8 text-emerald-500 animate-spin" />
                                    </div>
                                ) : (
                                    <>
                                        {/* Calendário */}
                                        <AgendaCalendar
                                            agendamentos={agendamentos}
                                            onDayClick={(date, agendamentosDoDia) => {
                                                if (agendamentosDoDia.length > 0) {
                                                    // Scroll para a lista e destacar pendências do dia
                                                    console.log('Pendências do dia:', agendamentosDoDia)
                                                }
                                            }}
                                        />

                                        {/* Lista de Pendências */}
                                        <div>
                                            <h4 className="text-white font-black text-[10px] uppercase mb-4">Todas as Pendências</h4>
                                            <AgendaList
                                                agendamentos={agendamentos}
                                                onMarcarConcluido={handleMarcarConcluido}
                                                onEditar={(ag) => {
                                                    setAgendamentoEditando(ag)
                                                    setShowPendenciaModal(true)
                                                }}
                                                onExcluir={handleExcluirAgendamento}
                                            />
                                        </div>
                                    </>
                                )}
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
                                            <h3 className="text-white font-bold text-sm uppercase">Obrigações & Drive</h3>
                                            <p className="text-[10px] font-mono text-neutral-500 uppercase">Documentos Sincronizados • Jan/2026</p>
                                        </div>
                                    </div>
                                    {client?.drive_folder_id && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSync}
                                                disabled={syncing}
                                                className={`flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-[10px] font-bold uppercase text-emerald-500 rounded transition-all border border-emerald-500/20 ${syncing ? 'animate-pulse opacity-50' : ''}`}
                                            >
                                                <Activity className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                                                {syncing ? 'Sincronizando...' : 'Sincronizar'}
                                            </button>
                                            <button
                                                onClick={() => window.open(`https://drive.google.com/drive/folders/${client.drive_folder_id}`, '_blank')}
                                                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-[10px] font-bold uppercase text-white rounded transition-all border border-neutral-700"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" /> Abrir Drive
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {['DAS', 'FGTS', 'INSS', 'DCTFWeb', 'Folha de Pagamento'].map((tipo) => {
                                        const ob = obrigacoes.find(o => o.tipo.toUpperCase() === tipo.toUpperCase());
                                        const status = ob?.status || 'pendente';

                                        return (
                                            <div
                                                key={tipo}
                                                onClick={() => status !== 'concluido' && openMappingDialog({ tipo, status })}
                                                className={`p-5 bg-black border border-neutral-800 rounded-xl flex items-center justify-between group hover:border-emerald-500/30 transition-all cursor-pointer ${status !== 'concluido' ? 'hover:bg-neutral-900/50' : ''}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 bg-neutral-900 border border-neutral-800 flex items-center justify-center rounded-lg ${status === 'concluido' ? 'text-emerald-500' : 'text-neutral-500'} group-hover:text-emerald-500 transition-colors`}>
                                                        {status === 'concluido' ? <CheckCircle2 className="w-5 h-5" /> : <FileSearch className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white uppercase tracking-wide">{tipo === 'Folha de Pagamento' ? 'Folha de Pagamento' : tipo}</p>
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <Calendar className="w-3 h-3 text-neutral-600" />
                                                            <p className="text-[10px] font-semibold text-neutral-400 uppercase">
                                                                {new Date(competenciaReferencia + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] font-bold px-2 py-1 rounded border uppercase ${status === 'concluido' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                                        status === 'atrasado' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                                            'bg-neutral-900 border-neutral-800 text-neutral-500'
                                                        }`}>
                                                        {status === 'concluido' ? 'Sincronizado' : status === 'atrasado' ? 'Atrasado' : 'Vincular Arquivo'}
                                                    </span>
                                                    {status === 'concluido' ? (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    ) : (
                                                        <Search className="w-4 h-4 text-neutral-600 group-hover:text-emerald-500 transition-colors" />
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
                                            <label className="text-[8px] font-black text-neutral-500 uppercase">Tipo / Titularidade</label>
                                            <select name="tipo" required className="w-full bg-neutral-900 border border-neutral-800 p-3 rounded text-[10px] text-white uppercase font-bold">
                                                <option value="A1 PJ">A1 PJ (Empresa)</option>
                                                <option value="A1 PF">A1 PF (Pessoa Física / Fazenda)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-neutral-500 uppercase">Senha</label>
                                            <input type="password" name="password" placeholder="SENHA" required className="w-full bg-neutral-900 border border-neutral-800 p-3 rounded text-[10px] text-white font-mono" />
                                        </div>
                                        <div className="flex items-end">
                                            <button className="w-full bg-amber-500 text-black font-black text-[10px] uppercase p-3 hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/10">
                                                PROTEGER NO COFRE
                                            </button>
                                        </div>
                                    </div>
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
                                            <div key={cert.id} className={`p-4 bg-neutral-900/40 border ${cert.senha_dados === 'PENDENTE' ? 'border-amber-500/20' : 'border-neutral-800'} rounded-xl flex items-center justify-between group`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-lg ${cert.senha_dados === 'PENDENTE' ? 'bg-amber-500/10 text-amber-500 animate-pulse' : 'bg-neutral-900 text-amber-500'}`}>
                                                        <FileCode className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-[11px] font-black text-white uppercase">{cert.nome_arquivo}</p>
                                                            <span className={`text-[7px] ${cert.senha_dados === 'PENDENTE' ? 'bg-amber-500' : 'bg-neutral-800'} text-black px-1.5 py-0.5 font-black uppercase rounded`}>
                                                                {cert.tipo || 'A1'}
                                                            </span>
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
                                                                const pwd = prompt(`O Maestro localizou este certificado no Drive para este cliente.\nInforme a senha para criptografar agora:`)
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
                                                            if (confirm('MAESTRO: Remover este certificado do Vault permanentemente?')) {
                                                                const res = await fetch(`/api/clientes/certificados/${cert.id}`, { method: 'DELETE' })
                                                                if (res.ok) {
                                                                    fetchCertificados()
                                                                    alert('Certificado removido.')
                                                                }
                                                            }
                                                        }}
                                                        className="p-1.5 text-neutral-800 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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

            <MappingModal
                showMappingModal={showMappingModal}
                setShowMappingModal={setShowMappingModal}
                mappingLoading={mappingLoading}
                mappingData={mappingData}
                client={client}
                selectedRoutine={selectedRoutine}
                handleManualLink={handleManualLink}
            />

            {/* PendenciaModal AGORA NO LUGAR CORRETO (Dentro do ClientHubPage) */}
            <PendenciaModal
                isOpen={showPendenciaModal}
                onClose={() => {
                    setShowPendenciaModal(false)
                    setAgendamentoEditando(null)
                }}
                onSave={handleSalvarAgendamento}
                agendamento={agendamentoEditando}
                clientId={clientId}
            />
        </div>
    )
}

// Modal de Mapeamento Manual Maestro
function MappingModal({ showMappingModal, setShowMappingModal, mappingLoading, mappingData, client, selectedRoutine, handleManualLink }: any) {
    if (!showMappingModal) return null;
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-black">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500 text-black rounded-lg">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-white font-black text-sm uppercase italic">Explorador Maestro: {selectedRoutine?.tipo}</h3>
                            <p className="text-[9px] font-mono text-neutral-600 uppercase">Vincule o arquivo correto para ensinar a IA</p>
                        </div>
                    </div>
                </div>

                <div className="p-0 max-h-[60vh] overflow-y-auto bg-black/50">
                    {mappingLoading ? (
                        <div className="p-20 flex flex-col items-center justify-center space-y-4">
                            <Activity className="w-8 h-8 text-emerald-500 animate-spin" />
                            <p className="text-[10px] font-black text-neutral-500 uppercase animate-pulse">Consultando Drive de {client?.nome}...</p>
                        </div>
                    ) : mappingData?.filesFound?.length > 0 ? (
                        <div className="divide-y divide-neutral-900 border-b border-neutral-900">
                            {mappingData.filesFound
                                .sort((a: any, b: any) => new Date(b.createdTime || 0).getTime() - new Date(a.createdTime || 0).getTime())
                                .map((file: any) => (
                                    <div
                                        key={file.id}
                                        onClick={() => handleManualLink(file)}
                                        className="p-4 flex items-center justify-between hover:bg-emerald-500/5 cursor-pointer transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-neutral-900 border border-neutral-800 text-neutral-500 rounded group-hover:text-emerald-500 transition-colors">
                                                <FileCode className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-neutral-300 group-hover:text-emerald-400">{file.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[8px] font-mono text-neutral-600 uppercase italic">Pasta: {file.parentName}</p>
                                                    {file.createdTime && (
                                                        <span className="text-[8px] font-mono text-emerald-500/60 bg-emerald-500/5 px-1 rounded">
                                                            {new Date(file.createdTime).toLocaleDateString('pt-BR')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button className="px-3 py-1 bg-neutral-900 border border-neutral-800 text-[9px] font-black text-neutral-500 group-hover:bg-emerald-500 group-hover:text-black group-hover:border-emerald-500 transition-all uppercase italic rounded">
                                            Vincular
                                        </button>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className="p-20 text-center space-y-4">
                            <ShieldAlert className="w-8 h-8 text-red-500 mx-auto" />
                            <p className="text-[10px] font-black text-neutral-500 uppercase px-12 leading-relaxed">
                                Nenhum arquivo encontrado nas pastas contábeis do ano de 2026. Verifique se o arquivo está no Drive.
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-neutral-800 bg-black flex justify-end">
                    <button
                        onClick={() => setShowMappingModal(false)}
                        className="px-6 py-2 bg-neutral-900 border border-neutral-800 text-[10px] font-black text-white hover:bg-neutral-800 transition-all uppercase rounded"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}

