"use client";

import React, { useState, useEffect, Suspense } from 'react';
import {
    Search,
    Plus,
    Filter,
    Phone,
    Mail,
    Trash2,
    Edit,
    Eye,
    Loader2,
    AlertCircle,
    X,
    CheckCircle2,
    FolderOpen,
    ExternalLink,
    FolderX,
    ArrowRight,
    MapPin,
    ShieldAlert
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import ClientDetailSidebar from './components/ClientDetailSidebar';

const supabase = createClient();

export const dynamic = 'force-dynamic';

function ClientesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchTerm, setSearchTerm] = useState('');
    const [clientes, setClientes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

    // Modal State (Cadastro Rápido)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<any>(null);
    const [formData, setFormData] = useState<any>({
        nome: '',
        cnpj_cpf: '',
        telefone_whatsapp: '',
        email: '',
        razao_social: '',
        regime_tributario: '',
        cnae_principal: '',
        logradouro: '',
        numero: '',
        bairro: '',
        cep: '',
        cidade: 'Sidrolândia',
        estado: 'MS',
        inscricao_estadual: '',
        inscricao_municipal: '',
        status_rfb: 'ATIVA',
        drive_folder_id: ''
    });
    const [consulting, setConsulting] = useState(false);

    useEffect(() => {
        fetchClientes();

        // Handle deep link via query param
        const idFromUrl = searchParams.get('id');
        if (idFromUrl) {
            setSelectedClientId(idFromUrl);
            setIsSidebarOpen(true);
        }
    }, [searchParams]);

    async function fetchClientes() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('clientes')
                .select('*')
                .order('nome', { ascending: true });

            if (error) throw error;
            setClientes(data || []);
        } catch (err: any) {
            console.error(err);
            setError('Erro ao carregar dados.');
        } finally {
            setLoading(false);
        }
    }

    const filteredClientes = clientes.filter(c =>
        c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.cnpj_cpf?.toString().includes(searchTerm) ||
        c.razao_social?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenDetails = (id: string) => {
        setSelectedClientId(id);
        setIsSidebarOpen(true);
        // Update URL without full reload
        router.push(`/admin/clientes?id=${id}`, { scroll: false });
    };

    const handleCloseDetails = () => {
        setIsSidebarOpen(false);
        setSelectedClientId(null);
        router.push('/admin/clientes', { scroll: false });
    };

    const handleOpenModal = (client: any = null) => {
        if (client) {
            setEditingClient(client);
            setFormData({
                nome: client.nome || '',
                cnpj_cpf: client.cnpj_cpf?.toString() || '',
                telefone_whatsapp: client.telefone_whatsapp || '',
                email: client.email || '',
                razao_social: client.razao_social || '',
                regime_tributario: client.regime_tributario || '',
                cnae_principal: client.cnae_principal || '',
                logradouro: client.logradouro || '',
                numero: client.numero || '',
                bairro: client.bairro || '',
                cep: client.cep || '',
                cidade: client.cidade || 'Sidrolândia',
                estado: client.estado || 'MS',
                inscricao_estadual: client.inscricao_estadual || '',
                inscricao_municipal: client.inscricao_municipal || '',
                status_rfb: client.status_rfb || 'ATIVA',
                drive_folder_id: client.drive_folder_id || ''
            });
        } else {
            setEditingClient(null);
            setFormData({
                nome: '', cnpj_cpf: '', telefone_whatsapp: '', email: '',
                razao_social: '', regime_tributario: '', cnae_principal: '',
                logradouro: '', numero: '', bairro: '', cep: '',
                cidade: 'Sidrolândia', estado: 'MS',
                inscricao_estadual: '', inscricao_municipal: '',
                status_rfb: 'ATIVA', drive_folder_id: ''
            });
        }
        setIsModalOpen(true);
    };

    async function handleConsultarCNPJ() {
        const cnpj = formData.cnpj_cpf.replace(/\D/g, '');
        if (cnpj.length !== 14) {
            alert('Digite um CNPJ válido com 14 dígitos.');
            return;
        }
        setConsulting(true);
        try {
            const response = await fetch(`https://open.cnpja.com/office/${cnpj}`);
            if (!response.ok) throw new Error('Falha na consulta.');
            const data = await response.json();
            setFormData((prev: any) => ({
                ...prev,
                nome: data.name || data.alias || prev.nome,
                email: data.emails?.[0]?.address || prev.email,
                razao_social: data.name,
                cnae_principal: data.mainActivity ? `${data.mainActivity.code} - ${data.mainActivity.text}` : null,
                status_rfb: data.status?.text || 'ATIVA',
                logradouro: data.address?.street,
                numero: data.address?.number,
                bairro: data.address?.district,
                cep: data.address?.zip
            }));
        } catch (err: any) {
            alert('Erro: ' + err.message);
        } finally {
            setConsulting(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            if (editingClient) {
                await supabase.from('clientes').update(formData).eq('id', editingClient.id);
            } else {
                await supabase.from('clientes').insert([formData]);
            }
            setIsModalOpen(false);
            fetchClientes();
        } catch (err: any) {
            alert('Erro ao salvar.');
        }
    }

    async function handleDelete(id: string, nome: string) {
        if (!confirm(`Excluir ${nome}?`)) return;
        try {
            await supabase.from('clientes').delete().eq('id', id);
            setClientes(clientes.filter(c => c.id !== id));
        } catch (err) {
            alert('Erro ao excluir');
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header Pro Max */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-neutral-100 italic tracking-tighter uppercase leading-none">Gestão de Carteira</h1>
                    <div className="flex items-center gap-4 mt-3">
                        <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
                            {clientes.length} OPERAÇÕES ATIVAS
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                            <span className="text-[10px] font-black text-emerald-500 uppercase italic">Sincronizado com Supabase</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="group relative px-8 py-4 bg-emerald-500 text-neutral-950 font-black uppercase text-xs tracking-widest rounded-none transform transition-all hover:scale-105 active:scale-95 shadow-[8px_8px_0px_#064e3b]"
                >
                    <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4" /> NOVO CLIENTE AGRO
                    </span>
                </button>
            </div>

            {/* Filtros e Busca Brutalista */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500 text-neutral-600">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="BUSCAR NOME, CNPJ OU REGIME..."
                        className="w-full bg-neutral-950 border-2 border-neutral-900 focus:border-emerald-500 p-4 pl-12 text-sm font-black uppercase italic tracking-widest outline-none transition-all placeholder:text-neutral-800 text-neutral-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center justify-center gap-2 bg-neutral-900 border-2 border-neutral-800 text-neutral-500 font-black uppercase text-[10px] tracking-widest hover:text-white hover:border-neutral-600 transition-all">
                    <Filter className="w-4 h-4" /> FILTROS AVANÇADOS
                </button>
            </div>

            {/* Tabela de Clientes Brutalista */}
            <div className="relative border-t-4 border-emerald-500 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto no-scrollbar bg-neutral-950">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-900/80 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                                <th className="p-5 border-b border-neutral-800">Identificação / Status</th>
                                <th className="p-5 border-b border-neutral-800">Documento</th>
                                <th className="p-5 border-b border-neutral-800">Modelo Fiscal</th>
                                <th className="p-5 border-b border-neutral-800">G-Drive</th>
                                <th className="p-5 border-b border-neutral-800">Radar Fiscal</th>
                                <th className="p-5 border-b border-neutral-800 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-900">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                                            <span className="text-[10px] font-black text-neutral-700 uppercase tracking-widest">Carregando Ativos...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredClientes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center bg-neutral-900/20 italic text-neutral-700 uppercase font-black tracking-widest">
                                        Nenhum registro encontrado no radar.
                                    </td>
                                </tr>
                            ) : (
                                filteredClientes.map((c) => (
                                    <tr key={c.id} className="group hover:bg-neutral-900/50 transition-all">
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    onClick={() => handleOpenDetails(c.id)}
                                                    className="inline-flex items-center gap-2 text-neutral-100 font-black uppercase italic tracking-tighter hover:text-emerald-400 transition-colors text-lg"
                                                >
                                                    {c.razao_social || c.nome}
                                                    {c.status_rfb === 'ATIVA' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                                                </button>
                                                {c.nome && c.nome !== c.razao_social && (
                                                    <span className="text-[9px] font-mono text-neutral-600 uppercase">Apelido: {c.nome}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="text-xs font-mono text-neutral-400 py-1 px-2 bg-neutral-900 border border-neutral-800 rounded">{c.cnpj_cpf}</span>
                                        </td>
                                        <td className="p-5">
                                            {c.regime_tributario ? (
                                                <span className={`text-[9px] font-black px-3 py-1 bg-neutral-900 border ${c.regime_tributario.includes('SIMPLES') ? 'text-emerald-500 border-emerald-500/20' : 'text-blue-500 border-blue-500/20'} uppercase italic`}>
                                                    {c.regime_tributario.replace(/_/g, ' ')}
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-black text-neutral-800 uppercase italic">Não Identificado</span>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            {c.drive_folder_id ? (
                                                <a href={`https://drive.google.com/drive/folders/${c.drive_folder_id}`} target="_blank" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-400 font-black text-[10px] uppercase transition-all group/drive">
                                                    <FolderOpen className="w-4 h-4" /> PASTA OK
                                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover/drive:opacity-100 transition-all" />
                                                </a>
                                            ) : (
                                                <div className="flex items-center gap-2 text-neutral-800 font-black text-[10px] uppercase">
                                                    <FolderX className="w-4 h-4" /> SEM PASTA
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            <div className="flex gap-1.5">
                                                <div className={`w-2 h-2 ${c.situacao_federal === 'REGULAR' ? 'bg-emerald-500' : 'bg-neutral-800'} shadow-[0_0_5px_rgba(0,0,0,0.5)]`} title="Federal" />
                                                <div className={`w-2 h-2 ${c.situacao_estadual === 'REGULAR' ? 'bg-emerald-500' : 'bg-neutral-800'} shadow-[0_0_5px_rgba(0,0,0,0.5)]`} title="Estadual" />
                                                <div className={`w-2 h-2 ${c.situacao_municipal === 'REGULAR' ? 'bg-emerald-500' : 'bg-neutral-800'} shadow-[0_0_5px_rgba(0,0,0,0.5)]`} title="Municipal" />
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => handleOpenDetails(c.id)} className="p-2 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-emerald-500 transition-all" title="Ver Detalhes"><Eye className="w-4 h-4" /></button>
                                                <button onClick={() => handleOpenModal(c)} className="p-2 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-primary-500 transition-all" title="Editar Cadastro"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(c.id, c.nome)} className="p-2 bg-neutral-900 border border-neutral-800 text-neutral-800 hover:text-red-500 hover:border-red-500 transition-all" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sidebar de Detalhes (Sobrepágina Lateral) */}
            <ClientDetailSidebar
                clientId={selectedClientId}
                isOpen={isSidebarOpen}
                onClose={handleCloseDetails}
                onUpdate={fetchClientes}
            />

            {/* Modal de Cadastro (Legacy UI/Quick Edit) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-end p-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-neutral-950 border-l border-neutral-800 w-full max-w-xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">
                        <div className="p-8 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/30">
                            <div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-neutral-100">{editingClient ? 'Ajustar Cadastro' : 'Novo Alistamento'}</h2>
                                <p className="text-[10px] font-mono text-neutral-600 uppercase mt-1 italic tracking-widest">Procedimento Interno Brandão</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-500"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex-1 p-8 space-y-8 overflow-y-auto no-scrollbar pb-24">
                            {/* CNPJ Consult Section */}
                            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-none space-y-4 shadow-[4px_4px_0px_#171717]">
                                <label className="text-[10px] font-black text-neutral-500 uppercase flex items-center gap-2 italic"><ShieldAlert className="w-3 h-3 text-emerald-500" /> Documento Oficial (CNPJ/CPF)</label>
                                <div className="flex gap-2">
                                    <input required className="flex-1 bg-neutral-950 border border-neutral-800 p-4 text-lg font-mono outline-none focus:border-emerald-500 text-neutral-100"
                                        placeholder="00.000.000/0000-00"
                                        value={formData.cnpj_cpf} onChange={e => setFormData({ ...formData, cnpj_cpf: e.target.value })} />
                                    {formData.cnpj_cpf?.replace(/\D/g, '').length === 14 && (
                                        <button type="button" onClick={handleConsultarCNPJ} disabled={consulting} className="px-6 bg-emerald-500 text-neutral-950 font-black uppercase text-[10px] hover:bg-emerald-400 transition-all disabled:opacity-50">
                                            {consulting ? <Loader2 className="animate-spin w-4 h-4" /> : 'PUXAR DADOS'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest border-b border-emerald-500/20 pb-2">Núcleo do Registro</h3>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-neutral-600 uppercase">Razão Social Oficial</label>
                                        <input required className="w-full bg-neutral-900 border border-neutral-800 p-4 text-xs font-bold uppercase tracking-widest text-neutral-200 focus:border-emerald-500 outline-none"
                                            value={formData.razao_social || ''} onChange={e => setFormData({ ...formData, razao_social: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-neutral-600 uppercase">Apelido de Operação (Nome)</label>
                                        <input required className="w-full bg-neutral-900 border border-neutral-800 p-4 text-xs font-black uppercase italic tracking-widest text-emerald-500 outline-none"
                                            value={formData.nome || ''} onChange={e => setFormData({ ...formData, nome: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-600 uppercase">Regime Fiscal</label>
                                            <select className="w-full bg-neutral-900 border border-neutral-800 p-4 text-xs font-bold uppercase text-neutral-300 outline-none"
                                                value={formData.regime_tributario || ''} onChange={e => setFormData({ ...formData, regime_tributario: e.target.value })}>
                                                <option value="">SELECIONE...</option>
                                                <option value="SIMPLES_NACIONAL">SIMPLES NACIONAL</option>
                                                <option value="LUCRO_PRESUMIDO">LUCRO PRESUMIDO</option>
                                                <option value="LUCRO_REAL">LUCRO REAL</option>
                                                <option value="PF_FAZENDA">PF (FAZENDA)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-600 uppercase">Situação RFB</label>
                                            <input className="w-full bg-neutral-900 border border-neutral-800 p-4 text-xs font-bold uppercase text-emerald-500 outline-none italic"
                                                value={formData.status_rfb || ''} onChange={e => setFormData({ ...formData, status_rfb: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 pt-4">
                                <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest border-b border-emerald-500/20 pb-2">Comunicação e Local</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-neutral-600 uppercase">WhatsApp</label>
                                        <input className="w-full bg-neutral-900 border border-neutral-800 p-4 text-xs font-mono text-neutral-300 outline-none"
                                            value={formData.telefone_whatsapp || ''} onChange={e => setFormData({ ...formData, telefone_whatsapp: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-neutral-600 uppercase">Email</label>
                                        <input className="w-full bg-neutral-900 border border-neutral-800 p-4 text-xs font-mono text-neutral-300 outline-none"
                                            value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-neutral-600 uppercase">Cidade de Sede</label>
                                        <input className="w-full bg-neutral-900 border border-neutral-800 p-4 text-xs font-bold uppercase text-neutral-300 outline-none"
                                            value={formData.cidade || ''} onChange={e => setFormData({ ...formData, cidade: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-neutral-600 uppercase">Google Drive ID</label>
                                        <input className="w-full bg-neutral-900 border border-neutral-800 p-4 text-[9px] font-mono text-neutral-600 outline-none"
                                            value={formData.drive_folder_id || ''} onChange={e => setFormData({ ...formData, drive_folder_id: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Footer for Action */}
                            <div className="fixed bottom-0 right-0 w-full max-w-xl p-8 bg-neutral-950 border-t border-neutral-900 flex gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-xs font-black uppercase text-neutral-600 hover:text-neutral-400 transition-colors">Abortar</button>
                                <button type="submit" className="flex-[2] py-4 bg-emerald-500 text-neutral-950 font-black uppercase text-xs tracking-[0.2em] shadow-[8px_8px_0px_#064e3b] transition-all active:scale-95 active:shadow-none hover:bg-emerald-400">
                                    {editingClient ? 'RE-ALISTAR ATIVO' : 'EFETUAR ALISTAMENTO'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ClientesPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>}>
            <ClientesContent />
        </Suspense>
    );
}
