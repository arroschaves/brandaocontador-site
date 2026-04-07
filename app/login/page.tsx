'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, Lock, AlertCircle, Loader2, ArrowRight, Shield } from 'lucide-react'

/**
 * Página de Login — Brandão Contabilidade
 * Design moderno, limpo e profissional
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
        // Mensagens amigáveis em pt-BR
        if (authError.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos. Verifique e tente novamente.')
        } else {
          setError(`Erro: ${authError.message}`)
        }
        setLoading(false)
        return
      }

      if (data.user) {
        router.push('/admin')
        router.refresh()
      }
    } catch {
      setError('Falha na conexão. Verifique sua internet e tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Gradientes decorativos */}
      <div className="absolute inset-0 gradient-hero pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Cabeçalho */}
        <div className="text-center mb-8 space-y-4 animate-fade-in-up">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-primary/20 shadow-glow-sm">
              <Image src="/logo-icon.jpg" alt="Logo" fill className="object-cover" />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Bem-vindo de volta
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Acesse o painel administrativo Brandão
            </p>
          </div>
        </div>

        {/* Card de Login */}
        <div className="glass-card-static p-8 animate-fade-in-up delay-200">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Erro */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl animate-fade-in">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-modern pl-11"
                  placeholder="seu@email.com.br"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-modern pl-11"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer do card */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Problemas para acessar?{' '}
              <a href="https://wa.me/5567996011356" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">
                Fale conosco
              </a>
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border/60 animate-fade-in delay-400">
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Acesso exclusivo para funcionários e diretores da Brandão Contabilidade.
              Sua conta é criada pela administração.
            </p>
          </div>
        </div>

        {/* Voltar ao site */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            ← Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  )
}
