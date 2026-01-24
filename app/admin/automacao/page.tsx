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
    const [selectedFolders, setSelectedFolders] = useState<string[]>([])
    const [scanResults, setScanResults] = useState<any[]>([])

    const sourceFolders = [
        { id: 'f-notas', path: 'F:\\NOTAS ORGANIZADAS', label: 'Notas Organizadas (F:)' },
        { id: 'f-itr', path: 'F:\\Arquivos de Programas RFB\\ITR2025', label: 'ITR 2025 (F:)' },
        { id: 'f-ccir', path: 'F:\\Users\\DANI\\Documents\\CCIR', label: 'CCIR (F:)' },
        { id: 'c-docs', path: 'C:\\Users\\DANI\\Documents', label: 'Documentos Usuário (C:)' }
    ]
    const supabase = createClient()

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

    const toggleFolder = (path: string) => {
        setSelectedFolders(prev =>
            prev.includes(path) ? prev.filter(f => f !== path) : [...prev, path]
        )
    }

    const runAnalysis = async () => {
        setScanning(true)
        // Simulando a análise de duplicados e datas
        setTimeout(() => {
            setStats(prev => ({ ...prev, arquivosLocaisMapeados: 342 }))
            setScanResults([
                { name: 'CCIR_CLIENTE_X.pdf', source: 'F:', date: '20/01/2026', action: 'KEEP (NEWER)' },
                { name: 'ITR_CLIENTE_Y.doc', source: 'C:', date: '15/01/2026', action: 'DELETE (OLDER)' }
            ])
            setScanning(false)
        }, 3000)
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
                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Arquivos Locais Identificados</p>
                            <p className="text-3xl font-black text-neutral-100 italic">{stats.arquivosLocaisMapeados}</p>
                        </div>
                        <FileSearch className="w-8 h-8 text-neutral-800" />
                    </div>
                </div>
                <div className="brutalist-card border-l-4 border-emerald-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Conexão n8n</p>
                            <p className="text-sm font-black text-emerald-500 uppercase tracking-widest italic mt-2">SISTEMA ONLINE</p>
                        </div>
                        <Zap className="w-8 h-8 text-emerald-500/20" />
                    </div>
                </div>
            </div>

            {/* Painel de Ações Brutalistas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ação 1: Migração para Drive */}
                <div className="p-8 bg-neutral-900 border border-neutral-800 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-electric/10 text-amber-electric border border-amber-electric/20">
                            <CloudIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-black italic text-lg uppercase leading-tight">Limpeza e Sincronização: Local ➔ Drive</h3>
                            <p className="text-neutral-500 text-[10px] font-mono uppercase">Detecta duplicados e mantém os mais recentes</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-neutral-950 border border-neutral-800">
                            <p className="text-[10px] text-neutral-500 font-bold uppercase mb-4">Selecione as pastas para processar:</p>
                            <div className="space-y-3">
                                {sourceFolders.map(folder => (
                                    <div
                                        key={folder.id}
                                        className={`p-3 border flex items-center justify-between cursor-pointer transition-colors ${selectedFolders.includes(folder.path) ? 'border-amber-electric bg-amber-electric/5' : 'border-neutral-800 hover:border-neutral-700'}`}
                                        onClick={() => toggleFolder(folder.path)}
                                    >
                                        <span className="font-mono text-[10px] text-neutral-300">{folder.label}</span>
                                        {selectedFolders.includes(folder.path) && <CheckCircle2 className="w-4 h-4 text-amber-electric" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={runAnalysis}
                            disabled={scanning || selectedFolders.length === 0}
                            className="w-full btn-brutal flex items-center justify-center gap-3 py-4 disabled:opacity-50"
                        >
                            {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                            <span className="font-black italic uppercase text-sm">Analisar e Resolver Conflitos</span>
                        </button>
                    </div>

                    {scanResults.length > 0 && (
                        <div className="mt-6 border-t border-neutral-800 pt-6 animate-in slide-in-from-top duration-500">
                            <p className="text-[10px] font-black text-amber-electric uppercase mb-3">CONFLITOS DETECTADOS (AMOSTRA):</p>
                            <div className="space-y-2">
                                {scanResults.map((res, i) => (
                                    <div key={i} className="flex justify-between items-center bg-neutral-950 p-2 border border-neutral-800 font-mono text-[9px]">
                                        <span className="text-neutral-300">{res.name}</span>
                                        <span className="text-neutral-500">{res.date}</span>
                                        <span className="text-emerald-500 font-black italic">{res.action}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 bg-emerald-500 text-neutral-950 font-black italic uppercase text-xs py-3 hover:bg-emerald-400 transition-colors">Confirmar e Subir pro Drive</button>
                        </div>
                    )}
                </div>

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
