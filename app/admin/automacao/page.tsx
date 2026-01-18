"use client";

import React, { useState, useEffect } from 'react';
import {
    Cpu,
    Database,
    Bot,
    FileCheck,
    CloudIcon,
    Zap,
    Search,
    RefreshCw,
    Server,
    ShieldCheck,
    CheckCircle2,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AutomationSystemPage() {
    const [stats, setStats] = useState({
        totalClientes: 0,
        clientesComDrive: 0,
        totalAtendimentos: 0,
        atendimentosIA: 0,
        totalObrigacoes: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                // Total Clientes
                const { count: cTotal } = await supabase.from('clientes').select('*', { count: 'exact', head: true });

                // Clientes com Google Drive
                const { count: cDrive } = await supabase.from('clientes').select('*', { count: 'exact', head: true }).not('drive_folder_id', 'is', null);

                // Total Atendimentos
                const { count: aTotal } = await supabase.from('atendimentos').select('*', { count: 'exact', head: true });

                // Atendimentos IA
                const { count: aIA } = await supabase.from('atendimentos').select('*', { count: 'exact', head: true }).not('categoria_solicitacao', 'is', null);

                // Total Obrigações
                const { count: oTotal } = await supabase.from('obrigacoes_acessorias').select('*', { count: 'exact', head: true });

                setStats({
                    totalClientes: cTotal || 0,
                    clientesComDrive: cDrive || 0,
                    totalAtendimentos: aTotal || 0,
                    atendimentosIA: aIA || 0,
                    totalObrigacoes: oTotal || 0
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const features = [
        {
            title: "Processamento de Atendimento (IA)",
            description: "Agente de IA baseado em Google Gemini que analisa mensagens do WhatsApp, extrai categorias, define prioridades e sugere respostas cordiais automaticamente.",
            icon: Bot,
            status: stats.atendimentosIA > 0 ? "Ativo" : "Pronto",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            details: ["Classificação em 9 setores", "Definição de Prioridade (1-3)", "Auto-resposta seletiva"]
        },
        {
            title: "Importador Fiscal Inteligente",
            description: "Scanner automático de arquivos XML/PDF que identifica clientes pelo CNPJ/CPF, consulta a Receita Federal e realiza o cadastro automático no sistema.",
            icon: Database,
            status: "Operacional",
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            details: ["Leitura de NFe/CTe", "Integração BrasilAPI", "Dedução de Regime Tributário"]
        },
        {
            title: "Gestão de Obrigações",
            description: "Identificação e registro automático de pagamentos de DAS, FGTS, INSS e DARF a partir dos arquivos físicos processados pela contabilidade.",
            icon: FileCheck,
            status: "Monitorando",
            color: "text-green-400",
            bg: "bg-green-500/10",
            details: ["Baixa automática por competência", "Histórico de auditoria", "Link direto para o arquivo"]
        },
        {
            title: "Google Drive Automatizado",
            description: "Sincronização de pastas na nuvem com estrutura hierárquica automática: Documentos CRM > Categoria > Cliente > Ano > Mês.",
            icon: CloudIcon,
            status: "Integrando",
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
            details: ["Folder IDs persistentes", "Estrutura temporal (Ano/Mês)", "Acesso rápido do Admin"]
        },
        {
            title: "Monitor de Vencimentos",
            description: "Acompanhamento especializado de Alvarás (Funcionamento, Sanitário, Bombeiros, Ambiental) e Certificados Digitais (A1/A3).",
            icon: Calendar,
            status: "Configurado",
            color: "text-orange-400",
            bg: "bg-orange-500/10",
            details: ["Alertas de expiração", "Segmentação por tipo", "Painel de saúde do cliente"]
        },
        {
            title: "Infraestrutura Supabase",
            description: "Banco de dados relacional em tempo real com Row Level Security (RLS) para máxima segurança dos dados contábeis.",
            icon: Server,
            status: "Protegido",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            details: ["Escalabilidade elástica", "Backups automáticos", "API Rest nativa"]
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-neutral-910 rounded-3xl border border-neutral-800 p-8 lg:p-12">
                <div className="relative z-10 max-w-3xl">
                    <div className="flex items-center gap-2 text-primary-400 font-semibold mb-4 text-sm tracking-wider uppercase">
                        <Zap className="w-4 h-4 fill-current" />
                        Infrastructure & Intelligence
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-neutral-100 leading-tight mb-6">
                        Status do Ecossistema <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">Digital</span>
                    </h1>
                    <p className="text-lg text-neutral-400 leading-relaxed">
                        Visualize todas as camadas de inteligência e automação que potencializam a Brandão Contabilidade.
                        Do processamento de mensagens à gestão documental na nuvem.
                    </p>
                </div>

                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-500/5 to-transparent pointer-events-none" />
                <Cpu className="absolute -bottom-10 -right-10 w-64 h-64 text-neutral-800 opacity-20 rotate-12" />
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-primary-500/10 rounded-xl text-primary-400">
                        <Database className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Dados Processados</div>
                        <div className="text-xl font-bold">{stats.totalClientes} Clientes</div>
                    </div>
                </div>
                <div className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">IA Insights</div>
                        <div className="text-xl font-bold">{stats.atendimentosIA} Classificações</div>
                    </div>
                </div>
                <div className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
                        <RefreshCw className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Conciliação Fiscal</div>
                        <div className="text-xl font-bold">{stats.totalObrigacoes} Doc. Baixados</div>
                    </div>
                </div>
                <div className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
                        <CloudIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Drive Sync</div>
                        <div className="text-xl font-bold">{stats.clientesComDrive} Pastas</div>
                    </div>
                </div>
            </div>

            {/* Logic Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {features.map((f, idx) => (
                    <div
                        key={idx}
                        className="group bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-neutral-600 transition-all duration-300 relative"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${f.bg} ${f.color} group-hover:scale-110 transition-transform duration-300`}>
                                <f.icon className="w-7 h-7" />
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border border-neutral-700 uppercase tracking-tighter bg-neutral-800 ${f.color}`}>
                                {f.status}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-neutral-100 mb-3 group-hover:text-primary-400 transition-colors">
                            {f.title}
                        </h3>
                        <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                            {f.description}
                        </p>

                        <div className="space-y-2 mt-auto">
                            {f.details.map((d, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-neutral-500">
                                    <ShieldCheck className="w-3.5 h-3.5 text-neutral-700" />
                                    {d}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Call to Action or Footer */}
            <div className="p-8 bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(13,148,136,0.3)]">
                        <ShieldCheck className="w-8 h-8 text-neutral-950" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Segurança & Auditoria</h3>
                        <p className="text-neutral-400 text-sm">Todas as automações são logadas e auditáveis via Supabase e n8n logs.</p>
                    </div>
                </div>
                <button className="px-6 py-3 bg-neutral-100 text-neutral-950 rounded-xl font-bold text-sm hover:bg-white transition-colors flex items-center gap-2 group">
                    Explorar Logs do n8n
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
