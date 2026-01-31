'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    X, Building2, Mail, Phone, Clock, FileText,
    MessageSquare, RefreshCw, Loader2, Building,
    Briefcase, ShieldAlert, FolderOpen, Calculator,
    FileCheck, FileSearch, Landmark, Users, Upload, Monitor, Server
} from 'lucide-react'

interface ClientDetailSidebarProps {
    isOpen: boolean
    onClose: () => void
    clientId: string | null
}

export default function ClientDetailSidebar({ isOpen, onClose, clientId }: ClientDetailSidebarProps) {
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

    const [isUnitModalOpen, setIsUnitModalOpen] = useState(false)
    const [unitFormData, setUnitFormData] = useState({
        nome_identificador: '',
        tipo_unidade: 'Fazenda',
        inscricao_estadual: '',
        endereco_completo: '',
        area_total_ha: ''
    })

    const supabase = createClient()

    async function fetchHistorico() {
        if (!clientId) return;
        const { data } = await supabase
            .from('auditoria_crm')
            .select('*')
            .eq('cliente_id', clientId)
            .order('created_at', { ascending: false })
            .limit(20);
        setHistorico(data || []);
    }

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

    useEffect(() => {
        if (clientId && isOpen) {
            getFullClientData()
            fetchHistorico()
        }
    }, [clientId, isOpen])

    async function getFullClientData() {
        if (!clientId) return
        try {
            setLoading(true)
            const { data: cliente } = await supabase.from('clientes').select('*').eq('id', clientId).single()
            setClient(cliente)
            setEditedClient(cliente)

            const { data: cron } = await supabase.from('obrigacoes_acessorias').select('*').eq('cliente_id', clientId)
            setCronograma(cron || [])

            const { data: units } = await supabase.from('unidades_negocio').select('*').eq('cliente_id', clientId)
            setUnidades(units || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
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
            <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-xl bg-neutral-950 border-l border-neutral-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header High-Density */}
                <div className="flex items-center justify-between p-4 bg-neutral-900/50 border-b border-neutral-900">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                            <Building2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-xs font-black text-neutral-400 uppercase tracking-tighter">Ficha do Cliente</h2>
                            <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">{client?.cnpj_cpf}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleAuditIndividual} disabled={syncing} className="p-2 bg-neutral-800 border border-neutral-700 text-emerald-500 hover:bg-neutral-700 rounded transition-all">
                            {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        </button>
                        <button onClick={onClose} className="p-2 bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white rounded">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-emerald-500">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span className="font-mono text-[9px] uppercase tracking-widest">Sincronizando Auditoria...</span>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {/* Banner Informativo */}
                            <div className="p-6 bg-gradient-to-b from-neutral-900 to-neutral-950 border-b border-neutral-900">
                                <h1 className="text-2xl font-black text-neutral-100 italic uppercase leading-tight tracking-tighter">{client?.nome}</h1>
                                <div className="flex gap-3 mt-4">
                                    <span className="text-[9px] font-black px-2 py-1 bg-neutral-900 border border-emerald-500/20 text-emerald-500 uppercase italic">
                                        {client?.regime_tributario?.replace(/_/g, ' ') || 'REVISÃO NECESSÁRIA'}
                                    </span>
                                    <span className="text-[9px] font-black px-2 py-1 bg-neutral-900 border border-neutral-800 text-neutral-500 uppercase">
                                        CNAE: {client?.cnae_principal?.split(' - ')[0] || '---'}
                                    </span>
                                </div>
                            </div>

                            {/* Tabs High-Density */}
                            <div className="flex bg-neutral-900/40 border-b border-neutral-900 overflow-x-auto no-scrollbar px-2">
                                {[
                                    { id: 'fiscal', label: 'Auditoria Mural', icon: FileSearch },
                                    { id: 'unidades', label: 'Propriedades', icon: Landmark },
                                    { id: 'rh', label: 'E-Social/Folha', icon: Users },
                                    { id: 'vencimentos', label: 'Validades', icon: Clock },
                                    { id: 'historico', label: 'Histórico/Auditoria', icon: ShieldAlert },
                                    { id: 'dados', label: 'Cadastro', icon: Mail }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`px-4 py-3 text-[9px] font-black uppercase whitespace-nowrap border-b-2 transition-all flex items-center gap-2 ${activeTab === tab.id
                                            ? 'border-emerald-500 text-emerald-500 bg-emerald-500/5'
                                            : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
                                    >
                                        <tab.icon className="w-3 h-3" /> {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Conteúdo Aba Fiscal (Auditoria) */}
                            <div className="p-6 space-y-8">
                                {activeTab === 'fiscal' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-neutral-500 tracking-widest">
                                            <h3>Obrigações Exigíveis ({new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(new Date())})</h3>
                                        </div>
                                        <div className="grid gap-2">
                                            {expectedRoutines.map((rout, i) => {
                                                const history = cronograma.find(o => o.tipo === rout.name);
                                                const isConcluido = history?.status === 'concluido';
                                                return (
                                                    <div key={i} className={`p-3 bg-neutral-900/40 border ${isConcluido ? 'border-emerald-500/20' : 'border-neutral-800'} rounded group space-y-3`}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-2 rounded ${isConcluido ? 'bg-emerald-500/10 text-emerald-500' : 'bg-neutral-800 text-neutral-600'}`}>
                                                                    {isConcluido ? <FileCheck className="w-3.5 h-3.5" /> : <Calculator className="w-3.5 h-3.5" />}
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black text-neutral-200 uppercase">{rout.name}</p>
                                                                    <p className="text-[8px] text-neutral-600 uppercase italic">{rout.description}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {isConcluido && (
                                                                    <button
                                                                        onClick={() => handleSendWhatsApp(rout.name)}
                                                                        className="p-2 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20 hover:bg-emerald-500 hover:text-neutral-950 transition-all"
                                                                        title="Enviar via WhatsApp"
                                                                    >
                                                                        <MessageSquare className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${isConcluido ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-500'}`}>
                                                                    {isConcluido ? 'AUDITADO OK' : 'PENDENTE'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {!isConcluido && (
                                                            <div className="flex pt-2 border-t border-neutral-800/50">
                                                                <label className="flex-1 cursor-pointer">
                                                                    <input type="file" className="hidden" onChange={e => handleFileUpload(e, rout.name)} disabled={uploading} />
                                                                    <div className="flex items-center justify-center gap-2 py-1.5 bg-neutral-800 text-[9px] font-bold text-neutral-400 hover:text-emerald-500 transition-all">
                                                                        <Upload className="w-3 h-3" />
                                                                        {uploading ? 'SUBINDO...' : 'SUBIR GUIA MANUAL'}
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
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-neutral-500 tracking-widest">
                                            <h3>Auditoria de Acessos e Ações</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {historico.length === 0 ? (
                                                <div className="p-10 text-center border-2 border-dashed border-neutral-900 opacity-20">
                                                    <p className="text-[10px] font-bold uppercase">Nenhum registro de auditoria.</p>
                                                </div>
                                            ) : historico.map(log => (
                                                <div key={log.id} className="p-3 bg-neutral-900/40 border border-neutral-800 rounded">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">{log.acao}</span>
                                                        <span className="text-[8px] text-neutral-600 font-mono">{new Date(log.created_at).toLocaleString('pt-BR')}</span>
                                                    </div>
                                                    <p className="text-[10px] text-neutral-300 mb-2">{log.detalhes}</p>
                                                    <div className="flex gap-4 text-[7px] text-neutral-700 font-bold uppercase border-t border-neutral-900 pt-2">
                                                        <span className="truncate flex items-center gap-1 max-w-[150px]"><Monitor className="w-2.5 h-2.5" /> {log.user_agent?.substring(0, 30)}...</span>
                                                        <span className="flex items-center gap-1"><Server className="w-2.5 h-2.5" /> IP: {log.ip_address}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'unidades' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 text-[11px]">
                                        <div className="flex justify-between items-center text-[10px]">
                                            <h3 className="font-black uppercase text-neutral-500 tracking-widest">Ativos Mobiliários / Fazendas</h3>
                                        </div>
                                        <div className="grid gap-3">
                                            {unidades.length === 0 ? (
                                                <div className="p-10 text-center border-2 border-dashed border-neutral-900 opacity-30">
                                                    <p className="font-bold uppercase">Sem registros detectados.</p>
                                                </div>
                                            ) : unidades.map(u => (
                                                <div key={u.id} className="p-4 bg-neutral-900/40 border border-neutral-800 rounded flex justify-between items-center">
                                                    <div>
                                                        <p className="font-black text-neutral-300 uppercase italic">{u.nome_identificador}</p>
                                                        <p className="font-mono text-neutral-600 uppercase">IE: {u.inscricao_estadual || 'N/A'}</p>
                                                    </div>
                                                    <span className="p-1 bg-neutral-900 border border-neutral-800 text-neutral-600 uppercase">{u.tipo_unidade}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'dados' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-neutral-500 tracking-widest">
                                            <h3>Detalhamento Cadastral</h3>
                                        </div>
                                        <div className="grid gap-3">
                                            {[
                                                { label: 'Razão Social', value: client?.razao_social, icon: Building2 },
                                                { label: 'Identificação Fiscal', value: formatCNPJ(client?.cnpj_cpf), icon: ShieldAlert },
                                                { label: 'E-mail Corporativo', value: client?.email, icon: Mail },
                                                { label: 'Telefone/WhatsApp', value: formatPhone(client?.telefone_whatsapp), icon: Phone },
                                                { label: 'Regime Tributário', value: client?.regime_tributario?.replace(/_/g, ' '), icon: Landmark },
                                                { label: 'CNAE Principal', value: client?.cnae_principal, icon: Briefcase }
                                            ].map((info, idx) => (
                                                <div key={idx} className="flex items-center gap-4 bg-neutral-900/40 p-3 border border-neutral-900 rounded-lg group">
                                                    <info.icon className="w-3.5 h-3.5 text-neutral-700 group-hover:text-emerald-500 transition-colors" />
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="text-[8px] font-black text-neutral-700 uppercase">{info.label}</p>
                                                        <p className="text-[11px] font-bold text-neutral-400 uppercase truncate">{info.value || 'NÃO CADASTRADO'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Fixo */}
                <div className="absolute bottom-0 left-0 w-full p-4 bg-neutral-950 border-t border-neutral-900 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-3 text-[10px] font-black uppercase text-neutral-600 hover:text-neutral-400 transition-colors">Fechar Vista</button>
                    {client?.drive_folder_id && (
                        <a href={`https://drive.google.com/drive/folders/${client.drive_folder_id}`} target="_blank" className="flex-[2] py-3 bg-emerald-500 text-neutral-950 text-[10px] font-black uppercase rounded text-center hover:bg-emerald-400 transition-all flex items-center justify-center gap-2">
                            <FolderOpen className="w-3.5 h-3.5" /> GOOGLE DRIVE
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}
