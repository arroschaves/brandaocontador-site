'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        console.log('🔐 Tentando login com:', email)

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        console.log('📊 Resposta do Supabase:', { data, error })

        if (error) {
            console.error('❌ Erro de autenticação:', error)
            setError(`Erro: ${error.message} (${error.status})`)
            setLoading(false)
        } else {
            console.log('✅ Login bem-sucedido! Redirecionando para admin...')


            // Forçar redirecionamento se o router.push falhar
            router.push('/admin')

            // Fallback: se em 2 segundos não mudar, força via window
            setTimeout(() => {
                window.location.href = '/admin'
            }, 1000)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/10 rounded-2xl mb-4">
                        <ShieldCheck className="w-8 h-8 text-primary-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-neutral-100 mb-2">Brandão CRM</h1>
                    <p className="text-neutral-400">Acesso Administrativo</p>
                </div>

                {/* Form */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-11 pr-4 py-3 text-neutral-100 focus:outline-none focus:border-primary-500 transition-colors"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-11 pr-4 py-3 text-neutral-100 focus:outline-none focus:border-primary-500 transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-neutral-500">
                            Esqueceu a senha?{' '}
                            <a href="#" className="text-primary-500 hover:text-primary-400">
                                Recuperar acesso
                            </a>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-neutral-600 mt-8">
                    Sistema protegido por autenticação Supabase
                </p>
            </div>
        </div>
    )
}
