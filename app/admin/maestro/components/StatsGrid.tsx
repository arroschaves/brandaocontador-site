import { ArrowUpRight, ArrowDownRight, Users, FileCheck, AlertTriangle, Activity } from "lucide-react";

interface StatProps {
    label: string;
    value: string;
    change?: number;
    icon: React.ElementType;
    className?: string; // Cor do ícone
}

export function StatsGrid({
    totalClientes = 0,
    totalFazendas = 0,
    pendencias = 0,
    arquivosHoje = 0
}: { totalClientes: number, totalFazendas: number, pendencias: number, arquivosHoje: number }) {

    const stats: StatProps[] = [
        {
            label: "Total de Clientes",
            value: totalClientes.toString(),
            change: 12, // Exemplo
            icon: Users,
            className: "text-blue-500",
        },
        {
            label: "Fazendas Ativas",
            value: totalFazendas.toString(),
            change: 5, // Exemplo
            icon: Activity,
            className: "text-emerald-500",
        },
        {
            label: "Obrigações Pendentes",
            value: pendencias.toString(),
            change: -2, // Bom sinal
            icon: AlertTriangle,
            className: "text-amber-500",
        },
        {
            label: "Arquivos Enviados (Hoje)",
            value: arquivosHoje.toString(),
            change: 25, // Comparado a ontem
            icon: FileCheck,
            className: "text-indigo-500",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
                <div key={i} className="bg-card border border-border/50 shadow-sm rounded-xl p-6 transition-all hover:shadow-md hover:border-primary/20 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                            <h3 className="text-2xl font-bold mt-1 tracking-tight text-foreground">{stat.value}</h3>
                        </div>
                        <div className={`p-3 rounded-xl bg-muted/50 group-hover:bg-muted transition-colors ${stat.className}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                    </div>
                    {stat.change !== undefined && (
                        <div className="mt-4 flex items-center text-xs font-medium">
                            <span className={stat.change >= 0 ? "text-emerald-500 flex items-center" : "text-rose-500 flex items-center"}>
                                {stat.change >= 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                                {Math.abs(stat.change)}%
                            </span>
                            <span className="text-muted-foreground ml-2">vs mês anterior</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
