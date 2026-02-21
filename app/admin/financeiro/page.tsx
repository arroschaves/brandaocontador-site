'use client'

import React, { useState } from 'react'
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    DollarSign,
    Filter,
    Percent,
    PieChart,
    Search,
    TrendingUp,
    Wallet
} from 'lucide-react'

export const dynamic = 'force-dynamic';

export default function FinanceiroPage() {
    const [search, setSearch] = useState('')

    // Dados de demonstração para UX Showcase
    const mrr = 84500.00
    const pending = 12400.00
    const expenses = 4120.00
    const growth = 12.5

    const transactions = [
        { id: 'T-1042', client: 'Tech Solutions LTDA', amount: 3500.00, type: 'INCOME', status: 'PAID', date: '2026-02-21' },
        { id: 'T-1043', client: 'Mercado Silva', amount: 1200.00, type: 'INCOME', status: 'PENDING', date: '2026-02-20' },
        { id: 'T-1044', client: 'AWS Cloud Services', amount: 850.00, type: 'EXPENSE', status: 'PAID', date: '2026-02-19' },
        { id: 'T-1045', client: 'Construtora Horizonte', amount: 5000.00, type: 'INCOME', status: 'PAID', date: '2026-02-18' },
        { id: 'T-1046', client: 'Folha de Pagamento', amount: 15400.00, type: 'EXPENSE', status: 'PENDING', date: '2026-02-18' }
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Header Brutalista */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border/40 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-foreground italic tracking-tight uppercase leading-none">
                        Módulo <span className="text-emerald-500">Financeiro</span>
                    </h1>
                    <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.2em] mt-3">
                        Controle de Caixa • Faturamento • MRR (Em Desenvolvimento)
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="h-12 px-6 bg-secondary text-muted-foreground font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 border border-border/50 hover:bg-card hover:text-foreground transition-all rounded-xl shadow-sm">
                        <Filter className="w-4 h-4" /> Filtros
                    </button>
                    <button className="h-12 px-8 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black italic text-sm uppercase tracking-tight flex items-center gap-2 transition-all rounded-xl shadow-lg shadow-emerald-500/20">
                        <TrendingUp className="w-5 h-5" /> Exportar DRE
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                    { label: 'MRR Atual', value: mrr, icon: Wallet, color: 'text-emerald-500', trend: '+12.5%', isPos: true },
                    { label: 'Inadimplência', value: pending, icon: DollarSign, color: 'text-amber-500', trend: '-2.1%', isPos: true },
                    { label: 'Despesas Fixas', value: expenses, icon: Activity, color: 'text-red-500', trend: '+5.0%', isPos: false },
                    { label: 'Margem de Lucro', value: 68.4, icon: Percent, color: 'text-blue-500', trend: '+1.2%', isPos: true, isPercent: true },
                ].map((kpi, i) => (
                    <div key={i} className="lucid-card p-6 flex flex-col justify-between group hover:border-emerald-500/30 transition-all shadow-sm border-l-4 border-l-border hover:border-l-emerald-500">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-secondary rounded-xl border border-border/50 group-hover:bg-emerald-500/10 transition-colors">
                                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border ${kpi.isPos ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                {kpi.isPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {kpi.trend}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{kpi.label}</p>
                            <p className="text-3xl font-black text-foreground italic mt-1 tracking-tighter">
                                {kpi.isPercent ? '' : 'R$ '}
                                {kpi.value.toLocaleString('pt-BR', { minimumFractionDigits: kpi.isPercent ? 1 : 2 })}
                                {kpi.isPercent ? '%' : ''}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                {/* Listagem de Transações */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold uppercase tracking-tight flex items-center gap-3">
                            <BarChart3 className="w-5 h-5 text-emerald-500" /> Fluxo de Caixa Recente
                        </h2>
                        <div className="relative w-64 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar transação..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-secondary/30 border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                            />
                        </div>
                    </div>

                    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border/50 bg-secondary/30 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    <th className="p-4 pl-6">ID</th>
                                    <th className="p-4">Cliente/Origem</th>
                                    <th className="p-4">Data</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 pr-6 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {transactions.map((tx, i) => (
                                    <tr key={i} className="hover:bg-secondary/40 transition-colors group">
                                        <td className="p-4 pl-6 font-mono text-xs text-muted-foreground/60 group-hover:text-emerald-500 transition-colors">{tx.id}</td>
                                        <td className="p-4 text-sm font-bold">{tx.client}</td>
                                        <td className="p-4 text-xs font-mono text-muted-foreground">{new Date(tx.date).toLocaleDateString('pt-BR')}</td>
                                        <td className="p-4">
                                            {tx.status === 'PAID' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider">
                                                    PAGO
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider">
                                                    PENDENTE
                                                </span>
                                            )}
                                        </td>
                                        <td className={`p-4 pr-6 text-right font-mono font-bold text-sm ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {tx.type === 'INCOME' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Dashboard Secundário */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold uppercase tracking-tight flex items-center gap-3">
                        <PieChart className="w-5 h-5 text-emerald-500" /> Distribuição
                    </h2>

                    <div className="lucid-card p-6 border-b-4 border-b-emerald-500 shadow-sm">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Receitas vs Despesas</p>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-2">
                                    <span className="text-emerald-500">Entradas (85%)</span>
                                    <span>R$ 84.500,00</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[85%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-2">
                                    <span className="text-red-500">Saídas (15%)</span>
                                    <span>R$ 15.200,00</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 w-[15%] rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lucid-card p-8 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 text-center relative overflow-hidden group shadow-sm">
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                        <Activity className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-50 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500" />
                        <h3 className="text-base font-black uppercase italic tracking-tight mb-2">Integração Bancária</h3>
                        <p className="text-xs text-muted-foreground mb-6">Em breve: Conciliação automática via Open Finance e emissão de boletos.</p>
                        <button className="w-full py-3 bg-card border border-border text-foreground text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm hover:border-emerald-500/50 transition-colors">
                            Ver Roadmap
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
