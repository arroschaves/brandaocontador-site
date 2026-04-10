"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
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

/**
 * Cronograma de Obrigações Fiscais — Brandão Contabilidade
 * Matriz cliente × obrigação com status por competência
 * Integra com schemas core.empresas + fiscal.calendario
 */
export default function CronogramaPage() {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;
    const [loading, setLoading] = useState(true);
    const [clientes, setClientes] = useState<any[]>([]);
    const [obrigacoes, setObrigacoes] = useState<any[]>([]);
    const [competencia, setCompetencia] = useState(() => new Date());
    const [filtroNome, setFiltroNome] = useState('');
    const [resumo, setResumo] = useState({ pendentes: 0, concluidos: 0, atrasados: 0 });

    // Padrão Brandão 2026 — tipos de obrigação
    const tiposObrigacoes = [
        'DAS', 'FOLHA', 'FGTS', 'INSS', 'DCTF', 'DARF', 'ITR_CCIR', 'CND_CERT', 'XML_NF'
    ];

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: dataClientes } = await supabase
                .schema('core')
                .from('empresas')
                .select('id, razao_social, documento')
                .order('razao_social');

            const { data: dataObrigacoes } = await supabase
                .schema('fiscal')
                .from('calendario')
                .select('*, template:template_id(nome)')
                .eq('ano_referencia', competencia.getFullYear())
                .eq('mes_referencia', competencia.getMonth() + 1);

            const clis = dataClientes || [];
            const obrs = dataObrigacoes || [];

            setClientes(clis);
            setObrigacoes(obrs);

            // Calcula resumo
            const concluidos = obrs.filter((o: any) => o.status === 'CONCLUIDO').length;
            const atrasados = obrs.filter((o: any) => o.status === 'ATRASADO').length;
            const pendentes = obrs.filter((o: any) => o.status === 'PENDENTE').length;
            setResumo({ pendentes, concluidos, atrasados });
        } catch (error) {
            console.warn('Cronograma: erro ao buscar dados. Verificar schemas core/fiscal.', error);
        } finally {
            setLoading(false);
        }
    }, [competencia]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSync = async () => {
        try {
            const response = await fetch('/api/automation/sync', { method: 'POST' });
            if (response.ok) {
                alert('Auditoria de Drive iniciada! Organizando pastas no padrão Brandão 2026...');
            }
        } catch (error) {
            console.error('Erro ao disparar auditoria:', error);
        }
    };

    const toggleStatus = async (clienteId: string, tipo: string) => {
        const existente = obrigacoes.find(o => o.empresa_id === clienteId && o.template?.nome === tipo);
        let novoStatus = 'CONCLUIDO';

        if (existente) {
            if (existente.status === 'CONCLUIDO') novoStatus = 'ATRASADO';
            else if (existente.status === 'ATRASADO') novoStatus = 'PENDENTE';
        }

        try {
            if (existente) {
                await supabase.schema('fiscal').from('calendario').update({ status: novoStatus }).eq('id', existente.id);
            }
            fetchData();
        } catch (err) {
            console.error('Erro ao atualizar status:', err);
        }
    };

    const getStatusObrigacao = (clienteId: string, tipo: string) => {
        const o = obrigacoes.find(ob => ob.empresa_id === clienteId && ob.template?.nome === tipo);
        return o ? o.status : 'vazio';
    };

    const clientesFiltrados = clientes.filter(c =>
        c.razao_social?.toLowerCase().includes(filtroNome.toLowerCase())
    );

    // Formato estável para evitar hydration mismatch
    const competenciaLabel = `${String(competencia.getMonth() + 1).padStart(2, '0')}/${competencia.getFullYear()}`;

    return (
        <div className="space-y-8 page-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">
                        Cronograma de Obrigações
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Padrão Brandão de Conformidade Fiscal</p>
                </div>

                <div className="flex items-center gap-2 lucid-card p-2">
                    <button onClick={() => {
                        const d = new Date(competencia);
                        d.setMonth(d.getMonth() - 1);
                        setCompetencia(d);
                    }} className="p-2 hover:bg-secondary text-muted-foreground hover:text-primary transition-colors rounded-xl">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-bold text-foreground min-w-[100px] text-center tracking-tight">
                        {competenciaLabel}
                    </span>
                    <button onClick={() => {
                        const d = new Date(competencia);
                        d.setMonth(d.getMonth() + 1);
                        setCompetencia(d);
                    }} className="p-2 hover:bg-secondary text-muted-foreground hover:text-primary transition-colors rounded-xl">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="lucid-card p-5 border-l-4 border-l-amber-500">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Aguardando Auditoria</p>
                    <p className="text-3xl font-bold text-amber-500">{loading ? '—' : resumo.pendentes}</p>
                </div>
                <div className="lucid-card p-5 border-l-4 border-l-emerald-500">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Documentos em Pasta</p>
                    <p className="text-3xl font-bold text-emerald-500">{loading ? '—' : resumo.concluidos}</p>
                </div>
                <div className="lucid-card p-5 border-l-4 border-l-red-500">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Transmissão Pendente</p>
                    <p className="text-3xl font-bold text-red-500">{loading ? '—' : resumo.atrasados}</p>
                </div>
            </div>

            {/* Filtros e Ações */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative flex-1 max-w-md w-full group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Filtrar cliente..."
                        value={filtroNome}
                        onChange={(e) => setFiltroNome(e.target.value)}
                        className="input-modern pl-10"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={handleSync}
                        className="btn-modern-outline flex items-center gap-2 text-[11px] py-2.5"
                    >
                        <Database className="w-4 h-4 text-primary" />
                        Auditoria Drive
                    </button>
                    <button className="btn-modern flex items-center gap-2 text-[11px] py-2.5">
                        <Send className="w-4 h-4" />
                        Disparar Transmissões
                    </button>
                </div>
            </div>

            {/* Tabela Matriz */}
            <div className="lucid-card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-secondary/30 border-b border-border/40">
                                <th className="p-4 pl-6 font-bold text-muted-foreground text-[10px] uppercase tracking-wider sticky left-0 bg-secondary/30 z-20 w-64">
                                    Cliente / Entidade
                                </th>
                                {tiposObrigacoes.map(tipo => (
                                    <th key={tipo} className="p-4 font-bold text-muted-foreground text-[10px] text-center border-l border-border/30 tracking-wider uppercase">
                                        {tipo}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {loading ? (
                                <tr>
                                    <td colSpan={tiposObrigacoes.length + 1} className="p-20 text-center">
                                        <div className="relative inline-block">
                                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                                            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4 relative" />
                                        </div>
                                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mt-2">
                                            Cruzando dados Drive vs Supabase...
                                        </span>
                                    </td>
                                </tr>
                            ) : clientesFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan={tiposObrigacoes.length + 1} className="p-16 text-center">
                                        <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                                        <p className="text-sm font-bold text-foreground">Nenhum registro localizado</p>
                                        <p className="text-xs text-muted-foreground mt-1">Verifique o cadastro de empresas no módulo Clientes.</p>
                                    </td>
                                </tr>
                            ) : (
                                clientesFiltrados.map((cliente) => (
                                    <tr key={cliente.id} className="hover:bg-secondary/30 transition-colors group">
                                        <td className="p-4 pl-6 sticky left-0 bg-card group-hover:bg-secondary/30 transition-colors border-r border-border/30 z-10">
                                            <div className="font-bold text-foreground truncate max-w-[240px] text-sm">{cliente.razao_social}</div>
                                            <div className="text-[10px] text-muted-foreground mt-0.5">{cliente.documento || 'Sem documento'}</div>
                                        </td>
                                        {tiposObrigacoes.map(tipo => {
                                            const status = getStatusObrigacao(cliente.id, tipo);
                                            return (
                                                <td
                                                    key={`${cliente.id}-${tipo}`}
                                                    className="p-4 text-center border-l border-border/20 cursor-pointer hover:bg-secondary/50 transition-all"
                                                    onClick={() => toggleStatus(cliente.id, tipo)}
                                                >
                                                    {status === 'CONCLUIDO' ? (
                                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 border border-emerald-500/30" title="Arquivo no Drive OK">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </div>
                                                    ) : status === 'ATRASADO' ? (
                                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/15 text-red-500 border border-red-500/30 animate-pulse" title="Pendente de Transmissão">
                                                            <AlertCircle className="w-4 h-4" />
                                                        </div>
                                                    ) : status === 'PENDENTE' ? (
                                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500/50 border border-amber-500/15" title="Aguardando Arquivo">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-border mx-auto group-hover:bg-muted-foreground/30" />
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

            {/* Legenda */}
            <div className="flex flex-wrap items-center gap-8 justify-end px-4 text-[10px] uppercase tracking-wider">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-border" />
                    <span className="text-muted-foreground">N/A</span>
                </div>
                <div className="flex items-center gap-2">
                    <FileText className="w-3 h-3 text-amber-500/50" />
                    <span className="text-muted-foreground">Sem Arquivo</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">No Drive</span>
                </div>
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    <span className="text-red-600 dark:text-red-400">Transmitir</span>
                </div>
            </div>
        </div>
    );
}
