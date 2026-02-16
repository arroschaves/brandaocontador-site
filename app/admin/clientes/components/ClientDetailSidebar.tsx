'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    X, Building2, Mail, Phone, Clock, FileText,
    MessageSquare, RefreshCw, Loader2, Building,
    Briefcase, ShieldAlert, FolderOpen, Calculator,
    FileCheck, FileSearch, Landmark, Users, Upload, Monitor, Server,
    Sparkles, MapPin, Fingerprint, CheckCircle2, History
} from 'lucide-react'

interface ClientDetailSidebarProps {
    isOpen: boolean
    onClose: () => void
    clientId: string | null
    onUpdate?: () => void
}

export default function ClientDetailSidebar({ isOpen, onClose, clientId, onUpdate }: ClientDetailSidebarProps) {
    const [client, setClient] = useState<any>(null)
    const [cronograma, setCronograma] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [syncing, setSyncing] = useState(false)
    const [editedClient, setEditedClient] = useState<any>(null)
    const [unidades, setUnidades] = useState<any[]>([])
    const [historico, setHistorico] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState<'fiscal' | 'unidades' | 'rh' | 'vencimentos' | 'dados' | 'historico'>('fiscal')
    const [uploading, setUploading] = useState(false)
    const [certificados, setCertificados] = useState<any[]>([])
    const [loadingCerts, setLoadingCerts] = useState(false)
    const [userRole, setUserRole] = useState<string>('operador')

    const [isUnitModalOpen, setIsUnitModalOpen] = useState(false)
    const [unitFormData, setUnitFormData] = useState({
        nome_identificador: '',
        tipo_unidade: 'Fazenda',
        inscricao_estadual: '',
        endereco_completo: '',
        area_total_ha: ''
    })

    const supabase = createClient()

    const fetchHistorico = useCallback(async () => {
        if (!clientId) return;
        const { data } = await supabase
            .schema('audit')
            .from('logs')
            .select('*')
            .contains('dados_novos', { empresa_id: clientId })
            .order('created_at', { ascending: false })
            .limit(20);
        setHistorico(data || []);
    }, [clientId, supabase]);

    const fetchCertificados = useCallback(async () => {
        if (!clientId) return
        try {
            setLoadingCerts(true)
            const res = await fetch(`/api/clientes/certificados?clientId=${clientId}`)
            const data = await res.json()
            if (res.ok) setCertificados(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingCerts(false)
        }
    }, [clientId])

    const fetchUserRole = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase.from('perfis').select('role').eq('id', user.id).single()
            if (data) setUserRole(data.role)
        }
    }, [supabase])

    const getFullClientData = useCallback(async () => {
        if (!clientId) return
        try {
            setLoading(true)
            const { data: cliente } = await supabase.schema('core').from('empresas').select('*').eq('id', clientId).single()
            setClient(cliente)
            setEditedClient(cliente)

            const { data: cron } = await supabase.schema('fiscal').from('calendario').select('*, template:template_id(nome)').eq('empresa_id', clientId)
            setCronograma(cron || [])

            const { data: units } = await supabase.from('unidades_fiscais').select('*').eq('cliente_id', clientId)
            setUnidades(units || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [clientId, supabase])

    useEffect(() => {
        if (clientId && isOpen) {
            getFullClientData()
            fetchHistorico()
            fetchCertificados()
            fetchUserRole()
        }
    }, [clientId, isOpen, getFullClientData, fetchHistorico, fetchCertificados, fetchUserRole])

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, routineName?: string) {
        const file = e.target.files?.[0];
        if (!file || !clientId) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('clientId', clientId);
        if (routineName) formData.append('routineName', routineName);

        try {
            const res = await fetch('/api/drive/upload', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                alert('Arquivo enviado com sucesso!');
                getFullClientData();
                fetchHistorico();
                if (onUpdate) onUpdate();
            } else {
                const errData = await res.json();
                alert('Falha ao enviar arquivo: ' + (errData.error || 'Erro desconhecido'));
            }
        } catch (err) {
            console.error(err);
            alert('Erro no upload.');
        } finally {
            setUploading(false);
        }
    }

    async function handleSendWhatsApp(routineName: string) {
        if (!clientId) return
        try {
            const hasConfirmed = confirm(`Deseja enviar a guia de ${routineName} via WhatsApp agora?`)
            if (!hasConfirmed) return

            setSyncing(true)
            const res = await fetch('/api/whatsapp/send-pdf', {
                method: 'POST',
                body: JSON.stringify({
                    clientId,
                    fileName: `${routineName}_${client.nome}.pdf`.replace(/\s+/g, '_'),
                    caption: `Olá ${client.nome}, aqui está sua guia de ${routineName} referente ao mês atual.`
                })
            })

            if (res.ok) {
                alert('Guia enviada com sucesso via WhatsApp!')
                getFullClientData()
                fetchHistorico()
                if (onUpdate) onUpdate()
            } else {
                const errData = await res.json();
                alert('Falha ao enviar guia: ' + (errData.error || 'Erro desconhecido'))
            }
        } catch (err) {
            console.error(err)
            alert('Erro ao enviar via WhatsApp.')
        } finally {
            setSyncing(false)
        }
    }

    async function handleAuditIndividual() {
        if (!clientId) return
        setSyncing(true)
        try {
            await fetch('https://webhook.brandaocontador.com.br/webhook/audit-client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId })
            })
            alert('Sincronização de auditoria disparada!')
            setTimeout(getFullClientData, 3000)
        } catch (err) {
            console.error(err)
        } finally {
            setSyncing(false)
        }
    }

    async function handleOffboarding() {
        if (!clientId || !client) return

        const confirmName = prompt(`⚠️ AÇÃO CRÍTICA (LGPD) ⚠️\nO offboarding removerá permanentemente todos os certificados e senhas do cofre para este cliente.\n\nPara confirmar, digite o nome do cliente: "${client.nome}"`)

        if (confirmName !== client.nome) {
            alert('Confirmação falhou. Operação cancelada.')
            return
        }

        const reason = prompt('Informe o motivo do encerramento (opcional):')

        try {
            setSyncing(true)
            const res = await fetch('/api/clientes/offboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId, reason })
            })

            const result = await res.json()
            if (res.ok) {
                alert('MAESTRO: Offboarding concluído! Dados sensíveis removidos e cliente inativado.')
                getFullClientData()
                fetchCertificados()
                fetchHistorico()
            } else {
                alert('Erro no offboarding: ' + result.error)
            }
        } catch (err) {
            console.error(err)
            alert('Falha total no processo de offboarding.')
        } finally {
            setSyncing(false)
        }
    }

    async function handleEnrich() {
        if (!clientId) return
        try {
            const hasConfirmed = confirm('Deseja enriquecer os dados deste cliente via API CNPJ.ws (SINTEGRA/Receita)? Esta ação atualizará o endereço, CNAE e Inscrição Estadual automaticamente.')
            if (!hasConfirmed) return

            setSyncing(true)
            const res = await fetch(`/api/clientes/${clientId}/enrich`, {
                method: 'POST'
            })
            const result = await res.json()

            if (res.ok) {
                alert('✨ Dados enriquecidos com sucesso!')
                getFullClientData()
                fetchHistorico()
                if (onUpdate) onUpdate()
            } else {
                alert('Erro ao enriquecer dados: ' + (result.error || 'Erro desconhecido'))
            }
        } catch (err) {
            console.error(err)
            alert('Falha total na comunicação com a API de enriquecimento.')
        } finally {
            setSyncing(false)
        }
    }

    const formatCNPJ = (val: string) => {
        if (!val) return ''
        const v = val.replace(/\D/g, '')
        if (v.length === 11) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
        return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
    }

    const formatPhone = (val: string) => {
        if (!val) return ''
        const v = val.replace(/\D/g, '')
        if (v.startsWith('55')) return '+' + v.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, "$1 ($2) $3-$4")
        return v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    }

    if (!isOpen) return null

    const expectedRoutines = [
        { name: 'DAS / SIMPLES', description: 'Imposto Simples Nacional' },
        { name: 'FGTS', description: 'Fundo de Garantia' },
        { name: 'INSS', description: 'Previdência Social' },
        { name: 'ICMS', description: 'Imposto sobre Circulação' },
        { name: 'IRPF', description: 'Imposto de Renda PF' },
        { name: 'CCIR / ITR', description: 'Impostos Rurais' }
    ]

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-xl bg-card border-l border-border/50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">

                {/* Header Lúcido de Alta Densidade */}
                <div className="flex items-center justify-between p-6 bg-secondary/30 border-b border-border/40">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm shadow-primary/5">
                            <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Ficha Maestro</h2>
                            <p className="text-[13px] font-mono font-medium text-foreground mt-1.5">{client?.cnpj_cpf}</p>
                        </div>
                    </div>
                    <div className="flex gap-2.5">
                        <button
                            onClick={handleAuditIndividual}
                            disabled={syncing}
                            className="p-3 bg-card border border-border/60 text-primary hover:bg-primary/5 hover:border-primary/30 rounded-xl transition-all shadow-sm"
                            title="Sincronizar"
                        >
                            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-3 bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-border rounded-xl transition-all shadow-sm"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                                <Loader2 className="w-10 h-10 animate-spin text-primary relative" />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Sincronizando Auditoria...</span>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {/* Banner Informativo Refinado */}
                            <div className="p-8 bg-gradient-to-b from-secondary/20 to-transparent border-b border-border/40">
                                <h1 className="text-2xl font-bold text-foreground tracking-tight leading-tight">{client?.nome}</h1>
                                <div className="flex flex-wrap gap-2 mt-5">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-tight rounded-xl">
                                        <ShieldAlert className="w-3.5 h-3.5" />
                                        {client?.regime_tributario?.replace(/_/g, ' ') || 'Revisão Necessária'}
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border/60 text-muted-foreground text-[10px] font-bold uppercase tracking-tight rounded-xl">
                                        <Briefcase className="w-3.5 h-3.5" />
                                        CNAE: {client?.cnae_principal?.split(' - ')[0] || '---'}
                                    </div>
                                </div>
                            </div>

                            {/* Tabs Modernas */}
                            <div className="flex bg-card border-b border-border/40 overflow-x-auto no-scrollbar px-4 pt-4 sticky top-0 z-10">
                                {[
                                    { id: 'fiscal', label: 'Auditoria', icon: FileSearch },
                                    { id: 'unidades', label: 'Unidades', icon: Landmark },
                                    { id: 'rh', label: 'e-Social', icon: Users },
                                    { id: 'vencimentos', label: 'Validades', icon: Clock },
                                    { id: 'historico', label: 'Logs', icon: HistoryIcon },
                                    { id: 'dados', label: 'Cadastro', icon: Mail }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`px-4 py-3 text-[11px] font-bold uppercase tracking-tight whitespace-nowrap border-b-2 transition-all flex items-center gap-2.5 ${activeTab === tab.id
                                            ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
                                            : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-t-xl'}`}
                                    >
                                        <tab.icon className="w-4 h-4" /> {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Conteúdo Aba Fiscal (Auditoria Mural) */}
                            <div className="p-8 space-y-8 page-fade-in transition-all">
                                {activeTab === 'fiscal' && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center text-[11px] font-bold uppercase text-muted-foreground tracking-widest pl-1">
                                            <h3>Obrigações Exigíveis • {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date())}</h3>
                                        </div>
                                        <div className="grid gap-3">
                                            {expectedRoutines.map((rout, i) => {
                                                const history = cronograma.find(o => o.template?.nome === rout.name);
                                                const isConcluido = history?.status === 'CONCLUIDO';
                                                return (
                                                    <div key={i} className={`lucid-card p-0 overflow-hidden border ${isConcluido ? 'border-primary/20 bg-primary/5 shadow-sm shadow-primary/5' : 'border-border/60 bg-card hover:border-primary/20 transition-all shadow-sm'}`}>
                                                        <div className="p-5 flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`p-3 rounded-2xl border transition-all ${isConcluido ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20' : 'bg-secondary text-muted-foreground border-border shadow-none'}`}>
                                                                    {isConcluido ? <FileCheck className="w-5 h-5" /> : <Calculator className="w-5 h-5" />}
                                                                </div>
                                                                <div>
                                                                    <p className="text-[13px] font-bold text-foreground leading-tight">{rout.name}</p>
                                                                    <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{rout.description}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {isConcluido && (
                                                                    <button
                                                                        onClick={() => handleSendWhatsApp(rout.name)}
                                                                        className="p-2.5 bg-card border border-border text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all shadow-sm"
                                                                        title="Enviar via WhatsApp"
                                                                    >
                                                                        <MessageSquare className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                                <div className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border flex items-center gap-1.5 ${isConcluido ? 'bg-primary/10 text-primary border-primary/20 shadow-sm shadow-primary/5' : 'bg-muted/30 text-muted-foreground border-border/50 shadow-none'}`}>
                                                                    {isConcluido && <CheckCircle2 className="w-3 h-3" />}
                                                                    {isConcluido ? 'AUDITADO' : 'PENDENTE'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {!isConcluido && (
                                                            <div className="flex">
                                                                <label className="flex-1 cursor-pointer group/upload">
                                                                    <input type="file" className="hidden" onChange={e => handleFileUpload(e, rout.name)} disabled={uploading} />
                                                                    <div className="flex items-center justify-center gap-2.5 py-2.5 bg-secondary/50 text-[11px] font-bold text-muted-foreground group-hover/upload:bg-primary group-hover/upload:text-white transition-all border-t border-border/40">
                                                                        <Upload className="w-3.5 h-3.5" />
                                                                        {uploading ? 'SINCRONIZANDO...' : 'UPLOAD MANUAL DA GUIA'}
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'historico' && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center text-[11px] font-bold uppercase text-muted-foreground tracking-widest pl-1">
                                            <h3>Auditoria de Eventos e Acessos</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {historico.length === 0 ? (
                                                <div className="p-16 text-center bg-secondary/20 rounded-3xl border border-dashed border-border/60">
                                                    <p className="text-sm font-bold text-muted-foreground opacity-40">Sem registros recentes.</p>
                                                </div>
                                            ) : historico.map(log => (
                                                <div key={log.id} className="lucid-card p-5 space-y-4 border-border/40 shadow-sm">
                                                    <div className="flex justify-between items-start">
                                                        <span className="px-2.5 py-1 text-[9px] font-bold rounded-lg bg-primary/10 text-primary border border-primary/20 uppercase tracking-tight">{log.acao}</span>
                                                        <span className="text-[10px] text-muted-foreground font-mono font-medium">{new Date(log.created_at).toLocaleString('pt-BR')}</span>
                                                    </div>
                                                    <p className="text-[13px] font-medium text-foreground leading-relaxed">
                                                        {log.dados_novos?.descricao || log.tabela}
                                                    </p>
                                                    <div className="flex gap-5 text-[10px] text-muted-foreground font-medium pt-3 border-t border-border/40">
                                                        <span className="truncate flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5 opacity-60" /> {log.user_agent?.substring(0, 30)}...</span>
                                                        <span className="flex items-center gap-1.5"><Server className="w-3.5 h-3.5 opacity-60" /> IP: {log.ip_address}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'vencimentos' && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center text-[11px] font-bold uppercase text-muted-foreground tracking-widest pl-1">
                                            <h3>Monitor de Certificados Digitais</h3>
                                        </div>
                                        <div className="grid gap-4">
                                            {loadingCerts ? (
                                                <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
                                            ) : certificados.length === 0 ? (
                                                <div className="p-16 text-center bg-secondary/20 rounded-3xl border border-dashed border-border/60">
                                                    <Fingerprint className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-10" />
                                                    <p className="text-sm font-bold text-muted-foreground opacity-40 uppercase tracking-widest">Nenhum certificado no cofre</p>
                                                </div>
                                            ) : certificados.map(cert => {
                                                const diasRestantes = cert.data_vencimento ? Math.ceil((new Date(cert.data_vencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
                                                const isExpirado = diasRestantes !== null && diasRestantes <= 0;
                                                const isAlerta = diasRestantes !== null && diasRestantes <= 30;

                                                const colorClass = isExpirado ? 'bg-destructive/10 text-destructive border-destructive/20' :
                                                    isAlerta ? 'bg-amber-100/50 text-amber-600 border-amber-200' :
                                                        'bg-primary/10 text-primary border-primary/20';

                                                return (
                                                    <div key={cert.id} className={`lucid-card p-5 group flex items-center justify-between border ${isExpirado ? 'border-destructive/30 bg-destructive/5' : isAlerta ? 'border-amber-300/50 bg-amber-50' : 'border-border/60 bg-card hover:bg-secondary/40 transition-colors shadow-sm'}`}>
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-3.5 rounded-2xl border transition-all ${colorClass} ${isAlerta && 'animate-pulse'}`}>
                                                                <Fingerprint className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[14px] font-bold text-foreground leading-tight truncate max-w-[200px]">{cert.nome_arquivo}</p>
                                                                <div className="flex items-center gap-3 mt-1.5">
                                                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-card/60 border border-border text-muted-foreground rounded-lg">{cert.tipo}</span>
                                                                    <span className={`text-[10px] font-bold uppercase tracking-tight ${isExpirado ? 'text-destructive' : isAlerta ? 'text-amber-600' : 'text-primary'}`}>
                                                                        {isExpirado ? 'Expirado' : diasRestantes !== null ? `${diasRestantes} dias restantes` : 'Data Pendente'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setActiveTab('fiscal')}
                                                            className="p-3 bg-card border border-border/60 text-muted-foreground hover:text-primary transition-all rounded-xl shadow-sm"
                                                        >
                                                            <Monitor className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'dados' && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center text-[11px] font-bold uppercase text-muted-foreground tracking-widest pl-1">
                                            <h3>Detalhamento da Ficha Maestro</h3>
                                        </div>
                                        <div className="grid gap-4">
                                            <button
                                                onClick={handleEnrich}
                                                disabled={syncing}
                                                className="w-full py-4 bg-primary text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-primary/90 transition-all text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 group"
                                            >
                                                {syncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                                                Enriquecimento de Dados Master
                                            </button>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {[
                                                    { label: 'Razão Social', value: client?.razao_social, icon: Building2 },
                                                    { label: 'ID Fiscal', value: formatCNPJ(client?.cnpj_cpf), icon: ShieldAlert },
                                                    { label: 'Inscr. Estadual', value: client?.inscricao_estadual, icon: Fingerprint },
                                                    { label: 'E-mail Fiscal', value: client?.email, icon: Mail },
                                                    { label: 'WhatsApp', value: formatPhone(client?.telefone_whatsapp), icon: Phone },
                                                    { label: 'Regime Fiscal', value: client?.regime_tributario?.replace(/_/g, ' '), icon: Landmark },
                                                    { label: 'CNAE', value: client?.cnae_principal, icon: Briefcase },
                                                    { label: 'Localidade', value: client?.cidade ? `${client.cidade}/${client.estado}` : null, icon: MapPin }
                                                ].map((info, idx) => (
                                                    <div key={idx} className="lucid-card p-3.5 space-y-2.5 border-border/40 shadow-sm flex flex-col justify-center">
                                                        <div className="flex items-center gap-2">
                                                            <info.icon className="w-3.5 h-3.5 text-primary opacity-60" />
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{info.label}</p>
                                                        </div>
                                                        <p className="text-[12px] font-bold text-foreground uppercase truncate pl-0.5">{info.value || 'NÃO CADASTRADO'}</p>
                                                    </div>
                                                ))}
                                                <div className="lucid-card p-3.5 space-y-2.5 border-border/40 shadow-sm col-span-2">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-3.5 h-3.5 text-primary opacity-60" />
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Endereço Operacional</p>
                                                    </div>
                                                    <p className="text-[12px] font-bold text-foreground uppercase leading-relaxed pl-0.5">
                                                        {client?.logradouro ? `${client.logradouro}, ${client.numero}${client.complemento ? ' - ' + client.complemento : ''}, ${client.bairro}` : 'ENDEREÇO PENDENTE'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ações Administrativas (LGPD) */}
                                        {userRole === 'admin' && (
                                            <div className="mt-12 p-8 bg-destructive/5 border border-destructive/20 rounded-3xl space-y-5">
                                                <div className="flex items-center gap-3 text-destructive">
                                                    <ShieldAlert className="w-6 h-6" />
                                                    <h4 className="text-sm font-bold uppercase tracking-tight">Zona de Risco • LGPD & Offboarding</h4>
                                                </div>
                                                <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
                                                    O fechamento de conta é irreversível. Todos os documentos confidenciais,
                                                    certificados e senhas do cofre serão eliminados permanentemente do CRM Maestro.
                                                </p>
                                                <button
                                                    onClick={handleOffboarding}
                                                    disabled={syncing}
                                                    className="w-full py-4 rounded-2xl text-[11px] font-bold uppercase transition-all bg-destructive text-white hover:bg-destructive/90 shadow-lg shadow-destructive/20"
                                                >
                                                    Executar Offboarding Definitivo
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Lúcido Fixo */}
                <div className="absolute bottom-0 left-0 w-full p-6 bg-card border-t border-border/50 flex gap-4 backdrop-blur-md">
                    <button onClick={onClose} className="flex-1 py-4 text-xs font-bold uppercase text-muted-foreground hover:bg-secondary rounded-2xl transition-all">Sair da Ficha</button>
                    {client?.drive_folder_id && (
                        <a
                            href={`https://drive.google.com/drive/folders/${client.drive_folder_id}`}
                            target="_blank"
                            className="flex-[2] py-4 bg-primary text-white text-xs font-bold uppercase rounded-2xl text-center hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                        >
                            <FolderOpen className="w-4.5 h-4.5" /> Acessar Drive
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}

function HistoryIcon(props: any) {
    return <History {...props} />;
}
