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
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Tech Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

            {/* Ambient Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]"></div>

            <div className="w-full max-w-lg relative z-10">
                {/* Brand Header */}
                <div className="text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-10 duration-1000">
                    <div className="relative inline-block">
                        <div className="w-24 h-24 border-2 border-amber-500 flex items-center justify-center relative group overflow-hidden">
                            <div className="absolute inset-0 bg-amber-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            <ShieldCheck className={`w-12 h-12 transition-all duration-700 ${email && password ? 'text-amber-500 scale-110' : 'text-neutral-700'}`} />

                            {/* Scanning Line Effect */}
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-amber-500/50 shadow-[0_0_10px_#f59e0b] animate-scan-slow line-scan"></div>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
                            MAESTRO <span className="text-amber-500">AUTH</span>
                        </h1>
                        <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.4em] mt-3">
                            Brandão Contabilidade // Access Protocol v3.0
                        </p>
                    </div>
                </div>

                {/* Login Terminal Card */}
                <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800 p-8 md:p-12 relative group shadow-2xl">
                    <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-3 animate-in shake duration-500">
                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest italic">{error}</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest ml-1 group-focus-within:text-amber-500 transition-colors">Identificação do Operador</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-700 group-focus-within:text-amber-500 transition-all" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/60 border border-neutral-800 p-4 pl-12 text-white font-mono text-sm outline-none focus:border-amber-500 transition-all placeholder:text-neutral-800"
                                        placeholder="user@brandaocontador.com.br"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest ml-1 group-focus-within:text-amber-500 transition-colors">Chave Criptográfica</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-700 group-focus-within:text-amber-500 transition-all" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/60 border border-neutral-800 p-4 pl-12 text-white font-mono text-sm outline-none focus:border-amber-500 transition-all placeholder:text-neutral-800"
                                        placeholder="••••••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative overflow-hidden group/btn"
                        >
                            <div className="absolute inset-0 bg-amber-500 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                            <div className={`relative z-10 p-5 flex items-center justify-center gap-3 border-2 border-amber-500 text-amber-500 group-hover/btn:text-black font-black uppercase text-xs italic tracking-widest transition-colors ${loading ? 'bg-amber-500 text-black' : ''}`}>
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>AUTENTICAR ACESSO <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" /></>
                                )}
                            </div>
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-neutral-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <button className="text-[9px] font-black text-neutral-600 hover:text-white uppercase tracking-widest transition-colors">
                            Problemas no Acesso?
                        </button>
                        <div className="flex gap-4">
                            <span className="text-[9px] font-mono text-neutral-800 uppercase">Status: Secure</span>
                            <span className="text-[9px] font-mono text-neutral-800 uppercase">v3.0.4-MAESTRO</span>
                        </div>
                    </div>
                </div>

                {/* Restricted Link Info */}
                <div className="mt-10 p-6 bg-amber-500/5 border border-amber-500/10 rounded-lg animate-in fade-in duration-1000 delay-500">
                    <p className="text-[9px] text-neutral-500 font-mono text-center uppercase leading-relaxed">
                        Sistema Exclusivo para Funcionários e Diretores.<br />
                        Criação de contas desabilitada para o público. Use o convite enviado ao seu e-mail corporativo.
                    </p>
                </div>
            </div>

            <style jsx>{`
                .line-scan {
                    animation: scan 3s linear infinite;
                }
                @keyframes scan {
                    0% { top: 0; }
                    100% { top: 100%; }
                }
            `}</style>
        </div>
    )
}
