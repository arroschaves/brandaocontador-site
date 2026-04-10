"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Calendar,
    AlertTriangle,
    CheckCircle2,
    Search,
    Clock,
    ArrowRight,
    ExternalLink,
    RefreshCw,
    Bell,
    Filter,
    Loader2
} from 'lucide-react';

/**
 * Gestão de Vencimentos — Brandão Contabilidade
 * Painel de controle de CNDs, Alvarás, Certificados Digitais e obrigações
 * Integra com Supabase view vw_radar_vencimentos
 */
export default function VencimentosPage() {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;
    const [vencimentos, setVencimentos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('todos');

    const fetchVencimentos = useCallback(async () => {
        try {
            setLoading(true);

            // Estratégia resiliente: tenta view primeiro, fallback para tabelas diretas
            let events: any[] = [];

            // Tentativa 1: View Soberana (se existir no Supabase)
            const { data: viewData, error: viewError } = await supabase
                .from('vw_radar_vencimentos')
                .select('*')
                .order('vencimento', { ascending: true });

            if (!viewError && viewData && viewData.length > 0) {
                events = viewData.map((v: any) => {
                    const due = new Date(v.vencimento);
                    const today = new Date();
                    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return {
                        id: `${v.origem}-${v.vencimento}-${v.empresa}`,
                        cliente: v.empresa || 'Sem nome',
                        tipo: v.descricao || 'Obrigação',
                        data: v.vencimento,
                        valor: v.valor || 0,
                        origem: v.origem,
                        diffDays,
                        folder: null
                    };
                });
            } else {
                // Tentativa 2: Busca direta nas tabelas fiscais
                const { data: certData } = await supabase
                    .schema('core')
                    .from('certificados_digitais')
                    .select('id, empresa_id, tipo, validade, empresas:empresa_id(razao_social)')
                    .order('validade', { ascending: true })
                    .limit(100);

                if (certData && certData.length > 0) {
                    events = certData.map((c: any) => {
                        const due = new Date(c.validade);
                        const today = new Date();
                        const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        return {
                            id: `cert-${c.id}`,
                            cliente: (c.empresas as any)?.razao_social || 'Empresa não identificada',
                            tipo: `Certificado Digital - ${c.tipo || 'A1'}`,
                            data: c.validade,
                            valor: 0,
                            origem: 'certificado',
                            diffDays,
                            folder: null
                        };
                    });
                }

                // Também tenta obrigações/calendário fiscal
                const { data: calData } = await supabase
                    .schema('fiscal')
                    .from('calendario')
                    .select('id, empresa_id, data_vencimento, status, template:template_id(nome)')
                    .order('data_vencimento', { ascending: true })
                    .limit(100);

                if (calData && calData.length > 0) {
                    const calEvents = calData
                        .filter((c: any) => c.data_vencimento)
                        .map((c: any) => {
                            const due = new Date(c.data_vencimento);
                            const today = new Date();
                            const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                            return {
                                id: `cal-${c.id}`,
                                cliente: `Empresa #${c.empresa_id}`,
                                tipo: (c.template as any)?.nome || 'Obrigação Fiscal',
                                data: c.data_vencimento,
                                valor: 0,
                                origem: 'calendario',
                                diffDays,
                                folder: null
                            };
                        });
                    events = [...events, ...calEvents];
                }
            }

            // Ordena por data de vencimento (mais urgente primeiro)
            events.sort((a, b) => a.diffDays - b.diffDays);
            setVencimentos(events);
        } catch (err) {
            // Falha silenciosa — exibe estado vazio em vez de erro
            console.warn('Radar de vencimentos: nenhuma fonte de dados disponível ainda.', err);
            setVencimentos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVencimentos();
    }, [fetchVencimentos]);

    const getStatusInfo = (diffDays: number) => {
        if (diffDays < 0) return { label: 'Vencido', color: 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800', dot: 'bg-red-500' };
        if (diffDays <= 7) return { label: 'Crítico', color: 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800', dot: 'bg-orange-500' };
        if (diffDays <= 30) return { label: 'Atenção', color: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800', dot: 'bg-amber-500' };
        return { label: 'Regular', color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800', dot: 'bg-emerald-500' };
    };

    const filtered = vencimentos.filter(v => {
        const matchSearch = v.cliente.toLowerCase().includes(search.toLowerCase()) ||
            v.tipo.toLowerCase().includes(search.toLowerCase());
        if (filtroStatus === 'todos') return matchSearch;
        if (filtroStatus === 'vencido') return matchSearch && v.diffDays < 0;
        if (filtroStatus === 'critico') return matchSearch && v.diffDays >= 0 && v.diffDays <= 7;
        if (filtroStatus === 'atencao') return matchSearch && v.diffDays > 7 && v.diffDays <= 30;
        if (filtroStatus === 'regular') return matchSearch && v.diffDays > 30;
        return matchSearch;
    });

    // Contadores para badges
    const counts = {
        total: vencimentos.length,
        vencido: vencimentos.filter(v => v.diffDays < 0).length,
        critico: vencimentos.filter(v => v.diffDays >= 0 && v.diffDays <= 7).length,
        atencao: vencimentos.filter(v => v.diffDays > 7 && v.diffDays <= 30).length,
        regular: vencimentos.filter(v => v.diffDays > 30).length,
    };

    return (
        <div className="space-y-8 page-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Gestão de Vencimentos</h1>
                    <p className="text-sm text-muted-foreground mt-1">Controle de CNDs, Alvarás, Certificados Digitais e obrigações fiscais</p>
                </div>
                <button
                    onClick={fetchVencimentos}
                    disabled={loading}
                    className="btn-modern-outline flex items-center gap-2 text-[12px] py-2.5"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Atualizar Radar
                </button>
            </div>

            {/* Cards de Status */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Vencidos', value: counts.vencido, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10', icon: AlertTriangle },
                    { label: 'Críticos (7d)', value: counts.critico, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/10', icon: Clock },
                    { label: 'Atenção (30d)', value: counts.atencao, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10', icon: Bell },
                    { label: 'Regular', value: counts.regular, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10', icon: CheckCircle2 },
                ].map((stat, i) => (
                    <div key={i} className="lucid-card p-5 flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${stat.color}`}>{loading ? '—' : stat.value}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filtros e Busca */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Filtrar por cliente ou documento..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-modern pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    {[
                        { id: 'todos', label: 'Todos' },
                        { id: 'vencido', label: 'Vencidos' },
                        { id: 'critico', label: 'Críticos' },
                        { id: 'atencao', label: 'Atenção' },
                        { id: 'regular', label: 'OK' },
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFiltroStatus(f.id)}
                            className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-tight rounded-xl border transition-all ${filtroStatus === f.id
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-card text-muted-foreground border-border/60 hover:bg-secondary'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lista de Vencimentos */}
            <div className="grid gap-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                            <Loader2 className="w-8 h-8 animate-spin text-primary relative" />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sincronizando Radar...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="lucid-card text-center py-20">
                        <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-foreground">Nenhum vencimento encontrado</h3>
                        <p className="text-sm text-muted-foreground mt-1">Tudo em dia ou nenhum dado cadastrado.</p>
                    </div>
                ) : (
                    filtered.map((v) => {
                        const status = getStatusInfo(v.diffDays);
                        return (
                            <div key={v.id} className="lucid-card p-5 flex items-center justify-between group hover:border-primary/30">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status.color.split(' ').slice(1, 3).join(' ')} border`}>
                                        <Calendar className={`w-5 h-5 ${status.color.split(' ')[0]}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-[15px] font-bold text-foreground">{v.cliente}</h3>
                                            <span className={`text-[9px] px-2.5 py-1 rounded-full border flex items-center gap-1.5 font-bold uppercase tracking-wider ${status.color}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${status.dot} ${v.diffDays <= 7 ? 'animate-pulse' : ''}`} />
                                                {status.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
                                            <span className="font-semibold">{v.tipo}</span>
                                            <span className="text-muted-foreground/40">•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {v.diffDays < 0
                                                    ? `Venceu há ${Math.abs(v.diffDays)} dias`
                                                    : `Vence em ${v.diffDays} dias`
                                                }
                                                ({new Date(v.data).toLocaleDateString('pt-BR')})
                                            </span>
                                            {v.valor > 0 && (
                                                <>
                                                    <span className="text-muted-foreground/40">•</span>
                                                    <span className="font-bold text-primary">
                                                        R$ {v.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    {v.folder && (
                                        <a
                                            href={`https://drive.google.com/drive/folders/${v.folder}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2.5 bg-card border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all rounded-xl"
                                            title="Ver no Google Drive"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                    <button className="btn-modern-outline flex items-center gap-2 text-[10px] px-4 py-2">
                                        <Bell className="w-3.5 h-3.5" />
                                        Notificar
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Rodapé de status */}
            {!loading && filtered.length > 0 && (
                <div className="text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {filtered.length} vencimento{filtered.length !== 1 ? 's' : ''} • Radar ativo
                    </p>
                </div>
            )}
        </div>
    );
}
