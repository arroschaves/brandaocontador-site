"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatsGrid } from "./components/StatsGrid";
import Link from 'next/link';
import {
    LucideCalendar,
    RefreshCcw,
    Search,
    Filter,
    MapPin,
    AlertCircle,
    CheckCircle2,
    Clock,
    FileBox,
    MoreVertical,
    Upload,
    CreditCard,
    FolderPlus,
    Zap,
    ArrowUpRight,
    FileText,
    Activity as ActivityIcon,
} from "lucide-react";

// Map de ícone por tipo de atividade
const ACTIVITY_ICONS: Record<string, { icon: any; color: string; bgColor: string }> = {
    upload: { icon: Upload, color: 'text-emerald-600', bgColor: 'bg-emerald-500' },
    sync: { icon: RefreshCcw, color: 'text-blue-600', bgColor: 'bg-blue-500' },
    alert: { icon: AlertCircle, color: 'text-amber-600', bgColor: 'bg-amber-500' },
    folder_created: { icon: FolderPlus, color: 'text-indigo-600', bgColor: 'bg-indigo-500' },
    payment_detected: { icon: CreditCard, color: 'text-green-600', bgColor: 'bg-green-500' },
    obligation_completed: { icon: CheckCircle2, color: 'text-emerald-600', bgColor: 'bg-emerald-500' },
};

// Map de label por tipo
const ACTIVITY_LABELS: Record<string, string> = {
    upload: 'Upload',
    sync: 'Sync',
    alert: 'Alerta',
    folder_created: 'Nova Pasta',
    payment_detected: 'Pagamento',
    obligation_completed: 'Concluído',
};

export const dynamic = 'force-dynamic';

export default function MaestroPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [obrigacoes, setObrigacoes] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalClientes: 0,
        totalFazendas: 0,
        pendencias: 0,
        arquivosHoje: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipo, setFilterTipo] = useState<string>('all');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Stats (Schemas CORE e FISCAL)
            const { count: countClientes } = await supabase.schema('core').from('empresas').select('*', { count: 'exact', head: true });
            const { count: countUnidades } = await supabase.schema('core').from('unidades_fiscais').select('*', { count: 'exact', head: true });
            const { count: countPendencias } = await supabase.schema('fiscal').from('calendario').select('*', { count: 'exact', head: true }).eq('status', 'PENDENTE');

            // Arquivos de hoje (Schema AUDIT)
            const today = new Date().toISOString().split('T')[0];
            const { count: countHoje } = await supabase
                .schema('audit')
                .from('logs')
                .select('*', { count: 'exact', head: true })
                .in('acao', ['UPLOAD', 'FILE_SYNC'])
                .gte('created_at', `${today}T00:00:00`);

            setStats({
                totalClientes: countClientes || 0,
                totalFazendas: countUnidades || 0,
                pendencias: countPendencias || 0,
                arquivosHoje: countHoje || 0
            });

            // 2. Activity Feed (últimas 50 atividades do Schema AUDIT)
            const { data: actData, error: actError } = await supabase
                .schema('audit')
                .from('logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (actError) {
                // Se tabela não existe ainda, mostrar dados vazios sem erro
                if (actError.message?.includes('does not exist') || actError.code === '42P01') {
                    setActivities([]);
                } else {
                    throw actError;
                }
            } else {
                setActivities(actData || []);
            }

            // 3. Obrigações próximas (Schema FISCAL)
            const { data: obData, error: oError } = await supabase
                .schema('fiscal')
                .from('calendario')
                .select('*, empresas:empresa_id(razao_social), template:template_id(nome)')
                .order('data_vencimento', { ascending: true })
                .eq('status', 'PENDENTE')
                .limit(10);

            if (oError && !oError.message?.includes('does not exist')) throw oError;
            setObrigacoes(obData || []);

        } catch (err: any) {
            console.error("Erro ao carregar dados do Maestro:", err);
            setError(err.message || "Erro desconhecido ao carregar dados.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();

        // Realtime subscription para audit.logs
        const channel = supabase
            .channel('maestro-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'audit', table: 'logs' }, (payload: any) => {
                console.log('[MAESTRO] Nova atividade:', payload.new);
                const newAct = payload.new;
                setActivities(prev => [newAct as any, ...prev].slice(0, 50));
                // Atualizar contadores
                if (newAct.dados_novos?.tipo === 'upload') {
                    setStats(prev => ({ ...prev, arquivosHoje: prev.arquivosHoje + 1 }));
                }
            })
            .on('postgres_changes', { event: '*', schema: 'fiscal', table: 'calendario' }, () => {
                fetchData(); // Refresh on obligation change
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchData]);

    // Formatar tempo relativo
    function timeAgo(dateStr: string): string {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now.getTime() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffMin < 1) return 'Agora';
        if (diffMin < 60) return `Há ${diffMin} min`;
        if (diffHour < 24) return `Há ${diffHour}h`;
        if (diffDay < 7) return `Há ${diffDay}d`;
        return date.toLocaleDateString('pt-BR');
    }

    // Filtrar atividades
    const filteredActivities = activities.filter(a => {
        const matchSearch = searchTerm === '' ||
            a.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.arquivo_nome?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchTipo = filterTipo === 'all' || a.tipo === filterTipo;

        return matchSearch && matchTipo;
    });

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <span className="bg-primary/10 p-2 rounded-lg text-primary">
                            <Zap className="w-8 h-8" />
                        </span>
                        Maestro Command Center
                    </h1>
                    <p className="text-muted-foreground mt-1">Inteligência documental em tempo real — dados ao vivo do Google Drive.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="btn-modern bg-white text-foreground border border-border hover:bg-muted flex items-center gap-2"
                    >
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Atualizar</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-8 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold">Erro de Sistema</h3>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <StatsGrid {...stats} />

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column (2/3) - Activity Feed REAL */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Search & Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar por cliente, arquivo ou descrição..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2.5 text-sm bg-card border border-border rounded-xl w-full focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>
                        <select
                            value={filterTipo}
                            onChange={(e) => setFilterTipo(e.target.value)}
                            className="px-4 py-2.5 text-sm bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
                        >
                            <option value="all">Todos os tipos</option>
                            <option value="upload">Uploads</option>
                            <option value="sync">Sincronização</option>
                            <option value="payment_detected">Pagamentos</option>
                            <option value="obligation_completed">Concluídos</option>
                            <option value="alert">Alertas</option>
                            <option value="folder_created">Pastas</option>
                        </select>
                    </div>

                    {/* Activity Timeline */}
                    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <ActivityIcon className="w-5 h-5 text-primary" />
                                Feed de Atividades
                                {activities.length > 0 && (
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                                        {activities.length}
                                    </span>
                                )}
                            </h3>
                        </div>

                        <div className="space-y-1 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse mb-3" />
                                ))
                            ) : filteredActivities.length === 0 ? (
                                <div className="text-center py-16 text-muted-foreground">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="font-medium">Nenhuma atividade registrada</p>
                                    <p className="text-sm mt-1">
                                        {activities.length === 0
                                            ? 'Execute a migration SQL e o webhook começará a registrar atividades.'
                                            : 'Nenhum resultado para o filtro selecionado.'
                                        }
                                    </p>
                                </div>
                            ) : (
                                filteredActivities.map((act, idx) => {
                                    const displayDesc = act.dados_novos?.descricao || act.tabela;
                                    const displayTipo = act.dados_novos?.tipo || 'system';
                                    const config = ACTIVITY_ICONS[displayTipo] || ACTIVITY_ICONS.upload;
                                    const IconComp = config.icon;
                                    const label = ACTIVITY_LABELS[displayTipo] || displayTipo;

                                    return (
                                        <div key={act.id || idx} className="relative pl-8 pb-6 last:pb-2 border-l-2 border-border/50 ml-2 hover:border-primary/30 transition-colors">
                                            {/* Timeline dot */}
                                            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${config.bgColor} border-4 border-card box-content shadow-sm`} />

                                            {/* Content */}
                                            <div className="flex items-start justify-between gap-3 group">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.color} bg-opacity-10`}
                                                            style={{ backgroundColor: `color-mix(in srgb, currentColor 10%, transparent)` }}
                                                        >
                                                            {label}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground ml-auto whitespace-nowrap">
                                                            {timeAgo(act.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium text-foreground leading-snug">
                                                        {act.descricao}
                                                    </p>
                                                    {act.metadata?.file_name && (
                                                        <p className="text-xs text-muted-foreground mt-1 bg-muted/30 p-2 rounded-lg border border-border/50 font-mono break-all truncate">
                                                            {act.metadata.file_name}
                                                        </p>
                                                    )}
                                                    {act.empresa_id && (
                                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            ID Empresa: {act.empresa_id.substring(0, 8)}...
                                                        </p>
                                                    )}
                                                </div>

                                                {act.arquivo_url && (
                                                    <a
                                                        href={act.arquivo_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-muted rounded-lg transition-all text-muted-foreground hover:text-primary"
                                                        title="Ver no Drive"
                                                    >
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Column (1/3) - Obrigações Pendentes */}
                <div className="space-y-6">
                    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-500" />
                            Próximos Vencimentos
                        </h3>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {obrigacoes.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">Nenhuma obrigação pendente</p>
                                </div>
                            ) : (
                                obrigacoes.map((ob: any) => {
                                    const due = new Date(ob.data_vencimento);
                                    const diffDays = Math.ceil((due.getTime() - Date.now()) / 86400000);
                                    const isUrgent = diffDays <= 3;
                                    const isWarning = diffDays <= 7;

                                    return (
                                        <div key={ob.id} className={`p-4 rounded-xl border transition-all hover:shadow-sm ${isUrgent
                                            ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300'
                                            : isWarning
                                                ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                                                : 'bg-background border-border/50 hover:border-primary/30'
                                            }`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-sm text-foreground">{ob.template?.nome}</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isUrgent
                                                    ? 'bg-rose-100 text-rose-700'
                                                    : isWarning
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                    {diffDays < 0 ? 'VENCIDO' : diffDays === 0 ? 'HOJE' : `${diffDays}d`}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {due.toLocaleDateString('pt-BR')}
                                            </p>
                                            {ob.empresas?.razao_social && (
                                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                                    {ob.empresas.razao_social}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-primary" />
                            Ações Rápidas
                        </h3>
                        <div className="space-y-3">
                            <Link href="/admin/clientes" className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">Novo Cliente</p>
                                    <p className="text-xs text-muted-foreground">Cadastrar + criar pastas automáticas</p>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                            <a href="/admin/vencimentos" className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group">
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                    <LucideCalendar className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">Vencimentos</p>
                                    <p className="text-xs text-muted-foreground">Alvarás, CNDs e Certificados</p>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
