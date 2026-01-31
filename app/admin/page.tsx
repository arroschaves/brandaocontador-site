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
        <div className="space-y-6 animate-in fade-in duration-700 pb-10">
            {/* Header Técnico */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-neutral-900 border border-neutral-800 p-5 rounded-lg">
                <div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500/80" />
                        <h1 className="text-lg font-bold text-neutral-100 tracking-tight">Centro de Inteligência Contábil</h1>
                    </div>
                    <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-[0.2em] mt-1">Brandão v2.0 // Monitoramento de Nuvem</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleAuditSync}
                        disabled={syncing}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-[10px] font-black uppercase rounded transition-all disabled:opacity-50"
                    >
                        {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        Sincronizar Cloud
                    </button>
                    <Link href="/admin/clientes" className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-black uppercase rounded border border-neutral-700 transition-all">
                        <Plus className="w-3 h-3" /> Novo Registro
                    </Link>
                </div>
            </div>

            {/* Grid de Auditoria (Compacto) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl space-y-2 group hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center gap-2 opacity-50">
                        <Users className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Carteira</span>
                    </div>
                    <p className="text-xl font-bold text-neutral-100 tabular-nums">{stats.totalClientes}</p>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl space-y-2 group hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center gap-2 opacity-50">
                        <MessageSquare className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Atendimento</span>
                    </div>
                    <p className="text-xl font-bold text-neutral-100 tabular-nums">{stats.pedidosZap}</p>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl space-y-2 group hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center gap-2 opacity-50">
                        <PieChart className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Concluídos</span>
                    </div>
                    <p className="text-xl font-bold text-neutral-100 tabular-nums">{stats.concluidosMes}</p>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl space-y-2 group hover:border-amber-500/30 transition-all">
                    <div className="flex items-center gap-2 opacity-50">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Pendentes</span>
                    </div>
                    <p className="text-xl font-bold text-amber-500 tabular-nums">{stats.pendentesMes}</p>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl space-y-2 group hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center gap-2 opacity-50">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Eficiência</span>
                    </div>
                    <p className="text-xl font-bold text-neutral-100 tabular-nums">{stats.auditRate}%</p>
                </div>
            </div>

            {/* Seções de Trabalho */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Radar de Gaps (Novo Componente de Inteligência) */}
                <div className="lg:col-span-1">
                    <AlertasGaps />
                </div>

                {/* Radar de Obrigações Acessórias (Dados Reais) */}
                <div className="lg:col-span-2 bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Métrica de Processamento ({new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date())}/{new Date().getFullYear()})</h2>
                        <Link href="/admin/cronograma" className="text-[9px] font-black text-emerald-500 hover:underline">VER MAPA COMPLETO</Link>
                    </div>
                    <div className="p-0 flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[8px] font-black text-neutral-600 uppercase border-b border-neutral-900 bg-neutral-900/20">
                                    <th className="p-3">Obrigação</th>
                                    <th className="p-3 text-center">Geração</th>
                                    <th className="p-3 text-center">Auditado</th>
                                    <th className="p-3 text-right">Status Final</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-900">
                                {['DCTFWeb', 'FGTS Digital', 'PGDAS-D', 'EFD-Reinf'].map((tipo) => {
                                    // Pega os dados filtrados em fetchStats que já buscamos
                                    // Vamos filtrar do array obrMes que está no escopo de fetchStats ou salvo em um state
                                    // Como obrMes está dentro de fetchStats, vou extrair essa lógica para o estado global

                                    const totalTipo = stats.obrCounts?.[tipo]?.total || 0;
                                    const doneTipo = stats.obrCounts?.[tipo]?.concluido || 0;
                                    const percent = totalTipo > 0 ? Math.round((doneTipo / totalTipo) * 100) : 0;

                                    return (
                                        <tr key={tipo} className="hover:bg-neutral-900/30 transition-colors">
                                            <td className="p-3">
                                                <p className="text-[10px] font-black text-neutral-300 uppercase italic">{tipo}</p>
                                                <p className="text-[7px] text-neutral-600 uppercase">Impacto Fiscal Global</p>
                                            </td>
                                            <td className="p-3 text-center">
                                                <p className="text-[10px] font-black text-neutral-400 tabular-nums">{totalTipo}</p>
                                            </td>
                                            <td className="p-3 text-center text-emerald-500">
                                                <p className="text-[10px] font-black tabular-nums">{doneTipo}</p>
                                            </td>
                                            <td className="p-3 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded ${percent === 100 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-neutral-900 text-neutral-500'} uppercase italic border border-neutral-800`}>
                                                        {percent}% CONCLUÍDO
                                                    </span>
                                                    <div className="w-16 h-0.5 bg-neutral-900 overflow-hidden">
                                                        <div className="h-full bg-emerald-600" style={{ width: `${percent}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-3 bg-neutral-900/20 border-t border-neutral-900 flex justify-between items-center">
                        <p className="text-[8px] text-neutral-700 font-mono italic uppercase">Audit engine v2.4 // Sincronizado com Google Drive API em tempo real.</p>
                        <button onClick={fetchStats} className="text-[8px] font-black text-neutral-600 hover:text-white uppercase flex items-center gap-1">
                            <RefreshCw className="w-2 h-2" /> ATUALIZAR MÉTRICAS
                        </button>
                    </div>
                </div>

                {/* Calendário de Validades (Certificados/Alvarás) */}
                <div className="space-y-6">
                    <GestaoValidades />

                    <div className="bg-neutral-900/30 border border-neutral-800 p-5 rounded-lg">
                        <WhatsAppRadar />
                    </div>
                </div>

            </div>
        </div>
    );
}
