"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
    MessageCircle,
    Clock,
    CheckCircle2,
    Search,
    Paperclip,
    Send,
    User,
    ArrowRight,
    Loader2
} from 'lucide-react';

export default function PedidosPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [pedidos, setPedidos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPedidos = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .schema('core')
                .from('atendimentos')
                .select('*, empresas(razao_social)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPedidos(data || []);
        } catch (err) {
            console.error('Erro ao buscar pedidos:', err);
        } finally {
            setLoading(false);
        }
    }, [])

    useEffect(() => {
        fetchPedidos();

        // Realtime updates
        const channel = supabase
            .channel('pedidos_realtime')
            .on('postgres_changes', { event: '*', schema: 'core', table: 'atendimentos' }, () => {
                fetchPedidos();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchPedidos]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pendente': return 'bg-error-500/10 text-error-400 border-error-500/20';
            case 'em_atendimento': return 'bg-warning-500/10 text-warning-400 border-warning-500/20';
            case 'concluido': return 'bg-success-500/10 text-success-400 border-success-500/20';
            default: return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pendente': return 'Novo Pedido';
            case 'em_atendimento': return 'Em Trabalho';
            case 'concluido': return 'Finalizado';
            default: return status;
        }
    };

    const filteredPedidos = pedidos.filter(p =>
        p.mensagem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.numero_whatsapp?.includes(searchTerm) ||
        p.empresas?.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.pushName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-100">Atendimento</h1>
                    <p className="text-neutral-400 mt-1">Monitore e responda as solicitações reais dos clientes em tempo real.</p>
                </div>
                <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary-500" />
                    <p>Carregando pedidos reais...</p>
                </div>
            ) : filteredPedidos.length === 0 ? (
                <div className="text-center py-20 bg-neutral-900/50 rounded-2xl border border-neutral-800">
                    <MessageCircle className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                    <p className="text-neutral-400">Nenhum pedido encontrado no momento.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPedidos.map((p) => (
                        <div key={p.id} className="card group hover:border-neutral-700 transition-all duration-300 flex flex-col h-full bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center border border-neutral-700 overflow-hidden text-primary-500 font-bold uppercase">
                                        {(p.empresas?.razao_social || p.pushName || '?').charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-neutral-100 group-hover:text-primary-400 transition-colors">
                                            {p.empresas?.razao_social || p.pushName || 'Visitante'}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                                            <MessageCircle className="w-3 h-3" />
                                            {p.numero_whatsapp}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 bg-neutral-950/50 p-4 rounded-xl border border-neutral-800/50 mb-4 overflow-hidden">
                                <p className="text-sm text-neutral-300 leading-relaxed font-medium italic">
                                    &quot;{p.mensagem}&quot;
                                </p>
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-800">
                                <div className="flex flex-col gap-2">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-center border ${getStatusColor(p.status)}`}>
                                        {getStatusLabel(p.status)}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(p.created_at).toLocaleDateString('pt-BR')} {new Date(p.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
