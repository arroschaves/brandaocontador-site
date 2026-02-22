'use client'

import React, { useState, useEffect } from 'react'
import { Settings, User, Mail, Building, Bell, Shield, Save, Key, CreditCard, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

/**
 * Página de Configurações do CRM
 * Design: Brutalista Premium (Preto Obsidian + Amarelo Elétrico)
 */
export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        razao_social: '',
        cnpj: '',
        email_contato: ''
    });

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        setLoading(true);
        const supabase = createClient();
        try {
            const { data, error } = await supabase
                .schema('core')
                .from('escritorios')
                .select('*')
                .single();

            if (data) {
                setFormData({
                    id: data.id,
                    razao_social: data.razao_social || '',
                    cnpj: data.cnpj || '',
                    email_contato: data.email_contato || ''
                });
            }
        } catch (err) {
            console.error('Erro ao carregar configurações:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        const supabase = createClient();
        try {
            const { error } = await supabase
                .schema('core')
                .from('escritorios')
                .update({
                    razao_social: formData.razao_social,
                    cnpj: formData.cnpj,
                    email_contato: formData.email_contato,
                    updated_at: new Date().toISOString()
                })
                .eq('id', formData.id);

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Erro ao salvar:', err);
            alert('Falha ao salvar configurações');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            </div>
        );
    }

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
                    <div className="brutalist-card cursor-pointer hover:bg-neutral-800 transition-colors border-l-4 border-l-amber-500">
                        <div className="flex items-center gap-3">
                            <Building className="w-5 h-5 text-amber-500" />
                            <span className="font-bold text-sm uppercase">Escritório</span>
                        </div>
                    </div>
                    {/* Estes itens podem ser desabilitados ou apenas visuais por enquanto */}
                    <div className="brutalist-card cursor-pointer hover:bg-neutral-800 transition-colors opacity-50">
                        <div className="flex items-center gap-3">
                            <Key className="w-5 h-5 text-neutral-500" />
                            <span className="font-bold text-sm uppercase">Segurança</span>
                        </div>
                    </div>
                    <div className="brutalist-card cursor-pointer hover:bg-neutral-800 transition-colors opacity-50">
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
                            <Building className="w-6 h-6 text-amber-500" />
                            <h2 className="text-xl font-bold text-neutral-200 uppercase tracking-tight">Identidade Organizacional</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Razão Social</label>
                                    <input
                                        type="text"
                                        value={formData.razao_social}
                                        onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                                        className="w-full bg-neutral-900 border border-neutral-800 p-4 text-neutral-200 font-bold focus:border-amber-500 outline-none transition-all placeholder:text-neutral-700"
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">CNPJ / Identificação</label>
                                    <input
                                        type="text"
                                        value={formData.cnpj}
                                        onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                                        className="w-full bg-neutral-900 border border-neutral-800 p-4 text-neutral-200 font-mono focus:border-amber-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">E-mail Corporativo</label>
                                <input
                                    type="email"
                                    value={formData.email_contato}
                                    onChange={(e) => setFormData({ ...formData, email_contato: e.target.value })}
                                    className="w-full bg-neutral-900 border border-neutral-800 p-4 text-neutral-200 focus:border-amber-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className={`w-full md:w-auto px-10 py-4 bg-amber-500 text-neutral-950 font-black flex items-center justify-center gap-3 group transition-all hover:bg-amber-400 active:scale-95 disabled:opacity-50`}
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : success ? (
                                    <CheckCircle2 className="w-5 h-5" />
                                ) : (
                                    <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                )}
                                <span className="tracking-[0.1em]">{saving ? 'SALVANDO...' : success ? 'SALVO COM SUCESSO!' : 'ATUALIZAR SISTEMA'}</span>
                            </button>
                        </form>
                    </div>

                    {/* Alerta de Segurança Brutalista */}
                    <div className="brutalist-card border-none bg-amber-500 text-neutral-950 overflow-hidden relative">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-black uppercase italic">Nível de Segurança Adicional</h3>
                                <p className="text-sm font-bold opacity-80">Recomendamos ativar a autenticação em duas etapas (2FA) para todos os administradores.</p>
                            </div>
                            <button className="px-6 py-2 bg-neutral-950 text-amber-500 font-black text-xs uppercase hover:bg-neutral-800 transition-colors">
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
