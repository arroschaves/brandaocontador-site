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
    FileSearch,
    Monitor,
    Clock,
    Plus,
    Trash2
} from 'lucide-react'

export default function AutomacaoPage() {
    const [loading, setLoading] = useState(false)
    const [scanning, setScanning] = useState(false)
    const [stats, setStats] = useState({
        clientesSemPasta: 0,
        arquivosLocaisMapeados: 0,
        tarefasPendentesn8n: 0
    })
    const [selectedFolders, setSelectedFolders] = useState<string[]>([])
    const [customPath, setCustomPath] = useState('')
    const [scanResults, setScanResults] = useState<any[]>([])

    // Estados para Notebooks (Sentinelas)
    const [notebooks, setNotebooks] = useState<any[]>([])
    const [notebookFolderInput, setNotebookFolderInput] = useState('')

    const supabase = createClient()

    useEffect(() => {
        fetchStats()
        loadSavedConfig()
        fetchNotebooks()
    }, [])

    async function fetchNotebooks() {
        // Busca configurações
        const { data: configs } = await supabase
            .from('admin_settings')
            .select('*')
            .ilike('key', 'notebook_config_%')

        // Busca status (last seen)
        const { data: statusData } = await supabase
            .from('admin_settings')
            .select('*')
            .ilike('key', 'notebook_status_%')

        const combined = (configs || []).map(nb => {
            const hostname = nb.key.replace('notebook_config_', '')
            const status = statusData?.find(s => s.key === `notebook_status_${hostname}`)?.value || {}
            return {
                hostname,
                folders: nb.value || [],
                last_seen: status.last_seen,
                status: status.status || 'offline'
            }
        })
        setNotebooks(combined)
    }

    async function saveNotebookConfig(hostname: string, folders: string[]) {
        setLoading(true)
        try {
            await supabase
                .from('admin_settings')
                .upsert({
                    key: `notebook_config_${hostname}`,
                    value: folders,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'key' })
            fetchNotebooks()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function loadSavedConfig() {
        const { data } = await supabase
            .from('admin_settings')
            .select('value')
            .eq('key', 'automation_folders')
            .single()

        if (data?.value) {
            setSelectedFolders(data.value)
        }
    }

    async function saveConfig(folders: string[]) {
        try {
            await supabase
                .from('admin_settings')
                .upsert({
                    key: 'automation_folders',
                    value: folders,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'key' })
        } catch (e) {
            console.error(e)
        }
    }

    const addPath = async () => {
        if (customPath && !selectedFolders.includes(customPath)) {
            const newFolders = [...selectedFolders, customPath]
            setSelectedFolders(newFolders)
            setCustomPath('')
            await saveConfig(newFolders)
        }
    }

    const removePath = async (path: string) => {
        const newFolders = selectedFolders.filter(p => p !== path)
        setSelectedFolders(newFolders)
        await saveConfig(newFolders)
    }

    async function fetchStats() {
        const { count } = await supabase
            .from('clientes')
            .select('*', { count: 'exact', head: true })
            .is('drive_folder_id', null)

        setStats(prev => ({ ...prev, clientesSemPasta: count || 0 }))
    }

    const runAnalysis = async () => {
        setScanning(true)
        // Simulação ou chamada real se houver endpoint
        setTimeout(() => {
            setScanResults([
                { name: 'CCIR_65842135.pdf', folder: 'F:\\CCIR', date: '20/01/2026', action: 'KEEP', status: 'Recentest' },
                { name: 'RG_ALESSANDRO.pdf', folder: 'C:\\Docs', date: '10/01/2019', action: 'KEEP', status: 'Historical Unique' }
            ])
            setScanning(false)
        }, 1500)
    }

    const handleConfirmSync = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/automation/sync', { method: 'POST' })
            if (res.ok) alert('Sincronização iniciada!')
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header Brutalista */}
            <div>
                <h1 className="text-4xl font-black text-neutral-100 italic tracking-tighter uppercase leading-none">
                    CENTRO DE <span className="text-amber-500">AUTOMAÇÃO</span>
                </h1>
                <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest mt-2">NÚCLEO DE SENTINELAS BRANDÃO 2026</p>
            </div>

            {/* Grid de Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-neutral-900 p-6 border-l-4 border-amber-500">
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Notebooks Ativos</p>
                    <p className="text-3xl font-black text-neutral-100 italic">{notebooks.filter(n => n.status === 'online').length}</p>
                </div>
                <div className="bg-neutral-900 p-6 border-l-4 border-primary-500">
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Clientes s/ Pasta</p>
                    <p className="text-3xl font-black text-neutral-100 italic">{stats.clientesSemPasta}</p>
                </div>
                <div className="bg-neutral-900 p-6 border-l-4 border-emerald-500">
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Status do Sistema</p>
                    <p className="text-sm font-black text-emerald-500 uppercase italic mt-2 text-primary-500">ESTAÇÃO CENTRAL ATIVA</p>
                </div>
            </div>

            {/* Gestão de Notebooks (Sentinelas) */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden p-8 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-500/10 text-primary-500 border border-primary-500/20">
                        <Monitor className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-black italic text-lg uppercase leading-tight">Gestão de Notebooks (Sentinelas)</h3>
                        <p className="text-neutral-500 text-[10px] font-mono uppercase">Controle remoto das pastas monitoradas em cada notebook</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    {notebooks.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-neutral-800 rounded-xl text-neutral-600 font-mono text-xs uppercase">
                            Nenhum notebook registrado. Execute o script Sentinela nos notebooks primeiro.
                        </div>
                    ) : (
                        notebooks.map((nb) => (
                            <div key={nb.hostname} className="bg-neutral-950 p-6 border border-neutral-800 rounded-xl space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${nb.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                        <h4 className="font-black italic text-neutral-200 uppercase">{nb.hostname}</h4>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase">
                                        <Clock className="w-3 h-3" />
                                        Visto em: {nb.last_seen ? new Date(nb.last_seen).toLocaleString('pt-BR') : 'Nunca'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Pastas Vigilantes:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {nb.folders.map((f: string, i: number) => (
                                            <div key={i} className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800 text-[11px] font-mono text-neutral-400">
                                                {f}
                                                <button onClick={() => {
                                                    const newFolders = nb.folders.filter((_: any, idx: number) => idx !== i)
                                                    saveNotebookConfig(nb.hostname, newFolders)
                                                }} className="text-red-500 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Novo caminho C:\..."
                                        className="flex-1 bg-neutral-900 border border-neutral-800 px-4 py-2 text-xs font-mono text-neutral-300 focus:border-primary-500 outline-none rounded-lg"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const val = (e.target as HTMLInputElement).value
                                                if (val) {
                                                    saveNotebookConfig(nb.hostname, [...nb.folders, val])
                                                        ; (e.target as HTMLInputElement).value = ''
                                                }
                                            }
                                        }}
                                    />
                                    <button className="bg-primary-500 text-neutral-950 px-4 py-2 rounded-lg text-xs font-black uppercase flex items-center gap-2">
                                        <Plus className="w-4 h-4" /> Adicionar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Configuração de Varredura Central */}
            <div className="p-8 bg-neutral-900 border border-neutral-800 space-y-8 rounded-2xl">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Search className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-black italic text-lg uppercase leading-tight">Varredura do Servidor Central</h3>
                        <p className="text-neutral-500 text-[10px] font-mono uppercase">Mapeamento para análise de duplicados no SSD Principal</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <input
                        type="text"
                        value={customPath}
                        onChange={(e) => setCustomPath(e.target.value)}
                        placeholder="EX: F:\ARQUIVOS DE PROGRAMAS RFB\ITR2025"
                        className="flex-1 bg-neutral-950 border border-neutral-800 p-4 text-xs font-mono text-neutral-300 focus:border-amber-500 outline-none rounded-xl"
                    />
                    <button onClick={addPath} className="bg-amber-500 text-neutral-950 px-8 py-4 rounded-xl font-black italic text-xs uppercase hover:bg-amber-400 transition-all">ADICIONAR</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedFolders.map((path, idx) => (
                        <div key={idx} className="bg-neutral-950 p-4 border border-neutral-800 flex justify-between items-center group rounded-xl">
                            <span className="text-[11px] font-mono text-neutral-400 truncate max-w-[200px]">{path}</span>
                            <button onClick={() => removePath(path)} className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    onClick={runAnalysis}
                    disabled={scanning || selectedFolders.length === 0}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 py-6 flex items-center justify-center gap-4 disabled:opacity-50 transition-all border border-neutral-700 rounded-2xl"
                >
                    {scanning ? <Loader2 className="w-6 h-6 animate-spin text-amber-500" /> : <Play className="w-6 h-6 text-amber-500 fill-current" />}
                    <span className="text-lg font-black italic uppercase text-neutral-200">Iniciar Auditoria de Conflitos</span>
                </button>
            </div>

            {/* Resultados */}
            {scanResults.length > 0 && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 animate-in slide-in-from-bottom duration-700">
                    <h2 className="font-black italic text-xl uppercase mb-6 text-neutral-100">Relatório de Inteligência Contábil</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="text-[10px] font-black text-neutral-600 uppercase tracking-widest text-left border-b border-neutral-800">
                                    <th className="pb-4">Documento</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4 text-right">Veredito</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {scanResults.map((item, i) => (
                                    <tr key={i} className="group">
                                        <td className="py-4 font-mono text-xs text-neutral-200">{item.name}</td>
                                        <td className="py-4">
                                            <span className="text-[9px] px-2 py-1 font-black bg-emerald-500/10 text-emerald-500 uppercase">{item.status}</span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className="font-black italic font-mono text-[10px] text-emerald-400">EM PASTA ➔ DRIVE</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
