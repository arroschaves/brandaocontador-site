'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { File, FileText, Image as ImageIcon, FileSpreadsheet, Download, ExternalLink, Loader2, FolderOpen, RefreshCw, MessageCircle, Mail } from 'lucide-react'

interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime: string;
    webViewLink: string;
    webContentLink?: string;
    iconLink?: string;
}

interface ClientDriveExplorerProps {
    clientId: string;
}

export default function ClientDriveExplorer({ clientId }: ClientDriveExplorerProps) {
    const [files, setFiles] = useState<DriveFile[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
    const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null, name: string }[]>([{ id: null, name: 'Raiz' }])
    const [sendingWA, setSendingWA] = useState<string | null>(null)
    const [sendingEmail, setSendingEmail] = useState<string | null>(null)

    const handleSendWhatsApp = async (fileId: string, fileName: string) => {
        try {
            if (!confirm(`Deseja enviar o documento "${fileName}" via WhatsApp para este cliente?`)) return;
            setSendingWA(fileId)
            const res = await fetch('/api/whatsapp/send-document', {
                method: 'POST',
                body: JSON.stringify({ clientId, fileId, fileName })
            })
            if (!res.ok) throw new Error((await res.json()).error)
            alert('Documento enviado com sucesso via WhatsApp!')
        } catch (err: any) {
            alert('Erro ao enviar via WhatsApp: ' + err.message)
        } finally {
            setSendingWA(null)
        }
    }

    const handleSendEmail = async (fileId: string, fileName: string) => {
        try {
            if (!confirm(`Deseja enviar o documento "${fileName}" via E-mail para este cliente?`)) return;
            setSendingEmail(fileId)
            const res = await fetch('/api/email/send-document', {
                method: 'POST',
                body: JSON.stringify({ clientId, fileId, fileName })
            })
            if (!res.ok) throw new Error((await res.json()).error)
            alert('Documento enviado com sucesso via E-mail!')
        } catch (err: any) {
            alert('Erro ao enviar via E-mail: ' + err.message)
        } finally {
            setSendingEmail(null)
        }
    }

    const fetchFiles = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const url = currentFolderId
                ? `/api/drive/files?folderId=${currentFolderId}`
                : `/api/drive/files?clientId=${clientId}`

            const res = await fetch(url)
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Erro ao carregar arquivos da nuvem')
            }
            const data = await res.json()
            setFiles(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [clientId, currentFolderId])

    useEffect(() => {
        if (clientId) {
            fetchFiles()
        }
    }, [clientId, currentFolderId, fetchFiles])

    const handleFolderClick = (folderId: string, folderName: string) => {
        setCurrentFolderId(folderId)
        setBreadcrumbs(prev => [...prev, { id: folderId, name: folderName }])
    }

    const handleBreadcrumbClick = (index: number) => {
        const target = breadcrumbs[index]
        setCurrentFolderId(target.id)
        setBreadcrumbs(prev => prev.slice(0, index + 1))
    }

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />
        if (mimeType.includes('image')) return <ImageIcon className="w-8 h-8 text-blue-500" aria-hidden="true" />
        if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="w-8 h-8 text-emerald-500" />
        if (mimeType.includes('folder')) return <FolderOpen className="w-8 h-8 text-amber-500" />
        return <File className="w-8 h-8 text-gray-400" />
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-16 bg-secondary/10 rounded-3xl border border-dashed border-border/60">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                    <Loader2 className="w-10 h-10 animate-spin text-primary relative mb-5 mx-auto" />
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-4">Conectando ao Google Workspace...</p>
                <p className="text-[10px] font-medium text-muted-foreground/60 mt-2">Sincronizando arquivos da nuvem em tempo real.</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-10 text-center bg-destructive/5 rounded-3xl border border-destructive/20 shadow-sm">
                <p className="text-sm font-bold text-destructive/80 uppercase tracking-widest">{error}</p>
                <button onClick={fetchFiles} className="mt-6 px-6 py-3 bg-background hover:bg-secondary text-foreground rounded-xl shadow-sm border border-border flex items-center justify-center gap-2 mx-auto transition-colors text-xs font-bold uppercase tracking-tight">
                    <RefreshCw className="w-4 h-4" /> Tentar Novamente
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <div>
                    <h3 className="text-xs font-bold uppercase text-foreground tracking-widest">Nuvem do Cliente</h3>
                    <div className="flex items-center gap-2 mt-2">
                        {breadcrumbs.map((crumb, idx) => (
                            <React.Fragment key={idx}>
                                <button
                                    onClick={() => handleBreadcrumbClick(idx)}
                                    className={`text-[11px] font-bold tracking-tight hover:underline ${idx === breadcrumbs.length - 1 ? 'text-primary' : 'text-muted-foreground'}`}
                                >
                                    {crumb.name}
                                </button>
                                {idx < breadcrumbs.length - 1 && <span className="text-muted-foreground/40 text-[10px]">&gt;</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                <button onClick={fetchFiles} className="p-3 bg-card border border-border/60 rounded-xl hover:text-primary transition-all text-muted-foreground shadow-sm group">
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                </button>
            </div>

            {files.length === 0 ? (
                <div className="p-16 text-center bg-secondary/20 rounded-3xl border border-dashed border-border/60">
                    <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-bold text-muted-foreground opacity-60 uppercase tracking-widest">Pasta Vazia Vazia</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-2">Nenhum documento encontrado na nuvem para este cliente.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {files.map(file => (
                        <div key={file.id} className="lucid-card p-5 flex flex-col justify-between border-border/60 bg-card hover:bg-secondary/40 transition-all shadow-sm group border-l-4 hover:border-l-primary cursor-default">
                            <div className="flex items-start gap-4 cursor-pointer" onClick={() => file.mimeType.includes('folder') ? handleFolderClick(file.id, file.name) : null}>
                                <div className="p-2.5 bg-muted/40 rounded-xl group-hover:scale-105 group-hover:bg-primary/5 transition-all shadow-inner">
                                    {getFileIcon(file.mimeType)}
                                </div>
                                <div className="overflow-hidden flex-1">
                                    <h4 className={`text-[13px] font-bold text-foreground truncate pr-2 ${file.mimeType.includes('folder') ? 'group-hover:text-amber-500' : ''}`} title={file.name}>{file.name}</h4>
                                    <p className="text-[10px] font-medium text-muted-foreground mt-1.5 flex items-center gap-1.5">
                                        <ClockIcon className="w-3 h-3 opacity-60" />
                                        {new Date(file.modifiedTime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2.5 mt-5 pt-5 border-t border-border/40">
                                {!file.mimeType.includes('folder') && (
                                    <div className="flex flex-col gap-2.5 w-full">
                                        <div className="flex gap-2.5">
                                            <a
                                                href={file.webViewLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex-1 py-2.5 bg-primary/10 text-primary border border-primary/20 text-center rounded-xl text-[10px] font-bold uppercase tracking-tight hover:bg-primary hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" /> Visualizar
                                            </a>
                                            {file.webContentLink && (
                                                <a
                                                    href={file.webContentLink}
                                                    download
                                                    className="py-2.5 px-4 bg-secondary border border-border/60 text-muted-foreground hover:text-foreground rounded-xl hover:bg-card transition-all shadow-sm flex items-center justify-center"
                                                    title="Baixar Arquivo via Acesso Direto"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex gap-2.5">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleSendWhatsApp(file.id, file.name) }}
                                                disabled={sendingWA === file.id || sendingEmail === file.id}
                                                className="flex-1 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-center rounded-xl text-[10px] font-bold uppercase tracking-tight hover:bg-emerald-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                                                title="Enviar via WhatsApp"
                                            >
                                                {sendingWA === file.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}
                                                WhatsApp
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleSendEmail(file.id, file.name) }}
                                                disabled={sendingEmail === file.id || sendingWA === file.id}
                                                className="flex-1 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 text-center rounded-xl text-[10px] font-bold uppercase tracking-tight hover:bg-blue-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                                                title="Enviar via E-mail"
                                            >
                                                {sendingEmail === file.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                                                E-mail
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {file.mimeType.includes('folder') && (
                                    <button
                                        onClick={() => handleFolderClick(file.id, file.name)}
                                        className="w-full py-2.5 bg-amber-50 text-amber-600 border border-amber-200 text-center rounded-xl text-[10px] font-bold uppercase tracking-tight hover:bg-amber-100 transition-all shadow-sm flex items-center justify-center gap-2"
                                    >
                                        <FolderOpen className="w-3.5 h-3.5" /> Abrir Pasta
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function ClockIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}
