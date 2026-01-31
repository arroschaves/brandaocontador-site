'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Mail, Phone, MapPin, Clock, X, Loader2, Calendar,
    FileCheck, ShieldAlert, AlertTriangle, Edit, Trash2, ExternalLink,
    Building2, Landmark, CheckCircle2, XCircle, Plus, Save, Users,
    FileText, Briefcase, Download, History, FolderOpen
} from 'lucide-react'

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
    const [editedClient, setEditedClient] = useState<any>(null)
    const [activeTab, setActiveTab] = useState<'unidades' | 'dados' | 'rh' | 'fiscal' | 'vencimentos'>('unidades')

    // Propriedades State
    const [isUnitModalOpen, setIsUnitModalOpen] = useState(false)
    const [editingUnit, setEditingUnit] = useState<any>(null)
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

    useEffect(() => {
        if (activeTab === 'rh' && client?.drive_folder_id && rhFiles.length === 0) {
            fetchRhFiles()
        }
    }, [activeTab, client?.drive_folder_id])

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

            const { data: unidadesData } = await supabase
                .from('unidades_fiscais')
                .select('*')
                .eq('cliente_id', clientId);

            const { data: validadesData } = await supabase
                .from('controle_validades')
                .select('*, unidade:unidades_fiscais(nome_identificador)')
                .eq('cliente_id', clientId)
                .order('data_vencimento', { ascending: true });

            const { data: cronogramaData } = await supabase
                .from('obrigacoes_acessorias')
                .select('*')
                .eq('cliente_id', clientId)
                .order('competencia', { ascending: false })
                .limit(20);

            setClient(clientData);
            setEditedClient(clientData);
            setUnidades(unidadesData || []);
            setValidades(validadesData || []);
            setCronograma(cronogramaData || []);
        } catch (err: any) {
            console.error('Erro na carga profunda:', err)
        } finally {
            setLoading(false)
        }
    }

    async function fetchRhFiles() {
        if (!client?.drive_folder_id) return
        setLoadingRh(true)
        try {
            const res = await fetch(`/api/drive/list-rh?folderId=${client.drive_folder_id}`)
            const data = await res.json()
            setRhFiles(data.files || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingRh(false)
        }
    }

    async function handleSaveProfile() {
        try {
            setLoading(true)
            const { error } = await supabase
                .from('clientes')
                .update(editedClient)
                .eq('id', clientId);
            if (error) throw error;
            setClient(editedClient);
            setIsEditing(false);
            onUpdate();
        } catch (err: any) {
            alert('Erro ao salvar: ' + err.message);
        } finally {
            setLoading(false)
        }
    }

    const handleOpenUnitModal = (unit: any = null) => {
        if (unit) {
            setEditingUnit(unit);
            setUnitFormData({
                nome_identificador: unit.nome_identificador,
                inscricao_estadual: unit.inscricao_estadual || '',
                tipo_unidade: unit.tipo_unidade || 'PROPRIEDADE_RURAL',
                documento_id: unit.documento_id || '',
                cidade: unit.cidade || 'Sidrolândia',
                estado: unit.estado || 'MS'
            });
        } else {
            setEditingUnit(null);
            setUnitFormData({
                nome_identificador: '',
                inscricao_estadual: '',
                tipo_unidade: 'PROPRIEDADE_RURAL',
                documento_id: '',
                cidade: 'Sidrolândia',
                estado: 'MS'
            });
        }
        setIsUnitModalOpen(true);
    };

    const handleSaveUnit = async () => {
        try {
            setLoading(true);
            const data = { ...unitFormData, cliente_id: clientId, status: 'ATIVA' };
            if (editingUnit) {
                await supabase.from('unidades_fiscais').update(data).eq('id', editingUnit.id);
            } else {
                await supabase.from('unidades_fiscais').insert([data]);
            }
            setIsUnitModalOpen(false);
            getFullClientData();
        } catch (err: any) {
            alert('Erro: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex justify-end pointer-events-none">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Sidebar Container */}
            <div className={`relative w-full max-w-2xl bg-neutral-950 border-l border-neutral-800 shadow-2xl pointer-events-auto transform transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="p-6 border-b border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400">
                            <X className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-xl font-black italic uppercase text-neutral-100 tracking-tighter">Ficha do Cliente</h2>
                            <p className="text-[10px] font-mono text-neutral-500 uppercase">Gestão Agro Pro Max // Brandão</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isEditing ? (
                            <button onClick={handleSaveProfile} className="px-4 py-2 bg-emerald-500 text-neutral-950 text-[10px] font-black uppercase rounded-lg hover:bg-emerald-400 transition-all flex items-center gap-2">
                                <Save className="w-4 h-4" /> SALVAR
                            </button>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-neutral-800 text-neutral-200 text-[10px] font-black uppercase rounded-lg border border-neutral-700 hover:border-primary-500 transition-all flex items-center gap-2">
                                <Edit className="w-4 h-4" /> EDITAR
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-primary-500">
                        <Loader2 className="w-10 h-10 animate-spin" />
                        <span className="font-mono text-[10px] uppercase tracking-widest font-black italic">Sincronizando Dados...</span>
                    </div>
                ) : !client ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-neutral-500">
                        <AlertTriangle className="w-10 h-10 text-amber-500" />
                        <span className="font-mono text-[10px] uppercase">Cliente não localizado.</span>
                    </div>
                ) : (
                    <>
                        {/* Summary Card */}
                        <div className="p-8 bg-neutral-900/20 border-b border-neutral-800">
                            <div className="space-y-4">
                                <div>
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <input
                                                className="w-full bg-neutral-950 border border-neutral-800 p-3 rounded-lg text-lg font-black uppercase italic outline-none focus:border-primary-500"
                                                value={editedClient.nome}
                                                onChange={e => setEditedClient({ ...editedClient, nome: e.target.value })}
                                            />
                                            <input
                                                placeholder="Razão Social"
                                                className="w-full bg-neutral-950 border border-neutral-800 p-3 rounded-lg text-xs font-bold text-neutral-400 uppercase outline-none focus:border-primary-500"
                                                value={editedClient.razao_social || ''}
                                                onChange={e => setEditedClient({ ...editedClient, razao_social: e.target.value })}
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <h1 className="text-3xl font-black text-neutral-100 italic tracking-tighter uppercase leading-none">{client.nome}</h1>
                                            <p className="text-sm font-bold text-neutral-500 uppercase mt-1 italic">{client.razao_social || 'Produtor Rural'}</p>
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-4 text-[10px] font-mono uppercase">
                                    <span className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded-md border border-neutral-800"><ShieldAlert className="w-3 h-3 text-primary-500" /> {client.cnpj_cpf}</span>
                                    <span className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded-md border border-neutral-800"><MapPin className="w-3 h-3 text-primary-500" /> {client.cidade}/{client.estado}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-neutral-800 bg-neutral-900/10 px-4">
                            {[
                                { id: 'unidades', label: 'Propriedades', icon: Landmark },
                                { id: 'rh', label: 'RH', icon: Users },
                                { id: 'fiscal', label: 'Fiscal', icon: FileText },
                                { id: 'vencimentos', label: 'Venc.', icon: Clock },
                                { id: 'dados', label: 'Dados', icon: Mail }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-4 py-4 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === tab.id
                                        ? 'border-primary-500 text-primary-500 bg-primary-500/5'
                                        : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
                                >
                                    <tab.icon className="w-3 h-3" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar bg-neutral-950/50 relative">
                            {/* Modal de Fazenda interno ao Sidebar */}
                            {isUnitModalOpen && (
                                <div className="absolute inset-x-0 bottom-0 top-0 z-[150] bg-neutral-950 p-8 flex flex-col space-y-8 animate-in slide-in-from-bottom duration-500">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-black italic uppercase text-neutral-100">{editingUnit ? 'Ajustar Propriedade' : 'Nova Fazenda'}</h3>
                                        <button onClick={() => setIsUnitModalOpen(false)} className="text-neutral-500 hover:text-white"><X className="w-6 h-6" /></button>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Identificador da Área</label>
                                            <input className="w-full bg-neutral-900 border border-neutral-800 p-4 text-xs font-black uppercase italic tracking-widest text-emerald-500 outline-none"
                                                value={unitFormData.nome_identificador} onChange={e => setUnitFormData({ ...unitFormData, nome_identificador: e.target.value })} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Inscrição Estadual</label>
                                                <input className="w-full bg-neutral-900 border border-neutral-800 p-4 text-xs font-mono text-neutral-300 outline-none"
                                                    value={unitFormData.inscricao_estadual} onChange={e => setUnitFormData({ ...unitFormData, inscricao_estadual: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">CAEPF / DOC</label>
                                                <input className="w-full bg-neutral-900 border border-neutral-800 p-4 text-xs font-mono text-neutral-300 outline-none"
                                                    value={unitFormData.documento_id} onChange={e => setUnitFormData({ ...unitFormData, documento_id: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={handleSaveUnit} className="w-full py-4 bg-emerald-500 text-neutral-950 font-black uppercase text-xs tracking-[0.2em] shadow-[8px_8px_0px_#064e3b] transition-all active:scale-95 active:shadow-none hover:bg-emerald-400">
                                        SALVAR PROPRIEDADE
                                    </button>
                                </div>
                            )}

                            {activeTab === 'unidades' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 italic">Unidades Fiscais</h3>
                                        <div className="flex gap-4">
                                            <button onClick={() => handleOpenUnitModal()} className="text-[9px] font-black text-primary-500 border border-primary-500/20 px-2 py-1 rounded hover:bg-primary-500/5 transition-all">+ ADD</button>
                                            {client.drive_folder_id && (
                                                <a href={`https://drive.google.com/drive/folders/${client.drive_folder_id}`} target="_blank" className="text-[9px] font-black text-green-500 flex items-center gap-1 hover:underline">
                                                    <FolderOpen className="w-3 h-3" /> DRIVE
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid gap-4">
                                        {unidades.length === 0 ? (
                                            <div className="p-8 text-center border-2 border-dashed border-neutral-900 rounded-2xl">
                                                <p className="text-[10px] font-bold text-neutral-700 uppercase">Sem propriedades listadas.</p>
                                            </div>
                                        ) : (
                                            unidades.map(u => (
                                                <div key={u.id} className="p-5 bg-neutral-900/50 border border-neutral-800 rounded-2xl group hover:border-primary-500/30 transition-all flex justify-between items-center">
                                                    <div>
                                                        <h4 className="text-sm font-black text-neutral-200 uppercase italic">{u.nome_identificador}</h4>
                                                        <p className="text-[9px] font-mono text-neutral-500 mt-1 uppercase">IE: {u.inscricao_estadual || '---'}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${u.status === 'ATIVA' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                                                            {u.status}
                                                        </span>
                                                        <button onClick={() => handleOpenUnitModal(u)} className="p-2 opacity-0 group-hover:opacity-100 transition-all text-neutral-600 hover:text-primary-500">
                                                            <Edit className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'rh' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 italic">Arquivos de RH e Folha</h3>
                                    {loadingRh ? (
                                        <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
                                    ) : rhFiles.length === 0 ? (
                                        <div className="p-12 text-center border-2 border-dashed border-neutral-900 rounded-2xl">
                                            <Users className="w-8 h-8 text-neutral-900 mx-auto mb-3" />
                                            <p className="text-[10px] font-bold text-neutral-700 uppercase italic">Nenhum arquivo de RH detectado.</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-2">
                                            {rhFiles.map(file => (
                                                <a key={file.id} href={file.webViewLink} target="_blank" className="flex items-center justify-between p-4 bg-neutral-900/40 border border-neutral-800 rounded-xl hover:border-primary-500/50 transition-all group">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className={`w-4 h-4 ${file.mimeType.includes('pdf') ? 'text-red-400' : 'text-blue-400'}`} />
                                                        <span className="text-[10px] font-bold text-neutral-300 uppercase truncate max-w-[300px]">{file.name}</span>
                                                    </div>
                                                    <ExternalLink className="w-3 h-3 text-neutral-600 group-hover:text-primary-500 transition-colors" />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'fiscal' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 italic">Cronograma de Obrigações</h3>
                                    <div className="grid gap-3">
                                        {cronograma.map(ob => (
                                            <div key={ob.id} className="flex items-center justify-between p-4 bg-neutral-900/30 border border-neutral-800 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${ob.status === 'concluido' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 animate-pulse'}`} />
                                                    <span className="text-[10px] font-black text-neutral-100 uppercase">{ob.tipo}</span>
                                                </div>
                                                <span className="text-[9px] font-mono text-neutral-500 uppercase italic">
                                                    {new Date(ob.competencia).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'vencimentos' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 italic">Radar de Certidões e Validades</h3>
                                    <div className="grid gap-4">
                                        {validades.length === 0 ? (
                                            <div className="p-12 text-center border-2 border-dashed border-neutral-900 rounded-2xl">
                                                <p className="text-[10px] font-bold text-neutral-700 uppercase">Validades em dia.</p>
                                            </div>
                                        ) : (
                                            validades.map(v => (
                                                <div key={v.id} className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-[20px] flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Clock className="w-4 h-4 text-amber-500" />
                                                        <div>
                                                            <p className="text-[10px] font-black text-neutral-200 uppercase">{v.tipo_documento}</p>
                                                            <p className="text-[8px] font-mono text-neutral-600 uppercase italic">{v.unidade?.nome_identificador || 'Geral'}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-black text-amber-500 italic font-mono tracking-tighter">
                                                        {new Date(v.data_vencimento).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'dados' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 italic">Informações Cadastrais</h3>
                                    <div className="grid gap-3">
                                        {[
                                            { label: 'E-mail', value: client.email, icon: Mail },
                                            { label: 'WhatsApp', value: client.telefone_whatsapp, icon: Phone },
                                            { label: 'Endereço', value: `${client.logradouro}, ${client.numero}`, icon: MapPin },
                                            { label: 'Cidade/UF', value: `${client.cidade}/${client.estado}`, icon: Landmark },
                                            { label: 'Regime', value: client.regime_tributario, icon: Briefcase }
                                        ].map((info, idx) => (
                                            <div key={idx} className="flex items-center gap-4 bg-neutral-900/40 p-4 rounded-xl border border-neutral-800">
                                                <info.icon className="w-4 h-4 text-neutral-700" />
                                                <div>
                                                    <p className="text-[8px] font-black text-neutral-600 uppercase tracking-tighter">{info.label}</p>
                                                    <p className="text-[10px] font-bold text-neutral-300 uppercase italic truncate max-w-[300px]">{info.value || 'Não informado'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Footer / Quick Actions */}
                <div className="p-6 border-t border-neutral-800 bg-neutral-900/30 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-3 text-[10px] font-black uppercase text-neutral-500 hover:text-neutral-300 transition-colors">Fechar Vista</button>
                    {client?.telefone_whatsapp && (
                        <a
                            href={`https://wa.me/55${client.telefone_whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            className="flex-[2] py-3 bg-emerald-600 text-neutral-950 text-[10px] font-black uppercase rounded-lg text-center hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        >
                            ENVIAR WHATSAPP
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}
