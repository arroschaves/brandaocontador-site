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
    Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalClientes: 0,
        prazosHoje: 0,
        concluidosMes: 0,
        pendentesMes: 0,
        pedidosZap: 0
    });
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

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

            const concluidos = obrMes?.filter(o => o.status === 'concluido').length || 0;
            const pendentes = obrMes?.filter(o => o.status !== 'concluido').length || 0;

            const { count: countPedidos } = await supabase
                .from('atendimentos')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'Pendente');

            setStats({
                totalClientes: countClientes || 0,
                pedidosZap: countPedidos || 0,
                prazosHoje: pendentes,
                concluidosMes: concluidos,
                pendentesMes: pendentes
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

    const handleManualSync = async () => {
        setSyncing(true);
        try {
            const res = await fetch('/api/automation/sync', { method: 'POST' });
            if (res.ok) {
                alert('Auditoria Brandão 2026 iniciada! Em alguns minutos o painel será atualizado.');
            }
        } catch (err) {
            alert('Falha ao iniciar auditoria');
        } finally {
            setSyncing(false);
        }
    };

    const cards = [
        { name: 'Clientes Ativos', value: stats.totalClientes.toString(), icon: Users, color: 'text-primary-400', bg: 'bg-primary-500/10', href: '/admin/clientes' },
        { name: 'Documentos em Pasta', value: stats.concluidosMes.toString(), icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', href: '/admin/cronograma' },
        { name: 'Transmissões Pendentes', value: stats.pendentesMes.toString(), icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', href: '/admin/cronograma' },
        { name: 'Pedidos WhatsApp', value: stats.pedidosZap.toString(), icon: MessageSquare, color: 'text-primary-400', bg: 'bg-primary-500/10', href: '/admin/atendimento' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-neutral-900/50 p-6 rounded-3xl border border-neutral-800 backdrop-blur-sm">
                <div>
                    <h1 className="text-4xl font-black text-neutral-100 italic tracking-tighter uppercase">Painel <span className="text-primary-500">Brandão</span></h1>
                    <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest mt-1">Sincronização 2026 em tempo real</p>
                </div>
                <button
                    onClick={handleManualSync}
                    disabled={syncing}
                    className="flex items-center gap-3 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-black uppercase rounded-xl border border-neutral-700 transition-all disabled:opacity-50"
                >
                    {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <DatabaseIcon className="w-4 h-4 text-primary-500" />}
                    Sincronizar Cloud
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((stat) => (
                    <Link
                        key={stat.name}
                        href={stat.href}
                        className={`bg-neutral-900/50 backdrop-blur-sm p-8 rounded-3xl border border-neutral-800 hover:border-primary-500/50 transition-all group cursor-pointer shadow-xl`}
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-4 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-neutral-700 group-hover:text-primary-500 transition-colors" />
                        </div>
                        <div className="mt-6">
                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{stat.name}</p>
                            {loading ? (
                                <div className="h-8 w-16 bg-neutral-800 animate-pulse rounded mt-2" />
                            ) : (
                                <p className="text-4xl font-black text-neutral-100 mt-1 italic">{stat.value}</p>
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-[32px] space-y-6">
                    <h2 className="text-xl font-black italic uppercase text-neutral-100">Ações Rápidas</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/admin/clientes" className="p-6 bg-neutral-800 hover:bg-primary-500 hover:text-neutral-950 rounded-2xl transition-all text-left border border-neutral-700 group">
                            <Plus className="w-6 h-6 mb-3 group-hover:scale-110 transition-transform" />
                            <div className="font-black uppercase text-xs">Novo Cliente</div>
                        </Link>
                        <Link href="/admin/cronograma" className="p-6 bg-neutral-800 hover:bg-emerald-500 hover:text-neutral-950 rounded-2xl transition-all text-left border border-neutral-700 group">
                            <Calendar className="w-6 h-6 mb-3 group-hover:scale-110 transition-transform" />
                            <div className="font-black uppercase text-xs">Cronograma</div>
                        </Link>
                    </div>
                </div>

                <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-[32px] flex flex-col justify-center items-center text-center space-y-4">
                    <div className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-10 h-10 text-primary-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black italic uppercase text-neutral-100">WhatsApp CRM</h2>
                        <p className="text-neutral-500 text-[10px] uppercase font-mono tracking-widest mt-1">Conectado via Evolution API</p>
                    </div>
                    <Link href="/admin/atendimento" className="px-8 py-3 bg-primary-500 text-neutral-950 font-black uppercase text-xs rounded-xl hover:bg-primary-400 transition-colors">
                        Ver Atendimentos
                    </Link>
                </div>
            </div>
        </div>
    );
}

function DatabaseIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
            <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path>
        </svg>
    )
}

