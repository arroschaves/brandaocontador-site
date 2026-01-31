'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Mail, Phone, MapPin, Clock, X, Loader2, Calendar,
    FileCheck, ShieldAlert, AlertTriangle, Edit, Trash2, ExternalLink,
    Building2, Landmark, CheckCircle2, XCircle, Plus, Save, Users,
    FileText, Briefcase, Download, History, FolderOpen, RefreshCw, Calculator, FileSearch, MessageSquare
} from 'lucide-react'
import { getRoutinesByClientType } from '@/lib/utils/accounting-intelligence'
import { formatCNPJ, formatPhone } from '@/lib/utils/format'

interface ClientDetailSidebarProps {
    clientId: string | null
    isOpen: boolean
    onClose: () => void
    onUpdate: () => void
}

export default function ClientDetailSidebar({ clientId, isOpen, onClose, onUpdate }: ClientDetailSidebarProps) {
    const [client, setClient] = useState<any>(null)
    const [unidades, setUnidades] = useState<any[]>([])
    const [validades, setValidades] = useState<any[]>([])
    const [rhFiles, setRhFiles] = useState<any[]>([])
    const [cronograma, setCronograma] = useState<any[]>([])

    const [loading, setLoading] = useState(false)
    const [loadingRh, setLoadingRh] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [syncing, setSyncing] = useState(false)
    const [editedClient, setEditedClient] = useState<any>(null)
    const [activeTab, setActiveTab] = useState<'fiscal' | 'unidades' | 'rh' | 'vencimentos' | 'dados'>('fiscal')

    const [isUnitModalOpen, setIsUnitModalOpen] = useState(false)
    const [unitFormData, setUnitFormData] = useState({
        nome_identificador: '',
        inscricao_estadual: '',
        tipo_unidade: 'PROPRIEDADE_RURAL',
        documento_id: '',
        cidade: 'Sidrolândia',
        estado: 'MS'
    })

    const supabase = createClient()

    useEffect(() => {
        if (clientId && isOpen) {
            getFullClientData()
        }
    }, [clientId, isOpen])

    async function getFullClientData() {
        if (!clientId) return
        try {
            setLoading(true)
            const { data: clientData, error: clientErr } = await supabase
                .from('clientes')
                .select('*')
                .eq('id', clientId)
                .maybeSingle()
            if (clientErr) throw clientErr;

            if (!clientData) return

            const { data: unidadesData } = await supabase.from('unidades_fiscais').select('*').eq('cliente_id', clientId);
            const { data: cronogramaData } = await supabase.from('obrigacoes_acessorias').select('*').eq('cliente_id', clientId).order('competencia', { ascending: false });

            setClient(clientData);
            setEditedClient(clientData);
            setUnidades(unidadesData || []);
            setCronograma(cronogramaData || []);
        } catch (err: any) {
            console.error('Erro na carga profunda:', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleAuditIndividual() {
        if (!clientId) return
        setSyncing(true)
        try {
            const res = await fetch('/api/sync/audit', { method: 'POST' })
            if (res.ok) {
                await getFullClientData()
            }
        } catch (err) {
            console.error(err)
        } finally {
            setSyncing(false)
        }
    }

    async function handleSendWhatsApp(routineName: string) {
        if (!clientId) return
        try {
            const hasConfirmed = confirm(`Deseja enviar a guia de ${routineName} via WhatsApp agora?`)
            if (!hasConfirmed) return

            const routineData = cronograma.find(o => o.tipo === routineName);
            if (!routineData?.arquivo_url) {
                alert('Documento não encontrado para esta obrigação.');
                return;
            }

            setSyncing(true)
            const res = await fetch('/api/whatsapp/send-pdf', {
                method: 'POST',
                body: JSON.stringify({
                    clientId,
                    fileId: routineData.arquivo_url,
                    fileName: `${routineName}_${client.nome}.pdf`,
                    caption: `Olá ${client.nome}, aqui está sua guia de ${routineName} referente ao mês atual.`
                })
            })

            if (res.ok) {
                alert('Documento enviado com sucesso!')
            } else {
                const err = await res.json()
                alert(`Erro: ${err.error}`)
            }
        } catch (err) {
            console.error(err)
            alert('Falha na comunicação com o servidor de disparo.')
        } finally {
            setSyncing(false)
        }
    }

    if (!isOpen) return null

    const expectedRoutines = client ? getRoutinesByClientType(client.regime_tributario, !!client.cnae_principal?.startsWith('01')) : []

    return (
        <div className="fixed inset-0 z-[100] flex justify-end pointer-events-none">
            <div className={`absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />

            <div className={`relative w-full max-w-xl bg-neutral-950 border-l border-neutral-800 shadow-2xl pointer-events-auto transform transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header Técnico */}
                <div className="p-5 border-b border-neutral-800 bg-neutral-900 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="p-1 hover:bg-neutral-800 rounded transition-colors text-neutral-500">
                            <X className="w-4 h-4" />
                        </button>
                        <div>
                            <h2 className="text-sm font-black italic uppercase text-neutral-100 tracking-tighter">Módulo de Cliente</h2>
                            <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">{client?.cnpj_cpf}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleAuditIndividual} disabled={syncing} className="p-2 bg-neutral-800 border border-neutral-700 text-emerald-500 hover:bg-neutral-700 rounded transition-all">
                            {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        </button>
                        <button onClick={() => setIsEditing(!isEditing)} className="px-3 py-1.5 bg-neutral-800 border border-neutral-700 text-[9px] font-black uppercase text-neutral-300 rounded hover:border-emerald-500 transition-all">
                            {isEditing ? 'Cancelar' : 'Editar'}
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
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Obrigações Exigíveis ({new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(new Date())})</h3>
                                            <span className="text-[9px] font-bold text-neutral-700 uppercase">Brandão Intelligence {new Date().getFullYear()}</span>
                                        </div>
                                        <div className="grid gap-2">
                                            {expectedRoutines.map((rout, i) => {
                                                const history = cronograma.find(o => o.tipo === rout.name);
                                                const isConcluido = history?.status === 'concluido';
                                                return (
                                                    <div key={i} className={`flex items-center justify-between p-3 bg-neutral-900/40 border ${isConcluido ? 'border-emerald-500/20' : 'border-neutral-800'} rounded group`}>
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
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'unidades' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 text-[11px]">
                                        <div className="flex justify-between items-center text-[10px]">
                                            <h3 className="font-black uppercase text-neutral-500 tracking-widest">Ativos Mobiliários / Fazendas</h3>
                                            <button onClick={() => setIsUnitModalOpen(true)} className="font-black text-emerald-500 border border-emerald-500/20 px-2 py-1 hover:bg-emerald-500/5 transition-all">+ CADASTRAR</button>
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
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Detalhamento Cadastral</h3>
                                            <button onClick={() => setIsEditing(!isEditing)} className="text-[10px] font-bold text-emerald-500">{isEditing ? 'Visualizar' : 'Editar'}</button>
                                        </div>

                                        <div className="grid gap-3">
                                            {isEditing ? (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-neutral-500 uppercase">Razão Social</label>
                                                            <input className="w-full bg-neutral-900 border border-neutral-800 p-2 text-[11px] text-neutral-200 outline-none focus:border-emerald-500"
                                                                value={editedClient?.razao_social || ''} onChange={e => setEditedClient({ ...editedClient, razao_social: e.target.value })} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-neutral-500 uppercase">Apelido / Fantasia</label>
                                                            <input className="w-full bg-neutral-900 border border-neutral-800 p-2 text-[11px] text-neutral-200 outline-none focus:border-emerald-500"
                                                                value={editedClient?.nome || ''} onChange={e => setEditedClient({ ...editedClient, nome: e.target.value })} />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-neutral-500 uppercase">WhatsApp</label>
                                                            <input className="w-full bg-neutral-900 border border-neutral-800 p-2 text-[11px] text-neutral-200 outline-none focus:border-emerald-500"
                                                                value={editedClient?.telefone_whatsapp || ''} onChange={e => setEditedClient({ ...editedClient, telefone_whatsapp: e.target.value })} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-neutral-500 uppercase">E-mail</label>
                                                            <input className="w-full bg-neutral-900 border border-neutral-800 p-2 text-[11px] text-neutral-200 outline-none focus:border-emerald-500"
                                                                value={editedClient?.email || ''} onChange={e => setEditedClient({ ...editedClient, email: e.target.value })} />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-neutral-500 uppercase">Inscrição Estadual</label>
                                                            <input className="w-full bg-neutral-900 border border-neutral-800 p-2 text-[11px] text-neutral-200 outline-none focus:border-emerald-500"
                                                                value={editedClient?.inscricao_estadual || ''} onChange={e => setEditedClient({ ...editedClient, inscricao_estadual: e.target.value })} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-neutral-500 uppercase">CEP</label>
                                                            <input className="w-full bg-neutral-900 border border-neutral-800 p-2 text-[11px] text-neutral-200 outline-none focus:border-emerald-500"
                                                                value={editedClient?.cep || ''} onChange={e => setEditedClient({ ...editedClient, cep: e.target.value })} />
                                                        </div>
                                                    </div>
                                                    <div className="pt-2">
                                                        <button onClick={async () => {
                                                            // Limpar campos que podem não existir no banco
                                                            const { inscricao_municipal, ...cleanUpdate } = editedClient;

                                                            const { error } = await supabase.from('clientes').update(cleanUpdate).eq('id', clientId);
                                                            if (!error) {
                                                                setIsEditing(false);
                                                                getFullClientData();
                                                            } else {
                                                                alert('Erro ao salvar: ' + error.message);
                                                            }
                                                        }} className="w-full py-2 bg-emerald-500 text-neutral-950 text-[10px] font-black uppercase">Confirmar Alterações</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                [
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
                                                ))
                                            )}
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
