"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatsGrid } from "./components/StatsGrid";
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
    MoreVertical
} from "lucide-react";

const supabase = createClient();

export default function MaestroPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [unidades, setUnidades] = useState<any[]>([]);
    const [obrigacoes, setObrigacoes] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalClientes: 0,
        totalFazendas: 0,
        pendencias: 0,
        arquivosHoje: 0
    });

    const [activeTab, setActiveTab] = useState<'overview' | 'fazendas' | 'calendario'>('overview');

    useEffect(() => {
        fetchData();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('maestro-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'obrigacoes_acessorias' }, (payload) => {
                console.log('Realtime change:', payload);
                fetchData(); // Refresh data on change
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function fetchData() {
        try {
            setLoading(true);

            // 1. Fetch Stats
            const { count: countClientes } = await supabase.from('clientes').select('*', { count: 'exact', head: true });
            const { count: countUnidades } = await supabase.from('unidades_fiscais').select('*', { count: 'exact', head: true });
            const { count: countPendencias } = await supabase.from('obrigacoes_acessorias').select('*', { count: 'exact', head: true }).eq('status', 'pendente');

            // Simulado: Arquivos processados hoje (usando updated_at como proxy se tiver log de files)
            const countArquivos = 0; // Placeholder until we have logs table

            setStats({
                totalClientes: countClientes || 0,
                totalFazendas: countUnidades || 0,
                pendencias: countPendencias || 0,
                arquivosHoje: countArquivos
            });

            // 2. Fetch Unidades (Fazendas) Recentes
            const { data: unidadesData, error: uError } = await supabase
                .from('unidades_fiscais')
                .select('*, clientes(nome)')
                .order('created_at', { ascending: false })
                .limit(10);

            if (uError) throw uError;
            setUnidades(unidadesData || []);

            // 3. Fetch Obrigações Recentes
            const { data: obData, error: oError } = await supabase
                .from('obrigacoes_acessorias')
                .select('*')
                .order('vencimento', { ascending: true })
                .limit(20);

            if (oError) throw oError;
            setObrigacoes(obData || []);

        } catch (err: any) {
            console.error("Erro ao carregar dados do Maestro:", err);
            // Detect if column missing error
            if (err.message && err.message.includes("does not exist")) {
                setError("O Banco de Dados precisa ser atualizado (Migration). Algumas colunas (drive_folder_id) estão faltando.");
            } else {
                setError(err.message || "Erro desconhecido ao carregar dados.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <span className="bg-primary/10 p-2 rounded-lg text-primary">
                            <LucideCalendar className="w-8 h-8" />
                        </span>
                        Maestro Command Center
                    </h1>
                    <p className="text-muted-foreground mt-1">Gestão centralizada de obrigações e inteligência documental.</p>
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
                    <button className="btn-modern shadow-lg shadow-primary/20 flex items-center gap-2">
                        <FileBox className="w-4 h-4" />
                        <span>Novo Processo</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-8 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold">Erro de Sistema</h3>
                        <p className="text-sm">{error}</p>
                        {error.includes("Migration") && (
                            <button
                                className="text-xs font-semibold underline mt-2 hover:text-rose-900"
                                onClick={() => alert("Por favor, execute o script SQL '20260209_maestro_structure.sql' no Console do Supabase.")}
                            >
                                Como corrigir?
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <StatsGrid {...stats} />

            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-border/50 mb-8 overflow-x-auto pb-1">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'overview'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Visão Geral
                </button>
                <button
                    onClick={() => setActiveTab('fazendas')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'fazendas'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Fazendas & Rural
                </button>
                <button
                    onClick={() => setActiveTab('calendario')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'calendario'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Calendário Fiscal
                </button>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Recent Obligations List */}
                    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                Próximos Vencimentos
                            </h3>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
                                    <Filter className="w-4 h-4" />
                                </button>
                                <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
                                ))
                            ) : obrigacoes.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Nenhuma obrigação pendente encontrada.</p>
                                </div>
                            ) : (
                                obrigacoes.map((ob: any) => (
                                    <div key={ob.id} className="group flex items-center justify-between p-4 bg-background border border-border/50 rounded-xl hover:border-primary/30 hover:shadow-sm transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs border ${ob.status === 'pendente'
                                                    ? 'bg-amber-50 text-amber-600 border-amber-100'
                                                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                }`}>
                                                {new Date(ob.vencimento).getDate()}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-foreground">{ob.tipo}</h4>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Vence em {new Date(ob.vencimento).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ob.status === 'pendente'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                {ob.status}
                                            </span>
                                            <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-muted rounded-lg transition-all">
                                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <button className="w-full mt-6 py-3 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-colors border border-dashed border-primary/20 hover:border-primary/40">
                            Ver Todas as Obrigações
                        </button>
                    </div>

                    {/* Fazendas Section */}
                    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-emerald-500" />
                                Fazendas Recentes
                            </h3>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Buscar fazenda..."
                                    className="pl-9 pr-4 py-2 text-sm bg-muted/30 border border-border rounded-lg w-full md:w-64 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {unidades.map((u: any) => (
                                <div key={u.id} className="p-4 bg-background border border-border/50 rounded-xl hover:border-emerald-500/30 transition-all group cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        {u.drive_folder_id ? (
                                            <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-md border border-blue-100">DRIVE OK</span>
                                        ) : (
                                            <span className="text-[10px] font-bold px-2 py-1 bg-rose-50 text-rose-600 rounded-md border border-rose-100">SEM DRIVE</span>
                                        )}
                                    </div>
                                    <h4 className="font-semibold text-foreground truncate" title={u.nome_identificador}>
                                        {u.nome_identificador}
                                    </h4>
                                    <p className="text-xs text-muted-foreground truncate mb-3">
                                        {u.clientes?.nome || 'Cliente Desconhecido'}
                                    </p>
                                    <div className="flex items-center justify-between pt-3 border-t border-border/30">
                                        <div className="text-xs text-muted-foreground">
                                            <span className="block font-medium text-foreground">-- ha</span>
                                            Área Total
                                        </div>
                                        <button className="text-xs font-medium text-primary hover:underline">
                                            Gerenciar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Right Column (1/3) - Activity Feed */}
                <div className="space-y-8">
                    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm h-full max-h-[800px] flex flex-col">
                        <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-500" />
                            Atividade do Robô
                        </h3>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                            {/* Timeline Item */}
                            <div className="relative pl-6 border-l-2 border-border/50 pb-6 last:border-0 last:pb-0">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-card box-content shadow-sm" />
                                <div className="mb-1 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Upload</span>
                                    <span className="text-[10px] text-muted-foreground">Há 2 min</span>
                                </div>
                                <p className="text-sm font-medium text-foreground">Novo arquivo detectado</p>
                                <p className="text-xs text-muted-foreground mt-1 bg-muted/30 p-2 rounded-lg border border-border/50 font-mono break-all">
                                    FGTS_FAZENDA_ITAOCA_012026.pdf
                                </p>
                            </div>

                            {/* Timeline Item */}
                            <div className="relative pl-6 border-l-2 border-border/50 pb-6 last:border-0 last:pb-0">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-card box-content shadow-sm" />
                                <div className="mb-1 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Sync</span>
                                    <span className="text-[10px] text-muted-foreground">Há 15 min</span>
                                </div>
                                <p className="text-sm font-medium text-foreground">Fazenda criada</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Pasta "FAZENDA PIATA" criada no Drive para Cliente X.
                                </p>
                            </div>

                            {/* Timeline Item */}
                            <div className="relative pl-6 border-l-2 border-border/50 pb-6 last:border-0 last:pb-0">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-amber-500 border-4 border-card box-content shadow-sm" />
                                <div className="mb-1 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Alerta</span>
                                    <span className="text-[10px] text-muted-foreground">Há 1 hora</span>
                                </div>
                                <p className="text-sm font-medium text-foreground">Vencimento Próximo</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    3 obrigações vencem amanhã. Clientes notificados.
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function Activity({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    );
}
