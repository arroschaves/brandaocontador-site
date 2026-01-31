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
    X,
    Loader2
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
            .on('postgres_changes', { event: '*', schema: 'public', table: 'atendimentos' }, (payload: any) => {
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
            console.log('Atualizando status:', { id, newStatus });

            const { data, error } = await supabase
                .from('atendimentos')
                .update({ status: newStatus })
                .eq('id', id)
                .select();

            if (error) {
                console.error('Erro do Supabase:', error);
                throw error;
            }

            console.log('Status atualizado com sucesso:', data);

            // Recarregar a lista de atendimentos
            await fetchTickets();
        } catch (err: any) {
            console.error('Erro completo:', err);
            alert(`Erro ao atualizar status: ${err.message || 'Erro desconhecido'}`);
        }
    }

    async function saveClassification(id: string) {
        try {
            console.log('Salvando classificação:', { id, editForm });

            const { data, error } = await supabase
                .from('atendimentos')
                .update({
                    categoria: editForm.categoria_solicitacao,
                    prioridade: editForm.prioridade, // Manter como TEXT (CRITICA, ALTA, NORMAL)
                    atendimento_automatico: editForm.atendimento_automatico === 'true'
                })
                .eq('id', id)
                .select();

            if (error) {
                console.error('Erro do Supabase:', error);
                throw error;
            }

            console.log('Classificação salva com sucesso:', data);

            setEditingTicket(null);
            setEditForm({});

            // Recarregar a lista de atendimentos
            await fetchTickets();
        } catch (err: any) {
            console.error('Erro completo:', err);
            alert(`Erro ao salvar classificação: ${err.message || 'Erro desconhecido'}`);
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

    const getPriorityColor = (prio: any) => {
        if (prio === 1 || prio === 'CRITICA' || prio === 'ALTA') return 'bg-red-500/20 text-red-500 border-red-500/30';
        if (prio === 2 || prio === 'ATENCOSA') return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
        if (prio === 3 || prio === 'NORMAL') return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
        return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    };

    const getPriorityLabel = (prio: any) => {
        if (prio === 1 || prio === 'CRITICA' || prio === 'ALTA') return 'Urgente';
        if (prio === 2 || prio === 'ATENCOSA') return 'Alta';
        if (prio === 3 || prio === 'NORMAL') return 'Normal';
        return 'Não definida';
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
            <div className="flex justify-between items-center px-2">
                <div>
                    <h1 className="text-xl font-bold text-neutral-100 tracking-tight">Central de Atendimento</h1>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Gestão de solicitações via WhatsApp & IA</p>
                </div>
            </div>

            {/* Filtros e Busca */}
            <div className="flex gap-4 items-center bg-neutral-900/30 p-3 rounded-xl border border-neutral-800">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        className="w-full bg-neutral-950/50 border border-neutral-800 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-1.5">
                    {['todos', 'pendente', 'em_atendimento', 'concluido'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filter === s
                                ? 'bg-emerald-500 text-neutral-950 shadow-lg shadow-emerald-500/20'
                                : 'bg-neutral-800 text-neutral-500 hover:bg-neutral-700'
                                }`}
                        >
                            {s === 'todos' ? 'Ver Todos' : getStatusLabel(s)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lista de Atendimentos */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-20 text-neutral-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Carregando Fluxos...</span>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="text-center py-20 bg-neutral-900/50 rounded-2xl border border-neutral-800">
                        <MessageSquare className="w-12 h-12 text-neutral-800 mx-auto mb-4" />
                        <h3 className="text-xs font-bold text-neutral-500 uppercase">Silêncio no Radar</h3>
                        <p className="text-[10px] text-neutral-700 uppercase mt-1">Nenhuma mensagem neste filtro.</p>
                    </div>
                ) : (
                    filteredTickets.map((ticket) => (
                        <div key={ticket.id} className="bg-neutral-950 border border-neutral-800 p-5 rounded-2xl hover:border-neutral-700 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex justify-between items-start gap-4">
                                <div className="flex gap-4 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-500 font-bold text-base shrink-0 overflow-hidden group-hover:border-emerald-500/50 transition-all">
                                        {ticket.clientes?.nome ? (
                                            ticket.clientes.nome.charAt(0)
                                        ) : (
                                            <User className="w-5 h-5 text-neutral-700" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                            <h3 className="text-sm font-bold text-neutral-200 tracking-tight">
                                                {ticket.clientes?.nome || ticket.pushName || 'Desconhecido'}
                                            </h3>

                                            {/* Badge de Tipo de Mídia */}
                                            {ticket.tipo_midia && ticket.tipo_midia !== 'texto' && (
                                                <span className="text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20 flex items-center gap-1 font-medium uppercase">
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
                                                        <option value="CRITICA">Urgente (CRITICA)</option>
                                                        <option value="ALTA">Alta</option>
                                                        <option value="NORMAL">Normal</option>
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
