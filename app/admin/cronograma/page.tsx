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
    UploadCloud
} from 'lucide-react';

export default function CronogramaPage() {
    const [loading, setLoading] = useState(true);
    const [clientes, setClientes] = useState<any[]>([]);
    const [obrigacoes, setObrigacoes] = useState<any[]>([]);
    const [competencia, setCompetencia] = useState(new Date()); // Data atual como base
    const [filtroNome, setFiltroNome] = useState('');

    // Lista de obrigações padrão para colunas (isso pode virar dinâmico depois)
    const tiposObrigacoes = ['DAS', 'FOLHA', 'FGTS', 'DCTF', 'SPED', 'ICMS'];

    useEffect(() => {
        fetchData();
    }, [competencia]);

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

    // Helper para verificar status de uma obrigação específica para um cliente
    const getStatusObrigacao = (clienteId: string, tipo: string) => {
        const obrigacao = obrigacoes.find(o =>
            o.cliente_id === clienteId &&
            o.tipo === tipo
        );

        if (!obrigacao) return 'pendente'; // Se não achou registro, assume pendente (ou teria que ver regime)
        return obrigacao.status; // concluido, atrasado, etc.
    };

    const clientesFiltrados = clientes.filter(c =>
        c.nome?.toLowerCase().includes(filtroNome.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-100 flex items-center gap-2">
                        <Calendar className="w-8 h-8 text-primary-500" />
                        Cronograma Fiscal
                    </h1>
                    <p className="text-neutral-400 mt-1">Gerencie as obrigações acessórias e prazos dos seus clientes.</p>
                </div>

                <div className="flex items-center gap-4 bg-neutral-900/50 p-2 rounded-xl border border-neutral-800">
                    <button onClick={() => mudarMes(-1)} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-lg font-bold text-neutral-200 min-w-[140px] text-center capitalize">
                        {competencia.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => mudarMes(1)} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Ações e Filtros */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Buscar cliente..."
                        value={filtroNome}
                        onChange={(e) => setFiltroNome(e.target.value)}
                        className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-primary-500 transition-all text-neutral-200 placeholder:text-neutral-600"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 hover:text-white hover:border-neutral-700 transition-all text-sm font-medium">
                        <UploadCloud className="w-4 h-4" /> Importar XMLs
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-xl text-primary-400 hover:bg-primary-500/20 transition-all text-sm font-medium">
                        <Download className="w-4 h-4" /> Baixar Relatório
                    </button>
                </div>
            </div>

            {/* Tabela Cronograma */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-900/80 border-b border-neutral-800">
                                <th className="p-4 font-medium text-neutral-400 text-sm whitespace-nowrap sticky left-0 bg-neutral-900 z-10 w-64 shadow-[4px_0_12px_rgba(0,0,0,0.5)]">Cliente</th>
                                {tiposObrigacoes.map(tipo => (
                                    <th key={tipo} className="p-4 font-medium text-neutral-400 text-sm text-center border-l border-neutral-800/50 min-w-[100px]">{tipo}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={tiposObrigacoes.length + 1} className="p-8 text-center text-neutral-500">
                                        Carregando dados...
                                    </td>
                                </tr>
                            ) : clientesFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan={tiposObrigacoes.length + 1} className="p-8 text-center text-neutral-500">
                                        Nenhum cliente encontrado.
                                    </td>
                                </tr>
                            ) : (
                                clientesFiltrados.map((cliente) => (
                                    <tr key={cliente.id} className="hover:bg-neutral-800/30 transition-colors group">
                                        <td className="p-4 sticky left-0 bg-neutral-900/50 group-hover:bg-neutral-900 group-hover:z-10 backdrop-blur-md border-r border-neutral-800 z-0">
                                            <div className="font-medium text-neutral-200 truncate max-w-[240px]" title={cliente.nome}>
                                                {cliente.nome}
                                            </div>
                                            <div className="text-xs text-neutral-500 font-mono">
                                                {cliente.cnpj_cpf || 'Sem Doc.'}
                                            </div>
                                        </td>
                                        {tiposObrigacoes.map(tipo => {
                                            const status = getStatusObrigacao(cliente.id, tipo);
                                            return (
                                                <td key={`${cliente.id}-${tipo}`} className="p-4 text-center border-l border-neutral-800/50">
                                                    {status === 'concluido' ? (
                                                        <div className="inline-flex items-center justify-center p-1.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </div>
                                                    ) : status === 'atrasado' ? (
                                                        <div className="inline-flex items-center justify-center p-1.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                                                            <AlertCircle className="w-4 h-4" />
                                                        </div>
                                                    ) : (
                                                        // Pendente
                                                        <div className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-neutral-700/50 group-hover:bg-neutral-700 transition-colors"></div>
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

            <div className="flex items-center gap-6 text-xs text-neutral-500 justify-end px-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-neutral-700"></div>
                    <span>Pendente / Não Aplicável</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>Concluído</span>
                </div>
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    <span>Atenção/Atrasado</span>
                </div>
            </div>
        </div>
    );
}
