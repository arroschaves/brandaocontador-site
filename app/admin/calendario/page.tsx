"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Calendar as CalendarIcon,
    AlertCircle,
    CheckCircle2,
    Clock,
    User,
    ArrowRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function CalendarioPage() {
    const daysArr = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const monthsArr = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const [viewDate, setViewDate] = useState(new Date(2026, 0, 18)); // Hoje
    const [deadlines, setDeadlines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();

    const fetchDeadlines = useCallback(async () => {
        setLoading(true);
        try {
            const firstDay = new Date(currentYear, currentMonth, 1).toISOString();
            const lastDay = new Date(currentYear, currentMonth + 1, 0).toISOString();

            const { data, error } = await supabase
                .from('obrigacoes_acessorias')
                .select('*, clientes(nome)')
                .gte('competencia', firstDay)
                .lte('competencia', lastDay);

            if (error) throw error;

            const mapped = (data || []).map((d: any) => ({
                day: new Date(d.competencia).getUTCDate(),
                type: d.tipo,
                title: d.tipo,
                client: d.clientes?.nome || 'Desconhecido',
                status: d.status || 'pendente'
            }));

            setDeadlines(mapped);
        } catch (err) {
            console.error('Erro ao buscar obrigações:', err);
        } finally {
            setLoading(false);
        }
    }, [currentMonth, currentYear]);

    useEffect(() => {
        fetchDeadlines();
    }, [fetchDeadlines]);

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentYear, currentMonth + offset, 1);
        setViewDate(newDate);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-100 flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-primary-400" />
                        Cronograma de Obrigações
                    </h1>
                    <p className="text-neutral-400 mt-1">Gestão centralizada de prazos contábeis e fiscais.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-neutral-950 font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary-500/10">
                        <Plus className="w-4 h-4" />
                        Novo Prazo
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Stats Summary Sidebar */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Métricas do Mês</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-neutral-400">Obrigações</span>
                                <span className="text-neutral-100 font-bold">{deadlines.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-neutral-400">Concluídas</span>
                                </div>
                                <span className="text-green-400 font-bold italic">{deadlines.filter(d => d.status === 'concluido').length}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    <span className="text-neutral-400">Pendentes</span>
                                </div>
                                <span className="text-yellow-400 font-bold italic">{deadlines.filter(d => d.status !== 'concluido').length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-5 h-5 text-primary-400" />
                            <h3 className="font-bold text-neutral-200">Próximos Prazos</h3>
                        </div>
                        <div className="space-y-4">
                            {deadlines.slice(0, 3).map((d, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
                                    <div className="text-xs font-bold text-primary-400 bg-primary-500/10 w-8 h-8 rounded-lg flex items-center justify-center">
                                        {d.day}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-neutral-200 truncate">{d.client}</div>
                                        <div className="text-[10px] text-neutral-500 uppercase">{d.type}</div>
                                    </div>
                                </div>
                            ))}
                            {deadlines.length === 0 && <p className="text-xs text-neutral-500 text-center py-4">Nenhuma obrigação para este mês.</p>}
                        </div>
                    </div>
                </div>

                {/* Calendar Grid View */}
                <div className="xl:col-span-3 bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-neutral-900/50 backdrop-blur-md">
                        <div className="flex items-center gap-6">
                            <h2 className="text-2xl font-black text-neutral-100 tracking-tight italic">
                                {monthsArr[currentMonth]} <span className="text-primary-500 tabular-nums">{currentYear}</span>
                            </h2>
                            <div className="flex bg-neutral-800 rounded-xl p-1 border border-neutral-700 shadow-inner">
                                <button onClick={() => changeMonth(-1)} className="p-2 hover:text-primary-400 hover:bg-neutral-700 rounded-lg transition-all">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button onClick={() => changeMonth(1)} className="p-2 hover:text-primary-400 hover:bg-neutral-700 rounded-lg transition-all">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                            <button
                                onClick={() => setViewDate(new Date(2026, 0, 18))}
                                className="text-xs font-bold uppercase tracking-widest text-primary-400 hover:text-primary-300 border-b-2 border-primary-500/20 px-1 py-0.5"
                            >
                                Ir para Hoje
                            </button>
                        </div>

                        <div className="flex bg-neutral-800 rounded-xl p-1 border border-neutral-700">
                            <button className="px-4 py-1.5 text-xs font-bold bg-neutral-700 text-primary-400 rounded-lg shadow-lg">Mês</button>
                            <button className="px-4 py-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-200">Semana</button>
                            <button className="px-4 py-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-200">Lista</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 border-b border-neutral-800 bg-neutral-950/30 text-center py-4">
                        {daysArr.map((d: any) => (
                            <div key={d} className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 grid-rows-5 h-[650px] relative">
                        {loading && (
                            <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                <div className="flex items-center gap-3 px-6 py-3 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl">
                                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    <span className="text-xs font-bold text-neutral-300 ml-2 uppercase tracking-widest">Sincronizando Banco...</span>
                                </div>
                            </div>
                        )}

                        {/* Empty cells for previous month padding */}
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} className="border-r border-b border-neutral-800/20 bg-neutral-950/20" />
                        ))}

                        {/* Calendar Day cells */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dayDeadlines = deadlines.filter(d => d.day === day);
                            const active = isToday(day);

                            return (
                                <div key={day} className={`border-r border-b border-neutral-800/40 p-3 hover:bg-neutral-800/30 transition-all relative group h-full overflow-hidden ${active ? 'bg-primary-500/5' : ''}`}>
                                    <div className="flex justify-between items-start">
                                        <span className={`text-sm font-black tabular-nums transition-all ${active ? 'bg-primary-500 text-neutral-950 w-7 h-7 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30 scale-110' : 'text-neutral-600 group-hover:text-neutral-300'
                                            }`}>
                                            {day}
                                        </span>
                                        {dayDeadlines.length > 0 && !active && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                                        )}
                                    </div>

                                    <div className="mt-3 space-y-1.5">
                                        {dayDeadlines.map((dl, idx) => (
                                            <div
                                                key={idx}
                                                className={`text-[9px] p-2 rounded-lg border leading-tight shadow-sm transition-all hover:scale-[1.02] cursor-pointer ${dl.status === 'concluido' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    dl.status === 'pendente' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                        'bg-primary-500/10 text-primary-400 border-primary-500/20'
                                                    }`}
                                            >
                                                <div className="font-black truncate uppercase">{dl.client}</div>
                                                <div className="opacity-70 truncate">{dl.title}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Fill the remaining grid cells */}
                        {Array.from({ length: 35 - (daysInMonth + firstDayOfMonth) }).map((_, i) => (
                            <div key={`empty-end-${i}`} className="border-r border-b border-neutral-800/10 bg-neutral-950/10" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
