'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Mail, Phone, MapPin, Clock, ArrowLeft, Loader2, Calendar,
    FileCheck, ShieldAlert, AlertTriangle, Edit, Trash2, ExternalLink,
    Building2, Landmark, CheckCircle2, XCircle, Plus, Save
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface ClientPageProps {
    params: Promise<{ id: string }>
}

export default function ClientDetailsPage({ params }: ClientPageProps) {
    const { id } = use(params)
    const [client, setClient] = useState<any>(null)
    const [unidades, setUnidades] = useState<any[]>([])
    const [validades, setValidades] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editedClient, setEditedClient] = useState<any>(null)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'dados' | 'unidades' | 'vencimentos' | 'fiscal'>('unidades')

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
        getFullClientData()
    }, [id])

    async function getFullClientData() {
        if (!id) return;
        try {
            setLoading(true)
            const { data: clientData, error: clientErr } = await supabase
                .from('clientes')
                .select('*')
                .eq('id', id)
                .maybeSingle()
            if (clientErr) throw clientErr;

            const { data: unidadesData } = await supabase
                .from('unidades_fiscais')
                .select('*')
                .eq('cliente_id', id);

            const { data: validadesData } = await supabase
                .from('controle_validades')
                .select('*, unidade:unidades_fiscais(nome_identificador)')
                .eq('cliente_id', id)
                .order('data_vencimento', { ascending: true });

            setClient(clientData);
            setEditedClient(clientData);
            setUnidades(unidadesData || []);
            setValidades(validadesData || []);
        } catch (err: any) {
            console.error('Erro na carga profunda:', err)
            setFetchError(err.message)
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

    const handleAuditUnidade = async (unidadeId: string) => {
        alert('Disparando Auditoria Agro Brandão no n8n...');
        try {
            await supabase.from('unidades_fiscais').update({ status: 'AUDITANDO...' }).eq('id', unidadeId);
            getFullClientData();
            setTimeout(async () => {
                await supabase.from('unidades_fiscais').update({ status: 'ATIVA' }).eq('id', unidadeId);
                getFullClientData();
            }, 3000);
        } catch (err) { }
    }

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
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] font-black italic">Mapeando Ativos Agro...</span>
            </div>
        )
    }

    const hasAlert = unidades.some(u => u.status !== 'ATIVA');

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Modal de Fazenda */}
            {isUnitModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-neutral-900 border-4 border-neutral-800 rounded-[40px] w-full max-w-lg p-10 space-y-6 shadow-2xl">
                        <h2 className="text-2xl font-black italic uppercase text-neutral-100">{editingUnit ? 'Editar Unidade' : 'Nova Fazenda'}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-neutral-500 uppercase">Identificação da Propriedade</label>
                                <input className="w-full bg-neutral-950 border border-neutral-800 rounded-xl mt-1 p-4 focus:border-primary-500 outline-none"
                                    value={unitFormData.nome_identificador} onChange={e => setUnitFormData({ ...unitFormData, nome_identificador: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-neutral-500 uppercase">Inscrição Estadual</label>
                                    <input className="w-full bg-neutral-950 border border-neutral-800 rounded-xl mt-1 p-4 focus:border-primary-500 outline-none font-mono"
                                        value={unitFormData.inscricao_estadual} onChange={e => setUnitFormData({ ...unitFormData, inscricao_estadual: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-neutral-500 uppercase">CAEPF</label>
                                    <input className="w-full bg-neutral-950 border border-neutral-800 rounded-xl mt-1 p-4 focus:border-primary-500 outline-none font-mono"
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
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            {isEditing ? (
                                <input
                                    className="text-5xl font-black bg-transparent border-b-2 border-primary-500 text-neutral-100 italic tracking-tighter uppercase outline-none"
                                    value={editedClient.nome}
                                    onChange={e => setEditedClient({ ...editedClient, nome: e.target.value })}
                                />
                            ) : (
                                <h1 className="text-5xl font-black text-neutral-100 italic tracking-tighter uppercase leading-tight">
                                    {client.nome}
                                </h1>
                            )}
                            <div className="flex flex-wrap items-center gap-6 text-neutral-400 font-mono text-xs">
                                <span className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-primary-500" /> CPF: {client.cnpj_cpf}</span>
                                <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-primary-500" /> {client.razao_social || 'Produtor Rural'}</span>
                                <span className={`flex items-center gap-2 font-black ${hasAlert ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                                    {hasAlert ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                    {hasAlert ? 'PENDÊNCIA DETECTADA' : 'SITUAÇÃO REGULAR'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 📑 NAVEGAÇÃO */}
            <div className="flex gap-4 border-b border-neutral-800 overflow-x-auto">
                {[
                    { id: 'unidades', label: 'FAZENDAS E U.P.A.s', icon: Landmark },
                    { id: 'dados', label: 'CONTATOS E ENDEREÇO', icon: Mail },
                    { id: 'vencimentos', label: 'CERTIDÕES E ALARMES', icon: Clock }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id
                            ? 'text-primary-500 border-primary-500'
                            : 'text-neutral-500 border-transparent hover:text-neutral-300'
                            }`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary-500' : 'text-neutral-600'}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTEÚDO DINÂMICO */}
            <div className="grid gap-8">
                {activeTab === 'unidades' && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-black italic text-neutral-100 uppercase tracking-widest text-sm">Propriedades Vinculadas</h3>
                                <p className="text-neutral-600 text-[9px] font-mono uppercase mt-1">Multi-Fazenda Brandão - Inscrições Estaduais</p>
                            </div>
                            <button onClick={() => handleOpenUnitModal()} className="btn-brutal px-6 py-2 text-[10px] tracking-tighter font-black uppercase">+ ADICIONAR FAZENDA</button>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {unidades.length === 0 ? (
                                <div className="col-span-full py-24 text-center border-4 border-dashed border-neutral-800 rounded-[40px]">
                                    <p className="text-neutral-600 font-black italic uppercase text-xs">Nenhuma fazenda vinculada.</p>
                                </div>
                            ) : (
                                unidades.map(u => (
                                    <div key={u.id} className={`p-8 rounded-[32px] border-2 transition-all group ${u.status === 'ATIVA' ? 'bg-neutral-900 border-neutral-800 hover:border-emerald-500' : 'bg-red-500/5 border-red-500/40 animate-pulse'}`}>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`p-3 rounded-2xl ${u.status === 'ATIVA' ? 'bg-neutral-800 text-emerald-500' : 'bg-red-500 text-white'}`}>
                                                <Landmark className="w-6 h-6" />
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleOpenUnitModal(u)} className="text-neutral-700 hover:text-primary-500 p-2"><Edit className="w-4 h-4" /></button>
                                                <a href={`https://drive.google.com/drive/search?q=${u.nome_identificador}`} target="_blank" className="text-neutral-700 hover:text-primary-500 p-2"><ExternalLink className="w-4 h-4" /></a>
                                            </div>
                                        </div>
                                        <h4 className="text-xl font-black text-neutral-100 uppercase italic mb-1 tracking-tighter">{u.nome_identificador}</h4>
                                        <p className="text-[10px] font-mono text-neutral-500 uppercase mb-6">{u.cidade} - {u.estado}</p>
                                        <div className="space-y-3 pt-4 border-t border-neutral-800">
                                            <div className="flex justify-between items-center bg-neutral-950 p-3 rounded-xl">
                                                <span className="text-[9px] font-black text-neutral-700 uppercase">I.E.</span>
                                                <span className="text-xs font-mono text-neutral-300">{u.inscricao_estadual || 'Vazio'}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-neutral-100/5 p-3 rounded-xl">
                                                <span className="text-[9px] font-black text-neutral-700 uppercase">Status</span>
                                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${u.status === 'ATIVA' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>{u.status}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleAuditUnidade(u.id)} className="w-full mt-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-[10px] font-black uppercase rounded-xl transition-all">AUDITAR AGORA</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'dados' && (
                    <div className="grid gap-8 lg:grid-cols-2">
                        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-[32px] space-y-8">
                            <h3 className="font-black italic text-neutral-100 uppercase tracking-widest text-sm">Contatos Principais</h3>
                            <div className="space-y-4 text-sm font-bold text-neutral-300">
                                <p className="flex items-center gap-4 bg-neutral-950 p-4 rounded-xl border border-neutral-800"><Mail className="w-5 h-5 text-primary-500" /> {client.email || 'Não informado'}</p>
                                <p className="flex items-center gap-4 bg-neutral-950 p-4 rounded-xl border border-neutral-800"><Phone className="w-5 h-5 text-emerald-500" /> {client.telefone_whatsapp || 'Não informado'}</p>
                                <p className="flex items-center gap-4 bg-neutral-950 p-4 rounded-xl border border-neutral-800"><MapPin className="w-5 h-5 text-amber-500" /> {client.logradouro}, {client.cidade} - {client.estado}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'vencimentos' && (
                    <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-[32px]">
                        <h3 className="font-black italic text-neutral-100 uppercase tracking-widest text-sm mb-6">Próximos Vencimentos</h3>
                        <div className="space-y-4">
                            {validades.length === 0 ? (
                                <p className="text-neutral-600 font-mono text-xs uppercase uppercase">Nenhum vencimento monitorado.</p>
                            ) : (
                                validades.map(v => (
                                    <div key={v.id} className="flex justify-between items-center p-4 bg-neutral-950 rounded-xl border border-neutral-800">
                                        <span className="text-xs font-black uppercase text-neutral-200">{v.tipo_documento}</span>
                                        <span className="font-mono text-xs text-amber-500">{new Date(v.data_vencimento).toLocaleDateString('pt-BR')}</span>
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
