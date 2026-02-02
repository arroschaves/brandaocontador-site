'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Users, UserPlus, ShieldAlert, Activity,
    Mail, Trash2, CheckCircle2, XCircle,
    Lock, Search, Filter, Monitor, Server,
    ArrowUpRight, BadgeCheck
} from 'lucide-react'

export default function EquipePage() {
    const [equipe, setEquipe] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [stats, setStats] = useState({ totalAtivos: 0, totalAcoesHoje: 0 })

    const supabase = createClient()

    useEffect(() => {
        fetchEquipe()
    }, [])

    async function fetchEquipe() {
        setLoading(true)
        try {
            const { data } = await supabase
                .from('equipe')
                .select('*')
                .order('nome')

            setEquipe(data || [])

            // Stats básicas
            const { count: acoesHoje } = await supabase
                .from('auditoria_crm')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', new Date().toISOString().split('T')[0])

            setStats({
                totalAtivos: data?.filter(f => f.ativo).length || 0,
                totalAcoesHoje: acoesHoje || 0
            })
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleInvite() {
        const nome = prompt('Nome do Funcionário:')
        const email = prompt('E-mail (enviará convite de acesso):')
        const cargo = prompt('Cargo:')

        if (!nome || !email) return

        try {
            const res = await fetch('/api/equipe/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, cargo })
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'Falha ao enviar convite')

            alert('✅ CONVITE ENVIADO: O funcionário receberá as instruções em instantes.')
            fetchEquipe()
        } catch (err: any) {
            alert('❌ ERRO NO PROCESSO: ' + err.message)
        }
    }

    async function handleDelete(id: string, nome: string) {
        if (!confirm(`TEM CERTEZA QUE DESEJA REMOVER ${nome.toUpperCase()}? ESTA AÇÃO É IRREVERSÍVEL NO MAESTRO.`)) return

        try {
            const { error } = await supabase.from('equipe').delete().eq('id', id)
            if (error) throw error
            fetchEquipe()
        } catch (err: any) {
            alert('ERRO AO DELETAR: ' + err.message)
        }
    }

    const filteredEquipe = equipe.filter(f =>
        f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Maestro */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tight leading-none mb-2">
                        GESTÃO DE EQUIPE <span className="text-emerald-500">MAESTRO</span>
                    </h1>
                    <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em]">
                        Controle 360º de Produtividade & Segurança LGPD
                    </p>
                </div>
                <button
                    onClick={handleInvite}
                    className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 text-xs font-black uppercase transition-all transform hover:-translate-y-1 active:translate-y-0"
                >
                    <UserPlus className="w-4 h-4" /> CONVIDAR FUNCIONÁRIO
                </button>
            </div>

            {/* Stats Cards - Brutalist Style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neutral-900 border-l-4 border-emerald-500 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <Users className="w-5 h-5 text-emerald-500" />
                        <span className="text-[10px] font-bold text-neutral-600 uppercase">Total Ativos</span>
                    </div>
                    <p className="text-3xl font-black text-white">{stats.totalAtivos}</p>
                </div>
                <div className="bg-neutral-900 border-l-4 border-amber-500 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <Activity className="w-5 h-5 text-amber-500" />
                        <span className="text-[10px] font-bold text-neutral-600 uppercase">Ações Hoje</span>
                    </div>
                    <p className="text-3xl font-black text-white">{stats.totalAcoesHoje}</p>
                </div>
                <div className="bg-neutral-900 border-l-4 border-blue-500 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <ShieldAlert className="w-5 h-5 text-blue-500" />
                        <span className="text-[10px] font-bold text-neutral-600 uppercase">Security Score</span>
                    </div>
                    <p className="text-3xl font-black text-white">98%</p>
                </div>
            </div>

            {/* List Table - Sharp & Technical */}
            <div className="bg-neutral-900 border border-neutral-800">
                <div className="p-4 border-b border-neutral-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                        <input
                            type="text"
                            placeholder="PESQUISAR NOME OU EMAIL..."
                            className="w-full bg-black border border-neutral-800 py-2 pl-10 pr-4 text-[11px] font-bold uppercase tracking-wider text-neutral-300 outline-none focus:border-emerald-500 transition-colors"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 border border-neutral-800 text-neutral-500 hover:text-white"><Filter className="w-4 h-4" /></button>
                        <button onClick={fetchEquipe} className="p-2 border border-neutral-800 text-neutral-500 hover:text-white"><Activity className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-800 bg-black/50">
                                <th className="p-4 text-[10px] font-black uppercase text-neutral-500 tracking-widest">Colaborador</th>
                                <th className="p-4 text-[10px] font-black uppercase text-neutral-500 tracking-widest">Cargo</th>
                                <th className="p-4 text-[10px] font-black uppercase text-neutral-500 tracking-widest">Status</th>
                                <th className="p-4 text-[10px] font-black uppercase text-neutral-500 tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Activity className="w-8 h-8 text-emerald-500 animate-spin" />
                                            <span className="text-[10px] font-black uppercase text-neutral-700">Auditando Equipe...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredEquipe.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center text-[11px] text-neutral-600 uppercase italic">
                                        Nenhum colaborador encontrado no banco de dados.
                                    </td>
                                </tr>
                            ) : filteredEquipe.map(item => (
                                <tr key={item.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center font-black text-neutral-500 group-hover:border-emerald-500 group-hover:text-emerald-500 transition-all">
                                                {item.nome.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-[12px] font-black text-white uppercase italic">{item.nome}</p>
                                                <p className="text-[9px] font-mono text-neutral-600">{item.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-[9px] font-black px-2 py-1 bg-neutral-800 text-neutral-400 uppercase tracking-widest">
                                            {item.cargo || 'OPERACIONAL'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${item.ativo ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            <span className="text-[10px] font-black uppercase text-neutral-300">{item.ativo ? 'ATIVO' : 'SUSPENSO'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 bg-neutral-800 hover:text-emerald-500 transition-colors" title="Editar Permissões"><Lock className="w-4 h-4" /></button>
                                            <button
                                                onClick={() => handleDelete(item.id, item.nome)}
                                                className="p-2 bg-neutral-800 hover:text-red-500 transition-colors"
                                                title="Remover"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Security Notice */}
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex items-start gap-4">
                <BadgeCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                    <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-1">Nota de Segurança LGPD</h4>
                    <p className="text-[9px] text-neutral-500 leading-relaxed max-w-2xl">
                        Este CRM implementa o protocolo Zero-Trust. Todas as ações realizadas por colaboradores são rastreadas
                        por IP, User-Agent e Timestamp. Os Certificados A1 são armazenados em cofre criptografado AES-256 e protegidos
                        pelo Alessandro Master Controller.
                    </p>
                </div>
            </div>
        </div>
    )
}
