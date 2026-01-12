"use client";

import React, { useState } from 'react';
import {
    MessageCircle,
    Clock,
    CheckCircle2,
    AlertCircle,
    Search,
    Filter,
    MoreHorizontal,
    Paperclip,
    Send,
    User,
    ArrowRight,
    Plus
} from 'lucide-react';

export default function PedidosPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const mockPedidos = [
        { id: '1', cliente: 'AASS', pedido: 'Segunda via DAS - Outubro', status: 'em_aberto', tempo: '15 min', canal: 'WhatsApp', responsavel: 'Alessandro' },
        { id: '2', cliente: 'BARBAQ', pedido: 'Rescisão Funcionário - João Silva', status: 'processando', tempo: '2h', canal: 'WhatsApp', responsavel: 'Maria' },
        { id: '3', cliente: 'AÇO MS', pedido: 'Certidão Negativa SEFAZ', status: 'concluido', tempo: 'Ontem', canal: 'E-mail', responsavel: 'Alessandro' },
        { id: '4', cliente: 'ANA OTICAS', pedido: 'Abertura de Ticket: Dúvida IR', status: 'em_aberto', tempo: '1h', canal: 'WhatsApp', responsavel: 'Pendente' },
        { id: '5', cliente: 'CAMPOS MS', pedido: 'Guia de GPS - Novembro', status: 'concluido', tempo: 'Hoje', canal: 'WhatsApp', responsavel: 'Maria' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'em_aberto': return 'bg-error-500/10 text-error-400 border-error-500/20';
            case 'processando': return 'bg-warning-500/10 text-warning-400 border-warning-500/20';
            case 'concluido': return 'bg-success-500/10 text-success-400 border-success-500/20';
            default: return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'em_aberto': return 'Novo Pedido';
            case 'processando': return 'Em Trabalho';
            case 'concluido': return 'Finalizado';
            default: return status;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-100">Atendimento</h1>
                    <p className="text-neutral-400 mt-1">Monitore e responda as solicitações dos clientes via WhatsApp e Site.</p>
                </div>
                <div className="flex bg-neutral-900 border border-neutral-800 p-1 rounded-lg">
                    <button className="px-4 py-1.5 text-sm font-medium bg-neutral-800 text-neutral-100 rounded-md shadow-sm">Todos</button>
                    <button className="px-4 py-1.5 text-sm font-medium text-neutral-400 hover:text-neutral-200 transition-colors">Meus</button>
                    <button className="px-4 py-1.5 text-sm font-medium text-neutral-400 hover:text-neutral-200 transition-colors">Não Atribuídos</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockPedidos.map((pedido) => (
                    <div key={pedido.id} className="card group hover:border-neutral-700 transition-all duration-300 flex flex-col h-full bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center border border-neutral-700">
                                    <User className="w-5 h-5 text-neutral-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-100 group-hover:text-primary-400 transition-colors">{pedido.cliente}</h3>
                                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                                        <MessageCircle className="w-3 h-3" />
                                        {pedido.canal}
                                    </div>
                                </div>
                            </div>
                            <button className="text-neutral-600 hover:text-neutral-400">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 bg-neutral-950/50 p-4 rounded-xl border border-neutral-800/50 mb-4">
                            <p className="text-sm text-neutral-300 leading-relaxed font-medium">
                                "{pedido.pedido}"
                            </p>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-800">
                            <div className="flex flex-col gap-2">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-center border ${getStatusColor(pedido.status)}`}>
                                    {getStatusLabel(pedido.status)}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                                    <Clock className="w-3.5 h-3.5" />
                                    {pedido.tempo}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="p-2 text-neutral-500 hover:text-primary-400 transition-colors" title="Responder">
                                    <Send className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-neutral-500 hover:text-primary-400 transition-colors" title="Ver Detalhes">
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                            <div className="w-6 h-6 bg-neutral-800 rounded-full flex items-center justify-center text-[10px] text-neutral-500 font-bold border border-neutral-700">
                                {pedido.responsavel === 'Pendente' ? '?' : pedido.responsavel.charAt(0)}
                            </div>
                            <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-tight">Resp: {pedido.responsavel}</span>
                        </div>
                    </div>
                ))}

                {/* Action Card: New Offline Request */}
                <button className="border-2 border-dashed border-neutral-800 rounded-2xl p-8 flex flex-col items-center justify-center text-neutral-500 hover:border-primary-500/50 hover:text-primary-400 transition-all group">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-neutral-700 flex items-center justify-center mb-4 group-hover:border-primary-500 group-hover:bg-primary-500/10">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-sm">Novo Registro Manual</span>
                    <span className="text-xs text-neutral-600 mt-1">E-mail, Visita ou Telefone</span>
                </button>
            </div>
        </div>
    );
}
