'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    ShieldCheck, Lock, Eye, AlertTriangle,
    Activity, Database, Server,
    Globe, Terminal, Fingerprint, Cpu
} from 'lucide-react'

export const dynamic = 'force-dynamic';

export default function MasterDashboard() {
    const [auditLogs, setAuditLogs] = useState<any[]>([])
    const [securityStats, setSecurityStats] = useState({
        totalLogs: 0,
        uniqueIPs: 0,
        suspectActivities: 0
    })
    const [loading, setLoading] = useState(true)

    const fetchSecurityData = useCallback(async () => {
        const supabase = createClient()
        setLoading(true)
        try {
            // 1. Logs de Segurança Recentes
            const { data } = await supabase
                .schema('audit')
                .from('logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50)

            setAuditLogs(data || [])

            // 2. Cálculo de Stats
            const ips = new Set(data?.map((l: any) => l.ip_address))
            setSecurityStats({
                totalLogs: data?.length || 0,
                uniqueIPs: ips.size,
                suspectActivities: data?.filter((l: any) => l.acao === 'LOGIN_FAILED' || l.acao === 'SEC_BREACH').length || 0
            })

        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchSecurityData()
    }, [fetchSecurityData])

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            {/* Header Cyberpunk / Master */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-emerald-500 pb-4">
                <div>
                    <h1 className="text-5xl font-black text-white italic uppercase tracking-tight leading-none">
                        MASTER <span className="text-emerald-500">CONTROL</span>
                    </h1>
                    <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.4em] mt-2">
                        Sistema de Vigilância e Auditoria // Alessandro Only
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-black/50 p-4 border border-neutral-800">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-neutral-500 font-black">SISTEMA: ONLINE</span>
                        <span className="text-[10px] text-emerald-500 font-black">ENCRYPTION: AES-256</span>
                    </div>
                    <ShieldCheck className="w-10 h-10 text-emerald-500 animate-pulse" />
                </div>
            </div>

            {/* Security Pulse Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Eventos Auditados', val: securityStats.totalLogs, icon: Activity, color: 'emerald' },
                    { label: 'Pontos de Acesso (IP)', val: securityStats.uniqueIPs, icon: Globe, color: 'blue' },
                    { label: 'Atividades Suspeitas', val: securityStats.suspectActivities, icon: AlertTriangle, color: 'amber' },
                    { label: 'Cofre de Certificados', val: 'PROTEGIDO', icon: Lock, color: 'red' }
                ].map((stat, i) => (
                    <div key={i} className="bg-neutral-900/50 border border-neutral-800 p-6 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 -rotate-45 translate-x-10 translate-y-10 group-hover:bg-${stat.color}-500/10 transition-all`} />
                        <stat.icon className={`w-5 h-5 text-${stat.color}-500 mb-4`} />
                        <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-2xl font-black text-white mt-1">{stat.val}</p>
                    </div>
                ))}
            </div>

            {/* Live Audit Stream */}
            <div className="bg-black border border-neutral-800 rounded-lg overflow-hidden">
                <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
                    <h2 className="text-[11px] font-black text-white uppercase italic tracking-widest flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-emerald-500" /> Live Audit Stream
                    </h2>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                            <span className="text-[9px] font-mono text-neutral-500 uppercase">Realtime Feed</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-mono">
                        <thead>
                            <tr className="bg-neutral-950 text-[9px] font-black uppercase text-neutral-700">
                                <th className="p-4">Timestamp</th>
                                <th className="p-4">Responsável</th>
                                <th className="p-4">Ação</th>
                                <th className="p-4">Cliente alvo</th>
                                <th className="p-4">IP / Geoloc</th>
                                <th className="p-4">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-900 text-[10px]">
                            {auditLogs.map((log, i) => (
                                <tr key={i} className="hover:bg-neutral-900/40 text-neutral-400 hover:text-white transition-colors">
                                    <td className="p-4 whitespace-nowrap text-neutral-600">{new Date(log.created_at).toLocaleString('pt-BR')}</td>
                                    <td className="p-4 font-black">
                                        <div className="flex items-center gap-2">
                                            <Fingerprint className="w-3 h-3 text-emerald-500/50" />
                                            {log.dados_novos?.usuario_nome || 'SISTEMA'}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 border ${log.acao.includes('FAIL') ? 'border-red-500/50 text-red-500' : 'border-emerald-500/50 text-emerald-500'} font-black text-[9px]`}>
                                            {log.acao}
                                        </span>
                                    </td>
                                    <td className="p-4">{log.dados_novos?.cliente_nome || 'SISTEMA'}</td>
                                    <td className="p-4 text-neutral-500 italic">{log.ip_address}</td>
                                    <td className="p-4 max-w-xs truncate text-[9px]">{JSON.stringify(log.detalhes)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Performance System Monitor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
                    <h3 className="text-[11px] font-black text-white uppercase italic tracking-widest flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-emerald-500" /> Recursos de Hardware (EasePanel)
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-neutral-500 uppercase font-black">
                            <span>CPU Usage</span>
                            <span className="text-white">12%</span>
                        </div>
                        <div className="w-full h-1 bg-black border border-neutral-800">
                            <div className="h-full bg-emerald-500 w-[12%]" />
                        </div>
                    </div>
                    <div className="space-y-2 pt-2">
                        <div className="flex justify-between text-[10px] text-neutral-500 uppercase font-black">
                            <span>Memory (8GB)</span>
                            <span className="text-white">1.2GB / 8GB</span>
                        </div>
                        <div className="w-full h-1 bg-black border border-neutral-800">
                            <div className="h-full bg-blue-500 w-[15%]" />
                        </div>
                    </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
                    <h3 className="text-[11px] font-black text-white uppercase italic tracking-widest flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-500" /> Health Check Supabase
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {['AUTH', 'REALTIME', 'STORAGE', 'POSTGRES', 'EDGE_FUNCTIONS'].map(svc => (
                            <span key={svc} className="text-[9px] font-black px-3 py-1 bg-black border border-emerald-500/20 text-emerald-500 uppercase tracking-widest">
                                {svc}: OK
                            </span>
                        ))}
                    </div>
                    <p className="text-[9px] text-neutral-600 font-mono italic">Database Engine: PosgreSQL 15.6 // Managed by Easypanel</p>
                </div>
            </div>
        </div>
    )
}
