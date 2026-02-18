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
    Lock,
    Sparkles,
    RefreshCw
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatCNPJ } from '@/lib/utils/format'
import ClientDetailSidebar from './components/ClientDetailSidebar';
import EnrichmentProgressModal from './components/EnrichmentProgressModal';

export const dynamic = 'force-dynamic';

function ClientesContent() {
    const supabase = createClient();
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

    // Enrichment Modal State
    const [isEnrichModalOpen, setIsEnrichModalOpen] = useState(false);
    const [enrichCandidates, setEnrichCandidates] = useState<any[]>([]);

    // Modal State (Cadastro Rápido)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<any>(null);
    const [formData, setFormData] = useState<any>({
        nome: '',
        documento: '',
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
        status_rfb: 'ATIVA'
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
            // 1. Buscar Empresas (Schema CORE)
            const { data: clientsData, error: clientErr } = await supabase
                .schema('core')
                .from('empresas')
                .select('*')
                .order('razao_social', { ascending: true });

            if (clientErr) throw clientErr;

            // 2. Buscar Status de Obrigações (Mês Atual - Schema FISCAL)
            const agora = new Date();
            const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString();
            const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).toISOString();

            const { data: obrs } = await supabase
                .schema('fiscal')
                .from('calendario')
                .select('*, template:template_id(nome, departamento)')
                .gte('data_vencimento', inicioMes)
                .lte('data_vencimento', fimMes);

            // 3. Buscar Certificados (para alertas de vencimento)
            const { data: certs } = await supabase
                .from('cliente_certificados')
                .select('id, cliente_id, data_vencimento');

            // 4. Cruzar Dados
            let pendenciasTotal = 0;
            let certsVencendo = 0;

            const enriched = (clientsData || []).map((c: any) => {
                const clientObrs = (obrs || []).filter((o: any) => o.empresa_id === c.id);
                const hasPending = clientObrs.some((o: any) => o.status === 'PENDENTE');
                if (hasPending) pendenciasTotal++;

                const clientCerts = (certs || []).filter((ct: any) => ct.cliente_id === c.id);
                const isNearExp = clientCerts.some((ct: any) => {
                    if (!ct.data_vencimento) return false;
                    const diff = Math.ceil((new Date(ct.data_vencimento).getTime() - agora.getTime()) / (1000 * 60 * 60 * 24));
                    return diff <= 30;
                });
                if (isNearExp) certsVencendo++;

                return {
                    ...c,
                    documento: c.documento || '', // Garantir campo consistente
                    obrigacoes: clientObrs,
                    hasPending,
                    isCertNearExp: isNearExp
                };
            });

            setClientes(enriched);
            setStats({
                total: enriched.length,
                pendentes: enriched.filter((e: any) => e.hasPending).length,
                certVencendo: certsVencendo,
                auditadosOk: enriched.filter((e: any) => !e.hasPending && e.obrigacoes.length > 0).length
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
        c.documento?.toString().includes(searchTerm) ||
        c.razao_social?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenDetails = (id: string) => {
        router.push(`/admin/clientes/${id}`);
    };
    async function handleGlobalSync() {
        if (!confirm('MAESTRO: Deseja rodar o radar global em toda a carteira? Isso será feito individualmente para evitar sobrecarga.')) return;

        try {
            setGlobalSyncing(true);
            const activeClients = clientes; // Todos os clientes carregados

            for (const client of activeClients) {
                console.log(`[MAESTRO] Sincronizando: ${client.nome}`);
                await fetch('/api/sync/audit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ clientId: client.id })
                });
            }

            alert('MAESTRO: Radar Global finalizado com sucesso!');
            fetchClientes();
        } catch (err: any) {
            console.error(err);
            alert('Erro no Radar Global: ' + err.message);
        } finally {
            setGlobalSyncing(false);
        }
    }
    async function handleEnrichmentMaster() {
        try {
            setGlobalSyncing(true);
            const res = await fetch('/api/clientes/enrich-all');
            const candidates = await res.json();

            if (!res.ok) throw new Error(candidates.error || 'Falha ao identificar candidatos');

            if (candidates.length === 0) {
                alert('MAESTRO: Todos os clientes PJ já estão com dados enriquecidos!');
                setGlobalSyncing(false);
                return;
            }

            setEnrichCandidates(candidates);
            setIsEnrichModalOpen(true);
            // O modal assume o controle do processamento a partir daqui
        } catch (err: any) {
            console.error(err);
            alert('Erro no Enriquecimento Master: ' + err.message);
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
                documento: client.documento?.toString() || '',
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
                status_rfb: client.status_rfb || 'ATIVA'
            });
        } else {
            setEditingClient(null);
            setFormData({
                nome: '', documento: '', telefone_whatsapp: '', email: '',
                razao_social: '', regime_tributario: '', cnae_principal: '',
                logradouro: '', numero: '', bairro: '', cep: '',
                cidade: 'Sidrolândia', estado: 'MS',
                inscricao_estadual: '',
                status_rfb: 'ATIVA'
            });
        }
        setIsModalOpen(true);
    };

    async function handleConsultarCNPJ(cnpjOverride?: string) {
        const cnpj = (cnpjOverride || formData.documento).replace(/\D/g, '');
        if (cnpj.length !== 14) {
            if (!cnpjOverride) alert('Digite um CNPJ válido com 14 dígitos.');
            return;
        }
        setConsulting(true);
        try {
            // Usa API proxy do servidor para evitar CORS
            const response = await fetch(`/api/clientes/cnpj?cnpj=${cnpj}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Falha na consulta.');
            }

            console.log('[CNPJ Consult]', data.source, data);

            setFormData((prev: any) => ({
                ...prev,
                nome_fantasia: data.nome_fantasia || prev.nome_fantasia,
                razao_social: data.razao_social || prev.razao_social,
                email: data.email || prev.email,
                telefone: data.telefone || prev.telefone,
                cnae_principal: data.cnae_principal || prev.cnae_principal,
                cnaes_secundarios: data.cnaes_secundarios || prev.cnaes_secundarios,
                natureza_juridica: data.natureza_juridica || prev.natureza_juridica,
                porte: data.porte || prev.porte,
                capital_social: data.capital_social || prev.capital_social,
                inicio_atividade: data.inicio_atividade || prev.inicio_atividade,
                regime_tributario: data.regime_tributario || prev.regime_tributario,
                status_rfb: data.status_rfb || 'ATIVA',
                logradouro: data.logradouro || prev.logradouro,
                numero: data.numero || prev.numero,
                bairro: data.bairro || prev.bairro,
                cep: data.cep || prev.cep,
                cidade: data.cidade || prev.cidade,
                estado: data.estado || prev.estado,
                inscricao_estadual: data.inscricao_estadual || prev.inscricao_estadual,
            }));
        } catch (err: any) {
            alert('Erro ao consultar CNPJ: ' + err.message);
        } finally {
            setConsulting(false);
        }
    }

    // Consulta Automática ao digitar 14 dígitos
    useEffect(() => {
        const cnpj = formData.documento?.replace(/\D/g, '');
        if (cnpj?.length === 14 && !consulting && !editingClient) {
            handleConsultarCNPJ(cnpj);
        }
    }, [formData.documento]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSyncing(true);
        try {
            if (editingClient) {
                // Edição: direto no Supabase (campos limpos)
                const cleanData = { ...formData };
                delete cleanData.drive_folder_id; // Não editar drive_folder_id manualmente
                const { error } = await supabase.schema('core').from('empresas').update(cleanData).eq('id', editingClient.id);
                if (error) throw new Error(error.message);
            } else {
                // Novo cliente: via API que sanitiza campos + dispara n8n
                const response = await fetch('/api/clientes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.error || 'Falha ao cadastrar cliente');
                }
                console.log('[CADASTRO] Sucesso:', result);
                alert(`✅ ${result.message}`);
            }
            setIsModalOpen(false);
            fetchClientes();
        } catch (err: any) {
            console.error('[CADASTRO] Erro:', err);
            alert('❌ Erro ao salvar: ' + err.message);
        } finally {
            setSyncing(false);
        }
    }

    async function handleDelete(id: string, nome: string) {
        if (!confirm(`Excluir ${nome}?`)) return;
        try {
            await supabase.schema('core').from('empresas').delete().eq('id', id);
            setClientes(clientes.filter(c => c.id !== id));
        } catch (err) {
            alert('Erro ao excluir');
        }
    }

    return (
        <div className="space-y-8 page-fade-in pb-20">
            {/* Header Moderno com Dash de Operações */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Centro de Controle Maestro</h1>
                        <p className="text-[13px] font-medium text-muted-foreground mt-1">Gestão inteligente e operacional da carteira de clientes</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleGlobalSync}
                            disabled={globalSyncing}
                            className={`btn-modern-outline flex items-center gap-2 text-[12px] py-2.5 ${globalSyncing ? 'opacity-50' : ''}`}
                        >
                            {globalSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                            Radar Global
                        </button>
                        <button
                            onClick={handleEnrichmentMaster}
                            disabled={globalSyncing}
                            className={`btn-modern-outline flex items-center gap-2 text-[12px] py-2.5 ${globalSyncing ? 'opacity-50' : ''}`}
                        >
                            {globalSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Enriquecimento Master
                        </button>
                        <button
                            onClick={() => handleOpenModal()}
                            className="btn-modern flex items-center gap-2 text-[12px] py-2.5 shadow-primary/10"
                        >
                            <Plus className="w-4 h-4" /> Novo Cliente
                        </button>
                    </div>
                </div>

                {/* Cards de Inteligência (Estilo Dashboard Lúcido) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Clientes Ativos', value: stats.total, color: 'primary', icon: Users, desc: 'Base total cadastrada' },
                        { label: 'Pendências Auditoria', value: stats.pendentes, color: 'destructive', icon: AlertCircle, desc: 'Aguardando ação' },
                        { label: 'Certificados', value: stats.certVencendo, color: 'amber', icon: ShieldCheck, desc: 'Vencimento em 30 dias' },
                        { label: 'Auditados OK', value: stats.auditadosOk, color: 'primary', icon: CheckCircle2, desc: 'Sincronizados este mês' }
                    ].map((stat, i) => {
                        const Icon = stat.icon as any;
                        const colorClass = stat.color === 'destructive' ? 'text-destructive bg-destructive/10' :
                            stat.color === 'amber' ? 'text-amber-600 bg-amber-50' :
                                'text-primary bg-primary/10';

                        return (
                            <div key={i} className="lucid-card group">
                                <div className="flex justify-between items-start">
                                    <div className={`p-2.5 rounded-xl ${colorClass} transition-colors group-hover:bg-primary group-hover:text-white`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">{stat.label}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-border/50">
                                    <p className="text-[10px] text-muted-foreground font-medium">{stat.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Filtros e Busca */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, CNPJ ou razão social..."
                        className="w-full bg-card border border-border/60 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center justify-center gap-2 px-5 py-3 bg-card border border-border/60 text-muted-foreground rounded-xl font-semibold text-sm hover:bg-secondary hover:text-foreground transition-all shadow-sm">
                    <Filter className="w-4 h-4" /> Filtrar
                </button>
            </div>

            {/* Tabela de Clientes Modernizada */}
            <div className="lucid-card p-0 overflow-hidden border-border/40 shadow-xl">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                <th className="p-5 pl-8">Identificação do Cliente</th>
                                <th className="p-5 text-center">DAS / SN</th>
                                <th className="p-5 text-center">FGTS</th>
                                <th className="p-5 text-center">INSS</th>
                                <th className="p-5 text-center">Folha</th>
                                <th className="p-5 text-center">Vault</th>
                                <th className="p-5 text-right pr-8">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                                                <Loader2 className="w-8 h-8 animate-spin text-primary relative" />
                                            </div>
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Sincronizando Base Sefaz...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredClientes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground opacity-40">
                                            <Building2 className="w-12 h-12 mb-2" />
                                            <p className="font-bold uppercase tracking-widest text-sm">Nenhum cliente no radar</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredClientes.map((c) => {
                                    const getObrStatus = (name: string) => c.obrigacoes?.find((o: any) => o.template?.nome === name)?.status;

                                    const StatusBadge = ({ name }: { name: string }) => {
                                        const status = getObrStatus(name);
                                        if (!status) return <div className="w-2 h-2 rounded-full bg-muted/50 mx-auto" />;

                                        const isDone = status === 'CONCLUIDO';
                                        return (
                                            <div className="flex justify-center group/tip relative">
                                                <div className={`w-3.5 h-3.5 rounded-full border-2 border-background shadow-sm ${isDone ? 'bg-primary' : 'bg-destructive animate-pulse'} `} />
                                                <div className="absolute bottom-full mb-2 hidden group-hover/tip:block bg-foreground text-[10px] font-bold text-background px-2 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-50 animate-in fade-in zoom-in duration-200">
                                                    {name}: {status.toUpperCase()}
                                                </div>
                                            </div>
                                        );
                                    };

                                    return (
                                        <tr key={c.id} className="group hover:bg-secondary/40 transition-colors">
                                            <td className="p-5 pl-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 bg-secondary border border-border/50 rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all shadow-sm">
                                                        <Building2 className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <Link
                                                            href={`/admin/clientes/${c.id}`}
                                                            className="text-foreground font-bold hover:text-primary transition-colors text-[15px] tracking-tight leading-tight"
                                                        >
                                                            {c.nome_fantasia || c.razao_social}
                                                        </Link>
                                                        {c.nome_fantasia && c.razao_social && c.nome_fantasia !== c.razao_social && (
                                                            <span className="text-[10px] text-muted-foreground block truncate max-w-[250px] mt-0.5">
                                                                {c.razao_social}
                                                            </span>
                                                        )}
                                                        <div className="flex items-center gap-2.5 mt-1.5">
                                                            <span className="text-[11px] font-medium text-muted-foreground/80 font-mono tracking-tight">{formatCNPJ(c.documento?.toString())}</span>
                                                            {c.isCertNearExp && (
                                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full">
                                                                    <div className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse" />
                                                                    <span className="text-[9px] font-bold uppercase tracking-tighter">Vencimento</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5"><StatusBadge name="DAS" /></td>
                                            <td className="p-5"><StatusBadge name="FGTS" /></td>
                                            <td className="p-5"><StatusBadge name="INSS" /></td>
                                            <td className="p-5"><StatusBadge name="Folha de Pagamento" /></td>
                                            <td className="p-5 text-center">
                                                <div className="flex justify-center">
                                                    {c.drive_folder_id ? (
                                                        <a
                                                            href={`https://drive.google.com/drive/folders/${c.drive_folder_id}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                            title="Abrir Pasta no Drive"
                                                        >
                                                            <FolderOpen className="w-4 h-4" />
                                                        </a>
                                                    ) : (
                                                        <div className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-600 animate-pulse" title="Sincronizando Drive...">
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-5 text-right pr-8">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button
                                                        onClick={() => handleOpenDetails(c.id)}
                                                        className="p-2.5 bg-card border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all rounded-xl shadow-sm"
                                                        title="Visualizar"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenModal(c)}
                                                        className="p-2.5 bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-all rounded-xl shadow-sm"
                                                        title="Editar"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(c.id, c.nome)}
                                                        className="p-2.5 bg-card border border-border/60 text-muted-foreground hover:text-destructive hover:bg-destructive/5 hover:border-destructive/30 transition-all rounded-xl shadow-sm"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
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

            {/* Componentes Laterais e Modais */}
            <ClientDetailSidebar
                clientId={selectedClientId}
                isOpen={isSidebarOpen}
                onClose={handleCloseDetails}
                onUpdate={fetchClientes}
            />

            <EnrichmentProgressModal
                isOpen={isEnrichModalOpen}
                candidates={enrichCandidates}
                onClose={(refetch) => {
                    setIsEnrichModalOpen(false);
                    setGlobalSyncing(false);
                    if (refetch) fetchClientes();
                }}
            />

            {/* Drawer de Cadastro Moderno */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-end p-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-card border-l border-border/50 w-full max-w-xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">
                        <div className="p-8 border-b border-border/50 flex justify-between items-center bg-secondary/30">
                            <div>
                                <h2 className="text-xl font-bold text-foreground tracking-tight">{editingClient ? 'Ajustar Cadastro' : 'Novo Cliente Agro'}</h2>
                                <p className="text-xs font-medium text-muted-foreground mt-1">Preencha as informações fiscais e cadastrais</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 p-8 space-y-6 overflow-y-auto no-scrollbar pb-32">
                            {/* CNPJ Consult Section */}
                            <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl space-y-3">
                                <label className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4" /> Inteligência Cadastral
                                </label>
                                <div className="flex gap-2">
                                    <input required className="flex-1 bg-card border border-border/60 rounded-xl p-3 text-sm font-semibold outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-foreground"
                                        placeholder="CNPJ ou CPF para consulta"
                                        value={formData.documento || ''} onChange={e => setFormData({ ...formData, documento: e.target.value })} />
                                    {formData.documento?.replace(/\D/g, '').length === 14 && (
                                        <button type="button" onClick={() => handleConsultarCNPJ()} disabled={consulting} className="btn-modern shadow-primary/20 px-6">
                                            {consulting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Consultar'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2 col-span-2">
                                    <label htmlFor="razao_social" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Razão Social (Nome Empresarial)</label>
                                    <input id="razao_social" required className="w-full bg-card border border-border/60 rounded-xl p-3 text-sm font-semibold text-foreground focus:border-primary/40 outline-none transition-all shadow-sm"
                                        value={formData.razao_social || ''} onChange={e => setFormData({ ...formData, razao_social: e.target.value })} />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label htmlFor="apelido" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Nome Fantasia / Apelido</label>
                                    <input id="apelido" required className="w-full bg-card border border-border/60 rounded-xl p-3 text-sm font-bold text-primary focus:border-primary outline-none transition-all shadow-sm"
                                        value={formData.nome_fantasia || ''} onChange={e => setFormData({ ...formData, nome_fantasia: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="regime_tributario" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Regime Fiscal</label>
                                    <select id="regime_tributario" className="w-full bg-card border border-border/60 rounded-xl p-3 text-sm font-semibold text-foreground outline-none appearance-none cursor-pointer"
                                        value={formData.regime_tributario || ''} onChange={e => setFormData({ ...formData, regime_tributario: e.target.value })}>
                                        <option value="">Selecione...</option>
                                        <option value="SIMPLES_NACIONAL">SIMPLES NACIONAL</option>
                                        <option value="LUCRO_PRESUMIDO">LUCRO PRESUMIDO</option>
                                        <option value="LUCRO_REAL">LUCRO REAL</option>
                                        <option value="MEI">MEI</option>
                                        <option value="PESSOA_FISICA">PF (AGRO)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="status_rfb" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Situação RFB</label>
                                    <input id="status_rfb" className="w-full bg-card border border-border/60 rounded-xl p-3 text-sm font-bold text-emerald-600 outline-none"
                                        value={formData.status_rfb || ''} onChange={e => setFormData({ ...formData, status_rfb: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="telefone" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">WhatsApp</label>
                                    <input id="telefone" className="w-full bg-card border border-border/60 rounded-xl p-3 text-sm font-medium text-foreground outline-none"
                                        placeholder="67 9..."
                                        value={formData.telefone || ''} onChange={e => setFormData({ ...formData, telefone: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email_fiscal" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">E-mail Fiscal</label>
                                    <input id="email_fiscal" className="w-full bg-card border border-border/60 rounded-xl p-3 text-sm font-medium text-foreground outline-none"
                                        placeholder="contato@..."
                                        value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>

                                {/* Seção de Endereço */}
                                <div className="col-span-2 pt-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-px flex-1 bg-border/40"></div>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Endereço</span>
                                        <div className="h-px flex-1 bg-border/40"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="cep" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">CEP</label>
                                    <input id="cep" className="w-full bg-card border border-border/60 rounded-xl p-3 text-sm font-semibold text-foreground outline-none"
                                        value={formData.cep || ''} onChange={e => setFormData({ ...formData, cep: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="cidade" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Cidade / UF</label>
                                    <div className="flex gap-2">
                                        <input id="cidade" className="flex-[3] bg-card border border-border/60 rounded-xl p-3 text-sm font-medium text-foreground outline-none"
                                            value={formData.cidade || ''} onChange={e => setFormData({ ...formData, cidade: e.target.value })} />
                                        <input id="estado" maxLength={2} className="flex-1 bg-card border border-border/60 rounded-xl p-3 text-sm font-medium text-foreground outline-none text-center"
                                            value={formData.estado || ''} onChange={e => setFormData({ ...formData, estado: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label htmlFor="logradouro" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Logradouro / Rua</label>
                                    <div className="flex gap-2">
                                        <input id="logradouro" className="flex-[3] bg-card border border-border/60 rounded-xl p-3 text-sm font-medium text-foreground outline-none"
                                            value={formData.logradouro || ''} onChange={e => setFormData({ ...formData, logradouro: e.target.value })} />
                                        <input id="numero" className="flex-1 bg-card border border-border/60 rounded-xl p-3 text-sm font-medium text-foreground outline-none"
                                            placeholder="Nº"
                                            value={formData.numero || ''} onChange={e => setFormData({ ...formData, numero: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label htmlFor="bairro" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Bairro</label>
                                    <input id="bairro" className="w-full bg-card border border-border/60 rounded-xl p-3 text-sm font-medium text-foreground outline-none"
                                        value={formData.bairro || ''} onChange={e => setFormData({ ...formData, bairro: e.target.value })} />
                                </div>

                                {/* Seção Técnica */}
                                <div className="col-span-2 pt-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-px flex-1 bg-border/40"></div>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Dossiê Técnico</span>
                                        <div className="h-px flex-1 bg-border/40"></div>
                                    </div>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label htmlFor="cnae_principal" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">CNAE Principal</label>
                                    <textarea id="cnae_principal" rows={2} className="w-full bg-card border border-border/60 rounded-xl p-3 text-xs font-medium text-foreground outline-none resize-none"
                                        value={formData.cnae_principal || ''} onChange={e => setFormData({ ...formData, cnae_principal: e.target.value })} />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label htmlFor="cnaes_secundarios" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">CNAEs Secundários</label>
                                    <textarea id="cnaes_secundarios" rows={3} className="w-full bg-card border border-border/60 rounded-xl p-3 text-[10px] font-medium text-muted-foreground outline-none resize-none"
                                        value={formData.cnaes_secundarios || ''} onChange={e => setFormData({ ...formData, cnaes_secundarios: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="natureza_juridica" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Natureza Jurídica</label>
                                    <input id="natureza_juridica" className="w-full bg-card border border-border/60 rounded-xl p-3 text-xs font-semibold text-foreground outline-none"
                                        value={formData.natureza_juridica || ''} onChange={e => setFormData({ ...formData, natureza_juridica: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="porte" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Porte</label>
                                    <input id="porte" className="w-full bg-card border border-border/60 rounded-xl p-3 text-xs font-semibold text-foreground outline-none"
                                        value={formData.porte || ''} onChange={e => setFormData({ ...formData, porte: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="capital_social" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Capital Social</label>
                                    <input id="capital_social" className="w-full bg-card border border-border/60 rounded-xl p-3 text-xs font-bold text-primary outline-none"
                                        value={formData.capital_social || ''} onChange={e => setFormData({ ...formData, capital_social: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="inicio_atividade" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Data Abertura</label>
                                    <input id="inicio_atividade" type="date" className="w-full bg-card border border-border/60 rounded-xl p-3 text-xs font-semibold text-foreground outline-none"
                                        value={formData.inicio_atividade || ''} onChange={e => setFormData({ ...formData, inicio_atividade: e.target.value })} />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-10 border-t border-border/50 sticky bottom-0 bg-card pb-8">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-sm font-bold text-muted-foreground hover:bg-muted rounded-xl transition-all">Cancelar</button>
                                <button type="submit" disabled={syncing} className={`flex-[2] btn-modern py-4 ${syncing ? 'opacity-50' : ''}`}>
                                    {syncing ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <Loader2 className="w-5 h-5 animate-spin" /> Salvando...
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

            {/* Footer Informativo Maestro (Design Reflexivo) */}
            <div className="pt-20 border-t border-border/40 text-center space-y-4 opacity-60 pb-10">
                <div className="flex justify-center items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground">Ecossistema Maestro</span>
                </div>
                <p className="text-[11px] max-w-lg mx-auto leading-relaxed text-muted-foreground font-medium">
                    A Brandão Contabilidade une tradição e inovação para entregar inteligência fiscal superior.
                    O Maestro é a nossa resposta tecnológica para um mercado que exige precisão, agilidade e segurança absoluta.
                </p>
            </div>
        </div>
    );
}

export default function ClientesPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
            <ClientesContent />
        </Suspense>
    );
}
