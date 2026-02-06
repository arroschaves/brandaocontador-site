'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Calendar, AlertCircle } from 'lucide-react'

interface Agendamento {
    id?: string
    tipo_pendencia: string
    subtipo?: string
    descricao: string
    data_vencimento: string
    alertas_config?: {
        dias_antes: number[]
        canais: string[]
    }
}

interface PendenciaModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (agendamento: Partial<Agendamento>) => void
    agendamento?: Agendamento | null
    clientId: string
}

export default function PendenciaModal({ isOpen, onClose, onSave, agendamento, clientId }: PendenciaModalProps) {
    const [formData, setFormData] = useState<Partial<Agendamento>>({
        tipo_pendencia: 'emissao_mensal',
        subtipo: '',
        descricao: '',
        data_vencimento: '',
        alertas_config: {
            dias_antes: [7, 3, 1],
            canais: ['sistema', 'email', 'whatsapp']
        }
    })

    useEffect(() => {
        if (agendamento) {
            setFormData(agendamento)
        } else {
            // Reset ao abrir modal para novo
            setFormData({
                tipo_pendencia: 'emissao_mensal',
                subtipo: '',
                descricao: '',
                data_vencimento: '',
                alertas_config: {
                    dias_antes: [7, 3, 1],
                    canais: ['sistema', 'email', 'whatsapp']
                }
            })
        }
    }, [agendamento, isOpen])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    const toggleDiaAntes = (dia: number) => {
        const dias = formData.alertas_config?.dias_antes || []
        const novos = dias.includes(dia)
            ? dias.filter(d => d !== dia)
            : [...dias, dia].sort((a, b) => b - a)

        setFormData({
            ...formData,
            alertas_config: {
                ...formData.alertas_config!,
                dias_antes: novos
            }
        })
    }

    const toggleCanal = (canal: string) => {
        const canais = formData.alertas_config?.canais || []
        const novos = canais.includes(canal)
            ? canais.filter(c => c !== canal)
            : [...canais, canal]

        setFormData({
            ...formData,
            alertas_config: {
                ...formData.alertas_config!,
                canais: novos
            }
        })
    }

    // Subtipos dinâmicos baseados no tipo
    const getSubtipos = () => {
        switch (formData.tipo_pendencia) {
            case 'emissao_mensal':
                return ['DAS', 'FGTS', 'INSS', 'DCTFWeb', 'Folha de Pagamento', 'DARF']
            case 'certificado_vencendo':
                return ['A1 PJ', 'A1 PF', 'A3 PJ', 'A3 PF']
            case 'certidao_negativa':
                return ['Federal', 'Estadual', 'Municipal', 'FGTS', 'Trabalhista']
            case 'alvara':
                return ['Funcionamento', 'Sanitário', 'Bombeiros', 'Ambiental']
            default:
                return []
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-black">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500 text-black rounded-lg">
                            <Plus className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-white font-black uppercase italic text-sm">
                                {agendamento ? 'Editar Pendência' : 'Nova Pendência'}
                            </h2>
                            <p className="text-[9px] font-mono text-neutral-600 uppercase">
                                Agendar lembrete automático
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-900 rounded-lg text-neutral-500 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Tipo de Pendência */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-neutral-500 uppercase">Tipo de Pendência *</label>
                            <select
                                value={formData.tipo_pendencia}
                                onChange={(e) => setFormData({ ...formData, tipo_pendencia: e.target.value, subtipo: '' })}
                                className="w-full bg-neutral-900 border border-neutral-800 p-3 rounded text-[10px] text-white uppercase font-bold"
                                required
                            >
                                <option value="emissao_mensal">Emissão Mensal</option>
                                <option value="parcelamento">Parcelamento</option>
                                <option value="dossie">Dossiê Técnico</option>
                                <option value="certificado_vencendo">Certificado Digital</option>
                                <option value="certidao_negativa">Certidão Negativa</option>
                                <option value="alvara">Alvará</option>
                                <option value="outro">Outro</option>
                            </select>
                        </div>

                        {/* Subtipo (condicional) */}
                        {getSubtipos().length > 0 && (
                            <div className="space-y-2">
                                <label className="text-[8px] font-black text-neutral-500 uppercase">Subtipo</label>
                                <select
                                    value={formData.subtipo}
                                    onChange={(e) => setFormData({ ...formData, subtipo: e.target.value })}
                                    className="w-full bg-neutral-900 border border-neutral-800 p-3 rounded text-[10px] text-white uppercase font-bold"
                                >
                                    <option value="">Selecione...</option>
                                    {getSubtipos().map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Descrição */}
                    <div className="space-y-2">
                        <label className="text-[8px] font-black text-neutral-500 uppercase">Descrição *</label>
                        <input
                            type="text"
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-800 p-3 rounded text-[10px] text-white"
                            placeholder="Ex: Emitir DAS de Fevereiro/2026"
                            required
                        />
                    </div>

                    {/* Data de Vencimento */}
                    <div className="space-y-2">
                        <label className="text-[8px] font-black text-neutral-500 uppercase flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            Data de Vencimento *
                        </label>
                        <input
                            type="date"
                            value={formData.data_vencimento}
                            onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-800 p-3 rounded text-[10px] text-white"
                            required
                        />
                    </div>

                    {/* Configuração de Alertas */}
                    <div className="p-5 bg-black border border-neutral-800 rounded-xl space-y-4">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <h3 className="text-[10px] font-black text-white uppercase">Configurar Alertas Automáticos</h3>
                        </div>

                        {/* Dias antes */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold text-neutral-500 uppercase">Alertar com antecedência de:</label>
                            <div className="flex gap-2">
                                {[7, 5, 3, 2, 1].map(dia => (
                                    <button
                                        key={dia}
                                        type="button"
                                        onClick={() => toggleDiaAntes(dia)}
                                        className={`px-3 py-2 text-[9px] font-black uppercase rounded transition-all ${formData.alertas_config?.dias_antes.includes(dia)
                                                ? 'bg-emerald-500 text-black'
                                                : 'bg-neutral-900 border border-neutral-800 text-neutral-500 hover:text-white'
                                            }`}
                                    >
                                        {dia} {dia === 1 ? 'dia' : 'dias'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Canais */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold text-neutral-500 uppercase">Enviar alerta via:</label>
                            <div className="flex gap-2">
                                {['sistema', 'email', 'whatsapp'].map(canal => (
                                    <button
                                        key={canal}
                                        type="button"
                                        onClick={() => toggleCanal(canal)}
                                        className={`px-4 py-2 text-[9px] font-black uppercase rounded transition-all ${formData.alertas_config?.canais.includes(canal)
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-neutral-900 border border-neutral-800 text-neutral-500 hover:text-white'
                                            }`}
                                    >
                                        {canal === 'sistema' ? '🔔 Sistema' : canal === 'email' ? '📧 Email' : '💬 WhatsApp'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-4 border-t border-neutral-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-neutral-900 border border-neutral-800 text-[10px] font-black text-white hover:bg-neutral-800 transition-all uppercase rounded"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-[10px] font-black text-black uppercase rounded transition-all shadow-xl shadow-emerald-500/10"
                        >
                            {agendamento ? 'Salvar Alterações' : 'Criar Pendência'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
