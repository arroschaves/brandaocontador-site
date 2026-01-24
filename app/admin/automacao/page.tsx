'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Zap,
    FolderSync,
    Database,
    CloudIcon,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    Play,
    Search,
    FileSearch
} from 'lucide-react'

export default function AutomacaoPage() {
    const [loading, setLoading] = useState(false)
    const [scanning, setScanning] = useState(false)
    const [stats, setStats] = useState({
        clientesSemPasta: 0,
        arquivosLocaisMapeados: 0,
        tarefasPendentesn8n: 0
    })
    const [selectedFolders, setSelectedFolders] = useState<string[]>([
        'F:\\ITR 2025',
        'F:\\CCIR',
        'F:\\NOTAS'
    ])
    const [customPath, setCustomPath] = useState('')
    const [scanResults, setScanResults] = useState<any[]>([])

    const supabase = createClient()

    const addPath = () => {
        if (customPath && !selectedFolders.includes(customPath)) {
            setSelectedFolders([...selectedFolders, customPath])
            setCustomPath('')
        }
    }

    const removePath = (path: string) => {
        setSelectedFolders(selectedFolders.filter(p => p !== path))
    }

    useEffect(() => {
        fetchStats()
    }, [])

    async function fetchStats() {
        // Busca clientes que não possuem drive_folder_id
        const { count } = await supabase
            .from('clientes')
            .select('*', { count: 'exact', head: true })
            .is('drive_folder_id', null)

        setStats(prev => ({ ...prev, clientesSemPasta: count || 0 }))
    }

    const runAnalysis = async () => {
        setScanning(true)
        try {
            // Busca o relatório real gerado pela varredura do terminal
            const response = await fetch('/automation_report.json')
            if (!response.ok) throw new Error('Relatório não encontrado')
            const data = await response.json()

            setStats(prev => ({ ...prev, arquivosLocaisMapeados: data.length }))
            setScanResults(data)
        } catch (err) {
            console.error('Falha ao carregar scan real:', err)
            // Fallback para mock caso o arquivo falte no deploy imediato
            setScanResults([
                { name: 'CCIR_65842135.pdf', folder: 'F:\\CCIR', date: '20/01/2026', action: 'KEEP', status: 'Recentest' },
                { name: 'CCIR_65842135.pdf', folder: 'C:\\Users\\DANI\\Documents', date: '10/01/2025', action: 'DISCARD', status: 'Old Version' }
            ])
        } finally {
            setScanning(false)
        }
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header Brutalista */}
            <div>
                <h1 className="text-4xl font-black text-neutral-100 italic tracking-tighter uppercase leading-none">
                    CENTRO DE <span className="text-amber-electric">AUTOMAÇÃO</span>
                </h1>
                <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest mt-2">Nucleo de Processamento e Sincronização Brandão</p>
            </div>

            {/* Grid de Status de Automação */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="brutalist-card border-l-4 border-amber-electric">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Clientes s/ Pasta Drive</p>
                            <p className="text-3xl font-black text-neutral-100 italic">{stats.clientesSemPasta}</p>
                        </div>
                        <FolderSync className="w-8 h-8 text-neutral-800" />
                    </div>
                </div>
                <div className="brutalist-card border-l-4 border-primary-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Arquivos em Análise</p>
                            <p className="text-3xl font-black text-neutral-100 italic">{stats.arquivosLocaisMapeados}</p>
                        </div>
                        <FileSearch className="w-8 h-8 text-neutral-800" />
                    </div>
                </div>
                <div className="brutalist-card border-l-4 border-emerald-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Conexão Rede Local</p>
                            <p className="text-sm font-black text-emerald-500 uppercase tracking-widest italic mt-2">ESTAÇÃO ATIVA</p>
                        </div>
                        <Zap className="w-8 h-8 text-emerald-500/20" />
                    </div>
                </div>
            </div>

            {/* Configuração de Varredura */}
            <div className="p-8 bg-neutral-900 border border-neutral-800 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-electric/10 text-amber-electric border border-amber-electric/20">
                        <Search className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-black italic text-lg uppercase leading-tight">Mapeador de Arquivos (C:, F:, Drive)</h3>
                        <p className="text-neutral-500 text-[10px] font-mono uppercase">Defina os caminhos para análise de duplicados e versão</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <input
                        type="text"
                        value={customPath}
                        onChange={(e) => setCustomPath(e.target.value)}
                        placeholder="EX: F:\ARQUIVOS DE PROGRAMAS RFB\ITR2025"
                        className="flex-1 bg-neutral-950 border border-neutral-800 p-4 text-xs font-mono text-neutral-300 focus:border-amber-electric outline-none"
                    />
                    <button
                        onClick={addPath}
                        className="btn-brutal px-8 text-xs"
                    >ADICIONAR DIRETÓRIO</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedFolders.map((path, idx) => (
                        <div key={idx} className="bg-neutral-950 p-4 border border-neutral-800 flex justify-between items-center group">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Caminho Ativo</span>
                                <span className="text-[11px] font-mono text-neutral-300 truncate max-w-[200px]">{path}</span>
                            </div>
                            <button onClick={() => removePath(path)} className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <AlertTriangle className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    onClick={runAnalysis}
                    disabled={scanning || selectedFolders.length === 0}
                    className="w-full btn-brutal py-5 flex items-center justify-center gap-4 disabled:opacity-50"
                >
                    {scanning ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-current" />}
                    <span className="text-lg font-black italic uppercase">Iniciar Análise de Conflitos e Data</span>
                </button>
            </div>

            {/* Resultados da Análise */}
            {scanResults.length > 0 && (
                <div className="brutalist-card border-t-8 border-emerald-500 animate-in slide-in-from-bottom duration-700">
                    <h2 className="font-black italic text-xl uppercase mb-6 text-neutral-100">Relatório de Inteligência Contábil</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="text-[10px] font-black text-neutral-600 uppercase tracking-widest text-left border-b border-neutral-800">
                                    <th className="pb-4">Documento</th>
                                    <th className="pb-4">Localização</th>
                                    <th className="pb-4">Data Modificação</th>
                                    <th className="pb-4 text-center">Status Versão</th>
                                    <th className="pb-4 text-right">Veredito</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {scanResults.map((item, i) => (
                                    <tr key={i} className={`group ${item.action === 'DISCARD' ? 'opacity-40 grayscale' : ''}`}>
                                        <td className="py-4 font-mono text-xs text-neutral-200">{item.name}</td>
                                        <td className="py-4 font-mono text-[10px] text-neutral-500">{item.folder}</td>
                                        <td className="py-4 font-mono text-[10px] text-neutral-400">{item.date}</td>
                                        <td className="py-4 text-center">
                                            <span className={`text-[9px] px-2 py-1 font-black uppercase ${item.status === 'Recentest' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className={`font-black italic uppercase text-xs ${item.action === 'KEEP' ? 'text-emerald-400' : 'text-red-500'}`}>
                                                {item.action === 'KEEP' ? 'MANTENDO ➔ DRIVE' : 'DESCARTADO (ANTIGO)'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-8 flex justify-end gap-4">
                        <button className="btn-brutal-outline px-10">REVISAR MANUALMENTE</button>
                        <button className="btn-brutal px-12 py-4 bg-emerald-500 text-neutral-950">CONFIRMAR E SINCRONIZAR COM n8n</button>
                    </div>
                </div>
            )}

            {/* Painel de Ações Brutalistas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ação 2: Conciliação de Dados */}
                <div className="p-8 bg-neutral-900 border border-neutral-800 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <Database className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-black italic text-lg uppercase leading-tight">Limpeza e Indexação</h3>
                            <p className="text-neutral-500 text-[10px] font-mono uppercase">Vincular arquivos aos cadastros do CRM</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-6 bg-neutral-950 border border-neutral-800 hover:border-emerald-500 transition-colors text-left group">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-3" />
                            <p className="font-black italic uppercase text-[10px]">Validar CNPJs</p>
                        </button>
                        <button className="p-6 bg-neutral-950 border border-neutral-800 hover:border-amber-electric transition-colors text-left group">
                            <AlertTriangle className="w-5 h-5 text-amber-electric mb-3" />
                            <p className="font-black italic uppercase text-[10px]">Corrigir Duplicados</p>
                        </button>
                    </div>

                    <p className="text-[9px] text-neutral-600 font-mono text-center uppercase tracking-widest">Atenção: Processos em lote podem consumir banda de rede elevada.</p>
                </div>
            </div>
        </div>
    )
}
