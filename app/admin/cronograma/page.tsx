"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Calendar,
    CheckCircle2,
    AlertCircle,
    FileText,
    Search,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Database,
    Send
} from 'lucide-react';

export default function CronogramaPage() {
    const [loading, setLoading] = useState(true);
    const [clientes, setClientes] = useState<any[]>([]);
    const [obrigacoes, setObrigacoes] = useState<any[]>([]);
    const [competencia, setCompetencia] = useState(new Date());
    const [filtroNome, setFiltroNome] = useState('');
    const [resumo, setResumo] = useState({ pendentes: 0, concluidos: 0, atrasados: 0 });

    // Padrão Brandão 2026
    const tiposObrigacoes = [
        'DAS', 'FOLHA', 'FGTS', 'INSS', 'DCTF', 'DARF', 'ITR_CCIR', 'CND_CERT', 'XML_NF'
    ];

    useEffect(() => {
        fetchData();
    }, [competencia]);

    useEffect(() => {
        const p = obrigacoes.filter(o => o.status === 'pendente').length;
        const c = obrigacoes.filter(o => o.status === 'concluido').length;
        const a = obrigacoes.filter(o => o.status === 'atrasado').length;
        setResumo({ pendentes: p, concluidos: c, atrasados: a });
    }, [obrigacoes]);

    async function fetchData() {
        setLoading(true);
        try {
            const { data: dataClientes } = await supabase
                .from('clientes')
                .select('id, nome, cnpj_cpf')
                .order('nome');

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

    const handleSync = async () => {
        try {
            const response = await fetch('/api/automation/sync', { method: 'POST' });
            if (response.ok) {
                alert('Auditoria de Drive Iniciada! Organizando pastas no Padrão Brandão 2026...');
            }
        } catch (error) {
            console.error('Erro ao disparar auditoria:', error);
        }
    };

    const toggleStatus = async (clienteId: string, tipo: string) => {
        const existente = obrigacoes.find(o => o.cliente_id === clienteId && o.tipo === tipo);
        let novoStatus = 'concluido';

        if (existente) {
            if (existente.status === 'concluido') novoStatus = 'atrasado';
            else if (existente.status === 'atrasado') novoStatus = 'pendente';
        }

        try {
            if (existente) {
                await supabase.from('obrigacoes_acessorias').update({ status: novoStatus }).eq('id', existente.id);
            } else {
                await supabase.from('obrigacoes_acessorias').insert([{
                    cliente_id: clienteId,
                    tipo,
                    status: novoStatus,
                    competencia: new Date(competencia.getFullYear(), competencia.getMonth(), 1).toISOString()
                }]);
            }
            fetchData();
        } catch (err) {
            console.error('Erro ao atualizar status:', err);
        }
    };

    const getStatusObrigacao = (clienteId: string, tipo: string) => {
        const o = obrigacoes.find(ob => ob.cliente_id === clienteId && ob.tipo === tipo);
        return o ? o.status : 'vazio';
    };

    const clientesFiltrados = clientes.filter(c =>
        c.nome?.toLowerCase().includes(filtroNome.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-neutral-100 italic tracking-tight uppercase">
                        CRONOGRAMA <span className="text-amber-500">2026</span>
                    </h1>
                    <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest mt-2">Padrão Brandão de Conformidade Fiscal</p>
                </div>

                <div className="flex items-center gap-4 bg-neutral-900 border border-neutral-800 p-2 rounded-xl">
                    <button onClick={() => {
                        const d = new Date(competencia);
                        d.setMonth(d.getMonth() - 1);
                        setCompetencia(d);
                    }} className="p-2 hover:bg-neutral-800 text-neutral-400 hover:text-amber-500 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-black text-neutral-200 min-w-[140px] text-center uppercase tracking-widest font-mono italic">
                        {competencia.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => {
                        const d = new Date(competencia);
                        d.setMonth(d.getMonth() + 1);
                        setCompetencia(d);
                    }} className="p-2 hover:bg-neutral-800 text-neutral-400 hover:text-amber-500 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neutral-900 border-l-4 border-amber-500 p-6 rounded-r-xl">
                    <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Aguardando Auditoria</div>
                    <div className="text-3xl font-black text-neutral-100 italic">{resumo.pendentes}</div>
                </div>
                <div className="bg-neutral-900 border-l-4 border-emerald-500 p-6 rounded-r-xl">
                    <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Documentos em Pasta</div>
                    <div className="text-3xl font-black text-neutral-100 italic">{resumo.concluidos}</div>
                </div>
                <div className="bg-neutral-900 border-l-4 border-red-500 p-6 rounded-r-xl">
                    <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Transmissão Pendente</div>
                    <div className="text-3xl font-black text-neutral-100 italic">{resumo.atrasados}</div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative flex-1 max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                    <input
                        type="text"
                        placeholder="FILTRAR CLIENTE..."
                        value={filtroNome}
                        onChange={(e) => setFiltroNome(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 pl-10 pr-4 py-3 text-xs font-mono focus:border-amber-500 transition-all text-neutral-200 placeholder:text-neutral-700 uppercase rounded-xl"
                    />
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        onClick={handleSync}
                        className="flex items-center gap-2 px-6 py-3 bg-neutral-900 border border-neutral-800 hover:border-amber-500 text-neutral-300 text-[10px] font-black uppercase transition-all rounded-xl"
                    >
                        <Database className="w-4 h-4 text-amber-500" />
                        Auditoria Inteligente (Drive)
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-neutral-950 text-[10px] font-black uppercase transition-all rounded-xl hover:bg-amber-400">
                        <Send className="w-4 h-4" />
                        Disparar Transmissões
                    </button>
                </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 overflow-hidden rounded-2xl">
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
                                        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-4" />
                                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-600">Cruzando Dados Drive vs Supabase...</span>
                                    </td>
                                </tr>
                            ) : clientesFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan={tiposObrigacoes.length + 1} className="p-10 text-center font-mono text-xs text-neutral-600 uppercase">Nenhum registro localizado</td>
                                </tr>
                            ) : (
                                clientesFiltrados.map((cliente) => (
                                    <tr key={cliente.id} className="hover:bg-neutral-800/20 transition-colors group">
                                        <td className="p-5 sticky left-0 bg-neutral-900 group-hover:bg-neutral-800 transition-colors border-r border-neutral-800 z-10 shadow-xl">
                                            <div className="font-black text-neutral-200 truncate max-w-[240px] uppercase italic text-sm">{cliente.nome}</div>
                                            <div className="text-[9px] text-neutral-600 font-mono mt-1">ID: {cliente.cnpj_cpf || 'CADASTRO_INCOMPLETO'}</div>
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
                                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 animate-in zoom-in duration-300" title="Arquivo no Drive OK">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </div>
                                                    ) : status === 'atrasado' ? (
                                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/20 text-red-500 border border-red-500/40 animate-pulse" title="Pendente de Transmissão">
                                                            <AlertCircle className="w-4 h-4" />
                                                        </div>
                                                    ) : status === 'pendente' ? (
                                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500/30 border border-amber-500/10" title="Aguardando Arquivo">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 mx-auto group-hover:bg-neutral-700"></div>
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

            <div className="flex flex-wrap items-center gap-8 justify-end px-4 border-t border-neutral-800 pt-6 font-mono text-[9px] uppercase tracking-widest">
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-neutral-800"></div> <span className="text-neutral-600">N/A</span></div>
                <div className="flex items-center gap-2"><FileText className="w-3 h-3 text-amber-500/30" /> <span className="text-neutral-500">Sem Arquivo</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> <span className="text-emerald-500">No Drive</span></div>
                <div className="flex items-center gap-2"><AlertCircle className="w-3 h-3 text-red-500" /> <span className="text-red-500">Transmitir</span></div>
            </div>
        </div>
    );
}
