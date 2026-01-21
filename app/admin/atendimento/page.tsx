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
    Phone,
    Tag,
    Star,
    Image as ImageIcon,
    FileText,
    Video,
    Mic,
    Bot,
    UserCircle,
    Edit3,
    Save,
    X
} from 'lucide-react';

export default function AtendimentoPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('todos');
    const [editingTicket, setEditingTicket] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    useEffect(() => {
        fetchTickets();

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
        } catch (err) {
            alert('Erro ao atualizar status');
        }
    }

    async function saveClassification(id: string) {
        try {
            const { error } = await supabase
                .from('atendimentos')
                .update({
                    categoria_solicitacao: editForm.categoria_solicitacao,
                    prioridade: parseInt(editForm.prioridade),
                    atendimento_automatico: editForm.atendimento_automatico === 'true'
                })
                .eq('id', id);

            if (error) throw error;
            setEditingTicket(null);
            setEditForm({});
        } catch (err) {
            alert('Erro ao salvar classificação');
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

    const getCategoryLabel = (cat: string) => {
        const labels: any = {
            'CERTIDAO': 'Certidão',
            'ALVARA': 'Alvará',
            'CARTAO_CNPJ_IE': 'CNPJ/IE',
            'FOLHA_PAGAMENTO': 'Folha',
            'GUIAS_IMPOSTOS': 'Impostos',
            'DOCUMENTOS_FISCAIS': 'Fiscal',
            'IR_DECLARACOES': 'Renda/Terra',
            'SOCIETARIO': 'Contrato',
            'OUTROS': 'Outros'
        };
        return labels[cat] || cat || 'Sem Categoria';
    };

    const getPriorityColor = (prio: number) => {
        switch (prio) {
            case 1: return 'bg-red-500/20 text-red-500 border-red-500/30';
            case 2: return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
            case 3: return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
            default: return 'bg-neutral-800 text-neutral-400 border-neutral-700';
        }
    };

    const getPriorityLabel = (prio: number) => {
        switch (prio) {
            case 1: return 'Urgente';
            case 2: return 'Alta';
            case 3: return 'Normal';
            default: return 'Não definida';
        }
    };

    const getMediaIcon = (tipo: string) => {
        switch (tipo) {
            case 'audio': return <Mic className="w-4 h-4" />;
            case 'imagem': return <ImageIcon className="w-4 h-4" />;
            case 'documento': return <FileText className="w-4 h-4" />;
            case 'video': return <Video className="w-4 h-4" />;
            default: return <MessageSquare className="w-4 h-4" />;
        }
    };

    const startEditing = (ticket: any) => {
        setEditingTicket(ticket.id);
        setEditForm({
            categoria_solicitacao: ticket.categoria_solicitacao || '',
            prioridade: ticket.prioridade || 3,
            atendimento_automatico: ticket.atendimento_automatico ? 'true' : 'false'
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-100 italic">Central de Atendimento</h1>
                    <p className="text-neutral-400 mt-1">Gerencie as solicitações recebidas via WhatsApp com IA.</p>
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
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex gap-4 flex-1">
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

                                            {/* Badge de Tipo de Mídia */}
                                            {ticket.tipo_midia && ticket.tipo_midia !== 'texto' && (
                                                <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20 flex items-center gap-1 font-medium">
                                                    {getMediaIcon(ticket.tipo_midia)} {ticket.tipo_midia}
                                                </span>
                                            )}

                                            {/* Badge de Categoria */}
                                            {ticket.categoria_solicitacao && (
                                                <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full border border-neutral-700 flex items-center gap-1 font-medium">
                                                    <Tag className="w-3 h-3" /> {getCategoryLabel(ticket.categoria_solicitacao)}
                                                </span>
                                            )}

                                            {/* Badge de Prioridade */}
                                            {ticket.prioridade && (
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-bold ${getPriorityColor(ticket.prioridade)}`}>
                                                    <Star className="w-3 h-3 fill-current" /> {getPriorityLabel(ticket.prioridade)}
                                                </span>
                                            )}

                                            {/* Badge de Atendimento Automático */}
                                            {ticket.atendimento_automatico && (
                                                <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20 flex items-center gap-1 font-medium">
                                                    <Bot className="w-3 h-3" /> Automático
                                                </span>
                                            )}

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
                                            {ticket.confianca_classificacao && (
                                                <span className="flex items-center gap-1">
                                                    <Bot className="w-3.5 h-3.5" />
                                                    Confiança: {(ticket.confianca_classificacao * 100).toFixed(0)}%
                                                </span>
                                            )}
                                        </div>

                                        {/* Mensagem ou Transcrição */}
                                        <p className="mt-3 text-neutral-300 bg-neutral-800/30 p-3 rounded-lg border border-neutral-800/50 italic leading-relaxed">
                                            {ticket.transcricao_audio ? (
                                                <>
                                                    <span className="text-xs text-neutral-500 block mb-1">Transcrição de áudio:</span>
                                                    "{ticket.transcricao_audio}"
                                                </>
                                            ) : (
                                                `"${ticket.mensagem}"`
                                            )}
                                        </p>

                                        {/* Resposta Automática (se houver) */}
                                        {ticket.resposta_automatica && (
                                            <div className="mt-3 bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Bot className="w-4 h-4 text-green-400" />
                                                    <span className="text-xs font-bold text-green-400">Resposta Automática:</span>
                                                </div>
                                                <p className="text-sm text-neutral-300 italic">"{ticket.resposta_automatica}"</p>
                                            </div>
                                        )}

                                        {/* Motivo de Atendimento Humano */}
                                        {ticket.motivo_humano && (
                                            <div className="mt-3 bg-orange-500/5 border border-orange-500/20 rounded-lg p-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <UserCircle className="w-4 h-4 text-orange-400" />
                                                    <span className="text-xs font-bold text-orange-400">Requer Atendimento Humano:</span>
                                                </div>
                                                <p className="text-sm text-neutral-300">{ticket.motivo_humano}</p>
                                            </div>
                                        )}

                                        {/* Formulário de Edição */}
                                        {editingTicket === ticket.id && (
                                            <div className="mt-4 bg-neutral-800/50 p-4 rounded-lg border border-neutral-700 space-y-3">
                                                <h4 className="text-sm font-bold text-neutral-200 mb-3">Classificar Manualmente</h4>

                                                <div>
                                                    <label className="text-xs text-neutral-400 block mb-1">Categoria</label>
                                                    <select
                                                        value={editForm.categoria_solicitacao}
                                                        onChange={(e) => setEditForm({ ...editForm, categoria_solicitacao: e.target.value })}
                                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm"
                                                    >
                                                        <option value="">Selecione...</option>
                                                        <option value="CERTIDAO">Certidão</option>
                                                        <option value="ALVARA">Alvará</option>
                                                        <option value="CARTAO_CNPJ_IE">CNPJ/IE</option>
                                                        <option value="FOLHA_PAGAMENTO">Folha de Pagamento</option>
                                                        <option value="GUIAS_IMPOSTOS">Guias/Impostos</option>
                                                        <option value="DOCUMENTOS_FISCAIS">Documentos Fiscais</option>
                                                        <option value="IR_DECLARACOES">IR/Declarações</option>
                                                        <option value="SOCIETARIO">Societário</option>
                                                        <option value="OUTROS">Outros</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="text-xs text-neutral-400 block mb-1">Prioridade</label>
                                                    <select
                                                        value={editForm.prioridade}
                                                        onChange={(e) => setEditForm({ ...editForm, prioridade: e.target.value })}
                                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm"
                                                    >
                                                        <option value="1">1 - Urgente</option>
                                                        <option value="2">2 - Alta</option>
                                                        <option value="3">3 - Normal</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="text-xs text-neutral-400 block mb-1">Tipo de Atendimento</label>
                                                    <select
                                                        value={editForm.atendimento_automatico}
                                                        onChange={(e) => setEditForm({ ...editForm, atendimento_automatico: e.target.value })}
                                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm"
                                                    >
                                                        <option value="false">Humano</option>
                                                        <option value="true">Automático</option>
                                                    </select>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => saveClassification(ticket.id)}
                                                        className="flex-1 px-3 py-2 bg-primary-500 text-neutral-950 rounded-lg text-sm font-bold hover:bg-primary-400 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Save className="w-4 h-4" /> Salvar
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingTicket(null)}
                                                        className="px-3 py-2 bg-neutral-700 text-neutral-300 rounded-lg text-sm font-bold hover:bg-neutral-600 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!editingTicket && (
                                        <button
                                            onClick={() => startEditing(ticket)}
                                            className="px-3 py-1.5 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1"
                                        >
                                            <Edit3 className="w-3 h-3" /> Classificar
                                        </button>
                                    )}
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
