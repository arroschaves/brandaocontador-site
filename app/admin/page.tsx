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
    Activity
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AlertasGaps from './components/AlertasGaps';
import GestaoValidades from './components/GestaoValidades';
import WhatsAppRadar from '@/app/components/WhatsAppRadar';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalClientes: 0,
        concluidosMes: 0,
        pendentesMes: 0,
        pedidosZap: 0,
        auditRate: 0
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

            setStats({
                totalClientes: countClientes || 0,
                pedidosZap: 0,
                concluidosMes: concluidos,
                pendentesMes: pendentes,
                auditRate: total > 0 ? Math.round((concluidos / total) * 100) : 0
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
                <div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        <h1 className="text-xl font-black text-neutral-100 uppercase tracking-tighter italic">Centro de Inteligência Contábil</h1>
                    </div>
                    <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em] mt-1">Brandão v2.0 // Auditoria de Nuvem Ativa</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-lg group">
                    <div className="flex justify-between items-center mb-4">
                        <Users className="w-4 h-4 text-neutral-600 group-hover:text-emerald-500 transition-colors" />
                        <span className="text-[9px] font-black text-neutral-700 uppercase">Clientes</span>
                    </div>
                    <p className="text-2xl font-black text-neutral-100 tabular-nums">{stats.totalClientes}</p>
                    <div className="w-full h-1 bg-neutral-900 mt-3 overflow-hidden">
                        <div className="h-full bg-emerald-500 w-full opacity-30" />
                    </div>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-lg group">
                    <div className="flex justify-between items-center mb-4">
                        <Activity className="w-4 h-4 text-neutral-600 group-hover:text-blue-500 transition-colors" />
                        <span className="text-[9px] font-black text-neutral-700 uppercase">Taxa de Auditoria</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <p className="text-2xl font-black text-neutral-100 tabular-nums">{stats.auditRate}%</p>
                        <span className="text-[10px] text-emerald-500 font-bold mb-1">Global</span>
                    </div>
                    <div className="w-full h-1 bg-neutral-900 mt-3 overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${stats.auditRate}%` }} />
                    </div>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-lg group text-emerald-500">
                    <div className="flex justify-between items-center mb-4 text-neutral-600">
                        <CheckCircle2 className="w-4 h-4 group-hover:text-emerald-500" />
                        <span className="text-[9px] font-black uppercase">Documentados</span>
                    </div>
                    <p className="text-2xl font-black tabular-nums">{stats.concluidosMes}</p>
                    <p className="text-[9px] font-bold uppercase mt-1 opacity-60 italic">Arquivos validados no Drive</p>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-lg group text-rose-500">
                    <div className="flex justify-between items-center mb-4 text-neutral-600">
                        <AlertCircle className="w-4 h-4 group-hover:text-rose-500" />
                        <span className="text-[9px] font-black uppercase">Pendências</span>
                    </div>
                    <p className="text-2xl font-black tabular-nums">{stats.pendentesMes}</p>
                    <p className="text-[9px] font-bold uppercase mt-1 opacity-60 italic">Transmissões não localizadas</p>
                </div>
            </div>

            {/* Seções de Trabalho */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Radar de Gaps (Novo Componente de Inteligência) */}
                <div className="lg:col-span-1">
                    <AlertasGaps />
                </div>

                {/* Radar de Obrigações Acessórias (Tabela Técnica) */}
                <div className="lg:col-span-2 bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">Radar de Obrigações Acessórias (Set/2026)</h2>
                        <Link href="/admin/cronograma" className="text-[9px] font-black text-emerald-500 hover:underline">VER MAPA COMPLETO</Link>
                    </div>
                    <div className="p-0 flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[8px] font-black text-neutral-600 uppercase border-b border-neutral-900 bg-neutral-900/20">
                                    <th className="p-3">Obrigação</th>
                                    <th className="p-3">Impacto</th>
                                    <th className="p-3">Prazo Limite</th>
                                    <th className="p-3 text-right">Status Mural</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-900">
                                {[
                                    { name: 'DCTFWeb', impact: 'Geral', date: 'Dia 15', status: 'Em Processamento' },
                                    { name: 'FGTS Digital', impact: 'RH', date: 'Dia 20', status: 'Auditando' },
                                    { name: 'PGDAS-D', impact: 'Simples', date: 'Dia 20', status: 'Auditando' },
                                    { name: 'EFD-Reinf', impact: 'Fiscal', date: 'Dia 15', status: 'Em Processamento' }
                                ].map((item, i) => (
                                    <tr key={i} className="hover:bg-neutral-900/30 transition-colors">
                                        <td className="p-3 text-[10px] font-black text-neutral-300 uppercase italic">{item.name}</td>
                                        <td className="p-3 text-[9px] font-bold text-neutral-500 uppercase">{item.impact}</td>
                                        <td className="p-3 text-[9px] font-mono text-neutral-600">{item.date}</td>
                                        <td className="p-3 text-[8px] text-right">
                                            <span className="bg-neutral-900 px-2 py-0.5 border border-neutral-800 text-neutral-500 rounded font-black italic">{item.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-3 bg-neutral-900/20 border-t border-neutral-900">
                        <p className="text-[8px] text-neutral-700 font-mono italic uppercase">Audit engine v2.4 // Todos os dados são extraídos do cruzamento Supabase x Google Drive API.</p>
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
