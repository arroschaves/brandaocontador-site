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
import { formatCNPJ } from '@/lib/utils/format'
import ClientDetailSidebar from './components/ClientDetailSidebar';

const supabase = createClient();

export const dynamic = 'force-dynamic';

function ClientesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [syncing, setSyncing] = useState(false);
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
        setSyncing(true); // Reusar ou criar estado de loading
        try {
            if (editingClient) {
                const { error } = await supabase.from('clientes').update(formData).eq('id', editingClient.id);
                if (error) throw error;
            } else {
                // Chamada para a API Soberana que cria pastas no Drive
                const response = await fetch('/api/clientes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (!response.ok) throw new Error('Falha na criação soberana');
            }
            setIsModalOpen(false);
            fetchClientes();
        } catch (err: any) {
            alert('Erro ao salvar: ' + err.message);
        } finally {
            setSyncing(false);
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
                <div>
                    <h1 className="text-xl font-bold text-neutral-100 tracking-tight">Gestão de Carteira</h1>
                    <div className="flex items-center gap-3 mt-1.5">
                        <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                            {clientes.length} Operações Ativas
                        </p>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10b981]" />
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">Cloud Autopilot On</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-6 py-2.5 bg-neutral-100 text-neutral-950 font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all active:scale-95 flex items-center gap-2 rounded shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
                >
                    <Plus className="w-3.5 h-3.5" /> Novo Cliente Agro
                </button>
            </div>

            {/* Filtros e Busca Brutalista */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-3 relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-700">
                        <Search className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        placeholder="BUSCAR NO RADAR..."
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500/50 p-2.5 pl-10 text-[11px] font-medium outline-none transition-all placeholder:text-neutral-800 text-neutral-300 rounded"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center justify-center gap-2 bg-neutral-900/50 border border-neutral-800 text-neutral-600 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-all rounded">
                    <Filter className="w-3.5 h-3.5" /> Filtrar
                </button>
            </div>

            {/* Tabela de Clientes Brutalista */}
            <div className="relative border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950 shadow-2xl">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-900/40 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                                <th className="p-4 border-b border-neutral-900">Identificação / Status</th>
                                <th className="p-4 border-b border-neutral-900">Documento</th>
                                <th className="p-4 border-b border-neutral-900">Modelo Fiscal</th>
                                <th className="p-4 border-b border-neutral-900">G-Drive</th>
                                <th className="p-4 border-b border-neutral-900">Radar Fiscal</th>
                                <th className="p-4 border-b border-neutral-900 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-900">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                                            <span className="text-[10px] font-bold text-neutral-700 uppercase tracking-widest">Sincronizando...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredClientes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center italic text-neutral-700 uppercase font-black tracking-widest">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredClientes.map((c) => (
                                    <tr key={c.id} className="group hover:bg-neutral-900/30 transition-all">
                                        <td className="p-4">
                                            <div className="flex flex-col gap-0.5">
                                                <button
                                                    onClick={() => handleOpenDetails(c.id)}
                                                    className="inline-flex items-center gap-2 text-neutral-200 font-bold hover:text-emerald-400 transition-colors text-[13px] tracking-tight"
                                                >
                                                    {c.razao_social || c.nome}
                                                    {c.status_rfb === 'ATIVA' && <CheckCircle2 className="w-3 h-3 text-emerald-500/80" />}
                                                </button>
                                                {c.nome && c.nome !== c.razao_social && (
                                                    <span className="text-[9px] font-mono text-neutral-600 uppercase">APELIDO: {c.nome}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-[11px] font-mono text-neutral-500">{formatCNPJ(c.cnpj_cpf?.toString())}</span>
                                        </td>
                                        <td className="p-4">
                                            {c.regime_tributario ? (
                                                <span className={`text-[9px] font-black px-2 py-0.5 bg-neutral-900 border ${c.regime_tributario.includes('SIMPLES') ? 'text-emerald-500 border-emerald-500/10' : 'text-blue-500 border-blue-500/10'} uppercase`}>
                                                    {c.regime_tributario.replace(/_/g, ' ')}
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-bold text-neutral-800 uppercase">Não Defino</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {c.drive_folder_id ? (
                                                <a href={`https://drive.google.com/drive/folders/${c.drive_folder_id}`} target="_blank" className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-400 font-bold text-[10px] uppercase transition-all">
                                                    <FolderOpen className="w-3.5 h-3.5" /> PASTA OK
                                                </a>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-neutral-800 font-bold text-[10px] uppercase">
                                                    <FolderX className="w-3.5 h-3.5" /> SEM DRIVE
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-1">
                                                <div className={`w-1.5 h-1.5 ${c.situacao_federal === 'REGULAR' ? 'bg-emerald-500' : 'bg-neutral-800'}`} title="Federal" />
                                                <div className={`w-1.5 h-1.5 ${c.situacao_estadual === 'REGULAR' ? 'bg-emerald-500' : 'bg-neutral-800'}`} title="Estadual" />
                                                <div className={`w-1.5 h-1.5 ${c.situacao_municipal === 'REGULAR' ? 'bg-emerald-500' : 'bg-neutral-800'} shadow-[0_0_5px_rgba(0,0,0,0.5)]`} title="Municipal" />
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => handleOpenDetails(c.id)} className="p-1.5 text-neutral-600 hover:text-white transition-all"><Eye className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => handleOpenModal(c)} className="p-1.5 text-neutral-600 hover:text-white transition-all"><Edit className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => handleDelete(c.id, c.nome)} className="p-1.5 text-neutral-700 hover:text-rose-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
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
                <div className="fixed inset-0 z-[120] flex items-center justify-end p-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-neutral-950 border-l border-neutral-800 w-full max-w-xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">
                        <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/30">
                            <div>
                                <h2 className="text-lg font-bold text-neutral-100 tracking-tight uppercase">{editingClient ? 'Ajustar Cadastro' : 'Novo Alistamento'}</h2>
                                <p className="text-[9px] font-mono text-neutral-600 uppercase mt-1 tracking-widest">Procedimento Interno // v2.0</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-neutral-800 rounded transition-colors text-neutral-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar pb-24">
                            {/* CNPJ Consult Section */}
                            <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg space-y-3">
                                <label className="text-[10px] font-bold text-neutral-600 uppercase flex items-center gap-2 tracking-widest">
                                    <ShieldAlert className="w-3 h-3 text-emerald-500" /> Documento (CNPJ/CPF)
                                </label>
                                <div className="flex gap-2">
                                    <input required className="flex-1 bg-neutral-950 border border-neutral-800 p-3 text-sm font-mono outline-none focus:border-emerald-500 text-neutral-100 rounded"
                                        placeholder="00.000.000/0000-00"
                                        value={formData.cnpj_cpf} onChange={e => setFormData({ ...formData, cnpj_cpf: e.target.value })} />
                                    {formData.cnpj_cpf?.replace(/\D/g, '').length === 14 && (
                                        <button type="button" onClick={handleConsultarCNPJ} disabled={consulting} className="px-4 bg-neutral-100 text-neutral-950 font-bold uppercase text-[10px] hover:bg-emerald-500 transition-all disabled:opacity-50 rounded">
                                            {consulting ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : 'Consultar'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-5">
                                <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-800 pb-2">Núcleo do Registro</h3>
                                <div className="grid gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-tight">Razão Social Oficial</label>
                                        <input required className="w-full bg-neutral-900 border border-neutral-800 p-3 text-[11px] font-bold uppercase text-neutral-300 focus:border-emerald-500 outline-none rounded"
                                            value={formData.razao_social || ''} onChange={e => setFormData({ ...formData, razao_social: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-tight">Nome Fantasia (Apelido)</label>
                                        <input required className="w-full bg-neutral-950 border border-neutral-800 p-3 text-[11px] font-bold uppercase text-emerald-500 outline-none rounded"
                                            value={formData.nome || ''} onChange={e => setFormData({ ...formData, nome: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-neutral-600 uppercase">Regime Fiscal</label>
                                            <select className="w-full bg-neutral-900 border border-neutral-800 p-3 text-[11px] font-bold uppercase text-neutral-400 outline-none rounded"
                                                value={formData.regime_tributario || ''} onChange={e => setFormData({ ...formData, regime_tributario: e.target.value })}>
                                                <option value="">SELECIONE...</option>
                                                <option value="SIMPLES_NACIONAL">SIMPLES NACIONAL</option>
                                                <option value="LUCRO_PRESUMIDO">LUCRO PRESUMIDO</option>
                                                <option value="LUCRO_REAL">LUCRO REAL</option>
                                                <option value="PF_FAZENDA">PF (FAZENDA)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-neutral-600 uppercase">Situação RFB</label>
                                            <input className="w-full bg-neutral-900 border border-neutral-800 p-3 text-[11px] font-bold uppercase text-emerald-500 outline-none rounded"
                                                value={formData.status_rfb || ''} onChange={e => setFormData({ ...formData, status_rfb: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5 pt-2">
                                <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-800 pb-2">Comunicação e Drive</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-neutral-600 uppercase">WhatsApp</label>
                                        <input className="w-full bg-neutral-900 border border-neutral-800 p-3 text-[11px] font-mono text-neutral-400 outline-none rounded"
                                            placeholder="5567999999999"
                                            value={formData.telefone_whatsapp || ''} onChange={e => setFormData({ ...formData, telefone_whatsapp: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-neutral-600 uppercase">E-mail</label>
                                        <input className="w-full bg-neutral-900 border border-neutral-800 p-3 text-[11px] font-mono text-neutral-400 outline-none rounded"
                                            placeholder="contato@empresa.com"
                                            value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-neutral-600 uppercase">Google Drive Folder ID</label>
                                    <input className="w-full bg-neutral-950 border border-neutral-800 p-3 text-[10px] font-mono text-neutral-700 outline-none rounded"
                                        placeholder="Ex: 1A2B3C4D5E..."
                                        value={formData.drive_folder_id || ''} onChange={e => setFormData({ ...formData, drive_folder_id: e.target.value })} />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-6 border-t border-neutral-900">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-[11px] font-bold uppercase text-neutral-600 hover:text-neutral-400 transition-colors">Cancelar</button>
                                <button type="submit" disabled={syncing} className={`flex-[2] py-3 rounded ${syncing ? 'bg-neutral-800 text-neutral-700' : 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400'} font-bold uppercase text-[11px] tracking-widest transition-all active:scale-95`}>
                                    {syncing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processando...
                                        </span>
                                    ) : (
                                        editingClient ? 'Salvar Alterações' : 'Confirmar Cadastro'
                                    )}
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
