"use client";

import React, { useState, useEffect } from 'react';
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
        prazosHoje: 12, // Mock por enquanto
        concluidosMes: 85, // Mock por enquanto
        pedidosZap: 7 // Mock por enquanto
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const { count, error } = await supabase
                    .from('clientes')
                    .select('*', { count: 'exact', head: true })
                    .not('nome', 'is', null)
                    .not('cnpj_cpf', 'is', null);

                if (!error) {
                    setStats(prev => ({ ...prev, totalClientes: count || 0 }));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const cards = [
        { name: 'Total de Clientes', value: stats.totalClientes.toString(), icon: Users, color: 'text-primary-400', bg: 'bg-primary-500/10' },
        { name: 'Prazos para Hoje', value: stats.prazosHoje.toString(), icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
        { name: 'Concluídos (Mês)', value: stats.concluidosMes.toString(), icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
        { name: 'Pedidos WhatsApp', value: stats.pedidosZap.toString(), icon: MessageSquare, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-neutral-100 italic">Visão Geral</h1>
                <p className="text-neutral-400 mt-1">Bem-vindo ao centro de comando da Brandão Contabilidade.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((stat, index) => (
                    <div key={index} className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl hover:border-neutral-700 transition-all group">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} mb-4 group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-neutral-400 text-sm font-medium">{stat.name}</h3>
                        {loading && stat.name === 'Total de Clientes' ? (
                            <Loader2 className="w-6 h-6 animate-spin text-neutral-600 mt-1" />
                        ) : (
                            <p className="text-2xl font-bold text-neutral-100 mt-1">{stat.value}</p>
                        )}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl">
                    <h2 className="text-xl font-bold mb-4">Ações Rápidas</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 bg-neutral-800 rounded-xl hover:bg-neutral-700 transition-colors text-left border border-neutral-700">
                            <Plus className="w-5 h-5 text-primary-400 mb-2" />
                            <div className="font-bold text-sm">Novo Cliente</div>
                        </button>
                        <button className="p-4 bg-neutral-800 rounded-xl hover:bg-neutral-700 transition-colors text-left border border-neutral-700">
                            <Calendar className="w-5 h-5 text-success-400 mb-2" />
                            <div className="font-bold text-sm">Lançar Prazo</div>
                        </button>
                    </div>
                </div>

                <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8 text-primary-400" />
                    </div>
                    <h2 className="text-xl font-bold">Assistente de IA</h2>
                    <p className="text-neutral-400 text-sm max-w-xs mt-2">Em breve: Analise seus dados e gere relatórios usando inteligência artificial.</p>
                </div>
            </div>
        </div>
    );
}
