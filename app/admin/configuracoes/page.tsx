'use client'

import React from 'react'
import { Settings, User, Mail, Building, Bell, Shield, Save, Key, CreditCard } from 'lucide-react'

/**
 * Página de Configurações do CRM
 * Design: Brutalista Premium (Preto Obsidian + Amarelo Elétrico)
 */
export default function SettingsPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Título de Autoridade */}
            <div>
                <h1 className="text-4xl font-black text-neutral-100 italic tracking-tight">CONFIGURAÇÕES</h1>
                <p className="text-neutral-500 font-mono text-sm mt-2 uppercase tracking-widest">Controle total do seu ecossistema CRM</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Lateral: Navegação Rápida (Estilo Brutalist) */}
                <div className="lg:col-span-3 space-y-2">
                    <div className="brutalist-card cursor-pointer hover:bg-neutral-800 transition-colors border-l-4 border-l-amber-electric">
                        <div className="flex items-center gap-3">
                            <Building className="w-5 h-5 text-amber-electric" />
                            <span className="font-bold text-sm uppercase">Escritório</span>
                        </div>
                    </div>
                    <div className="brutalist-card cursor-pointer hover:bg-neutral-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <Key className="w-5 h-5 text-neutral-500" />
                            <span className="font-bold text-sm uppercase">Segurança</span>
                        </div>
                    </div>
                    <div className="brutalist-card cursor-pointer hover:bg-neutral-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-neutral-500" />
                            <span className="font-bold text-sm uppercase">Notificações</span>
                        </div>
                    </div>
                </div>

                {/* Conteúdo Principal */}
                <div className="lg:col-span-9 space-y-8">
                    {/* Card: Dados do Escritório */}
                    <div className="brutalist-card">
                        <div className="flex items-center gap-3 mb-8 border-b border-neutral-800 pb-4">
                            <Building className="w-6 h-6 text-amber-electric" />
                            <h2 className="text-xl font-bold text-neutral-200 uppercase tracking-tight">Identidade Organizacional</h2>
                        </div>

                        <form className="space-y-8">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Razão Social</label>
                                    <input
                                        type="text"
                                        defaultValue="Brandão Contabilidade"
                                        className="w-full bg-neutral-900 border border-neutral-800 p-4 text-neutral-200 font-bold focus:border-amber-electric outline-none transition-all placeholder:text-neutral-700"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">CNPJ / Identificação</label>
                                    <input
                                        type="text"
                                        defaultValue="00.000.000/0001-00"
                                        className="w-full bg-neutral-900 border border-neutral-800 p-4 text-neutral-200 font-mono focus:border-amber-electric outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">E-mail Corporativo</label>
                                <input
                                    type="email"
                                    placeholder="contato@brandaocontador.com.br"
                                    className="w-full bg-neutral-900 border border-neutral-800 p-4 text-neutral-200 focus:border-amber-electric outline-none transition-all"
                                />
                            </div>

                            <button type="button" className="btn-brutal w-full md:w-auto px-10 flex items-center justify-center gap-3 group">
                                <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                <span className="tracking-[0.1em]">ATUALIZAR SISTEMA</span>
                            </button>
                        </form>
                    </div>

                    {/* Alerta de Segurança Brutalista */}
                    <div className="brutalist-card border-none bg-amber-electric text-obsidian overflow-hidden relative">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-black uppercase italic">Nível de Segurança Adicional</h3>
                                <p className="text-sm font-bold opacity-80">Recomendamos ativar a autenticação em duas etapas (2FA) para todos os administradores.</p>
                            </div>
                            <button className="px-6 py-2 bg-obsidian text-amber-electric font-black text-xs uppercase hover:bg-neutral-800 transition-colors">
                                ATIVAR AGORA
                            </button>
                        </div>
                        {/* Decoração sutil ao fundo */}
                        <Shield className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 rotate-12" />
                    </div>
                </div>
            </div>
        </div>
    )
}
