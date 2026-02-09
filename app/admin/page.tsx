"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Users,
    AlertCircle,
    CheckCircle2,
    MessageSquare,
    ArrowUpRight,
    Loader2,
    Plus,
    Calendar,
    Search,
    RefreshCw,
    ShieldCheck,
    FileSearch,
    Activity,
    PieChart
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AlertasGaps from './components/AlertasGaps';
import GestaoValidades from './components/GestaoValidades';
import WhatsAppRadar from '@/app/components/WhatsAppRadar';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>({
        totalClientes: 0,
        concluidosMes: 0,
        pendentesMes: 0,
        pedidosZap: 0,
        auditRate: 0,
        obrCounts: {}
    });
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [recentAlerts, setRecentAlerts] = useState<any[]>([]);

    async function fetchStats() {
        try {
            setLoading(true);
            const { count: countClientes } = await supabase
                .from('clientes')
                .select('*', { count: 'exact', head: true });

            const agora = new Date();
            const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString();
            const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).toISOString();

            const { data: obrMes } = await supabase
                .from('obrigacoes_acessorias')
                .select('status')
                .gte('competencia', inicioMes)
                .lte('competencia', fimMes);

            const total = obrMes?.length || 0;
            const concluidos = obrMes?.filter((o: any) => o.status === 'concluido').length || 0;
            const pendentes = total - concluidos;

            // Processar contagem por tipo
            const obrCounts: any = {};
            obrMes?.forEach((o: any) => {
                if (!obrCounts[o.tipo]) obrCounts[o.tipo] = { total: 0, concluido: 0 };
                obrCounts[o.tipo].total++;
                if (o.status === 'concluido') obrCounts[o.tipo].concluido++;
            });

            setStats({
                totalClientes: countClientes || 0,
                pedidosZap: 0,
                concluidosMes: concluidos,
                pendentesMes: pendentes,
                auditRate: total > 0 ? Math.round((concluidos / total) * 100) : 0,
                obrCounts
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStats();
    }, []);

    const handleAuditSync = async () => {
        setSyncing(true);
        try {
            const res = await fetch('/api/sync/audit', { method: 'POST' });
            if (res.ok) {
                await fetchStats();
                alert('Auditoria Concluída! O CRM foi sincronizado com os arquivos do Google Drive.');
            }
        } catch (err) {
            alert('Falha ao processar auditoria.');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="space-y-8 page-fade-in pb-12">
            {/* Header Técnico & Boas-vindas */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 bg-card border border-border/40 rounded-[2rem] shadow-xl shadow-primary/5">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                        </div>
                        <h1 className="text-xl font-bold text-foreground tracking-tight">Centro de Inteligência Contábil</h1>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] pl-1">Brandão v3.0 • Monitoramento Maestro em Tempo Real</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleAuditSync}
                        disabled={syncing}
                        className="flex items-center gap-2.5 px-6 py-3.5 btn-modern shadow-primary/20"
                    >
                        {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Sincronizar Cloud
                    </button>
                    <Link href="/admin/clientes" className="flex items-center gap-2.5 px-6 py-3.5 bg-secondary hover:bg-secondary/80 text-foreground text-[11px] font-bold uppercase tracking-tight rounded-2xl border border-border/60 transition-all shadow-sm">
                        <Plus className="w-4 h-4" /> Novo Registro
                    </Link>
                </div>
            </div>

            {/* Grid de Auditoria (Sleek) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: 'Carteira', value: stats.totalClientes, icon: Users, color: 'text-primary' },
                    { label: 'Atendimento', value: stats.pedidosZap, icon: MessageSquare, color: 'text-primary' },
                    { label: 'Concluídos', value: stats.concluidosMes, icon: PieChart, color: 'text-primary' },
                    { label: 'Pendentes', value: stats.pendentesMes, icon: AlertCircle, color: 'text-amber-500' },
                    { label: 'Eficiência', value: `${stats.auditRate}%`, icon: Activity, color: 'text-primary' }
                ].map((stat, i) => (
                    <div key={i} className="lucid-card p-6 flex flex-col justify-between group hover:border-primary/40 hover:shadow-primary/5 transition-all">
                        <div className="flex items-center justify-between">
                            <div className={`p-2 rounded-lg bg-secondary border border-border/50 group-hover:border-primary/20 group-hover:bg-primary/5 transition-colors`}>
                                <stat.icon className={`w-4 h-4 ${stat.color} transition-all`} />
                            </div>
                            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                        <div className="space-y-1 mt-4">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                            <p className={`text-2xl font-bold tracking-tight tabular-nums ${stat.color}`}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Seções de Trabalho Estruturadas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Radar de Gaps (Novo Componente de Inteligência) */}
                <div className="lg:col-span-1">
                    <AlertasGaps />
                </div>

                {/* Radar de Obrigações Acessórias (Dados Reais) */}
                <div className="lg:col-span-2 lucid-card p-0 flex flex-col border-border/40 shadow-xl">
                    <div className="p-6 border-b border-border/40 bg-secondary/20 flex justify-between items-center">
                        <div className="space-y-1">
                            <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Métrica de Processamento Maestro</h2>
                            <p className="text-[10px] font-medium text-muted-foreground/60">{new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date())} • {new Date().getFullYear()}</p>
                        </div>
                        <Link href="/admin/cronograma" className="text-[10px] font-bold text-primary hover:underline underline-offset-4 tracking-tight">VER MAPA COMPLETO</Link>
                    </div>
                    <div className="p-0 flex-1 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/40 bg-muted/30">
                                    <th className="p-4 pl-6">Obrigação</th>
                                    <th className="p-4 text-center">Protocolo</th>
                                    <th className="p-4 text-center">Auditado</th>
                                    <th className="p-4 pr-6 text-right">Eficiência</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {['DCTFWeb', 'FGTS Digital', 'PGDAS-D', 'EFD-Reinf'].map((tipo) => {
                                    const totalTipo = stats.obrCounts?.[tipo]?.total || 0;
                                    const doneTipo = stats.obrCounts?.[tipo]?.concluido || 0;
                                    const percent = totalTipo > 0 ? Math.round((doneTipo / totalTipo) * 100) : 0;

                                    return (
                                        <tr key={tipo} className="hover:bg-secondary/30 transition-colors group">
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                                    <div>
                                                        <p className="text-[12px] font-bold text-foreground uppercase tracking-tight">{tipo}</p>
                                                        <p className="text-[9px] font-semibold text-muted-foreground opacity-60">Impacto Fiscal em Tempo Real</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <p className="text-[11px] font-bold text-foreground tabular-nums">{totalTipo}</p>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md">
                                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                                    <p className="text-[11px] font-bold tabular-nums">{doneTipo}</p>
                                                </div>
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${percent === 100 ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground'} uppercase transition-all`}>
                                                        {percent}%
                                                    </span>
                                                    <div className="w-16 h-1 bg-secondary rounded-full overflow-hidden border border-border/20">
                                                        <div className={`h-full transition-all duration-1000 ease-out ${percent === 100 ? 'bg-primary' : 'bg-primary/60'}`} style={{ width: `${percent}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-secondary/10 border-t border-border/40 flex justify-between items-center bg-card/50">
                        <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-widest pl-2">Sincronizado via maestro engine v3.1 • Google Cloud Platform</p>
                        <button onClick={fetchStats} className="text-[10px] font-bold text-muted-foreground hover:text-primary uppercase flex items-center gap-2 transition-colors pr-2">
                            <RefreshCw className="w-3 h-3" /> Atualizar Radar
                        </button>
                    </div>
                </div>

                {/* Calendário de Validades & Ferramentas Auxiliares */}
                <div className="space-y-6">
                    <GestaoValidades />

                    <div className="lucid-card border-border/40 shadow-lg p-0 overflow-hidden">
                        <WhatsAppRadar />
                    </div>
                </div>
            </div>
            {/* Filosofia Maestro (Reflexivo) */}
            <div className="pt-20 border-t border-border/40 text-center space-y-4 opacity-60">
                <div className="flex justify-center items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground">Ecossistema Maestro</span>
                </div>
                <p className="text-[11px] max-w-lg mx-auto leading-relaxed text-muted-foreground font-medium">
                    O Maestro não é apenas uma ferramenta, é a materialização de 30 anos de expertise contábil dedicada ao sucesso do agronegócio.
                    Monitoramos cada detalhe para que você possa focar no que realmente importa: a sua estratégia.
                </p>
            </div>
        </div>
    );
}
