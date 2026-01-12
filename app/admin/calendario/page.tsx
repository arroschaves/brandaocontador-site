"use client";

import React from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Filter,
    Calendar as CalendarIcon,
    Search,
    AlertCircle,
    CheckCircle2,
    Clock,
    MoreVertical
} from 'lucide-react';

export default function CalendarioPage() {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const currentMonth = 0; // Janeiro
    const currentYear = 2026;

    const deadlines = [
        { day: 10, type: 'Fiscal', title: 'Guia de DAS', client: 'AASS', status: 'pendente' },
        { day: 10, type: 'Fiscal', title: 'Guia de DAS', client: 'BARBAQ', status: 'concluido' },
        { day: 15, type: 'Trabalhista', title: 'FGTS / E-Social', client: 'Vários', status: 'concluido' },
        { day: 20, type: 'Fiscal', title: 'DCTFWeb', client: 'Empresas LP', status: 'processando' },
        { day: 20, type: 'Tributário', title: 'PIS / COFINS', client: 'Empresas LR', status: 'pendente' },
        { day: 31, type: 'Contábil', title: 'Fechamento Mês', client: 'Todos', status: 'em_aberto' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-100 flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-primary-400" />
                        Cronograma de Obrigações
                    </h1>
                    <p className="text-neutral-400 mt-1">Gestão de prazos e obrigações acessórias mensais.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Novo Prazo
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Sidebar: Filters & Summary */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="card">
                        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4">Filtrar por Tipo</h3>
                        <div className="space-y-2">
                            {['Fiscal', 'Trabalhista', 'Contábil', 'Tributário', 'Certidões'].map((type) => (
                                <label key={type} className="flex items-center gap-3 p-2 hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors group">
                                    <input type="checkbox" className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-primary-500" defaultChecked />
                                    <span className="text-sm text-neutral-300 group-hover:text-neutral-100">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4">Resumo do Mês</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-neutral-400">Total de Obrigações</span>
                                <span className="text-neutral-100 font-bold">142</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-success-500" />
                                    <span className="text-neutral-400">Concluídas</span>
                                </div>
                                <span className="text-success-400 font-bold italic">84</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-warning-500" />
                                    <span className="text-neutral-400">Pendente</span>
                                </div>
                                <span className="text-warning-400 font-bold italic">46</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-error-400 font-bold">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-error-500" />
                                    <span>Atrasadas</span>
                                </div>
                                <span className="italic">12</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calendar View */}
                <div className="xl:col-span-3 card !p-0 overflow-hidden border-neutral-800">
                    <div className="p-6 border-b border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-neutral-900/40">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold text-neutral-100 italic">{months[currentMonth]} {currentYear}</h2>
                            <div className="flex bg-neutral-800 rounded-lg p-0.5 border border-neutral-700">
                                <button className="p-1.5 hover:text-primary-400 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                                <div className="w-px h- كامل bg-neutral-700 mx-1" />
                                <button className="p-1.5 hover:text-primary-400 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                            </div>
                            <button className="text-xs font-bold uppercase tracking-widest text-primary-400 hover:text-primary-300 border-b border-primary-500/20 px-1">Hoje</button>
                        </div>

                        <div className="flex bg-neutral-800 rounded-lg p-1 border border-neutral-700">
                            <button className="px-3 py-1 text-xs font-bold bg-neutral-700 text-neutral-100 rounded-md shadow">Mês</button>
                            <button className="px-3 py-1 text-xs font-bold text-neutral-400 hover:text-neutral-200">Semana</button>
                            <button className="px-3 py-1 text-xs font-bold text-neutral-400 hover:text-neutral-200">Lista</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 border-b border-neutral-800 bg-neutral-900/20 text-center py-3">
                        {days.map(day => (
                            <div key={day} className="text-xs font-bold uppercase tracking-widest text-neutral-500">{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 grid-rows-5 h-[600px]">
                        {/* Generate calendar cells (simplified mock) */}
                        {Array.from({ length: 31 }).map((_, i) => {
                            const day = i + 1;
                            const hasDeadline = deadlines.some(d => d.day === day);
                            const dayDeadlines = deadlines.filter(d => d.day === day);

                            return (
                                <div key={day} className={`border-r border-b border-neutral-800/50 p-2 hover:bg-neutral-800/10 transition-colors relative group ${day === 9 ? 'bg-primary-500/5' : ''}`}>
                                    <span className={`text-sm font-bold ${day === 9 ? 'bg-primary-500 text-neutral-950 w-6 h-6 rounded-full flex items-center justify-center' : 'text-neutral-600'
                                        }`}>
                                        {day}
                                    </span>

                                    <div className="mt-2 space-y-1 overflow-hidden h-full">
                                        {dayDeadlines.map((dl, idx) => (
                                            <div key={idx} className={`text-[10px] p-1 rounded border truncate translate-y-0 hover:-translate-y-0.5 transition-transform cursor-pointer ${dl.status === 'concluido' ? 'bg-success-500/10 text-success-400 border-success-500/20' :
                                                    dl.status === 'pendente' ? 'bg-error-500/10 text-error-400 border-error-500/20' :
                                                        'bg-warning-500/10 text-warning-400 border-warning-500/20'
                                                }`}>
                                                <strong>{dl.client}</strong>: {dl.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        {/* Pad the rest with empty cells */}
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={`empty-${i}`} className="border-r border-b border-neutral-800/20 bg-neutral-950/40" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
