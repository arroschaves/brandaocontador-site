"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Calendar,
    Filter,
    Download,
    CheckCircle2,
    AlertCircle,
    FileText,
    Search,
    ChevronLeft,
    ChevronRight,
    UploadCloud,
    Loader2
} from 'lucide-react';

export default function CronogramaPage() {
    const [loading, setLoading] = useState(true);
    const [clientes, setClientes] = useState<any[]>([]);
    const [obrigacoes, setObrigacoes] = useState<any[]>([]);
    const [competencia, setCompetencia] = useState(new Date()); // Data atual como base
    const [filtroNome, setFiltroNome] = useState('');

    // Lista de obrigações padrão para colunas (isso pode virar dinâmico depois)
    // Estados Adicionais
    const [resumo, setResumo] = useState({ pendentes: 0, concluidos: 0, atrasados: 0 });

    // Lista de obrigações padrão para colunas
    const tiposObrigacoes = ['DAS', 'FOLHA', 'FGTS', 'DCTF', 'SPED', 'ICMS'];

    useEffect(() => {
        fetchData();
    }, [competencia]);

    useEffect(() => {
        // Calcular resumo sempre que as obrigações mudarem
        const p = obrigacoes.filter(o => o.status === 'pendente').length;
        const c = obrigacoes.filter(o => o.status === 'concluido').length;
        const a = obrigacoes.filter(o => o.status === 'atrasado').length;
        setResumo({ pendentes: p, concluidos: c, atrasados: a });
    }, [obrigacoes]);

    async function fetchData() {
        setLoading(true);
        try {
            // 1. Buscar Clientes Ativos
            const { data: dataClientes } = await supabase
                .from('clientes')
                .select('id, nome, cnpj_cpf')
                .order('nome');

            // 2. Buscar Obrigações do Mês Selecionado
            // Definir intervalo do mês
            const inicioMes = new Date(competencia.getFullYear(), competencia.getMonth(), 1).toISOString();
            const fimMes = new Date(competencia.getFullYear(), competencia.getMonth() + 1, 0).toISOString();

            const { data: dataObrigacoes } = await supabase
                .from('obrigacoes_acessorias')
                .select('*')
                .gte('competencia', inicioMes)
                .lte('competencia', fimMes);

            setClientes(dataClientes || []);
            setObrigacoes(dataObrigacoes || []);
        } catch (error) {
            console.error('Erro ao buscar cronograma:', error);
        } finally {
            setLoading(false);
        }
    }

    // Navegação de Meses
    const mudarMes = (delta: number) => {
        const novaData = new Date(competencia);
        novaData.setMonth(novaData.getMonth() + delta);
        setCompetencia(novaData);
    };

    // Função para alternar status (Pendente -> Concluido -> Atrasado -> Pendente)
    const toggleStatus = async (clienteId: string, tipo: string) => {
        const existente = obrigacoes.find(o => o.cliente_id === clienteId && o.tipo === tipo);
        let novoStatus = 'concluido';

        if (existente) {
            if (existente.status === 'concluido') novoStatus = 'atrasado';
            else if (existente.status === 'atrasado') novoStatus = 'pendente';
        }

        try {
            if (existente) {
                const { error } = await supabase
                    .from('obrigacoes_acessorias')
                    .update({ status: novoStatus })
                    .eq('id', existente.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('obrigacoes_acessorias')
                    .insert([{
                        cliente_id: clienteId,
                        tipo,
                        status: novoStatus,
                        competencia: new Date(competencia.getFullYear(), competencia.getMonth(), 1).toISOString()
                    }]);
                if (error) throw error;
            }
            fetchData(); // Recarrega para atualizar UI
        } catch (err) {
            console.error('Erro ao atualizar status:', err);
        }
    };

    // Helper para verificar status de uma obrigação específica para um cliente
    const getStatusObrigacao = (clienteId: string, tipo: string) => {
        const obrigacao = obrigacoes.find(o =>
            o.cliente_id === clienteId &&
            o.tipo === tipo
        );

        if (!obrigacao) return 'vazio';
        return obrigacao.status;
    };

    const clientesFiltrados = clientes.filter(c =>
        c.nome?.toLowerCase().includes(filtroNome.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-neutral-100 italic tracking-tighter uppercase leading-none">
                        CRONOGRAMA <span className="text-amber-electric">FISCAL</span>
                    </h1>
                    <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest mt-2">Monitoramento Ativo de Conformidade</p>
                </div>

                <div className="flex items-center gap-4 bg-neutral-900 border border-neutral-800 p-2">
                    <button onClick={() => mudarMes(-1)} className="p-2 hover:bg-neutral-800 text-neutral-400 hover:text-amber-electric transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-black text-neutral-200 min-w-[140px] text-center uppercase tracking-widest font-mono italic">
                        {competencia.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => mudarMes(1)} className="p-2 hover:bg-neutral-800 text-neutral-400 hover:text-amber-electric transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Resumo Brutalista */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neutral-900 border-l-4 border-amber-electric p-6">
                    <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Aguardando Processamento</div>
                    <div className="text-3xl font-black text-neutral-100 italic">{resumo.pendentes}</div>
                </div>
                <div className="bg-neutral-900 border-l-4 border-emerald-500 p-4">
                    <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Guias Liquidadas</div>
                    <div className="text-3xl font-black text-neutral-100 italic">{resumo.concluidos}</div>
                </div>
                <div className="bg-neutral-900 border-l-4 border-red-500 p-4">
                    <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Alerta de Atraso</div>
                    <div className="text-3xl font-black text-neutral-100 italic">{resumo.atrasados}</div>
                </div>
            </div>

            {/* Ações e Filtros */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative flex-1 max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                    <input
                        type="text"
                        placeholder="FILTRAR CLIENTE..."
                        value={filtroNome}
                        onChange={(e) => setFiltroNome(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 pl-10 pr-4 py-3 text-xs font-mono focus:border-amber-electric transition-all text-neutral-200 placeholder:text-neutral-700 uppercase"
                    />
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button className="btn-brutal-outline text-[10px] flex-1 md:flex-none">SINCRONIZAR DRIVE</button>
                    <button className="btn-brutal text-[10px] flex-1 md:flex-none">GERAR PDF MENSAL</button>
                </div>
            </div>

            {/* Tabela Cronograma Brutalista */}
            <div className="bg-neutral-900 border border-neutral-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-950 border-b border-neutral-800">
                                <th className="p-5 font-black text-neutral-500 text-[10px] uppercase tracking-[0.2em] sticky left-0 bg-neutral-950 z-20 w-64">CLIENTE / ENTIDADE</th>
                                {tiposObrigacoes.map(tipo => (
                                    <th key={tipo} className="p-5 font-black text-neutral-500 text-[10px] text-center border-l border-neutral-800/50 tracking-widest uppercase">{tipo}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={tiposObrigacoes.length + 1} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-8 h-8 animate-spin text-amber-electric" />
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-600">Sincronizando Dados Base...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : clientesFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan={tiposObrigacoes.length + 1} className="p-10 text-center font-mono text-xs text-neutral-600 uppercase">Nenhum registro localizado no sistema</td>
                                </tr>
                            ) : (
                                clientesFiltrados.map((cliente) => (
                                    <tr key={cliente.id} className="hover:bg-neutral-800/20 transition-colors group">
                                        <td className="p-5 sticky left-0 bg-neutral-900 group-hover:bg-neutral-800 transition-colors border-r border-neutral-800 z-10 shadow-xl">
                                            <div className="font-black text-neutral-200 truncate max-w-[240px] uppercase italic text-sm" title={cliente.nome}>
                                                {cliente.nome}
                                            </div>
                                            <div className="text-[9px] text-neutral-600 font-mono mt-1">
                                                ID: {cliente.cnpj_cpf || '---'}
                                            </div>
                                        </td>
                                        {tiposObrigacoes.map(tipo => {
                                            const status = getStatusObrigacao(cliente.id, tipo);
                                            return (
                                                <td
                                                    key={`${cliente.id}-${tipo}`}
                                                    className="p-5 text-center border-l border-neutral-800/50 cursor-pointer hover:bg-neutral-800/40 transition-all"
                                                    onClick={() => toggleStatus(cliente.id, tipo)}
                                                >
                                                    {status === 'concluido' ? (
                                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 animate-in zoom-in duration-300">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </div>
                                                    ) : status === 'atrasado' ? (
                                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20 text-red-500 border border-red-500/40 animate-bounce">
                                                            <AlertCircle className="w-4 h-4" />
                                                        </div>
                                                    ) : status === 'pendente' ? (
                                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 text-amber-500/30 border border-amber-500/10">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                    ) : (
                                                        // Vazio (Ainda não configurado para este cliente)
                                                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 mx-auto group-hover:bg-neutral-700 transition-colors"></div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legenda Brutalista */}
            <div className="flex flex-wrap items-center gap-8 justify-end px-4 border-t border-neutral-900 pt-6">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-800"></div>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-600">Não Aplicável</span>
                </div>
                <div className="flex items-center gap-3">
                    <FileText className="w-3 h-3 text-amber-500/30" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">Pendente</span>
                </div>
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-500 uppercase">Liquidado</span>
                </div>
                <div className="flex items-center gap-3">
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-red-500">Urgente</span>
                </div>
            </div>
        </div>
    );
}
