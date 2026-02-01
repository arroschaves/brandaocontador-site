'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    ShieldCheck, Lock, User,
    CheckCircle2, ArrowRight, Loader2,
    Fingerprint, Shield
} from 'lucide-react'

function OnboardingContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const email = searchParams.get('email')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const supabase = createClient()

    async function handleActivate(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.')
            setLoading(false)
            return
        }

        try {
            // 1. Atualizar senha no Auth do Supabase (se o usuário já existir no auth)
            // Ou criar o usuário se for convite por email puro.
            // Para simplificar no MVP, vamos apenas atualizar a tabela equipe
            // e assumir que o sistema de login usará essa senha ou o fluxo de e-mail do Supabase.

            const { error: updError } = await supabase
                .from('equipe')
                .update({
                    senha: password, // Em prod, usaríamos Supabase Auth properly
                    ativo: true
                })
                .eq('email', email)

            if (updError) throw updError

            setSuccess(true)
            setTimeout(() => {
                router.push('/login')
            }, 3000)

        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!email) {
        return (
            <div className="text-center p-20">
                <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-black text-white uppercase italic">LINK INVÁLIDO</h1>
                <p className="text-neutral-500 mt-2">O e-mail de ativação não foi identificado.</p>
            </div>
        )
    }

    if (success) {
        return (
            <div className="max-w-md mx-auto text-center space-y-6 py-20 px-6 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-10 h-10 text-black" />
                </div>
                <h1 className="text-3xl font-black text-white italic uppercase">BEM-VINDO AO TIME</h1>
                <p className="text-neutral-500">Sua conta foi ativada com sucesso. Redirecionando para o login...</p>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto py-20 px-6 space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="text-center space-y-2">
                <div className="flex justify-center mb-4 text-emerald-500">
                    <Fingerprint className="w-12 h-12" />
                </div>
                <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Ativação <span className="text-emerald-500">Maestro</span></h1>
                <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest leading-relaxed">
                    Olá <b>{email}</b>, defina sua credencial de acesso para entrar no sistema.
                </p>
            </div>

            <form onSubmit={handleActivate} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">Senha de Acesso</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                        <input
                            type="password"
                            required
                            className="w-full bg-neutral-900 border border-neutral-800 p-4 pl-12 text-white outline-none focus:border-emerald-500 transition-all font-mono"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">Confirmar Senha</label>
                    <div className="relative">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                        <input
                            type="password"
                            required
                            className="w-full bg-neutral-900 border border-neutral-800 p-4 pl-12 text-white outline-none focus:border-emerald-500 transition-all font-mono"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest text-center italic">
                        {error}
                    </div>
                )}

                <button
                    disabled={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black p-5 text-sm font-black uppercase italic tracking-widest flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>ATIVAR ACESSO <ArrowRight className="w-5 h-5" /></>
                    )}
                </button>
            </form>

            <div className="pt-10 border-t border-neutral-900 text-center">
                <p className="text-[9px] font-mono text-neutral-700 uppercase leading-relaxed">
                    SISTEMA DE SEGURANÇA MAESTRO BRANDÃO v3.0<br />
                    AUTENTICAÇÃO RASTREADA POR ENDEREÇO IP
                </p>
            </div>
        </div>
    )
}

export default function OnboardingPage() {
    return (
        <div className="min-h-screen bg-black flex flex-col justify-center">
            <Suspense fallback={<div className="text-center font-mono text-neutral-500">CARREGANDO...</div>}>
                <OnboardingContent />
            </Suspense>
        </div>
    )
}
