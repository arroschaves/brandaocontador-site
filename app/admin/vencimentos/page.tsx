"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Calendar,
    AlertTriangle,
    CheckCircle2,
    Search,
    Clock,
    User,
    ArrowRight,
    ExternalLink
} from 'lucide-react';

export default function VencimentosPage() {
    const [vencimentos, setVencimentos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchVencimentos = useCallback(async () => {
        try {
            // Buscamos clientes que tenham algum vencimento preenchido
            const { data, error } = await supabase
                .from('clientes')
                .select(`
                    id, 
                    nome, 
                    vencimento_alvara_funcionamento, 
                    vencimento_alvara_sanitario, 
                    vencimento_alvara_bombeiros, 
                    vencimento_alvara_ambiental,
                    vencimento_certificado_a1,
                    vencimento_certificado_a3,
                    drive_folder_id
                `);

            if (error) throw error;

            // Transformar em lista de eventos de vencimento
            const events: any[] = [];
            data?.forEach((c: any) => {
                const mapeamento = [
                    { field: 'vencimento_alvara_funcionamento', label: 'Alvará Funcionamento' },
                    { field: 'vencimento_alvara_sanitario', label: 'Alvará Sanitário' },
                    { field: 'vencimento_alvara_bombeiros', label: 'Alvará Bombeiros' },
                    { field: 'vencimento_alvara_ambiental', label: 'Alvará Ambiental' },
                    { field: 'vencimento_certificado_a1', label: 'Certificado A1' },
                    { field: 'vencimento_certificado_a3', label: 'Certificado A3' },
                ];

                mapeamento.forEach(m => {
                    const client = c as any;
                    if (client[m.field]) {
                        events.push({
                            id: `${c.id}-${m.field}`,
                            cliente: c.nome,
                            tipo: m.label,
                            data: client[m.field],
                            folder: c.drive_folder_id
                        });
                    }
                });
            });

            // Ordenar por data mais próxima
            events.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
            setVencimentos(events);
        } catch (err) {
            console.error('Erro ao buscar vencimentos:', err);
        } finally {
            setLoading(false);
        }
    }, [])

    useEffect(() => {
        fetchVencimentos();
    }, [fetchVencimentos]);

    const getStatusInfo = (dateStr: string) => {
        const today = new Date();
        const due = new Date(dateStr);
        const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: 'Vencido', color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: <AlertTriangle className="w-4 h-4" /> };
        if (diffDays <= 7) return { label: 'Crítico', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20', icon: <AlertTriangle className="w-4 h-4" /> };
        if (diffDays <= 30) return { label: 'Atenção', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', icon: <Clock className="w-4 h-4" /> };
        return { label: 'Regular', color: 'text-green-500 bg-green-500/10 border-green-500/20', icon: <CheckCircle2 className="w-4 h-4" /> };
    };

    const filtered = vencimentos.filter(v =>
        v.cliente.toLowerCase().includes(search.toLowerCase()) ||
        v.tipo.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-neutral-100 italic">Gestão de Vencimentos</h1>
                <p className="text-neutral-400 mt-1">Controle de CNDs, Alvarás e Certificados Digitais.</p>
            </div>

            <div className="flex gap-4 items-center bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Filtrar por cliente ou documento..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-neutral-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary-500 text-neutral-200"
                    />
                </div>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-20 text-neutral-500">Carregando vencimentos...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-neutral-900/50 rounded-2xl border border-neutral-800">
                        <Calendar className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-neutral-300">Nenhum vencimento próximo</h3>
                        <p className="text-neutral-500">Tudo em dia ou nenhum dado cadastrado.</p>
                    </div>
                ) : (
                    filtered.map((v) => {
                        const status = getStatusInfo(v.data);
                        return (
                            <div key={v.id} className="bg-neutral-900/50 p-5 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${status.color.split(' ')[0]}`}>
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-neutral-200">{v.cliente}</h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-bold uppercase tracking-wider ${status.color}`}>
                                                {status.icon} {status.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500">
                                            <span className="font-medium text-neutral-400">{v.tipo}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                Vence em: {new Date(v.data).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {v.folder && (
                                        <a
                                            href={`https://drive.google.com/drive/folders/${v.folder}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-500 hover:text-primary-500 transition-colors"
                                            title="Ver no Google Drive"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                        </a>
                                    )}
                                    <button className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-sm font-medium transition-colors">
                                        Notificar <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
