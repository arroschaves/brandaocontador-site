'use client'

import { useState, useEffect, use, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    FileText, History, Info, Shield,
    MessageSquare, Upload, ExternalLink,
    Lock, Calendar, CheckCircle2, AlertTriangle,
    Mic, Image as ImageIcon, FileCode, Search,
    ArrowLeft, MoreVertical, Plus, Hash,
    ChevronRight, ChevronLeft, LayoutDashboard, Settings,
    FileSearch, Activity, Cpu, Trash2, ShieldAlert,
    Zap, RefreshCw, Brain, TrendingUp, AlertCircle,
    MapPin, Eye, Edit, FolderOpen
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AgendaCalendar from '../components/AgendaCalendar'
import AgendaList from '../components/AgendaList'
import PendenciaModal from '../components/PendenciaModal'
import ContactsTab from '../components/ContactsTab'
import ServicesTab from '../components/ServicesTab'
import { User, Users, ShoppingCart } from 'lucide-react'

export const dynamic = 'force-dynamic';

export default function ClientHubPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: clientId } = use(params)
    const router = useRouter()
    const [client, setClient] = useState<any>(null)
    const [activeTab, setActiveTab] = useState<string>('timeline')
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

    const [selectedDate, setSelectedDate] = useState(new Date())

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

            // Determinar competência de exibição baseada na data selecionada
            const refStr = selectedDate.toISOString().split('T')[0]
            setCompetenciaReferencia(refStr)

            // 2. Histórico / Auditoria (Schema AUDIT)
            // Lendo do esquema audit.logs, filtrando por cliente
            const { data: h } = await supabase
                .schema('audit')
                .from('logs')
                .select('*')
                .eq('registro_id', clientId)
                .order('created_at', { ascending: false })
                .limit(30)

            setHistory(h || [])

            // 3. Wiki (Notas) - Schema CORE
            const { data: w, error: wErr } = await supabase
                .schema('core')
                .from('cliente_wiki')
                .select('conteudo')
                .eq('cliente_id', clientId)
                .maybeSingle()

            if (wErr && wErr.code !== 'PGRST116') {
                console.warn('Wiki not found or error:', wErr)
            }
            setWiki(w?.conteudo || '')

            // 4. Obrigações do Ano/Mês Selecionado (Schema FISCAL)
            const year = selectedDate.getFullYear()
            const month = selectedDate.getMonth() + 1
            const { data: obr } = await supabase
                .schema('fiscal')
                .from('obrigacoes')
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
    }, [clientId, supabase, selectedDate])

    const fetchCertificados = useCallback(async () => {
        setLoadingCerts(true)
        try {
            const { data, error } = await supabase
                .schema('core')
                .from('certificados')
                .select('*')
                .eq('empresa_id', clientId)
                .order('data_vencimento', { ascending: true });

            if (error) throw error;
            setCertificados(data || []);
        } catch (err) {
            console.error('Erro ao buscar certificados:', err)
        } finally {
            setLoadingCerts(false)
        }
    }, [clientId, supabase])

    const fetchAgendamentos = useCallback(async () => {
        setLoadingAgendamentos(true)
        try {
            const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).toISOString().split('T')[0]
            const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).toISOString().split('T')[0]

            const { data, error } = await supabase
                .schema('workflow')
                .from('tarefas')
                .select('*')
                .eq('empresa_id', clientId)
                .gte('data_limite', startOfMonth)
                .lte('data_limite', endOfMonth)
                .order('data_limite', { ascending: true });

            if (error) throw error;
            setAgendamentos(data || []);
        } catch (err) {
            console.error('Erro ao buscar agendamentos:', err)
        } finally {
            setLoadingAgendamentos(false)
        }
    }, [clientId, supabase, selectedDate])

    const [maestroDocs, setMaestroDocs] = useState<any[]>([])
    const [loadingMaestro, setLoadingMaestro] = useState(false)

    const fetchMaestroVision = useCallback(async () => {
        setLoadingMaestro(true)
        try {
            // Busca documentos processados para a competência selecionada
            const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).toISOString().split('T')[0]
            const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).toISOString().split('T')[0]

            const { data, error } = await supabase
                .schema('compliance')
                .from('documentos_processados')
                .select(`
                    *,
                    doc:documento_id(drive_file_id, nome_arquivo)
                `)
                .eq('empresa_id', clientId)
                .gte('competencia', startOfMonth)
                .lte('competencia', endOfMonth)
                .order('analisado_em', { ascending: false });

            if (error) throw error;
            setMaestroDocs(data || []);
        } catch (err) {
            console.error('Erro ao buscar Maestro Vision:', err);
        } finally {
            setLoadingMaestro(false)
        }
    }, [clientId, supabase, selectedDate])

    useEffect(() => {
        if (clientId) {
            fetchClientData()
            fetchCertificados()
            fetchAgendamentos()
            fetchMaestroVision()
        }
    }, [clientId, selectedDate, fetchClientData, fetchCertificados, fetchAgendamentos, fetchMaestroVision])

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

        try {
            // 1. Fase de Inteligência Maestro (OCR PDF-Parse)
            const visionData = new FormData()
            visionData.append('file', file)

            console.log('[Maestro Vision] Lendo arquivo em memória...')

            const visionRes = await fetch('/api/maestro/upload-inteligente', {
                method: 'POST',
                body: visionData
            })

            const visionResult = await visionRes.json()

            // 2. Montar Dados para o Upload Final (Google Drive) com a Renomeação Opcional
            const uploadData = new FormData()
            let routineToSave = ''

            // Se o motor reconheceu o PDF como um documento contábil
            if (visionRes.ok && visionResult.metadata?.tipo_documento !== 'Outros') {
                const meta = visionResult.metadata
                const newName = `${meta.tipo_documento}_${meta.competencia ? meta.competencia.replace('/', '-') : 'SemData'}_${meta.razao_social.substring(0, 15).trim()}.pdf`

                // Reconstrói o arquivo com nome sanitizado e preenche metadados
                const renamedFile = new File([file], newName, { type: file.type })
                uploadData.append('file', renamedFile)

                // Mapeamento OCR para as Templates Padrão (necessário pro histórico do Calendário)
                if (meta.tipo_documento === 'DAS') routineToSave = 'DAS'
                if (meta.tipo_documento === 'FGTS') routineToSave = 'FGTS'
                if (meta.tipo_documento === 'DARF') routineToSave = 'DARF'
                if (meta.tipo_documento === 'DCTFWeb') routineToSave = 'DCTFWeb'

                console.log(`[Maestro Vision] Sucesso! PDF LIDO. Identificado CNPJ: ${meta.cnpj_encontrado}. Tipo: ${meta.tipo_documento}`)
            } else {
                // Upload comum sem mutação
                uploadData.append('file', file)
                const fileName = file.name.toUpperCase()
                if (fileName.includes('DAS')) routineToSave = 'DAS'
                else if (fileName.includes('FGTS')) routineToSave = 'FGTS'
                else if (fileName.includes('INSS')) routineToSave = 'INSS'
                else if (fileName.includes('DCTF')) routineToSave = 'DCTFWeb'
                else if (fileName.includes('FOLHA')) routineToSave = 'Folha de Pagamento'
            }

            uploadData.append('clientId', clientId)
            if (routineToSave) {
                uploadData.append('routineName', routineToSave)
            }

            // 3. Fase Final: Enviar pro Drive e Banco
            const res = await fetch('/api/drive/upload', {
                method: 'POST',
                body: uploadData
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'Falha no upload do Drive')

            await fetchClientData()

            // Re-render Maestro
            if (fetchMaestroVision) {
                await fetchMaestroVision()
            }

            alert(visionRes.ok && visionResult.metadata?.tipo_documento !== 'Outros' ? `🤖 MAESTRO VISION: Documento identificado como [${visionResult.metadata.tipo_documento}] e arquivado automaticamente!` : 'Arquivo enviado com sucesso.')

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
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-neutral-900 gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/admin/clientes')} className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl hover:bg-neutral-900 transition-all text-neutral-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-[10px] font-black text-neutral-600 uppercase tracking-widest">
                            <Link href="/admin" className="hover:text-neutral-400">ADMIN</Link>
                            <ChevronRight className="w-3 h-3" />
                            <Link href="/admin/clientes" className="hover:text-neutral-400">CLIENTES</Link>
                        </div>
                        <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
                            Hub do Cliente <span className="text-emerald-500">#{(client?.nome_fantasia || client?.razao_social)?.substring(0, 5) || 'MAESTRO'}</span>
                        </h2>
                    </div>
                </div>

                <div className="flex items-center bg-neutral-900/80 border border-neutral-800 p-1.5 rounded-2xl gap-2">
                    <button
                        onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                        className="p-2 hover:bg-neutral-800 rounded-xl text-neutral-500 hover:text-white transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="px-6 flex flex-col items-center min-w-[160px]">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">Competência</span>
                        <span className="text-[14px] font-black text-white uppercase italic tracking-tight">
                            {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(' de ', ' ')}
                        </span>
                    </div>
                    <button
                        onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                        className="p-2 hover:bg-neutral-800 rounded-xl text-neutral-500 hover:text-white transition-all"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-2.5 bg-neutral-950 border border-neutral-800 text-neutral-500 hover:text-white rounded-xl hover:bg-neutral-900 transition-all"><Settings className="w-5 h-5" /></button>
                    <button className="bg-emerald-500 text-black px-6 py-2.5 text-[10px] font-black uppercase flex items-center gap-2 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20">
                        <Plus className="w-4 h-4" /> Nova Demanda
                    </button>
                </div>
            </div>

            {/* Client Top Card - Bento UI */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="md:col-span-3 bg-neutral-900/50 border border-neutral-800 p-8 rounded-2xl flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="w-24 h-24 bg-neutral-800 border-2 border-emerald-500/20 flex items-center justify-center rounded-2xl shadow-2xl">
                        <span className="text-3xl font-black text-white italic">{client?.nome?.substring(0, 2)?.toUpperCase() || 'HB'}</span>
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black text-white italic uppercase tracking-tight leading-none">{client?.nome_fantasia || client?.razao_social || 'CLIENTE MAESTRO'}</h1>
                            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full">Ativo</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
                            <span className="flex items-center gap-1.5 bg-neutral-800/50 px-2 py-1 rounded border border-neutral-800"><Hash className="w-3.5 h-3.5 text-neutral-600" /> {client?.cnpj_cpf || client?.cnpj || '-'}</span>
                            <span className="flex items-center gap-1.5 bg-neutral-800/50 px-2 py-1 rounded border border-neutral-800 text-emerald-500"><Calendar className="w-3.5 h-3.5" /> COMPETÊNCIA: {competenciaReferencia ? new Date(competenciaReferencia + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase() : '-'}</span>
                            <span className="flex items-center gap-1.5 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 text-blue-400"><LayoutDashboard className="w-3.5 h-3.5" /> {client?.regime_tributario?.replace(/_/g, ' ') || client?.regime_atual || '-'}</span>
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
                            { id: 'info', label: 'Cadastro', icon: Info },
                            { id: 'contatos', label: 'Sócios & Contatos', icon: Users },
                            { id: 'servicos', label: 'Planos & Serviços', icon: ShoppingCart },
                            { id: 'timeline', label: 'Atividade Recente', icon: History },
                            { id: 'wiki', label: 'Dossiê Técnico', icon: FileText },
                            { id: 'docs', label: 'Arquivos Drive', icon: FileCode },
                            { id: 'maestro', label: 'Maestro Vision', icon: Zap },
                            { id: 'agenda', label: 'Calendário / Agenda', icon: Calendar },
                            { id: 'ia', label: 'Brain IA Insights', icon: Brain }
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === t.id ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <t.icon className={`w-4 h-4 ${activeTab === t.id ? 'animate-pulse' : ''}`} />
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-8 min-h-[600px] shadow-2xl shadow-black/40">
                        {activeTab === 'contatos' && (
                            <ContactsTab clientId={clientId} />
                        )}

                        {activeTab === 'servicos' && (
                            <ServicesTab clientId={clientId} />
                        )}

                        {activeTab === 'timeline' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] italic">Atividade Recente (Fluxo do Sistema)</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="text-[9px] font-bold text-neutral-500 uppercase">Audit Log Ativo</span>
                                    </div>
                                </div>
                                {history.length === 0 ? (
                                    <div className="py-20 text-center bg-black/20 border border-dashed border-neutral-800 rounded-2xl">
                                        <History className="w-10 h-10 text-neutral-800 mx-auto mb-4" />
                                        <p className="text-[10px] text-neutral-600 uppercase italic">Nenhum registro de auditoria para este período.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-neutral-800">
                                        {history.map((log, i) => (
                                            <div key={i} className="relative pl-8 animate-in slide-in-from-left duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                                <div className="absolute left-0 top-1 w-[24px] h-[24px] bg-black border-2 border-neutral-800 flex items-center justify-center rounded-lg group-hover:border-emerald-500 transition-all">
                                                    <Activity className={`w-3 h-3 ${log.acao.includes('ERRO') ? 'text-red-500' : 'text-emerald-500'}`} />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[11px] font-black text-white uppercase italic">
                                                            {log.acao === 'UPLOAD' ? '📁 Arquivo Sincronizado' :
                                                                log.acao === 'SISTEMA' ? '⚙️ Processamento AI' :
                                                                    log.acao === 'ACESSO_VAULT' ? '🔐 Acesso ao Vault' :
                                                                        log.acao === 'VISUALIZACAO_SENHA' ? '👁️ Senha Consultada' :
                                                                            log.acao === 'EDICAO_CADASTRO' ? '📝 Cadastro Atualizado' :
                                                                                log.acao === 'ENRIQUECIMENTO' ? '✨ Inteligência de Dados' :
                                                                                    log.acao?.replace('_', ' ')}
                                                        </span>
                                                        <span className="text-[9px] font-mono text-neutral-600">
                                                            {new Date(log.created_at).toLocaleString('pt-BR')}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-neutral-400 bg-black/40 p-4 border border-neutral-800 rounded-xl leading-relaxed">
                                                        {log.detalhes || log.descricao || log.dados_novos?.detalhes || 'Operação registrada pelo núcleo do sistema.'}
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
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] italic">Cadastro Soberano do Cliente</h3>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => router.push(`/admin/clientes?id=${clientId}&edit=true`)}
                                            className="bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white px-4 py-2 text-[10px] font-black uppercase flex items-center gap-2 rounded-xl transition-all hover:bg-neutral-800"
                                        >
                                            <Edit className="w-3.5 h-3.5" /> Editar
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (confirm('Tem certeza absoluta que deseja excluir este cliente? Esta ação é irreversível e pode gerar inconsistências nos logs de auditoria e documentos arquivados.')) {
                                                    try {
                                                        const res = await fetch(`/api/clientes/${clientId}`, { method: 'DELETE' });
                                                        if (!res.ok) {
                                                            const err = await res.json();
                                                            throw new Error(err.error || 'Erro ao excluir');
                                                        }
                                                        alert('Cliente excluído com sucesso.');
                                                        router.push('/admin/clientes');
                                                    } catch (err: any) {
                                                        alert(`Erro: ${err.message}`);
                                                    }
                                                }
                                            }}
                                            className="bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 px-4 py-2 text-[10px] font-black uppercase flex items-center gap-2 rounded-xl transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Excluir
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Identificação */}
                                    <div className="p-8 bg-black border border-neutral-800 rounded-3xl space-y-6 shadow-2xl shadow-black/40 group hover:border-emerald-500/30 transition-all">
                                        <h4 className="text-[11px] font-black text-muted-foreground uppercase flex items-center gap-3">
                                            <div className="w-5 h-5 bg-secondary rounded-lg flex items-center justify-center border border-border group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                                                <Info className="w-3.5 h-3.5 text-primary" />
                                            </div>
                                            Identificação Legal
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[11px] text-muted-foreground uppercase font-black tracking-widest mb-1 leading-none">Razão Social</p>
                                                <p className="text-[15px] text-white font-black italic uppercase tracking-tighter truncate" title={client?.razao_social}>{client?.razao_social || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-muted-foreground uppercase font-black tracking-widest mb-1 leading-none">Nome Fantasia</p>
                                                <p className="text-[15px] text-emerald-500 font-black italic uppercase tracking-tighter truncate" title={client?.nome_fantasia}>{client?.nome_fantasia || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-[11px] text-muted-foreground uppercase font-black tracking-widest mb-1 leading-none">CNPJ / CPF</p>
                                                <p className="text-[13px] text-white font-mono font-black">{client?.cnpj_cpf || client?.cnpj || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-muted-foreground uppercase font-black tracking-widest mb-1 leading-none">Ins. Estadual</p>
                                                <p className="text-[13px] text-white font-mono">{client?.inscricao_estadual || 'Isenta'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-muted-foreground uppercase font-black tracking-widest mb-1 leading-none">Ins. Municipal</p>
                                                <p className="text-[13px] text-white font-mono">{client?.inscricao_municipal || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Overview Fiscal */}
                                <div className="p-8 bg-black border border-neutral-800 rounded-3xl space-y-6 shadow-2xl shadow-black/40 group hover:border-blue-500/30 transition-all">
                                    <h4 className="text-[11px] font-black text-muted-foreground uppercase flex items-center gap-3">
                                        <div className="w-5 h-5 bg-secondary rounded-lg flex items-center justify-center border border-border group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all">
                                            <Shield className="w-3.5 h-3.5 text-blue-500" />
                                        </div>
                                        Enquadramento Tributário
                                    </h4>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-[11px] text-muted-foreground uppercase font-black tracking-widest mb-1 leading-none">Regime Atual</p>
                                            <p className="text-[14px] text-blue-400 font-black uppercase italic">{client?.regime_tributario?.replace(/_/g, ' ') || client?.regime_atual || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-muted-foreground uppercase font-black tracking-widest mb-1 leading-none">Situação RFB</p>
                                            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase rounded-full">{client?.status_rfb || 'Ativa'}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-[9px] text-neutral-600 uppercase font-black tracking-widest mb-1">Atividade Principal (CNAE)</p>
                                            <p className="text-[11px] text-neutral-300 leading-relaxed font-medium">
                                                {client?.cnae_principal ? (
                                                    <span className="flex flex-col gap-1">
                                                        <span className="text-white font-bold">{client.cnae_principal}</span>
                                                        <span className="text-[10px] text-neutral-500">{client.cnaes_secundarios || ''}</span>
                                                    </span>
                                                ) : 'Não parametrizado no Cérebro.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Localização (NOVO) */}
                                <div className="p-8 bg-black border border-neutral-800 rounded-3xl space-y-6 shadow-2xl shadow-black/40 group hover:border-neutral-500/30 transition-all">
                                    <h4 className="text-[10px] font-black text-neutral-500 uppercase flex items-center gap-3">
                                        <div className="w-5 h-5 bg-neutral-900 rounded-lg flex items-center justify-center border border-neutral-800">
                                            <MapPin className="w-3 h-3 text-neutral-400" />
                                        </div>
                                        Localização / Sede
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[11px] text-muted-foreground uppercase font-black tracking-widest mb-2 leading-none">Endereço Completo</p>
                                            <p className="text-[14px] text-white font-bold uppercase tracking-tight leading-tight">
                                                {client?.logradouro ? `${client.logradouro}, ${client.numero || 'S/N'}` : '-'}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground uppercase italic pb-2 border-b border-border/10">
                                                {client?.bairro} {client?.cep ? `• CEP: ${client.cep}` : ''}
                                            </p>
                                            <p className="text-[11px] text-neutral-400 font-black">
                                                {client?.cidade} / {client?.estado}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contato e Presença */}
                                <div className="p-8 bg-black border border-neutral-800 rounded-3xl space-y-6 shadow-2xl shadow-black/40 group hover:border-neutral-500/30 transition-all">
                                    <h4 className="text-[10px] font-black text-neutral-500 uppercase flex items-center gap-3">
                                        <div className="w-5 h-5 bg-neutral-900 rounded-lg flex items-center justify-center border border-neutral-800">
                                            <MessageSquare className="w-3 h-3 text-neutral-400" />
                                        </div>
                                        Canais de Comunicação
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex items-center gap-4 p-3 bg-neutral-900/50 rounded-xl border border-neutral-800">
                                            <div className="text-emerald-500 font-black text-xs">WA</div>
                                            <div>
                                                <p className="text-[8px] text-neutral-600 uppercase font-black">WhatsApp</p>
                                                <p className="text-[11px] text-white font-mono">{client?.telefone_whatsapp || client?.telefone || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-3 bg-neutral-900/50 rounded-xl border border-neutral-800">
                                            <div className="text-blue-500 font-black text-xs">@</div>
                                            <div>
                                                <p className="text-[8px] text-neutral-600 uppercase font-black">E-mail Fiscal</p>
                                                <p className="text-[11px] text-white font-mono">{client?.email || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Certificados ativos */}
                                <div className="p-8 bg-black border border-neutral-800 rounded-3xl space-y-6 shadow-2xl shadow-black/40 group hover:border-amber-500/30 transition-all">
                                    <h4 className="text-[10px] font-black text-neutral-500 uppercase flex items-center gap-3">
                                        <div className="w-5 h-5 bg-neutral-900 rounded-lg flex items-center justify-center border border-neutral-800">
                                            <ShieldAlert className="w-3 h-3 text-amber-500" />
                                        </div>
                                        Proteção Certificados (Vault)
                                    </h4>
                                    <div className="space-y-3">
                                        {certificados.length === 0 ? (
                                            <div className="p-6 bg-neutral-900/40 border border-dashed border-neutral-800 rounded-2xl text-center">
                                                <p className="text-[9px] text-neutral-600 uppercase italic">Nenhum certificado no cofre.</p>
                                            </div>
                                        ) : (
                                            certificados.slice(0, 2).map((cert, i) => {
                                                const isVencendo = cert.data_vencimento && new Date(cert.data_vencimento) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                                                return (
                                                    <div key={i} className="flex items-center justify-between p-4 bg-neutral-900/30 border border-neutral-800 rounded-2xl">
                                                        <div>
                                                            <p className="text-[10px] text-white font-black truncate max-w-[150px] uppercase italic">{cert.nome_arquivo || 'Certificado A1'}</p>
                                                            <p className={`text-[9px] font-bold mt-0.5 ${isVencendo ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                                                                Vence em: {cert.data_vencimento ? new Date(cert.data_vencimento).toLocaleDateString() : 'N/D'}
                                                            </p>
                                                        </div>
                                                        <div className="p-2 bg-black border border-neutral-800 rounded-lg">
                                                            <Lock className="w-3 h-3 text-amber-500" />
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        )}
                                        {certificados.length > 2 && (
                                            <button onClick={() => setShowVault(true)} className="w-full py-2 text-[9px] font-black text-neutral-500 hover:text-white uppercase transition-all">
                                                + {certificados.length - 2} certificados no cofre
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'ia' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right duration-700">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20">
                                            <Brain className="w-6 h-6 text-black" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] italic">Brain Maestro Predictor</h3>
                                            <p className="text-[10px] text-neutral-500 uppercase font-black">Motor Preditivo & Análise de Conformidade Soberana</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="col-span-1 p-8 bg-black border border-neutral-800 rounded-[2.5rem] space-y-6 group hover:border-emerald-500/40 transition-all">
                                        <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-3">
                                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                            Compliance Score
                                        </h4>
                                        <div className="flex items-end gap-3">
                                            <span className="text-6xl font-black text-white italic leading-none tracking-tighter">
                                                {Math.round((obrigacoes.filter(o => o.status === 'concluido').length / (obrigacoes.length || 1)) * 100)}
                                            </span>
                                            <span className="text-emerald-500 font-black text-xl mb-1">%</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed uppercase font-bold italic">Saúde de conformidade para o ciclo de {selectedDate.toLocaleDateString('pt-BR', { month: 'long' })}.</p>
                                    </div>

                                    <div className="col-span-2 p-8 bg-black border border-neutral-800 rounded-[2.5rem] space-y-6 group hover:border-amber-500/40 transition-all">
                                        <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-3">
                                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                            Alertas Preditivos do Maestro
                                        </h4>
                                        <div className="space-y-4">
                                            {certificados.some(c => c.data_vencimento && new Date(c.data_vencimento) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) ? (
                                                <div className="flex items-start gap-4 p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl animate-pulse">
                                                    <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
                                                    <div>
                                                        <p className="text-[11px] text-white font-black uppercase tracking-tight">Risco de Interrupção Operacional</p>
                                                        <p className="text-[10px] text-neutral-500 font-medium leading-relaxed mt-1">
                                                            Certificado Digital ({certificados.find(c => new Date(c.data_vencimento) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))?.nome_arquivo}) expirando em breve.
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-start gap-4 p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                                                    <div>
                                                        <p className="text-[11px] text-white font-black uppercase tracking-tight">Vigilância Estável</p>
                                                        <p className="text-[10px] text-neutral-500 font-medium leading-relaxed mt-1">
                                                            Nenhum risco de conformidade crítica detectado para os próximos 15 dias.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-start gap-4 p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                                                <Zap className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
                                                <div>
                                                    <p className="text-[11px] text-white font-black uppercase tracking-tight">Oportunidade de Automação</p>
                                                    <p className="text-[10px] text-neutral-500 font-medium leading-relaxed mt-1">
                                                        O padrão de recebimento de documentos deste cliente permite ativação do Maestro Eye 2.0.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'maestro' && (
                            <div className="space-y-8 animate-in zoom-in-95 duration-500">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                                            <Zap className="w-7 h-7 text-black" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-black text-xl uppercase tracking-[0.2em] italic">Maestro Vision Engine</h3>
                                            <p className="text-[10px] font-mono text-neutral-600 uppercase mt-1">Cérebro AI e Extração de Soberania de Dados</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={fetchMaestroVision}
                                        className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-500 hover:text-emerald-500 transition-all group"
                                    >
                                        <RefreshCw className={`w-5 h-5 ${loadingMaestro ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                                    </button>
                                </div>

                                {loadingMaestro ? (
                                    <div className="py-32 flex flex-col items-center justify-center gap-6 bg-black/40 border border-neutral-800 rounded-[3rem]">
                                        <Activity className="w-12 h-12 text-emerald-500 animate-spin" />
                                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] animate-pulse italic">Mapeando Registros Soberanos...</span>
                                    </div>
                                ) : maestroDocs.length === 0 ? (
                                    <div className="py-32 text-center bg-black border border-dashed border-neutral-800 rounded-[3rem] group hover:border-emerald-500/40 transition-all">
                                        <div className="relative w-24 h-24 mx-auto mb-8">
                                            <Eye className="w-full h-full text-neutral-900 absolute inset-0" />
                                            <Brain className="w-12 h-12 text-emerald-500/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                        </div>
                                        <p className="text-sm text-neutral-500 uppercase italic font-black tracking-widest">Nenhuma soberania extraída para este ciclo</p>
                                        <p className="text-[10px] text-neutral-700 uppercase mt-2 font-mono tracking-tighter">Aguardando processamento do motor Maestro Vision em {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {maestroDocs.map((doc, i) => (
                                            <div key={i} className="p-8 bg-black border border-neutral-800 rounded-[2.5rem] hover:border-emerald-500/40 transition-all group relative overflow-hidden shadow-2xl shadow-black/40">
                                                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                                    <Brain className="w-32 h-32 text-emerald-500" />
                                                </div>

                                                <div className="flex justify-between items-start mb-8">
                                                    <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-[1.5rem] text-emerald-500 shadow-inner group-hover:scale-110 transition-transform">
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border uppercase tracking-widest shadow-lg ${doc.status_processamento === 'sucesso' ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-amber-500 text-black border-amber-400'}`}>
                                                            {doc.status_processamento === 'sucesso' ? 'Soberano' : 'Pendente'}
                                                        </span>
                                                        <span className="text-[8px] font-mono text-neutral-700 uppercase tracking-tighter">ID: {doc.id.substring(0, 8)}</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div>
                                                        <p className="text-[11px] text-muted-foreground uppercase font-black tracking-widest leading-none mb-2">Natureza do Documento</p>
                                                        <p className="text-xl text-white font-black italic uppercase tracking-tighter group-hover:text-emerald-500 transition-colors">{doc.tipo_documento || 'Extração AI'}</p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-6 bg-neutral-900/40 p-6 rounded-[2rem] border border-neutral-800/50">
                                                        <div>
                                                            <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Valor Auditado</p>
                                                            <p className="text-xl text-emerald-500 font-black tabular-nums tracking-tighter leading-none">
                                                                {doc.valor ? `R$ ${doc.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Vencimento</p>
                                                            <p className="text-xl text-white font-black tabular-nums tracking-tighter leading-none italic uppercase">
                                                                {doc.vencimento ? new Date(doc.vencimento + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '--/--'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="pt-6 border-t border-neutral-900 flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            <p className="text-[7px] text-neutral-700 uppercase font-black tracking-widest">Processamento Soberano</p>
                                                            <p className="text-[10px] text-neutral-500 font-mono italic">{new Date(doc.analisado_em).toLocaleString('pt-BR')}</p>
                                                        </div>
                                                        <a
                                                            href={`https://drive.google.com/open?id=${doc.doc?.drive_file_id}`}
                                                            target="_blank"
                                                            className="p-3.5 bg-neutral-900 hover:bg-emerald-500 hover:text-black rounded-2xl border border-neutral-800 hover:border-emerald-400 transition-all shadow-xl group/btn active:scale-95"
                                                            title="Acessar Fonte Original no Google Drive"
                                                        >
                                                            <ExternalLink className="w-5 h-5" />
                                                        </a>
                                                    </div>
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
                                        <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] italic">Agenda de Pendências</h3>
                                        <p className="text-[11px] font-mono text-muted-foreground uppercase mt-1 leading-none">
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
                                            <p className="text-[11px] font-mono text-muted-foreground uppercase leading-none">
                                                Documentos Sincronizados • {new Date(competenciaReferencia + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).toUpperCase()}
                                            </p>
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
                                        const ob = obrigacoes.find(o => (o.template?.nome || '').toUpperCase() === tipo.toUpperCase());
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
                                                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">
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
            {/* Modal Vault - Certificados Showroom Premium */}
            {
                showVault && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-full max-w-5xl bg-neutral-950 border border-neutral-800 rounded-[3rem] shadow-[0_0_100px_-20px_rgba(245,158,11,0.15)] overflow-hidden flex flex-col md:flex-row h-full max-h-[85vh]">

                            {/* Lateral Esquerda: Formulário de Ingestão (40%) */}
                            <div className="w-full md:w-[400px] bg-black border-r border-neutral-900 p-10 flex flex-col space-y-10 overflow-y-auto">
                                <div className="space-y-2">
                                    <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/20 mb-6">
                                        <Shield className="w-7 h-7 text-black" />
                                    </div>
                                    <h2 className="text-white font-black text-xl uppercase italic tracking-tighter leading-none">Safe Ingest Engine</h2>
                                    <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Protocolo de Segurança Nível 4 • AES-256</p>
                                </div>

                                <form className="space-y-6" onSubmit={async (e) => {
                                    e.preventDefault()
                                    const form = e.target as HTMLFormElement
                                    const formData = new FormData(form)
                                    formData.append('clientId', clientId)

                                    try {
                                        const res = await fetch('/api/clientes/certificados', { method: 'POST', body: formData })
                                        const result = await res.json()

                                        if (res.ok) {
                                            alert('MAESTRO: Ativo digital protegido com sucesso no núcleo do sistema!')
                                            form.reset()
                                            fetchCertificados()
                                            fetchClientData()
                                        } else {
                                            throw new Error(result.error || 'Falha crítica na ingestão do ativo.')
                                        }
                                    } catch (err: any) {
                                        console.error('Erro no Vault:', err)
                                        alert(`ERRO NO NÚCLEO: ${err.message}`)
                                    }
                                }}>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em]">Data de Emissão (Source)</label>
                                            <input
                                                type="date"
                                                name="emissao"
                                                required
                                                className="w-full bg-neutral-900/40 border border-neutral-800 p-4 rounded-2xl text-[11px] text-white focus:border-amber-500/50 outline-none transition-all font-bold"
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
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em]">Expiração Calculada (AI Sync)</label>
                                            <input type="date" name="vencimento" readOnly className="w-full bg-black border border-neutral-900 p-4 rounded-2xl text-[11px] text-amber-500/60 font-black cursor-not-allowed" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em]">Tipo de Credencial</label>
                                            <select name="tipo" required className="w-full bg-neutral-900/40 border border-neutral-800 p-4 rounded-2xl text-[11px] text-white uppercase font-black outline-none appearance-none">
                                                <option value="A1 PJ">A1 PJ (Empresarial)</option>
                                                <option value="A1 PF">A1 PF (Sócio / Fazenda)</option>
                                                <option value="A3 TOKEN">A3 Token (Hardware)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em]">Payload (Arquivo .pfx / .p12)</label>
                                            <div className="relative">
                                                <input type="file" name="file" required className="w-full bg-neutral-900/40 border border-neutral-800 p-4 rounded-2xl text-[10px] text-neutral-500 font-bold file:hidden cursor-pointer" />
                                                <Upload className="absolute right-4 top-4 w-4 h-4 text-neutral-700" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em]">Chave de Criptografia (Senha)</label>
                                            <div className="relative">
                                                <input type="password" name="password" placeholder="••••••••" required className="w-full bg-neutral-900/40 border border-neutral-800 p-4 rounded-2xl text-[11px] text-white font-mono focus:border-emerald-500/50 outline-none transition-all" />
                                                <Lock className="absolute right-4 top-4 w-4 h-4 text-emerald-500/50" />
                                            </div>
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full bg-white text-black font-black text-xs uppercase italic p-5 rounded-2xl hover:bg-emerald-500 transition-all shadow-xl shadow-white/5 group border-b-4 border-neutral-300 hover:border-emerald-600 active:border-b-0 active:translate-y-1">
                                        <span className="flex items-center justify-center gap-2">
                                            <Activity className="w-4 h-4 group-hover:animate-spin" /> Injetar Ativo no Cofre
                                        </span>
                                    </button>
                                </form>
                            </div>

                            {/* Lateral Direita: Listagem e Visualização (60%) */}
                            <div className="flex-1 flex flex-col min-w-0 bg-neutral-950">
                                <div className="p-10 border-b border-neutral-900 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-white font-black text-sm uppercase italic tracking-[0.2em]">Active Records Vault</h3>
                                        <p className="text-[10px] text-neutral-500 uppercase font-black">{certificados.length} Certificados Armazenados</p>
                                    </div>
                                    <button onClick={() => setShowVault(false)} className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all group">
                                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-10 space-y-6">
                                    {certificados.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20 grayscale">
                                            <ShieldAlert className="w-20 h-20 text-neutral-500" />
                                            <p className="text-[11px] font-black uppercase tracking-widest text-center">Nenhum Ativo Identificado no Perímetro.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                            {certificados.map((cert) => {
                                                const isVencendo = cert.data_vencimento && new Date(cert.data_vencimento) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                                                return (
                                                    <div key={cert.id} className={`group relative p-8 bg-black border ${cert.senha_dados === 'PENDENTE' ? 'border-amber-500/40 shadow-lg shadow-amber-500/5' : 'border-neutral-900'} rounded-[2rem] hover:border-blue-500/40 transition-all overflow-hidden`}>
                                                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                                            <FileCode className="w-16 h-16 text-blue-500" />
                                                        </div>

                                                        <div className="relative space-y-6">
                                                            <div className="flex items-start justify-between">
                                                                <div className={`p-4 rounded-2xl border ${cert.senha_dados === 'PENDENTE' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}>
                                                                    <FileCode className="w-6 h-6" />
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase italic border ${cert.senha_dados === 'PENDENTE' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                                                                        {cert.senha_dados === 'PENDENTE' ? 'PENDÊNCIA' : 'SECURE'}
                                                                    </span>
                                                                    <span className="bg-neutral-900 border border-neutral-800 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase italic">
                                                                        {cert.tipo || 'A1_V1'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <h4 className="text-white font-black text-sm uppercase italic tracking-tighter truncate group-hover:text-blue-400 transition-colors">{cert.nome_arquivo}</h4>
                                                                <p className={`text-[10px] font-bold mt-2 uppercase tracking-widest ${isVencendo ? 'text-red-500 animate-pulse' : 'text-neutral-600'}`}>
                                                                    {isVencendo ? 'Protocolo de Expiração Ativo: ' : 'Vigência do Certificado: '}
                                                                    <span className="text-neutral-400">{cert.data_vencimento ? new Date(cert.data_vencimento).toLocaleDateString() : 'INDISPONÍVEL'}</span>
                                                                </p>
                                                            </div>

                                                            <div className="flex items-center gap-3 pt-4 border-t border-neutral-900">
                                                                {cert.senha_dados === 'PENDENTE' ? (
                                                                    <button
                                                                        onClick={() => {
                                                                            const pwd = prompt(`PROTOCOL MAESTRO: Informe a senha de importação para este ativo:`)
                                                                            if (pwd) handleUpdateCertPassword(cert.id, pwd)
                                                                        }}
                                                                        className="flex-1 bg-amber-500 text-black text-[10px] font-black px-6 py-3 rounded-xl hover:bg-white transition-all uppercase italic"
                                                                    >
                                                                        Configurar Nucleus
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleViewPassword(cert.id)}
                                                                        className="flex-1 bg-neutral-900 border border-neutral-800 text-white text-[10px] font-black px-6 py-3 rounded-xl hover:border-emerald-500 transition-all uppercase italic flex items-center justify-center gap-2"
                                                                    >
                                                                        <Shield className="w-3.5 h-3.5" /> Acessar Key
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={async () => {
                                                                        if (confirm('SISTEMA MAESTRO: Deletar permanentemente este ativo digital do núcleo? Esta ação é irreversível.')) {
                                                                            const res = await fetch(`/api/clientes/certificados/${cert.id}`, { method: 'DELETE' })
                                                                            if (res.ok) {
                                                                                fetchCertificados()
                                                                                alert('Ativo purgado com sucesso.')
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="w-12 h-12 bg-neutral-900/50 border border-neutral-900 rounded-xl flex items-center justify-center text-neutral-700 hover:text-red-500 hover:bg-red-500/5 transition-all"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="p-10 bg-black/40 border-t border-neutral-900 flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-neutral-600">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Nucleus Vault Active • AES-GCM Encrypted</span>
                                    </div>
                                    <p className="text-[9px] text-neutral-800 font-mono tracking-tighter">Braid Nucleus v.{new Date().getFullYear()}.{String(new Date().getMonth() + 1).padStart(2, '0')}</p>
                                </div>
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
    );
}

// Modal de Mapeamento Manual Maestro
function MappingModal({ showMappingModal, setShowMappingModal, mappingLoading, mappingData, client, selectedRoutine, handleManualLink }: any) {
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [folderFiles, setFolderFiles] = useState<any[]>([]);
    const [loadingFolder, setLoadingFolder] = useState(false);
    const [history, setHistory] = useState<any[]>([]); // Para breadcrumbs

    // Reset quando abre
    useEffect(() => {
        if (showMappingModal) {
            setCurrentFolderId(null);
            setFolderFiles([]);
            setHistory([]);
        }
    }, [showMappingModal]);

    // Carregar arquivos da pasta atual
    useEffect(() => {
        if (showMappingModal) {
            fetchFolder(currentFolderId);
        }
    }, [currentFolderId, showMappingModal]);

    async function fetchFolder(folderId: string | null) {
        setLoadingFolder(true);
        try {
            const url = folderId
                ? `/api/drive/files?folderId=${folderId}`
                : `/api/drive/files?clientId=${client.id}`;
            const res = await fetch(url);
            const data = await res.json();
            if (Array.isArray(data)) {
                setFolderFiles(data);
            }
        } catch (err) {
            console.error('Erro ao navegar no drive:', err);
        } finally {
            setLoadingFolder(false);
        }
    }

    function navigateToFolder(folder: any) {
        setHistory(prev => [...prev, { id: currentFolderId, name: 'Voltar' }]);
        setCurrentFolderId(folder.id);
    }

    function goBack() {
        const newHistory = [...history];
        const last = newHistory.pop();
        setHistory(newHistory);
        setCurrentFolderId(last?.id || null);
    }

    if (!showMappingModal) return null;

    const displayFiles = currentFolderId ? folderFiles : (folderFiles.length > 0 ? folderFiles : (mappingData?.filesFound || []));

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
                            <p className="text-[9px] font-mono text-neutral-600 uppercase">
                                {currentFolderId ? 'Navegando em pasta específica' : 'Arquivos sugeridos pela IA ou navegue abaixo'}
                            </p>
                        </div>
                    </div>
                    {currentFolderId && (
                        <button
                            onClick={goBack}
                            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-[9px] font-black text-white uppercase rounded hover:bg-neutral-800"
                        >
                            <ChevronLeft className="w-3 h-3" /> Voltar
                        </button>
                    )}
                </div>

                <div className="p-0 max-h-[60vh] overflow-y-auto bg-black/50">
                    {(mappingLoading || loadingFolder) ? (
                        <div className="p-20 flex flex-col items-center justify-center space-y-4">
                            <Activity className="w-8 h-8 text-emerald-500 animate-spin" />
                            <p className="text-[10px] font-black text-neutral-500 uppercase animate-pulse">Acessando Drive...</p>
                        </div>
                    ) : displayFiles.length > 0 ? (
                        <div className="divide-y divide-neutral-900 border-b border-neutral-900">
                            {displayFiles
                                .sort((a: any, b: any) => {
                                    // Pastas primeiro
                                    if (a.mimeType === 'application/vnd.google-apps.folder' && b.mimeType !== 'application/vnd.google-apps.folder') return -1;
                                    if (a.mimeType !== 'application/vnd.google-apps.folder' && b.mimeType === 'application/vnd.google-apps.folder') return 1;
                                    return new Date(b.modifiedTime || 0).getTime() - new Date(a.modifiedTime || 0).getTime();
                                })
                                .map((file: any) => {
                                    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                                    return (
                                        <div
                                            key={file.id}
                                            onClick={() => isFolder ? navigateToFolder(file) : handleManualLink(file)}
                                            className="p-4 flex items-center justify-between hover:bg-emerald-500/5 cursor-pointer transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 bg-neutral-900 border border-neutral-800 rounded transition-colors ${isFolder ? 'text-amber-500' : 'text-neutral-500 group-hover:text-emerald-500'}`}>
                                                    {isFolder ? <FolderOpen className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-neutral-300 group-hover:text-emerald-400">{file.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[8px] font-mono text-neutral-600 uppercase italic">
                                                            {isFolder ? 'Pasta de Arquivos' : `Modificado em: ${new Date(file.modifiedTime).toLocaleDateString('pt-BR')}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className={`px-3 py-1 bg-neutral-900 border border-neutral-800 text-[9px] font-black transition-all uppercase italic rounded ${isFolder ? 'text-amber-500 hover:bg-amber-500 hover:text-black' : 'text-neutral-500 group-hover:bg-emerald-500 group-hover:text-black'}`}>
                                                {isFolder ? 'Abrir' : 'Vincular'}
                                            </button>
                                        </div>
                                    );
                                })}
                        </div>
                    ) : (
                        <div className="p-20 text-center space-y-4">
                            <ShieldAlert className="w-8 h-8 text-red-500 mx-auto" />
                            <p className="text-[10px] font-black text-neutral-500 uppercase px-12 leading-relaxed">
                                Nenhum arquivo encontrado nesta pasta. Verifique se o documento está no Drive.
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
