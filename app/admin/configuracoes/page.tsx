'use client'

import React from 'react'
import { Settings, User, Mail, Building, Bell, Shield, Save } from 'lucide-react'

export default function SettingsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-neutral-100 italic">Configurações</h1>
                <p className="text-neutral-400 mt-1">
                    Gerencie as informações do seu escritório e preferências de acesso.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Dados do Escritório */}
                <div className="brutalist-card">
                    <div className="flex items-center gap-3 mb-8 border-b border-neutral-800 pb-4">
                        <Building className="w-5 h-5 text-primary-500" />
                        <h2 className="text-xl font-bold text-neutral-200">Dados do Escritório</h2>
                    </div>

                    <form className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-500 uppercase">Nome da Organização</label>
                                <input
                                    type="text"
                                    defaultValue="Brandão Contabilidade"
                                    className="w-full bg-neutral-800 border-neutral-700 rounded-none p-3 text-neutral-200 focus:border-primary-500 outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-500 uppercase">CNPJ</label>
                                <input
                                    type="text"
                                    defaultValue="00.000.000/0001-00"
                                    className="w-full bg-neutral-800 border-neutral-700 rounded-none p-3 text-neutral-200 focus:border-primary-500 outline-none transition-colors ml-0"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase">E-mail de Contato</label>
                            <input
                                type="email"
                                placeholder="contato@brandaocontador.com.br"
                                className="w-full bg-neutral-800 border-neutral-700 rounded-none p-3 text-neutral-200 focus:border-primary-500 outline-none transition-colors"
                            />
                        </div>

                        <div className="pt-4">
                            <button type="button" className="btn-brutal w-full md:w-auto px-8 flex items-center justify-center gap-2">
                                <Save className="w-4 h-4" /> Salvar Dados
                            </button>
                        </div>
                    </form>
                </div>

                {/* Segurança */}
                <div className="brutalist-card">
                    <div className="flex items-center gap-3 mb-8 border-b border-neutral-800 pb-4">
                        <Shield className="w-5 h-5 text-primary-500" />
                        <h2 className="text-xl font-bold text-neutral-200">Segurança & Acesso</h2>
                    </div>

                    <div className="space-y-8">
                        <div className="p-4 bg-primary-500/5 border border-primary-500/20">
                            <p className="text-sm font-bold text-primary-500 mb-1">Acesso Administrativo</p>
                            <p className="text-xs text-neutral-500">
                                Sua conta tem privilégios totais. Tenha cuidado ao alterar credenciais.
                            </p>
                        </div>

                        <form className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-500 uppercase">Senha Atual</label>
                                <input
                                    type="password"
                                    className="w-full bg-neutral-800 border-neutral-700 rounded-none p-3 text-neutral-200 focus:border-primary-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-500 uppercase">Nova Senha</label>
                                <input
                                    type="password"
                                    className="w-full bg-neutral-800 border-neutral-700 rounded-none p-3 text-neutral-200 focus:border-primary-500 outline-none"
                                />
                            </div>
                            <button type="button" className="w-full bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-3 transition-colors px-0">
                                Atualizar Senha de Acesso
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
