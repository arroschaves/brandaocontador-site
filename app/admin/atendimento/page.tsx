"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    MessageSquare,
    User,
    Clock,
    CheckCircle,
    AlertCircle,
    Search,
    Filter,
    MoreVertical,
    Phone
} from 'lucide-react';

export default function AtendimentoPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('todos'); // todos, pendente, em_atendimento, concluido

    useEffect(() => {
        fetchTickets();

        // Inscrever para atualizações em tempo real
        const channel = supabase
            .channel('atendimentos_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'atendimentos' }, (payload) => {
                console.log('Change received!', payload);
                fetchTickets();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function fetchTickets() {
        try {
            const { data, error } = await supabase
                .from('atendimentos')
                .select(`
                    *,
                    clientes ( nome, email )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTickets(data || []);
        } catch (err) {
            console.error('Erro ao buscar atendimentos:', err);
        } finally {
            setLoading(false);
        }
    }

    async function updateStatus(id: string, newStatus: string) {
        try {
            const { error } = await supabase
                .from('atendimentos')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            // O realtime vai atualizar a lista automaticamente
        } catch (err) {
            alert('Erro ao atualizar status');
        }
    }

    const filteredTickets = tickets.filter(t => {
        if (filter === 'todos') return true;
        return t.status === filter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pendente': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'em_atendimento': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'concluido': return 'bg-green-500/10 text-green-500 border-green-500/20';
            default: return 'bg-neutral-800 text-neutral-400';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pendente': return 'Pendente';
            case 'em_atendimento': return 'Em Atendimento';
            case 'concluido': return 'Concluído';
            default: return status;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-100 italic">Central de Atendimento</h1>
                    <p className="text-neutral-400 mt-1">Gerencie as solicitações recebidas via WhatsApp.</p>
                </div>
            </div>

            {/* Filtros e Busca */}
            <div className="flex gap-4 items-center bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, telefone ou mensagem..."
                        className="w-full bg-neutral-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary-500"
                    />
                </div>
                <div className="flex gap-2">
                    {['todos', 'pendente', 'em_atendimento', 'concluido'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === s
                                    ? 'bg-primary-500 text-neutral-950'
                                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                                }`}
                        >
                            {s === 'todos' ? 'Todos' : getStatusLabel(s)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lista de Atendimentos */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-20 text-neutral-500">Carregando atendimentos...</div>
                ) : filteredTickets.length === 0 ? (
                    <div className="text-center py-20 bg-neutral-900/50 rounded-2xl border border-neutral-800">
                        <MessageSquare className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-neutral-300">Nenhum atendimento encontrado</h3>
                        <p className="text-neutral-500">Nenhuma mensagem com esse status no momento.</p>
                    </div>
                ) : (
                    filteredTickets.map((ticket) => (
                        <div key={ticket.id} className="bg-neutral-900/50 backdrop-blur-sm p-6 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-all group">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-primary-500 font-bold text-lg shrink-0 overflow-hidden ring-2 ring-neutral-800 group-hover:ring-primary-500/50 transition-all">
                                        {ticket.clientes?.nome ? (
                                            ticket.clientes.nome.charAt(0)
                                        ) : (
                                            <User className="w-6 h-6 text-neutral-500" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-neutral-200">
                                                {ticket.clientes?.nome || ticket.pushName || 'Desconhecido'}
                                            </h3>

                                            {/* Badge de Status */}
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border border-current uppercase tracking-wider font-bold ${getStatusColor(ticket.status)}`}>
                                                {getStatusLabel(ticket.status)}
                                            </span>

                                            {/* Badge de Identificação */}
                                            {ticket.clientes ? (
                                                <span className="text-[10px] bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded-full border border-primary-500/20 flex items-center gap-1 font-medium">
                                                    <CheckCircle className="w-3 h-3" /> Cliente
                                                </span>
                                            ) : (
                                                <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full border border-neutral-700 flex items-center gap-1 font-medium">
                                                    <User className="w-3 h-3" /> Visitante
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-neutral-500">
                                            <span className="flex items-center gap-1">
                                                <Phone className="w-3.5 h-3.5" />
                                                {ticket.numero_whatsapp}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(ticket.created_at).toLocaleString('pt-BR')}
                                            </span>
                                        </div>

                                        <p className="mt-3 text-neutral-300 bg-neutral-800/30 p-3 rounded-lg border border-neutral-800/50 italic leading-relaxed">
                                            "{ticket.mensagem}"
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {ticket.status === 'pendente' && (
                                        <button
                                            onClick={() => updateStatus(ticket.id, 'em_atendimento')}
                                            className="px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-xs font-bold uppercase transition-colors"
                                        >
                                            Atender
                                        </button>
                                    )}
                                    {ticket.status !== 'concluido' && (
                                        <button
                                            onClick={() => updateStatus(ticket.id, 'concluido')}
                                            className="px-3 py-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg text-xs font-bold uppercase transition-colors"
                                        >
                                            Concluir
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
