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
    ShieldAlert,
    Users,
    ShieldCheck,
    Building2,
    Lock
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
    const [stats, setStats] = useState({
        total: 0,
        pendentes: 0,
        certVencendo: 0,
        auditadosOk: 0
    });
    const [globalSyncing, setGlobalSyncing] = useState(false);

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
            // 1. Buscar Clientes
            const { data: clientsData, error: clientErr } = await supabase
                .from('clientes')
                .select('*')
                .eq('status_hub', 'ATIVO') // Apenas ativos no dashboard principal
                .order('nome', { ascending: true });

            if (clientErr) throw clientErr;

            // 2. Buscar Status de Obrigações (Mês Atual)
            const hoje = new Date();
            const refDate = new Date(hoje.getFullYear(), hoje.getMonth() - (hoje.getDate() < 15 ? 1 : 0), 1);
            const competencia = refDate.toISOString().split('T')[0];

            const { data: obrs } = await supabase
                .from('obrigacoes_acessorias')
                .select('*')
                .eq('competencia', competencia);

            // 3. Buscar Certificados (para alertas de vencimento)
            const { data: certs } = await supabase
                .from('cliente_certificados')
                .select('id, cliente_id, data_vencimento');

            // 4. Cruzar Dados
            let pendenciasTotal = 0;
            let certsVencendo = 0;

            const enriched = (clientsData || []).map(c => {
                const clientObrs = (obrs || []).filter(o => o.cliente_id === c.id);
                const hasPending = clientObrs.some(o => o.status === 'pendente');
                if (hasPending) pendenciasTotal++;

                const clientCerts = (certs || []).filter(ct => ct.cliente_id === c.id);
                const isNearExp = clientCerts.some(ct => {
                    if (!ct.data_vencimento) return false;
                    const diff = Math.ceil((new Date(ct.data_vencimento).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
                    return diff <= 30;
                });
                if (isNearExp) certsVencendo++;

                return {
                    ...c,
                    obrigacoes: clientObrs,
                    hasPending,
                    isCertNearExp: isNearExp
                };
            });

            setClientes(enriched);
            setStats({
                total: enriched.length,
                pendentes: enriched.filter(e => e.hasPending).length,
                certVencendo: certsVencendo,
                auditadosOk: enriched.filter(e => !e.hasPending && e.obrigacoes.length > 0).length
            });

        } catch (err: any) {
            console.error(err);
            setError('Erro ao carregar dados do Centro de Controle.');
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
        router.push(`/admin/clientes/${id}`);
    };
    async function handleGlobalSync() {
        if (!confirm('MAESTRO: Deseja rodar o radar global em toda a carteira de clientes ativos? Isso pode levar alguns segundos.')) return;

        try {
            setGlobalSyncing(true);
            const res = await fetch('/api/sync/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}) // Sem clientId = Sincroniza todos
            });

            if (res.ok) {
                alert('MAESTRO: Radar Global finalizado! Atualizando painéis...');
                fetchClientes();
            } else {
                throw new Error('Falha na sincronização global');
            }
        } catch (err: any) {
            alert('Erro no Radar Global: ' + err.message);
        } finally {
            setGlobalSyncing(false);
        }
    }
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
                inscricao_estadual: '',
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

            // Log do resultado para debug
            console.log('[CNPJ Consult]', data);

            setFormData((prev: any) => ({
                ...prev,
                nome: data.alias || data.name || prev.nome,
                razao_social: data.name || prev.razao_social,
                email: data.emails?.[0]?.address || prev.email,
                cnae_principal: data.mainActivity ? `${data.mainActivity.code} - ${data.mainActivity.text}` : prev.cnae_principal,
                status_rfb: data.status?.text || 'ATIVA',
                logradouro: data.address?.street || prev.logradouro,
                numero: data.address?.number || prev.numero,
                bairro: data.address?.district || prev.bairro,
                cep: data.address?.zip || prev.cep,
                cidade: data.address?.city || prev.cidade,
                estado: data.address?.state || prev.estado
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
            {/* Header Pro Max com Dash de Operações */}
            <div className="space-y-6 px-1">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Centro de Controle Master</h1>
                        <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest mt-1">Status Operacional da Carteira - Brandão Contabilidade</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleGlobalSync}
                            disabled={globalSyncing}
                            className={`px-6 py-2.5 ${globalSyncing ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'} border border-current font-black uppercase text-[10px] tracking-widest hover:bg-current hover:text-black transition-all active:scale-95 flex items-center gap-2 rounded shadow-xl`}
                        >
                            {globalSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5 shadow-none" />}
                            {globalSyncing ? 'MAESTRO EM CAMPO...' : 'RADAR GLOBAL'}
                        </button>
                        <button
                            onClick={() => handleOpenModal()}
                            className="px-6 py-2.5 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-neutral-200 transition-all active:scale-95 flex items-center gap-2 rounded shadow-xl"
                        >
                            <Plus className="w-3.5 h-3.5" /> Novo Cliente Agro
                        </button>
                    </div>
                </div>

                {/* Cards de Inteligência */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Clientes Ativos', value: stats.total, color: 'neutral', icon: Users },
                        { label: 'Pendências de Auditoria', value: stats.pendentes, color: 'rose', icon: AlertCircle },
                        { label: 'Certificados Vencendo', value: stats.certVencendo, color: 'amber', icon: ShieldCheck },
                        { label: 'Auditados OK (Mês)', value: stats.auditadosOk, color: 'emerald', icon: CheckCircle2 }
                    ].map((stat, i) => {
                        const Icon = stat.icon as any;
                        return (
                            <div key={i} className={`p-4 bg-neutral-900/40 border-l-4 border-l-${stat.color === 'rose' ? 'rose-500' : stat.color === 'amber' ? 'amber-500' : stat.color === 'emerald' ? 'emerald-500' : 'neutral-700'} border border-neutral-900 rounded-xl space-y-1`}>
                                <div className="flex justify-between items-center">
                                    <p className="text-[9px] font-black uppercase text-neutral-500 tracking-widest">{stat.label}</p>
                                    <Icon className={`w-3.5 h-3.5 text-neutral-700`} />
                                </div>
                                <p className="text-xl font-black text-white italic">{stat.value}</p>
                            </div>
                        );
                    })}
                </div>
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
                                <th className="p-4 pl-6 border-b border-neutral-900">Cliente Alpha</th>
                                <th className="p-4 border-b border-neutral-900 text-center">DAS / SN</th>
                                <th className="p-4 border-b border-neutral-900 text-center">FGTS</th>
                                <th className="p-4 border-b border-neutral-900 text-center">INSS</th>
                                <th className="p-4 border-b border-neutral-900 text-center">Folha</th>
                                <th className="p-4 border-b border-neutral-900 text-center">Vault</th>
                                <th className="p-4 border-b border-neutral-900 text-right pr-6">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-900">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                                            <span className="text-[10px] font-bold text-neutral-700 uppercase tracking-widest">Sincronizando...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredClientes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center italic text-neutral-700 uppercase font-black tracking-widest">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredClientes.map((c) => {
                                    const getObrStatus = (name: string) => c.obrigacoes?.find((o: any) => o.tipo === name)?.status;

                                    const StatusBadge = ({ name }: { name: string }) => {
                                        const status = getObrStatus(name);
                                        if (!status) return <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 mx-auto" />;
                                        return (
                                            <div className="flex justify-center group/tip relative">
                                                <div className={`w-3.5 h-3.5 rounded-full border-2 border-black ${status === 'concluido' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-pulse'} `} />
                                                <div className="absolute bottom-full mb-2 hidden group-hover/tip:block bg-neutral-900 text-[8px] font-black uppercase text-white px-2 py-1 rounded border border-neutral-800 whitespace-nowrap z-50">
                                                    {name}: {status.toUpperCase()}
                                                </div>
                                            </div>
                                        );
                                    };

                                    return (
                                        <tr key={c.id} className="group hover:bg-neutral-900/40 transition-all">
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center text-neutral-600 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-all">
                                                        <Building2 className="w-4.5 h-4.5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <Link
                                                            href={`/admin/clientes/${c.id}`}
                                                            className="text-white font-black hover:text-emerald-500 transition-colors text-[12px] tracking-tighter uppercase italic"
                                                        >
                                                            {c.nome || c.razao_social}
                                                        </Link>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] font-mono text-neutral-700">{formatCNPJ(c.cnpj_cpf?.toString())}</span>
                                                            {c.isCertNearExp && (
                                                                <span className="text-[7px] bg-amber-500 text-black px-1.5 py-0.5 font-black uppercase rounded shadow-[0_0_5px_#f59e0b]">
                                                                    Certificado Vence Logo
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4"><StatusBadge name="DAS" /></td>
                                            <td className="p-4"><StatusBadge name="FGTS" /></td>
                                            <td className="p-4"><StatusBadge name="INSS" /></td>
                                            <td className="p-4"><StatusBadge name="Folha de Pagamento" /></td>
                                            <td className="p-4">
                                                <div className="flex justify-center">
                                                    <Lock className={`w-3.5 h-3.5 ${c.isCertNearExp ? 'text-amber-500 animate-pulse' : 'text-emerald-500/20'}`} />
                                                </div>
                                            </td>
                                            <td className="p-4 text-right pr-6">
                                                <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Link
                                                        href={`/admin/clientes/${c.id}`}
                                                        className="p-2 bg-neutral-900 border border-neutral-800 text-neutral-600 hover:text-white transition-all rounded"
                                                        title="Mural de Operações"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button onClick={() => handleOpenModal(c)} className="p-2 bg-neutral-900 border border-neutral-800 text-neutral-600 hover:text-white transition-all rounded"><Edit className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleDelete(c.id, c.nome)} className="p-2 bg-neutral-900 border border-neutral-800 text-neutral-700 hover:text-rose-500 transition-all rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
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
            {
                isModalOpen && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-end p-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-neutral-950 border-l border-neutral-800 w-full max-w-xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">
                            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/30">
                                <div>
                                    <h2 className="text-lg font-bold text-neutral-100 tracking-tight uppercase">{editingClient ? 'Ajustar Cadastro' : 'Novo Alistamento'}</h2>
                                    <p className="text-[9px] font-mono text-neutral-600 uppercase mt-1 tracking-widest">Procedimento Interno // v2.0</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-neutral-800 rounded transition-colors text-neutral-600"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4 overflow-y-auto no-scrollbar pb-24">
                                {/* CNPJ Consult Section */}
                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg space-y-2">
                                    <label className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-2 tracking-[0.2em]">
                                        <ShieldAlert className="w-3 h-3" /> Identificação Fiscal
                                    </label>
                                    <div className="flex gap-2">
                                        <input required className="flex-1 bg-neutral-900 border border-neutral-800 p-2 text-xs font-mono outline-none focus:border-emerald-500 text-neutral-100 rounded"
                                            placeholder="CNPJ ou CPF"
                                            value={formData.cnpj_cpf} onChange={e => setFormData({ ...formData, cnpj_cpf: e.target.value })} />
                                        {formData.cnpj_cpf?.replace(/\D/g, '').length === 14 && (
                                            <button type="button" onClick={handleConsultarCNPJ} disabled={consulting} className="px-4 bg-emerald-500 text-neutral-950 font-black uppercase text-[9px] hover:bg-emerald-400 transition-all disabled:opacity-50 rounded">
                                                {consulting ? <Loader2 className="animate-spin w-3 h-3" /> : 'Consultar'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1 col-span-2">
                                        <label className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">Razão Social</label>
                                        <input required className="w-full bg-neutral-900 border border-neutral-800 p-2 text-[11px] font-bold uppercase text-neutral-300 focus:border-emerald-500 outline-none rounded"
                                            value={formData.razao_social || ''} onChange={e => setFormData({ ...formData, razao_social: e.target.value })} />
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <label className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">Nome Fantasia / Apelido</label>
                                        <input required className="w-full bg-neutral-900 border border-neutral-800 p-2 text-[11px] font-bold uppercase text-emerald-500 outline-none rounded"
                                            value={formData.nome || ''} onChange={e => setFormData({ ...formData, nome: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">Regime Fiscal</label>
                                        <select className="w-full bg-neutral-900 border border-neutral-800 p-2 text-[10px] font-bold uppercase text-neutral-400 outline-none rounded"
                                            value={formData.regime_tributario || ''} onChange={e => setFormData({ ...formData, regime_tributario: e.target.value })}>
                                            <option value="">SELECIONE...</option>
                                            <option value="SIMPLES_NACIONAL">SIMPLES NACIONAL</option>
                                            <option value="LUCRO_PRESUMIDO">LUCRO PRESUMIDO</option>
                                            <option value="LUCRO_REAL">LUCRO REAL</option>
                                            <option value="PESSOA_FISICA">PF (FAZENDA)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">Situação RFB</label>
                                        <input className="w-full bg-neutral-900 border border-neutral-800 p-2 text-[10px] font-bold uppercase text-emerald-500 outline-none rounded"
                                            value={formData.status_rfb || ''} onChange={e => setFormData({ ...formData, status_rfb: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">WhatsApp</label>
                                        <input className="w-full bg-neutral-900 border border-neutral-800 p-2 text-[11px] font-mono text-neutral-400 outline-none rounded"
                                            placeholder="5567..."
                                            value={formData.telefone_whatsapp || ''} onChange={e => setFormData({ ...formData, telefone_whatsapp: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">E-mail</label>
                                        <input className="w-full bg-neutral-900 border border-neutral-800 p-2 text-[11px] font-mono text-neutral-400 outline-none rounded"
                                            placeholder="contato@..."
                                            value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">Inscrição Estadual</label>
                                        <input className="w-full bg-neutral-900 border border-neutral-800 p-2 text-[11px] font-mono text-neutral-400 outline-none rounded"
                                            value={formData.inscricao_estadual || ''} onChange={e => setFormData({ ...formData, inscricao_estadual: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">CEP</label>
                                        <input className="w-full bg-neutral-900 border border-neutral-800 p-2 text-[11px] font-mono text-neutral-400 outline-none rounded"
                                            value={formData.cep || ''} onChange={e => setFormData({ ...formData, cep: e.target.value })} />
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <label className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">Pasta Google Drive (ID)</label>
                                        <input className="w-full bg-neutral-950 border border-neutral-800 p-2 text-[10px] font-mono text-neutral-700 outline-none rounded"
                                            value={formData.drive_folder_id || ''} onChange={e => setFormData({ ...formData, drive_folder_id: e.target.value })} />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-6 border-t border-neutral-900 sticky bottom-0 bg-neutral-950 pb-6">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-[10px] font-black uppercase text-neutral-600 hover:text-neutral-401 transition-colors">Cancelar</button>
                                    <button type="submit" disabled={syncing} className={`flex-[2] py-3 rounded ${syncing ? 'bg-neutral-800 text-neutral-700' : 'bg- emerald-500 text-neutral-950 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'} font-black uppercase text-[10px] tracking-widest transition-all active:scale-95`}>
                                        {syncing ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-3 h-3 animate-spin" /> Processando...
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
