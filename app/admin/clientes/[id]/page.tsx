'use client'

import { useEffect, useState, use } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    Mail, Phone, MapPin, Clock, ArrowLeft, Loader2, Calendar,
    FileCheck, ShieldAlert, AlertTriangle, Edit, Trash2, ExternalLink,
    Building2, Landmark, CheckCircle2, XCircle, Plus, Save, Users,
    FileText, Briefcase, Download, History, FolderOpen
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function ClientDetailsPage() {
    const params = useParams()
    const id = params?.id as string

    const [client, setClient] = useState<any>(null)
    const [unidades, setUnidades] = useState<any[]>([])
    const [validades, setValidades] = useState<any[]>([])
    const [rhFiles, setRhFiles] = useState<any[]>([])
    const [cronograma, setCronograma] = useState<any[]>([])

    const [loading, setLoading] = useState(true)
    const [loadingRh, setLoadingRh] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editedClient, setEditedClient] = useState<any>(null)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'unidades' | 'dados' | 'rh' | 'fiscal' | 'vencimentos'>('unidades')

    // Estados para gestão de fazendas
    const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<any>(null);
    const [unitFormData, setUnitFormData] = useState({
        nome_identificador: '',
        inscricao_estadual: '',
        tipo_unidade: 'PROPRIEDADE_RURAL',
        documento_id: '',
        cidade: 'Sidrolândia',
        estado: 'MS'
    });

    const supabase = createClient()

    useEffect(() => {
        if (id) {
            getFullClientData()
        }
    }, [id])

    useEffect(() => {
        if (activeTab === 'rh' && client?.drive_folder_id && rhFiles.length === 0) {
            fetchRhFiles()
        }
    }, [activeTab, client?.drive_folder_id])

    async function getFullClientData() {
        try {
            setLoading(true)
            const { data: clientData, error: clientErr } = await supabase
                .from('clientes')
                .select('*')
                .eq('id', id)
                .maybeSingle()
            if (clientErr) throw clientErr;

            if (!clientData) {
                setFetchError("Cliente não encontrado.")
                return
            }

            const { data: unidadesData } = await supabase
                .from('unidades_fiscais')
                .select('*')
                .eq('cliente_id', id);

            const { data: validadesData } = await supabase
                .from('controle_validades')
                .select('*, unidade:unidades_fiscais(nome_identificador)')
                .eq('cliente_id', id)
                .order('data_vencimento', { ascending: true });

            const { data: cronogramaData } = await supabase
                .from('obrigacoes_acessorias')
                .select('*')
                .eq('cliente_id', id)
                .order('competencia', { ascending: false })
                .limit(20);

            setClient(clientData);
            setEditedClient(clientData);
            setUnidades(unidadesData || []);
            setValidades(validadesData || []);
            setCronograma(cronogramaData || []);
        } catch (err: any) {
            console.error('Erro na carga profunda:', err)
            setFetchError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function fetchRhFiles() {
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
            const data = {
                ...unitFormData,
                cliente_id: id,
                status: 'ATIVA'
            };
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

    const handleSaveProfile = async () => {
        try {
            const { error } = await supabase
                .from('clientes')
                .update(editedClient)
                .eq('id', id);
            if (error) throw error;
            setClient(editedClient);
            setIsEditing(false);
            alert('Perfil atualizado com sucesso!');
        } catch (err: any) {
            alert('Erro ao salvar: ' + err.message);
        }
    }

    if (loading) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-primary-500 animate-pulse">
                <Loader2 className="w-12 h-12 animate-spin" />
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] font-black italic text-center">Mapeando Ativos Agro...<br />Sincronizando com G-Drive</span>
            </div>
        )
    }

    if (fetchError || !client) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-6 text-neutral-500">
                <AlertTriangle className="w-16 h-16 text-amber-500" />
                <div className="text-center">
                    <h2 className="text-xl font-black uppercase italic">Ops! Algo deu errado.</h2>
                    <p className="text-xs font-mono uppercase mt-2">{fetchError || 'Cliente não encontrado no Supabase.'}</p>
                </div>
                <Link href="/admin/clientes" className="btn-brutal px-8 py-3 bg-neutral-800 text-neutral-100 text-[10px] font-black uppercase">Voltar para Clientes</Link>
            </div>
        )
    }

    const hasAlert = unidades.some(u => u.status !== 'ATIVA');

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-20">
            {/* Modal de Fazenda */}
            {isUnitModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-neutral-900 border-4 border-neutral-800 rounded-[40px] w-full max-w-lg p-10 space-y-6 shadow-2xl">
                        <h2 className="text-2xl font-black italic uppercase text-neutral-100">{editingUnit ? 'Editar Unidade' : 'Nova Fazenda'}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-neutral-500 uppercase">Identificação da Propriedade</label>
                                <input className="w-full bg-neutral-950 border border-neutral-800 rounded-xl mt-1 p-4 focus:border-primary-500 outline-none text-neutral-200"
                                    value={unitFormData.nome_identificador} onChange={e => setUnitFormData({ ...unitFormData, nome_identificador: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-neutral-500 uppercase">Inscrição Estadual</label>
                                    <input className="w-full bg-neutral-950 border border-neutral-800 rounded-xl mt-1 p-4 focus:border-primary-500 outline-none font-mono text-neutral-200"
                                        value={unitFormData.inscricao_estadual} onChange={e => setUnitFormData({ ...unitFormData, inscricao_estadual: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-neutral-500 uppercase">CAEPF</label>
                                    <input className="w-full bg-neutral-950 border border-neutral-800 rounded-xl mt-1 p-4 focus:border-primary-500 outline-none font-mono text-neutral-200"
                                        value={unitFormData.documento_id} onChange={e => setUnitFormData({ ...unitFormData, documento_id: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setIsUnitModalOpen(false)} className="flex-1 py-4 text-neutral-500 font-black uppercase text-xs">Cancelar</button>
                            <button onClick={handleSaveUnit} className="flex-[2] btn-brutal py-4 bg-primary-500 text-neutral-950 font-black uppercase">Salvar Fazenda</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🔝 HEADER AGRO PRO MAX */}
            <div className={`p-8 border-b-4 ${hasAlert ? 'border-red-500 bg-red-500/5' : 'border-emerald-500 bg-neutral-900/50'} backdrop-blur-md rounded-3xl transition-all`}>
                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <Link href="/admin/clientes" className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-500 transition-colors uppercase font-black text-[10px] tracking-widest">
                            <ArrowLeft className="w-4 h-4" /> LISTAGEM GERAL
                        </Link>
                        <div className="flex gap-3">
                            {isEditing ? (
                                <button onClick={handleSaveProfile} className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-neutral-950 text-[10px] font-black uppercase transition-all rounded-xl hover:bg-emerald-400">
                                    <Save className="w-4 h-4" /> SALVAR DADOS
                                </button>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-3 bg-neutral-800 text-neutral-200 text-[10px] font-black uppercase transition-all rounded-xl border border-neutral-700 hover:border-primary-500">
                                    <Edit className="w-4 h-4" /> EDITAR PERFIL
                                </button>
                            )}
                            {client.drive_folder_id && (
                                <a href={`https://drive.google.com/drive/folders/${client.drive_folder_id}`} target="_blank" className="flex items-center gap-2 px-6 py-3 bg-neutral-800 text-neutral-200 text-[10px] font-black uppercase transition-all rounded-xl border border-neutral-700 hover:border-green-500">
                                    <FolderOpen className="w-4 h-4 text-green-500" /> ABRIR DRIVE
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            {isEditing ? (
                                <div className="space-y-2">
                                    <input
                                        className="text-4xl font-black bg-transparent border-b-2 border-primary-500 text-neutral-100 italic tracking-tighter uppercase outline-none w-full"
                                        value={editedClient.nome}
                                        onChange={e => setEditedClient({ ...editedClient, nome: e.target.value })}
                                    />
                                    <input
                                        placeholder="Razão Social"
                                        className="text-xl font-bold bg-transparent border-b border-neutral-700 text-neutral-400 w-full outline-none mt-2"
                                        value={editedClient.razao_social || ''}
                                        onChange={e => setEditedClient({ ...editedClient, razao_social: e.target.value })}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <h1 className="text-5xl font-black text-neutral-100 italic tracking-tighter uppercase leading-tight">
                                        {client.nome}
                                    </h1>
                                    <p className="text-xl font-bold text-neutral-500 uppercase mt-1 italic">{client.razao_social || 'Produtor Rural'}</p>
                                </div>
                            )}
                            <div className="flex flex-wrap items-center gap-6 text-neutral-400 font-mono text-[10px] uppercase">
                                <span className="flex items-center gap-2 bg-neutral-950 p-2 rounded-lg border border-neutral-800"><ShieldAlert className="w-3 h-3 text-primary-500" /> ID: {client.cnpj_cpf}</span>
                                <span className="flex items-center gap-2 bg-neutral-950 p-2 rounded-lg border border-neutral-800"><MapPin className="w-3 h-3 text-primary-500" /> {client.cidade} - {client.estado}</span>
                                <span className={`flex items-center gap-2 font-black p-2 rounded-lg bg-neutral-950 border ${hasAlert ? 'text-red-500 animate-pulse border-red-500/30' : 'text-emerald-500 border-emerald-500/30'}`}>
                                    {hasAlert ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                                    {hasAlert ? 'PENDÊNCIA AGRO' : 'REGULARIDADE OK'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 📑 NAVEGAÇÃO INTERATIVA */}
            <div className="flex gap-2 p-2 bg-neutral-900/30 rounded-2xl border border-neutral-800 overflow-x-auto no-scrollbar">
                {[
                    { id: 'unidades', label: 'Propriedades', icon: Landmark },
                    { id: 'rh', label: 'RH / Funcionários', icon: Users },
                    { id: 'fiscal', label: 'Fiscal / Impostos', icon: FileText },
                    { id: 'vencimentos', label: 'Certidões', icon: Clock },
                    { id: 'dados', label: 'Contatos', icon: Mail }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-[0.1em] transition-all rounded-xl border ${activeTab === tab.id
                            ? 'bg-primary-500 text-neutral-950 border-primary-500 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]'
                            : 'text-neutral-500 border-transparent hover:bg-neutral-800 hover:text-neutral-300'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTEÚDO DINÂMICO */}
            <div className="grid gap-8">
                {activeTab === 'unidades' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-black italic text-neutral-100 uppercase tracking-widest text-sm">Estrutura Patrimonial</h3>
                                <p className="text-neutral-600 text-[9px] font-mono uppercase mt-1">Multi-Fazenda Brandão - Inscrições Estaduais Ativas</p>
                            </div>
                            <button onClick={() => handleOpenUnitModal()} className="px-6 py-2 bg-neutral-800 text-primary-400 border border-neutral-700 text-[9px] font-black uppercase rounded-lg hover:border-primary-500 transition-all">+ FAZENDA</button>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {unidades.length === 0 ? (
                                <div className="col-span-full py-16 text-center border-2 border-dashed border-neutral-800 rounded-3xl">
                                    <p className="text-neutral-600 font-bold uppercase text-[10px]">Nenhuma fazenda vinculada.</p>
                                </div>
                            ) : (
                                unidades.map(u => (
                                    <div key={u.id} className={`p-8 rounded-3xl border transition-all flex flex-col justify-between ${u.status === 'ATIVA' ? 'bg-neutral-900/50 border-neutral-800 hover:border-emerald-500' : 'bg-red-500/5 border-red-500/40 animate-pulse'}`}>
                                        <div className="flex justify-between items-start mb-6">
                                            <Landmark className={`w-8 h-8 ${u.status === 'ATIVA' ? 'text-emerald-500' : 'text-red-500'}`} />
                                            <div className="flex gap-1">
                                                <button onClick={() => handleOpenUnitModal(u)} className="p-2 text-neutral-600 hover:text-primary-400 transition-colors"><Edit className="w-4 h-4" /></button>
                                                <button className="p-2 text-neutral-600 hover:text-error-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-black text-neutral-100 uppercase italic tracking-tighter">{u.nome_identificador}</h4>
                                            <p className="text-[10px] font-mono text-neutral-500 uppercase">{u.cidade} - {u.estado}</p>
                                        </div>
                                        <div className="mt-6 pt-6 border-t border-neutral-800 space-y-2">
                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-neutral-600 font-black uppercase">Inscrição</span>
                                                <span className="text-neutral-100 font-mono">{u.inscricao_estadual || '---'}</span>
                                            </div>
                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-neutral-600 font-black uppercase">Status</span>
                                                <span className={`${u.status === 'ATIVA' ? 'text-emerald-500' : 'text-red-500'} font-black italic`}>{u.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'rh' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-2 duration-500">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-black italic text-neutral-100 uppercase tracking-widest text-sm flex items-center gap-2">
                                        <Users className="w-5 h-5 text-primary-500" /> Funcionários e Recibos
                                    </h3>
                                    {loadingRh && <Loader2 className="w-4 h-4 animate-spin text-primary-500" />}
                                </div>
                                <div className="space-y-3">
                                    {rhFiles.length === 0 && !loadingRh ? (
                                        <div className="p-10 text-center border-2 border-dashed border-neutral-800 rounded-2xl">
                                            <Users className="w-10 h-10 text-neutral-800 mx-auto mb-4" />
                                            <p className="text-neutral-600 font-bold uppercase text-[10px]">Nenhuma pasta de RH localizada no Drive.</p>
                                        </div>
                                    ) : (
                                        rhFiles.map(file => (
                                            <div key={file.id} className="group p-4 bg-neutral-950 border border-neutral-800 rounded-xl hover:border-primary-500/50 transition-all flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-neutral-900 rounded-lg">
                                                        {file.mimeType.includes('pdf') ? <FileText className="w-5 h-5 text-red-400" /> : <Landmark className="w-5 h-5 text-blue-400" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-neutral-200 uppercase truncate max-w-md">{file.name}</p>
                                                        <p className="text-[9px] text-neutral-600 font-mono uppercase">{new Date(file.modifiedTime).toLocaleDateString()} • RH BRANDÃO</p>
                                                    </div>
                                                </div>
                                                <a href={file.webViewLink} target="_blank" className="p-2 opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-primary-500 transition-all">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-primary-500 p-8 rounded-3xl text-neutral-950 shadow-[0_0_40px_rgba(var(--primary-rgb),0.2)]">
                                <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Painel RH</h4>
                                <p className="text-xs font-bold uppercase opacity-80 mb-6 border-b border-black/10 pb-4 italic">Sentinela de Funcionários</p>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-black/5 p-4 rounded-2xl">
                                        <span className="text-[10px] font-black uppercase">Registros Ativos</span>
                                        <span className="text-xl font-black italic">--</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-black/5 p-4 rounded-2xl">
                                        <span className="text-[10px] font-black uppercase">Salário Total</span>
                                        <span className="text-xl font-black italic">R$ --</span>
                                    </div>
                                </div>
                                <button className="w-full mt-6 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">AUDITAR FOLHA</button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'fiscal' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl">
                            <h3 className="font-black italic text-neutral-100 uppercase tracking-widest text-sm mb-8 flex items-center gap-2">
                                <History className="w-5 h-5 text-primary-500" /> Histórico de Transmissões
                            </h3>
                            <div className="grid gap-4">
                                {cronograma.map(ob => (
                                    <div key={ob.id} className="flex items-center justify-between p-5 bg-neutral-950 border border-neutral-800 rounded-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${ob.status === 'concluido' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                {ob.status === 'concluido' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-neutral-200 uppercase">{ob.tipo}</p>
                                                <p className="text-[9px] text-neutral-500 font-mono uppercase">COMP: {new Date(ob.competencia).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${ob.status === 'concluido' ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'}`}>
                                                {ob.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'dados' && (
                    <div className="grid gap-8 lg:grid-cols-2 animate-in slide-in-from-bottom-2 duration-500">
                        <div className="bg-neutral-900 border border-neutral-800 p-10 rounded-[40px] space-y-8">
                            <h3 className="font-black italic text-neutral-100 uppercase tracking-widest text-sm text-center">Cadastro Completo</h3>
                            <div className="grid gap-4">
                                {[
                                    { label: 'E-mail', value: client.email, icon: Mail },
                                    { label: 'WhatsApp', value: client.telefone_whatsapp, icon: Phone },
                                    { label: 'Endereço', value: `${client.logradouro}, ${client.numero}`, icon: MapPin },
                                    { label: 'Bairro', value: client.bairro, icon: Building2 },
                                    { label: 'Cidade/UF', value: `${client.cidade} - ${client.estado}`, icon: Landmark },
                                    { label: 'Regime', value: client.regime_tributario?.replace('_', ' '), icon: Briefcase }
                                ].map((info, idx) => (
                                    <div key={idx} className="flex items-center gap-4 bg-neutral-950 p-5 rounded-2xl border border-neutral-800 group hover:border-primary-500/30 transition-all">
                                        <info.icon className="w-5 h-5 text-primary-500 opacity-40 group-hover:opacity-100" />
                                        <div>
                                            <p className="text-[9px] font-black text-neutral-600 uppercase mb-0.5">{info.label}</p>
                                            <p className="text-xs font-bold text-neutral-300 uppercase italic">{info.value || 'Vazio'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'vencimentos' && (
                    <div className="bg-neutral-900 border border-neutral-800 p-10 rounded-[40px] animate-in slide-in-from-bottom-2 duration-500">
                        <h3 className="font-black italic text-neutral-100 uppercase tracking-widest text-sm mb-10 text-center">Radar de Validades</h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {validades.length === 0 ? (
                                <div className="col-span-full py-16 text-center">
                                    <p className="text-neutral-600 font-bold uppercase text-[10px]">Nenhum vencimento monitorado para este cliente.</p>
                                </div>
                            ) : (
                                validades.map(v => (
                                    <div key={v.id} className="p-6 bg-neutral-950 rounded-2xl border border-dashed border-neutral-800 flex flex-col justify-between group hover:border-amber-500/50 transition-all">
                                        <div className="flex justify-between mb-4">
                                            <span className="p-2 bg-neutral-900 rounded-lg text-amber-500"><Clock className="w-5 h-5" /></span>
                                            <span className="text-[10px] font-black text-neutral-700 uppercase italic">{v.unidade?.nome_identificador || 'Geral'}</span>
                                        </div>
                                        <h5 className="font-black text-neutral-200 uppercase text-xs mb-1">{v.tipo_documento}</h5>
                                        <p className="font-mono text-xl text-amber-500 italic tracking-tighter">
                                            {new Date(v.data_vencimento).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
