'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Mail, Lock, AlertCircle, Loader2, ArrowRight } from 'lucide-react'

/**
 * Página de Login Master - Brandão Contabilidade
 * Design: Brutalista Premium (Obsidian + Amber Electric)
 */
export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (authError) {
                setError(`Acesso Negado: ${authError.message}`)
                setLoading(false)
                return
            }

            if (data.user) {
                router.push('/admin')
                // Fallback de contingência
                setTimeout(() => {
                    window.location.href = '/admin'
                }, 800)
            }
        } catch (err) {
            setError('Falha crítica na conexão com o núcleo de segurança.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-obsidian flex items-center justify-center p-6 relative overflow-hidden">
            {/* Elementos Decorativos de Fundo */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-noise"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-electric/10 rounded-full blur-[120px]"></div>

            <div className="w-full max-w-lg relative z-10">
                {/* Header de Autoridade */}
                <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="inline-flex items-center justify-center w-20 h-20 border-2 border-amber-electric mb-6 group">
                        <ShieldCheck className="w-10 h-10 text-amber-electric group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <h1 className="text-5xl font-black text-neutral-100 italic tracking-tighter uppercase mb-2">
                        ACESSAR <span className="text-amber-electric">SISTEMA</span>
                    </h1>
                    <p className="text-neutral-500 font-mono text-xs uppercase tracking-[0.3em]">Ambiente Administrativo Seguro</p>
                </div>

                {/* Card Brutalista de Login */}
                <div className="brutalist-card bg-neutral-900/50 backdrop-blur-sm shadow-2xl border-neutral-800">
                    <form onSubmit={handleLogin} className="space-y-8">
                        {error && (
                            <div className="bg-red-500/10 border-l-4 border-red-500 p-4 flex items-start gap-3 animate-shake">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs font-bold text-red-400 uppercase tracking-wider">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Identificação (Email)</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600 group-focus-within:text-amber-electric transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-obsidian border border-neutral-800 p-4 pl-12 text-neutral-100 font-bold focus:border-amber-electric outline-none transition-all placeholder:text-neutral-700"
                                        placeholder="INSIRA SEU E-MAIL"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Chave de Segurança (Senha)</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600 group-focus-within:text-amber-electric transition-colors" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-obsidian border border-neutral-800 p-4 pl-12 text-neutral-100 font-bold focus:border-amber-electric outline-none transition-all placeholder:text-neutral-700"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-brutal w-full flex items-center justify-center gap-3 active:scale-95 transition-transform"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <span>INICIAR SESSÃO</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-neutral-800 flex justify-between items-center">
                        <button className="text-[10px] font-black text-neutral-600 hover:text-amber-electric transition-colors uppercase tracking-widest">
                            Recuperar Chave
                        </button>
                        <span className="text-[10px] font-mono text-neutral-700 uppercase">v2.1.0-secure</span>
                    </div>
                </div>

                <p className="text-center text-[10px] text-neutral-600 mt-12 font-mono uppercase tracking-[0.2em]">
                    Dados protegidos por criptografia de ponta a ponta
                </p>
            </div>
        </div>
    )
}
