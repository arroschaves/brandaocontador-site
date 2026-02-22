'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
    Wallet,
    RefreshCw,
    AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic';

export default function FinanceiroPage() {
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [mrr, setMrr] = useState(0)
    const [pending, setPending] = useState(0)
    const [expenses, setExpenses] = useState(0)
    const [transactions, setTransactions] = useState<any[]>([])
    const [setupRequired, setSetupRequired] = useState(false)
    const supabase = createClient()

    const fetchFinancialData = useCallback(async () => {
        setLoading(true)
        setSetupRequired(false)
        try {
            // 1. Tentar buscar empresas com status Ativa e honorario_valor
            // Se a coluna honorario_valor não existir, o PostgREST lança erro
            const { data, error } = await supabase
                .schema('core')
                .from('empresas')
                .select('id, razao_social, status, honorario_valor')
                .eq('status', 'Ativa')

            if (error) {
                // Se o erro for PGRST200 e referenciar honorario_valor, significa que a coluna falta
                if (error.message.includes('honorario_valor')) {
                    setSetupRequired(true)
                    setMrr(0)
                    setTransactions([])
                    return
                }
                throw error
            }

            const ativos = data || []

            // 2. Calcular MRR
            const totalMrr = ativos.reduce((acc, curr) => acc + (Number(curr.honorario_valor) || 0), 0)
            setMrr(totalMrr)

            // 3. Simular "Geração de Faturas/Lançamentos" baseada nos honorários do Mês
            const month = new Date().toLocaleString('pt-BR', { month: 'short', year: 'numeric' }).toUpperCase()
            const generatedTransactions = ativos
                .filter(a => Number(a.honorario_valor) > 0)
                .map((empresa, index) => ({
                    id: `HON-${month}-${empresa.id.substring(0, 4).toUpperCase()}`,
                    client: empresa.razao_social,
                    amount: Number(empresa.honorario_valor),
                    type: 'INCOME',
                    // Simula alguns PIXs como pendentes ou pagos de forma estática apenas visual (enquanto não criamos Tabela Real de Lançamentos)
                    status: index % 3 === 0 ? 'PENDING' : 'PAID',
                    date: new Date().toISOString()
                }))

            // Ordena os pendentes no topo
            generatedTransactions.sort((a, b) => {
                if (a.status === 'PENDING' && b.status === 'PAID') return -1;
                if (a.status === 'PAID' && b.status === 'PENDING') return 1;
                return 0;
            });

            // Adiciona despesas mockadas para fechar o Dashboard MVP
            const amostral = [
                ...generatedTransactions,
                { id: 'DESP-FOLHA', client: 'Folha de Pagamento', amount: 15400.00, type: 'EXPENSE', status: 'PENDING', date: new Date().toISOString() },
                { id: 'AWS-CLOUD', client: 'Amazon Web Services', amount: 850.00, type: 'EXPENSE', status: 'PAID', date: new Date(Date.now() - 86400000).toISOString() }
            ]

            setTransactions(amostral)

            // Calc Pendencias (Amostral de Honorarios Atrasados)
            const pend = generatedTransactions.filter(t => t.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0)
            setPending(pend)

            // Calc Gastos
            setExpenses(15400 + 850)

        } catch (err) {
            console.error('Falha Financeiro:', err)
        } finally {
            setLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        fetchFinancialData()
    }, [fetchFinancialData])

    const growth = totalMrr => totalMrr > 0 ? 12.5 : 0; // Estático para UI
    const lucro = ((mrr - expenses) / (mrr || 1)) * 100

    const filteredTransactions = transactions.filter(t =>
        t.client.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase())
    )

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
                    <button onClick={fetchFinancialData} className="h-12 px-4 bg-secondary text-muted-foreground hover:bg-card hover:text-foreground transition-all rounded-xl shadow-sm">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
                    </button>
                    <button className="h-12 px-6 bg-secondary text-muted-foreground font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 border border-border/50 hover:bg-card hover:text-foreground transition-all rounded-xl shadow-sm">
                        <Filter className="w-4 h-4" /> Filtros
                    </button>
                    <button className="h-12 px-8 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black italic text-sm uppercase tracking-tight flex items-center gap-2 transition-all rounded-xl shadow-lg shadow-emerald-500/20">
                        <TrendingUp className="w-5 h-5" /> Exportar DRE
                    </button>
                </div>
            </div>

            {setupRequired && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-4 items-start shadow-sm">
                    <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                    <div>
                        <h3 className="text-red-500 font-black text-sm uppercase tracking-tight">Setup Necessário</h3>
                        <p className="text-xs text-neutral-400 mt-1">
                            A coluna <code className="bg-red-500/20 px-1 py-0.5 rounded text-red-400">honorario_valor</code> do tipo numérico não foi encontrada na tabela <code className="bg-red-500/20 px-1 py-0.5 rounded text-red-400">core.empresas</code>.
                            Vá ao painel do Supabase, edite a tabela Empresas e adicione essa coluna para habilitar a inteligência do fluxo de caixa e cálculo do MRR.
                        </p>
                    </div>
                </div>
            )}

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                    { label: 'MRR Atual', value: mrr, icon: Wallet, color: 'text-emerald-500', trend: mrr > 0 ? '+12.5%' : '0%', isPos: true },
                    { label: 'Inadimplência', value: pending, icon: DollarSign, color: 'text-amber-500', trend: '-2.1%', isPos: true },
                    { label: 'Despesas Fixas', value: expenses, icon: Activity, color: 'text-red-500', trend: '+5.0%', isPos: false },
                    { label: 'Margem de Lucro', value: isNaN(lucro) || mrr === 0 ? 0 : lucro, icon: Percent, color: 'text-blue-500', trend: '+1.2%', isPos: true, isPercent: true },
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
                            <p className={`text-3xl font-black italic mt-1 tracking-tighter ${kpi.value < 0 ? 'text-red-500' : 'text-foreground'}`}>
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
                                {loading && transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground text-xs uppercase tracking-widest font-black">
                                            Lendo Livro Caixa...
                                        </td>
                                    </tr>
                                ) : filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground text-xs uppercase tracking-widest font-black">
                                            Nenhum lançamento encontrado
                                        </td>
                                    </tr>
                                ) : filteredTransactions.map((tx, i) => (
                                    <tr key={i} className="hover:bg-secondary/40 transition-colors group">
                                        <td className="p-4 pl-6 font-mono text-xs text-muted-foreground/60 group-hover:text-emerald-500 transition-colors">{tx.id}</td>
                                        <td className="p-4 text-sm font-bold flex items-center gap-2">
                                            {tx.client}
                                            {tx.id.startsWith('HON') && <span className="px-2 py-0.5 bg-neutral-800 text-[9px] uppercase tracking-widest rounded text-neutral-400">Mensal</span>}
                                        </td>
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
                                    <span className="text-emerald-500">Entradas ({mrr > 0 ? ((mrr / (mrr + expenses)) * 100).toFixed(0) : 0}%)</span>
                                    <span>R$ {mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all" style={{ width: `${mrr > 0 ? ((mrr / (mrr + expenses)) * 100) : 0}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-2">
                                    <span className="text-red-500">Saídas ({expenses > 0 ? ((expenses / (mrr + expenses)) * 100).toFixed(0) : 0}%)</span>
                                    <span>R$ {expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${expenses > 0 ? ((expenses / (mrr + expenses)) * 100) : 0}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lucid-card p-8 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 text-center relative overflow-hidden group shadow-sm">
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                        <Activity className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-50 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500" />
                        <h3 className="text-base font-black uppercase italic tracking-tight mb-2">Integração Bancária</h3>
                        <p className="text-xs text-muted-foreground mb-6">Em breve: Conciliação automática via Open Finance e emissão de boletos via ASAAS.</p>
                        <button className="w-full py-3 bg-card border border-border text-foreground text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm hover:border-emerald-500/50 transition-colors">
                            Ver Roadmap
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
