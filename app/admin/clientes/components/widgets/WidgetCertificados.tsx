'use client'

import { useState, useEffect, useCallback } from 'react'
import { Shield, Plus, Upload, Eye, EyeOff, Calendar, AlertTriangle } from 'lucide-react'
import WidgetCard from './WidgetCard'

interface Certificado {
    id: string
    tipo: 'cpf_a1' | 'cpf_a3' | 'cnpj_a1' | 'cnpj_a3'
    data_emissao: string
    data_vencimento: string
    status: 'ativo' | 'vencido' | 'renovado' | 'cancelado'
    observacoes?: string
}

interface WidgetCertificadosProps {
    clientId: string
}

export default function WidgetCertificados({ clientId }: WidgetCertificadosProps) {
    const [certificados, setCertificados] = useState<Certificado[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)

    const fetchCertificados = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/clientes/${clientId}/certificados-digitais`)
            const data = await res.json()
            if (res.ok) {
                setCertificados(Array.isArray(data) ? data : [])
            }
        } catch (err) {
            console.error('Erro ao buscar certificados:', err)
        } finally {
            setLoading(false)
        }
    }, [clientId])

    useEffect(() => {
        fetchCertificados()
    }, [fetchCertificados])

    // Calcular dias restantes
    const getDiasRestantes = (dataVencimento: string) => {
        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)
        const venc = new Date(dataVencimento)
        const diff = Math.ceil((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
        return diff
    }

    // Determinar status visual
    const getStatusVisual = (diasRestantes: number, status: string) => {
        if (status === 'vencido' || diasRestantes < 0) return 'red'
        if (diasRestantes <= 30) return 'yellow'
        return 'green'
    }

    // Buscar certificado por tipo
    const getCertByTipo = (tipo: Certificado['tipo']) => {
        return certificados.find(c => c.tipo === tipo)
    }

    // Mapear label dos tipos
    const tipoLabels = {
        cpf_a1: 'CPF A1',
        cpf_a3: 'CPF A3',
        cnpj_a1: 'CNPJ A1',
        cnpj_a3: 'CNPJ A3'
    }

    // Calcular status geral do widget (pior status prevalece)
    const overallStatus = () => {
        if (certificados.length === 0) return 'neutral'
        const temVencido = certificados.some(c => c.status === 'vencido' || getDiasRestantes(c.data_vencimento) < 0)
        if (temVencido) return 'red'
        const temVencendo = certificados.some(c => getDiasRestantes(c.data_vencimento) <= 30)
        if (temVencendo) return 'yellow'
        return 'green'
    }

    const tipos: Certificado['tipo'][] = ['cpf_a1', 'cpf_a3', 'cnpj_a1', 'cnpj_a3']

    return (
        <WidgetCard
            title="Certificados Digitais"
            icon={<Shield className="w-5 h-5" />}
            statusColor={overallStatus()}
            badge={certificados.length}
            actions={
                <button
                    onClick={() => setShowAddModal(true)}
                    className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded transition-colors"
                    aria-label="Adicionar certificado"
                >
                    <Plus className="w-4 h-4" />
                </button>
            }
        >
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tipos.map(tipo => {
                        const cert = getCertByTipo(tipo)
                        const diasRestantes = cert ? getDiasRestantes(cert.data_vencimento) : null
                        const statusVisual = cert && diasRestantes !== null ? getStatusVisual(diasRestantes, cert.status) : 'neutral'

                        return (
                            <div
                                key={tipo}
                                className={`p-4 rounded-xl border transition-all ${cert
                                    ? statusVisual === 'red'
                                        ? 'bg-red-500/5 border-red-500/30 hover:border-red-500'
                                        : statusVisual === 'yellow'
                                            ? 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500'
                                            : 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500'
                                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                                    }`}
                            >
                                {/* Header do Card */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${cert
                                            ? statusVisual === 'red' ? 'bg-red-500'
                                                : statusVisual === 'yellow' ? 'bg-amber-500'
                                                    : 'bg-emerald-500'
                                            : 'bg-neutral-600'
                                            }`} />
                                        <span className="text-[9px] font-black text-white uppercase">
                                            {tipoLabels[tipo]}
                                        </span>
                                    </div>
                                    {cert && (
                                        <span className={`text-[7px] font-bold uppercase px-2 py-0.5 rounded ${cert.status === 'ativo' ? 'bg-emerald-500/20 text-emerald-500' :
                                            cert.status === 'vencido' ? 'bg-red-500/20 text-red-500' :
                                                'bg-neutral-700 text-neutral-400'
                                            }`}>
                                            {cert.status}
                                        </span>
                                    )}
                                </div>

                                {/* Conteúdo */}
                                {cert ? (
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-[7px] text-neutral-600 uppercase font-bold">Vencimento</p>
                                            <p className="text-[10px] text-white font-mono">
                                                {new Date(cert.data_vencimento).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[7px] text-neutral-600 uppercase font-bold">Dias Restantes</p>
                                            <p className={`text-[10px] font-black ${diasRestantes && diasRestantes < 0 ? 'text-red-500' :
                                                diasRestantes && diasRestantes <= 30 ? 'text-amber-500' :
                                                    'text-emerald-500'
                                                }`}>
                                                {diasRestantes && diasRestantes < 0
                                                    ? `Vencido há ${Math.abs(diasRestantes)} dias`
                                                    : `${diasRestantes} dias`
                                                }
                                            </p>
                                        </div>
                                        {cert.observacoes && (
                                            <div>
                                                <p className="text-[7px] text-neutral-600 uppercase font-bold">Obs</p>
                                                <p className="text-[9px] text-neutral-400 italic">{cert.observacoes}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-4 text-center">
                                        <p className="text-[9px] text-neutral-600 uppercase font-bold mb-2">Não Cadastrado</p>
                                        <button
                                            onClick={() => {
                                                // TODO: Abrir modal para adicionar certificado A3
                                                setShowAddModal(true)
                                            }}
                                            className="text-[8px] text-emerald-500 hover:text-emerald-400 uppercase font-black flex items-center gap-1 mx-auto"
                                        >
                                            <Plus className="w-3 h-3" />
                                            Adicionar Vencimento
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Resumo de Alertas */}
            {certificados.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-800">
                    <div className="flex items-center gap-2 text-[8px] text-neutral-500 uppercase font-bold">
                        <AlertTriangle className="w-3 h-3" />
                        {certificados.filter(c => getDiasRestantes(c.data_vencimento) <= 30).length > 0 ? (
                            <span className="text-amber-500">
                                {certificados.filter(c => getDiasRestantes(c.data_vencimento) <= 30).length} certificado(s) vencendo
                            </span>
                        ) : (
                            <span className="text-emerald-500">Todos os certificados OK</span>
                        )}
                    </div>
                </div>
            )}
        </WidgetCard>
    )
}
