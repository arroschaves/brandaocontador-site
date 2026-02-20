'use client'

import React, { useState, useEffect } from 'react'
import { X, Calendar, Cpu, Zap, Shield, FileText, Send, Terminal } from 'lucide-react'
import { TarefaSoberana } from './AgendaCalendar'

interface FormData {
    tipo_pendencia: string
    subtipo: string
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
    onSave: (data: FormData) => void
    agendamento?: TarefaSoberana | null
    clientId: string
}

/**
 * PendenciaModal - Masterpiece UI
 * Módulo de Ingestão de Operações Soberanas.
 */
export default function PendenciaModal({ isOpen, onClose, onSave, agendamento, clientId }: PendenciaModalProps) {
    const [formData, setFormData] = useState<FormData>({
        tipo_pendencia: 'emissao_mensal',
        subtipo: '',
        descricao: '',
        data_vencimento: '',
    })

    useEffect(() => {
        if (agendamento) {
            // Extrair tipo e subtipo do título [TIPO] SUBTIPO
            const match = agendamento.titulo.match(/\[(.*?)\] (.*)/)
            setFormData({
                tipo_pendencia: match ? match[1] : 'outro',
                subtipo: match ? match[2] : '',
                descricao: agendamento.descricao,
                data_vencimento: agendamento.data_limite.split('T')[0],
            })
        } else {
            setFormData({
                tipo_pendencia: 'emissao_mensal',
                subtipo: '',
                descricao: '',
                data_vencimento: '',
            })
        }
    }, [agendamento, isOpen])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    const getSubtipos = () => {
        switch (formData.tipo_pendencia) {
            case 'emissao_mensal': return ['DAS', 'FGTS', 'INSS', 'DCTFWeb', 'Folha de Pagamento', 'DARF']
            case 'certificado_vencendo': return ['A1 PJ', 'A1 PF', 'A3 PJ', 'A3 PF']
            case 'certidao_negativa': return ['Federal', 'Estadual', 'Municipal', 'FGTS', 'Trabalhista']
            default: return []
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500">
            <div className="w-full max-w-6xl bg-neutral-950 border border-neutral-900 shadow-[0_0_100px_rgba(0,0,0,1)] rounded-[3.5rem] overflow-hidden relative flex flex-col md:flex-row h-auto max-h-[92vh]">

                {/* Painel de Controle Lateral (Contexto) */}
                <div className="md:w-2/5 bg-black border-r border-neutral-900 p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden shrink-0">
                    <div className="absolute top-[-5%] left-[-10%] p-8 opacity-[0.02] pointer-events-none">
                        <Terminal className="w-[500px] h-[500px] text-white" />
                    </div>

                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                            <Shield className="w-10 h-10 text-black" />
                        </div>
                        <h2 className="text-4xl text-white font-black uppercase italic tracking-tighter leading-[0.9] mb-6">
                            Módulo de <br />Ingestão <br /><span className="text-emerald-500">Soberana</span>
                        </h2>
                        <p className="text-[11px] text-neutral-600 font-mono uppercase tracking-[0.3em] mb-12 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Protocolo de Segurança Ativo
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-5 p-6 bg-neutral-900/40 border border-neutral-800 rounded-3xl backdrop-blur-sm">
                                <Zap className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
                                <div>
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Padrão de Conformidade</h4>
                                    <p className="text-[9px] text-neutral-500 font-bold uppercase leading-relaxed">
                                        Os registros serão auditados pelo sistema Maestro para garantir integridade e prazos.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <div className="text-[9px] text-neutral-700 font-black uppercase tracking-[0.4em] mb-3">Engine Status</div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></div>
                            <span className="text-[10px] text-white font-mono uppercase font-bold">LXT-ORE: Sincronizado</span>
                        </div>
                    </div>
                </div>

                {/* Área de Formulário Operational */}
                <form onSubmit={handleSubmit} className="flex-1 p-12 lg:p-16 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-start mb-16">
                        <div>
                            <span className="text-emerald-500 font-black text-[9px] uppercase tracking-[0.5em] mb-2 block">Terminal de Operações</span>
                            <h3 className="text-white font-black text-xl uppercase tracking-widest">Entrada de Parâmetros</h3>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-14 h-14 flex items-center justify-center bg-neutral-900 hover:bg-white hover:text-black rounded-2xl transition-all duration-300"
                        >
                            <X size={28} />
                        </button>
                    </div>

                    <div className="space-y-12">
                        {/* Categoria e Subtipo */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={14} className="text-emerald-500" /> Categoria Operacional
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.tipo_pendencia}
                                        onChange={(e) => setFormData({ ...formData, tipo_pendencia: e.target.value, subtipo: '' })}
                                        className="w-full bg-black border border-neutral-900 p-6 rounded-3xl text-[12px] text-white uppercase font-black focus:border-emerald-500 focus:bg-neutral-950 outline-none transition-all appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="emissao_mensal">EMISSÃO MENSAL</option>
                                        <option value="parcelamento">PARCELAMENTO</option>
                                        <option value="certificado_vencendo">CERTIFICADO DIGITAL</option>
                                        <option value="certidaon_egativa">CERTIDÃO NEGATIVA</option>
                                        <option value="outro">OUTRO PROTOCOLO</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                                        <Terminal size={12} />
                                    </div>
                                </div>
                            </div>

                            {getSubtipos().length > 0 && (
                                <div className="space-y-4 animate-in slide-in-from-right duration-700">
                                    <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Especificação da Tarefa</label>
                                    <div className="relative">
                                        <select
                                            value={formData.subtipo}
                                            onChange={(e) => setFormData({ ...formData, subtipo: e.target.value })}
                                            className="w-full bg-black border border-neutral-900 p-6 rounded-3xl text-[12px] text-white uppercase font-black focus:border-emerald-500 focus:bg-neutral-950 outline-none transition-all appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="">SELECIONE A SUB-CATEGORIA...</option>
                                            {getSubtipos().map(sub => (
                                                <option key={sub} value={sub}>{sub}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                                            <Shield size={12} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Descrição Detalhada */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Descrição Crítica da Operação</label>
                            <input
                                type="text"
                                value={formData.descricao}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                className="w-full bg-black border border-neutral-900 p-6 rounded-3xl text-sm text-white placeholder-neutral-800 focus:border-emerald-500 focus:bg-neutral-950 outline-none transition-all font-bold"
                                placeholder="DESCREVA A MISSÃO COM PRECISÃO..."
                                required
                            />
                        </div>

                        {/* Data de Vencimento */}
                        <div className="space-y-4 max-w-sm">
                            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={14} className="text-emerald-500" /> Deadline Inegociável
                            </label>
                            <input
                                type="date"
                                value={formData.data_vencimento}
                                onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                                className="w-full bg-black border border-neutral-900 p-6 rounded-3xl text-[12px] text-white uppercase font-black focus:border-emerald-500 outline-none transition-all invert-[0.95] hue-rotate-180 brightness-150"
                                required
                            />
                        </div>

                        {/* Painel de Ações Finais */}
                        <div className="flex flex-col sm:flex-row gap-6 pt-12">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 h-20 bg-neutral-950 border border-neutral-900 text-[11px] font-black text-neutral-600 hover:text-white hover:border-neutral-700 transition-all uppercase rounded-3xl"
                            >
                                Abortar Operação
                            </button>
                            <button
                                type="submit"
                                className="flex-[2] h-20 bg-white text-black text-[12px] font-black uppercase italic rounded-3xl hover:bg-emerald-500 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex items-center justify-center gap-4 border-b-[8px] border-neutral-300 hover:border-emerald-700 active:border-b-0 active:translate-y-2 group"
                            >
                                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                {agendamento ? 'ATUALIZAR REGISTRO SOBERANO' : 'LANÇAR NA REDE MAESTRO'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
